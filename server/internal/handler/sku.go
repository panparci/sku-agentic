package handler

import (
	"github.com/gin-gonic/gin"

	"sku-rumahsakit/internal/model"
	"sku-rumahsakit/internal/service"
	"sku-rumahsakit/pkg/response"
)

type SKUHandler struct {
	svc *service.SKUService
}

func NewSKUHandler(svc *service.SKUService) *SKUHandler {
	return &SKUHandler{svc: svc}
}

func (h *SKUHandler) List(c *gin.Context) {
	status := c.Query("status")
	skus, err := h.svc.ListSKUs(c.Request.Context(), status)
	if err != nil {
		response.InternalError(c, "Failed to list SKUs", err)
		return
	}
	response.SuccessData(c, "", skus)
}

func (h *SKUHandler) Get(c *gin.Context) {
	id := c.Param("id")
	sku, err := h.svc.GetSKU(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "SKU not found")
		return
	}
	response.SuccessData(c, "", sku)
}

func (h *SKUHandler) Create(c *gin.Context) {
	var req model.CreateSKURequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err)
		return
	}

	sku, err := h.svc.CreateSKU(c.Request.Context(), req)
	if err != nil {
		response.InternalError(c, "Failed to create SKU", err)
		return
	}
	response.Created(c, sku)
}

func (h *SKUHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req model.UpdateSKURequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err)
		return
	}

	sku, err := h.svc.UpdateSKU(c.Request.Context(), id, req)
	if err != nil {
		response.InternalError(c, "Failed to update SKU", err)
		return
	}
	response.SuccessData(c, "SKU updated", sku)
}

func (h *SKUHandler) ToggleStatus(c *gin.Context) {
	id := c.Param("id")
	var req model.ToggleSKUStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err)
		return
	}

	if err := h.svc.ToggleStatus(c.Request.Context(), id, req.Status); err != nil {
		response.InternalError(c, "Failed to toggle status", err)
		return
	}
	response.SuccessMsg(c, "Status updated")
}

func (h *SKUHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.DeleteSKU(c.Request.Context(), id); err != nil {
		response.InternalError(c, "Failed to delete SKU", err)
		return
	}
	response.SuccessMsg(c, "SKU deleted")
}

func (h *SKUHandler) CriticalStock(c *gin.Context) {
	skus, err := h.svc.GetCriticalStock(c.Request.Context())
	if err != nil {
		response.InternalError(c, "Failed to get critical stock", err)
		return
	}
	response.SuccessData(c, "", skus)
}
