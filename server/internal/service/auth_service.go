package service

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	"sku-rumahsakit/config"
	"sku-rumahsakit/internal/model"
	"sku-rumahsakit/internal/repository"
)

type AuthService struct {
	repo *repository.SupabaseRepository
	env  *config.Env
}

func NewAuthService(repo *repository.SupabaseRepository, env *config.Env) *AuthService {
	return &AuthService{repo: repo, env: env}
}

func (s *AuthService) Login(ctx context.Context, email, password string) (*model.LoginResponse, error) {
	// Check via Supabase Auth REST API
	// For MVP: use simplified auth - check users table directly
	// Production: integrate with Supabase Auth

	// Query users table
	rows, err := s.repo.List("users", "email=eq."+email+"&limit=1")
	if err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return nil, errors.New("invalid credentials")
	}

	userRow := rows[0]
	
	// Verify password hash
	hashedInput := hashPassword(password)
	storedHash := getString(userRow, "password_hash")
	if hashedInput != storedHash {
		return nil, errors.New("invalid credentials")
	}

	// Generate JWT
	token, err := s.generateJWT(userRow)
	if err != nil {
		return nil, err
	}

	user := &model.User{
		ID:         getString(userRow, "id"),
		Email:      email,
		Name:       getString(userRow, "name"),
		Role:       model.UserRole(getString(userRow, "role")),
		Department: getString(userRow, "department"),
	}

	return &model.LoginResponse{
		User:        user,
		AccessToken: token,
	}, nil
}

func (s *AuthService) ValidateToken(tokenString string) (*model.JWTClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		return []byte(s.env.JWTSecret), nil
	})
	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return &model.JWTClaims{
			UserID: getStringFromAny(claims["user_id"]),
			Email:  getStringFromAny(claims["email"]),
			Role:   model.UserRole(getStringFromAny(claims["role"])),
		}, nil
	}

	return nil, errors.New("invalid token")
}

func (s *AuthService) GetUserByID(ctx context.Context, id string) (*model.User, error) {
	row, err := s.repo.Get("users", id)
	if err != nil {
		return nil, err
	}
	return &model.User{
		ID:         getString(row, "id"),
		Email:      getString(row, "email"),
		Name:       getString(row, "name"),
		Role:       model.UserRole(getString(row, "role")),
		Department: getString(row, "department"),
	}, nil
}

func (s *AuthService) generateJWT(userRow map[string]any) (string, error) {
	claims := jwt.MapClaims{
		"user_id": getString(userRow, "id"),
		"email":   getString(userRow, "email"),
		"role":    getString(userRow, "role"),
		"exp":     time.Now().Add(time.Duration(s.env.AccessTokenExpiry) * time.Second).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.env.JWTSecret))
}

func (s *AuthService) CreateUser(ctx context.Context, email, password, name string, role model.UserRole, department string) (*model.User, error) {
	now := time.Now()
	id := uuid.New().String()

	data := map[string]any{
		"id":           id,
		"email":        email,
		"password_hash": hashPassword(password),
		"name":         name,
		"role":         string(role),
		"department":   department,
		"created_at":   now,
	}

	_, err := s.repo.Insert("users", data)
	if err != nil {
		return nil, err
	}

	return &model.User{
		ID:         id,
		Email:      email,
		Name:       name,
		Role:       role,
		Department: department,
	}, nil
}

func hashPassword(password string) string {
	hash := sha256.Sum256([]byte(password))
	return hex.EncodeToString(hash[:])
}

func getStringFromAny(v any) string {
	if s, ok := v.(string); ok {
		return s
	}
	return ""
}

func (s *AuthService) DebugQuery() ([]map[string]any, error) {
	return s.repo.List("users", "email=eq.admin@rs-medika.com&limit=1")
}
