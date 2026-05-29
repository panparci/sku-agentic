package startup

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"

	"sku-rumahsakit/config"
	"sku-rumahsakit/internal/handler"
	"sku-rumahsakit/internal/middleware"
	"sku-rumahsakit/internal/repository"
	"sku-rumahsakit/internal/service"
	"sku-rumahsakit/pkg/response"
)

func Server() {
	env := config.NewEnv()

	// Set Gin mode
	if env.GoMode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize repositories
	supabaseRepo := repository.NewSupabaseRepository(env)
	redisRepo := repository.NewRedisRepository(env)
	defer redisRepo.Close()

	// Test Redis connection
	if err := redisRepo.Ping(context.Background()); err != nil {
		log.Printf("Warning: Redis not connected: %v (continuing without cache)", err)
	} else {
		log.Println("Redis connected")
	}

	// Initialize services
	authService := service.NewAuthService(supabaseRepo, env)
	vendorService := service.NewVendorService(supabaseRepo)
	skuService := service.NewSKUService(supabaseRepo, redisRepo)
	prService := service.NewPRService(supabaseRepo, redisRepo)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(authService)
	vendorHandler := handler.NewVendorHandler(vendorService)
	skuHandler := handler.NewSKUHandler(skuService)
	prHandler := handler.NewPRHandler(prService)

	// Initialize middleware
	authMiddleware := middleware.NewAuthMiddleware(authService)

	// Setup router
	router := gin.Default()

	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey")
		c.Header("Access-Control-Allow-Credentials", "true")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})

	// Health check
	router.GET("/health", func(c *gin.Context) {
		response.SuccessMsg(c, "OK")
	})

	// Serve static frontend files
	router.Static("/assets", "./dist/assets")

	// SPA fallback — serve index.html for non-API routes
	router.NoRoute(func(c *gin.Context) {
		c.File("./dist/index.html")
	})

	// Public routes
	router.POST("/api/v1/auth/login", authHandler.Login)
	router.POST("/api/v1/auth/logout", authHandler.Logout)
	// Debug endpoint - direct query test
	router.GET("/debug/env", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"supabase_url": env.SupabaseURL,
			"anon_key_len": len(env.SupabaseAnonKey),
			"service_key_len": len(env.SupabaseServiceKey),
			"jwt_secret_len": len(env.JWTSecret),
		})
	})


	// Protected routes
	api := router.Group("/api/v1")
	api.Use(authMiddleware.RequireAuth())
	{
		// Auth
		api.GET("/me", authHandler.Me)

		// Vendors
		api.GET("/vendors", vendorHandler.List)
		api.GET("/vendors/:id", vendorHandler.Get)
		api.POST("/vendors", vendorHandler.Create)
		api.PUT("/vendors/:id", vendorHandler.Update)
		api.DELETE("/vendors/:id", vendorHandler.Delete)

		// SKUs
		api.GET("/skus", skuHandler.List)
		api.GET("/skus/critical", skuHandler.CriticalStock)
		api.GET("/skus/:id", skuHandler.Get)
		api.POST("/skus", skuHandler.Create)
		api.PUT("/skus/:id", skuHandler.Update)
		api.PATCH("/skus/:id/status", skuHandler.ToggleStatus)
		api.DELETE("/skus/:id", skuHandler.Delete)

		// Purchase Requisitions
		api.GET("/purchase-requisitions", prHandler.List)
		api.GET("/purchase-requisitions/:id", prHandler.Get)
		api.POST("/purchase-requisitions", prHandler.Create)
		api.PUT("/purchase-requisitions/:id/status", prHandler.UpdateStatus)
		api.DELETE("/purchase-requisitions/:id", prHandler.Delete)
	}

	// Start server
	addr := fmt.Sprintf(":%d", env.ServerPort)
	srv := &http.Server{
		Addr:         addr,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown
	go func() {
		log.Printf("Server starting on %s", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	// Wait for interrupt
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	srv.Shutdown(ctx)
	log.Println("Server stopped")
}
