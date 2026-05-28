package handler

import (
	"github.com/gin-gonic/gin"

	"sku-rumahsakit/internal/model"
	"sku-rumahsakit/internal/service"
	"sku-rumahsakit/pkg/response"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req model.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err)
		return
	}

	resp, err := h.authService.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		response.Unauthorized(c, "Invalid email or password")
		return
	}

	// Set HttpOnly cookie
	c.SetCookie("cgp_at", resp.AccessToken, 3600*24*7, "/", "", false, true)

	response.SuccessData(c, "Login successful", resp)
}

func (h *AuthHandler) Logout(c *gin.Context) {
	c.SetCookie("cgp_at", "", -1, "/", "", false, true)
	response.SuccessMsg(c, "Logged out")
}

func (h *AuthHandler) Me(c *gin.Context) {
	userID, _ := c.Get("user_id")
	
	user, err := h.authService.GetUserByID(c.Request.Context(), userID.(string))
	if err != nil {
		response.NotFound(c, "User not found")
		return
	}

	response.SuccessData(c, "", user)
}
