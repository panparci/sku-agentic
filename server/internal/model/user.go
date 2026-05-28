package model

import "time"

type UserRole string

const (
	RoleRequester UserRole = "REQUESTER"
	RoleDeptHead   UserRole = "DEPT_HEAD"
	RoleProcurement UserRole = "PROCUREMENT"
	RoleFinanceVP   UserRole = "FINANCE_VP"
	RoleDirector    UserRole = "DIRECTOR"
	RoleAdmin       UserRole = "ADMIN"
)

type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	Name         string    `json:"name"`
	Role         UserRole  `json:"role"`
	Department   string    `json:"department"`
	ManagerID    string    `json:"manager_id,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	User        *User  `json:"user"`
	AccessToken string `json:"access_token"`
}

type JWTClaims struct {
	UserID string   `json:"user_id"`
	Email  string   `json:"email"`
	Role   UserRole `json:"role"`
}
