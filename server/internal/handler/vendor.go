package handler

import (
	"github.com/gin-gonic/gin"

	"sku-rumahsakit/internal/model"
	"sku-rumahsakit/internal/service"
	"sku-rumahsakit/pkg/response"
)

type VendorHandler struct {
	svc *service.VendorService
}

func NewVendorHandler(svc *service.VendorService) *VendorHandler {
	return &VendorHandler{svc: svc}
}

func (h *VendorHandler) List(c *gin.Context) {
	vendors, err := h.svc.ListVendors(c.Request.Context())
	if err != nil {
		response.InternalError(c, "Failed to list vendors", err)
		return
	}
	response.SuccessData(c, "", vendors)
}

func (h *VendorHandler) Get(c *gin.Context) {
	id := c.Param("id")
	vendor, err := h.svc.GetVendor(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "Vendor not found")
		return
	}
	response.SuccessData(c, "", vendor)
}

func (h *VendorHandler) Create(c *gin.Context) {
	var req model.CreateVendorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err)
		return
	}

	vendor, err := h.svc.CreateVendor(c.Request.Context(), req)
	if err != nil {
		response.InternalError(c, "Failed to create vendor", err)
		return
	}
	response.Created(c, vendor)
}

func (h *VendorHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req model.UpdateVendorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err)
		return
	}

	vendor, err := h.svc.UpdateVendor(c.Request.Context(), id, req)
	if err != nil {
		response.InternalError(c, "Failed to update vendor", err)
		return
	}
	response.SuccessData(c, "Vendor updated", vendor)
}

func (h *VendorHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.DeleteVendor(c.Request.Context(), id); err != nil {
		response.InternalError(c, "Failed to delete vendor", err)
		return
	}
	response.SuccessMsg(c, "Vendor deleted")
}
