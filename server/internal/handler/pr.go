package handler

import (
	"github.com/gin-gonic/gin"

	"sku-rumahsakit/internal/model"
	"sku-rumahsakit/internal/service"
	"sku-rumahsakit/pkg/response"
)

type PRHandler struct {
	svc *service.PRService
}

func NewPRHandler(svc *service.PRService) *PRHandler {
	return &PRHandler{svc: svc}
}

func (h *PRHandler) List(c *gin.Context) {
	status := c.Query("status")
	department := c.Query("department")

	prs, err := h.svc.ListPRs(c.Request.Context(), status, department)
	if err != nil {
		response.InternalError(c, "Failed to list PRs", err)
		return
	}
	response.SuccessData(c, "", prs)
}

func (h *PRHandler) Get(c *gin.Context) {
	id := c.Param("id")
	pr, err := h.svc.GetPR(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "PR not found")
		return
	}
	response.SuccessData(c, "", pr)
}

func (h *PRHandler) Create(c *gin.Context) {
	var req model.CreatePRRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err)
		return
	}

	pr, err := h.svc.CreatePR(c.Request.Context(), req)
	if err != nil {
		response.InternalError(c, "Failed to create PR", err)
		return
	}
	response.Created(c, pr)
}

func (h *PRHandler) UpdateStatus(c *gin.Context) {
	id := c.Param("id")
	var req model.UpdatePRStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err)
		return
	}

	userID, _ := c.Get("user_id")
	pr, err := h.svc.UpdatePRStatus(c.Request.Context(), id, req, userID.(string))
	if err != nil {
		response.InternalError(c, "Failed to update PR status", err)
		return
	}
	response.SuccessData(c, "PR status updated", pr)
}

func (h *PRHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.DeletePR(c.Request.Context(), id); err != nil {
		response.InternalError(c, "Failed to delete PR", err)
		return
	}
	response.SuccessMsg(c, "PR deleted")
}
