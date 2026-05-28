package model

import "time"

type SKU struct {
	SKUID         string    `json:"sku_id"`
	SKUCode       string    `json:"sku_code"`
	SKUName       string    `json:"sku_name"`
	Category      string    `json:"category"`
	Type          string    `json:"type"` // Obat, Alkes, BMHP, Non-Medis, Jasa
	UOM           string    `json:"uom"`
	Brand         string    `json:"brand"`
	EstimatedPrice float64  `json:"estimated_price"`
	MinimumStock  int       `json:"minimum_stock"`
	MaximumStock  int       `json:"maximum_stock"`
	CurrentStock  int       `json:"current_stock"`
	VendorID      string    `json:"vendor_id"`
	Status        string    `json:"status"` // Aktif, Nonaktif
	LeadTimeDays  int       `json:"lead_time_days"`
	IsCritical    bool      `json:"is_critical"`
	IsControlled  bool      `json:"is_controlled"`
	IsTaxable     bool      `json:"is_taxable"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type CreateSKURequest struct {
	SKUCode        string  `json:"sku_code" binding:"required"`
	SKUName        string  `json:"sku_name" binding:"required"`
	Category       string  `json:"category" binding:"required"`
	Type           string  `json:"type" binding:"required"`
	UOM            string  `json:"uom" binding:"required"`
	Brand          string  `json:"brand"`
	EstimatedPrice float64 `json:"estimated_price" binding:"required"`
	MinimumStock   int     `json:"minimum_stock"`
	MaximumStock   int     `json:"maximum_stock"`
	VendorID       string  `json:"vendor_id" binding:"required"`
	LeadTimeDays   int     `json:"lead_time_days"`
	IsCritical     bool    `json:"is_critical"`
	IsControlled   bool    `json:"is_controlled"`
	IsTaxable      bool    `json:"is_taxable"`
}

type UpdateSKURequest struct {
	SKUName        string  `json:"sku_name"`
	Category       string  `json:"category"`
	UOM            string  `json:"uom"`
	Brand          string  `json:"brand"`
	EstimatedPrice float64 `json:"estimated_price"`
	MinimumStock   int     `json:"minimum_stock"`
	MaximumStock   int     `json:"maximum_stock"`
	CurrentStock   int     `json:"current_stock"`
	LeadTimeDays   int     `json:"lead_time_days"`
	IsCritical     bool    `json:"is_critical"`
	IsControlled   bool    `json:"is_controlled"`
	IsTaxable      bool    `json:"is_taxable"`
}

type ToggleSKUStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=Aktif Nonaktif"`
}
