package model

import "time"

type Vendor struct {
	ID                string    `json:"id"`
	Code              string    `json:"code"`
	Name              string    `json:"name"`
	Contact           string    `json:"contact"`
	Email             string    `json:"email"`
	Address           string    `json:"address"`
	Rating            float64   `json:"rating"`
	SLADeliveryRate   float64   `json:"sla_delivery_rate"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

type CreateVendorRequest struct {
	Code    string `json:"code" binding:"required"`
	Name    string `json:"name" binding:"required"`
	Contact string `json:"contact" binding:"required"`
	Email   string `json:"email" binding:"required,email"`
	Address string `json:"address"`
	Rating  float64 `json:"rating"`
}

type UpdateVendorRequest struct {
	Name    string `json:"name"`
	Contact string `json:"contact"`
	Email   string `json:"email" binding:"omitempty,email"`
	Address string `json:"address"`
	Rating  float64 `json:"rating"`
}
