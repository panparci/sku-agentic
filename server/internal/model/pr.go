package model

import "time"

type PRStatus string

const (
	PRDraft          PRStatus = "Draft"
	PRSubmitted      PRStatus = "Submitted"
	PRApproved       PRStatus = "Approved"
	PRRejected      PRStatus = "Rejected"
	PRConvertedToPO PRStatus = "Converted_to_PO"
	PRCancelled     PRStatus = "Cancelled"
)

type PRItem struct {
	ID          string  `json:"id"`
	SKUID       string  `json:"sku_id"`
	Qty         int     `json:"qty"`
	UnitPrice   float64 `json:"unit_price"`
	TotalPrice  float64 `json:"total_price"`
}

type PurchaseRequisition struct {
	PRID          string    `json:"pr_id"`
	PRNumber      string    `json:"pr_number"`
	Department    string    `json:"department"`
	ReqDate       time.Time `json:"req_date"`
	TargetDate    time.Time `json:"target_date"`
	TotalAmount   float64   `json:"total_amount"`
	Description   string    `json:"description"`
	Status        PRStatus  `json:"status"`
	RejectReason  string    `json:"reject_reason,omitempty"`
	ApprovedBy    string    `json:"approved_by,omitempty"`
	Items         []PRItem  `json:"items"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type CreatePRRequest struct {
	Department  string              `json:"department" binding:"required"`
	TargetDate  string              `json:"target_date" binding:"required"`
	Description string              `json:"description"`
	Items       []CreatePRItemRequest `json:"items" binding:"required,min=1"`
}

type CreatePRItemRequest struct {
	SKUID string  `json:"sku_id" binding:"required"`
	Qty   int     `json:"qty" binding:"required,min=1"`
}

type UpdatePRStatusRequest struct {
	Status       PRStatus `json:"status" binding:"required"`
	RejectReason string   `json:"reject_reason,omitempty"`
}

type PRAuditInfo struct {
	ApprovedBy   string `json:"approved_by,omitempty"`
	RejectReason string `json:"reject_reason,omitempty"`
}
