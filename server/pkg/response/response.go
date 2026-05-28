package response

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   *APIError  `json:"error,omitempty"`
}

type APIError struct {
	Code    string `json:"code,omitempty"`
	Message string `json:"message"`
	Details any    `json:"details,omitempty"`
}

func SuccessMsg(c *gin.Context, message string) {
	c.JSON(http.StatusOK, APIResponse{Success: true, Message: message})
}

func SuccessData(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusOK, APIResponse{Success: true, Message: message, Data: data})
}

func Created(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, APIResponse{Success: true, Message: "Created", Data: data})
}

func BadRequest(c *gin.Context, message string, err error) {
	c.JSON(http.StatusBadRequest, APIResponse{Success: false, Error: &APIError{Message: message, Details: err}})
}

func Unauthorized(c *gin.Context, message string) {
	c.JSON(http.StatusUnauthorized, APIResponse{Success: false, Error: &APIError{Code: "UNAUTHORIZED", Message: message}})
}

func Forbidden(c *gin.Context, message string) {
	c.JSON(http.StatusForbidden, APIResponse{Success: false, Error: &APIError{Code: "FORBIDDEN", Message: message}})
}

func NotFound(c *gin.Context, message string) {
	c.JSON(http.StatusNotFound, APIResponse{Success: false, Error: &APIError{Code: "NOT_FOUND", Message: message}})
}

func InternalError(c *gin.Context, message string, err error) {
	c.JSON(http.StatusInternalServerError, APIResponse{Success: false, Error: &APIError{Message: message, Details: err}})
}
