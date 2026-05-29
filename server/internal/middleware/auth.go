package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"

	"sku-rumahsakit/internal/model"
	"sku-rumahsakit/internal/service"
	"sku-rumahsakit/pkg/response"
)

type AuthMiddleware struct {
	authService *service.AuthService
}

func NewAuthMiddleware(authService *service.AuthService) *AuthMiddleware {
	return &AuthMiddleware{authService: authService}
}

func (m *AuthMiddleware) RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		cookie, err := c.Cookie("cgp_at")
		if err != nil || cookie == "" {
			// Try Authorization header
			authHeader := c.GetHeader("Authorization")
			if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
				cookie = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}

		if cookie == "" {
			response.Unauthorized(c, "Missing authentication")
			c.Abort()
			return
		}

		claims, err := m.authService.ValidateToken(cookie)
		if err != nil {
			response.Unauthorized(c, "Invalid or expired token")
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("role", claims.Role)
		c.Next()
	}
}

func (m *AuthMiddleware) RequireRole(roles ...model.UserRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleVal, exists := c.Get("role")
		if !exists {
			response.Unauthorized(c, "Not authenticated")
			c.Abort()
			return
		}

		userRole := roleVal.(model.UserRole)
		for _, role := range roles {
			if userRole == role {
				c.Next()
				return
			}
		}

		response.Forbidden(c, "Insufficient permissions")
		c.Abort()
	}
}

func (m *AuthMiddleware) OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		cookie, _ := c.Cookie("cgp_at")
		if cookie == "" {
			authHeader := c.GetHeader("Authorization")
			if strings.HasPrefix(authHeader, "Bearer ") {
				cookie = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}

		if cookie != "" {
			claims, err := m.authService.ValidateToken(cookie)
			if err == nil {
				c.Set("user_id", claims.UserID)
				c.Set("email", claims.Email)
				c.Set("role", claims.Role)
			}
		}
		c.Next()
	}
}
