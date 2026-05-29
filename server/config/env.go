package config

import (
	"log"
	"os"

	"github.com/spf13/viper"
)

type Env struct {
	ServerPort         uint16
	GoMode             string
	// Supabase
	SupabaseURL        string
	SupabaseAnonKey    string
	SupabaseServiceKey string
	// Redis
	RedisHost string
	RedisPort uint16
	RedisPwd  string
	RedisDB   int
	// JWT
	JWTSecret          string
	AccessTokenExpiry  int64
	RefreshTokenExpiry int64
}

func NewEnv() *Env {
	viper.SetConfigFile("/home/ubuntu/workspace/sku-agentic/server/.env")
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		log.Printf("Warning: .env not found, using defaults: %v", err)
	}

	env := &Env{
		ServerPort:         8080,
		GoMode:             "debug",
		SupabaseURL:        viper.GetString("SUPABASE_URL"),
		SupabaseAnonKey:    viper.GetString("SUPABASE_ANON_KEY"),
		SupabaseServiceKey: viper.GetString("SUPABASE_SERVICE_ROLE_KEY"),
		RedisHost:          viper.GetString("REDIS_HOST"),
		RedisPort:          6379,
		RedisPwd:           viper.GetString("REDIS_PASSWORD"),
		RedisDB:            0,
		JWTSecret:          viper.GetString("JWT_SECRET"),
		AccessTokenExpiry:  3600,
		RefreshTokenExpiry: 604800,
	}

	if port := viper.GetUint16("SERVER_PORT"); port > 0 {
		env.ServerPort = port
	}
	if mode := viper.GetString("GO_MODE"); mode != "" {
		env.GoMode = mode
	}

	return env
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
