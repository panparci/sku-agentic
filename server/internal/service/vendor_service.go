package service

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"

	"sku-rumahsakit/internal/model"
	"sku-rumahsakit/internal/repository"
)

type VendorService struct {
	repo *repository.SupabaseRepository
}

func NewVendorService(repo *repository.SupabaseRepository) *VendorService {
	return &VendorService{repo: repo}
}

func (s *VendorService) ListVendors(ctx context.Context) ([]model.Vendor, error) {
	rows, err := s.repo.List("vendors", "select=*&order=name.asc")
	if err != nil {
		return nil, err
	}
	return s.mapRowsToVendors(rows)
}

func (s *VendorService) GetVendor(ctx context.Context, id string) (*model.Vendor, error) {
	row, err := s.repo.Get("vendors", id)
	if err != nil {
		return nil, err
	}
	v := s.mapRowToVendor(row)
	return &v, nil
}

func (s *VendorService) CreateVendor(ctx context.Context, req model.CreateVendorRequest) (*model.Vendor, error) {
	now := time.Now()
	vendor := model.Vendor{
		ID:              uuid.New().String(),
		Code:            req.Code,
		Name:            req.Name,
		Contact:         req.Contact,
		Email:           req.Email,
		Address:         req.Address,
		Rating:          req.Rating,
		SLADeliveryRate: 0,
		CreatedAt:       now,
		UpdatedAt:       now,
	}

	data := map[string]any{
		"id":       vendor.ID,
		"code":     vendor.Code,
		"name":     vendor.Name,
		"contact":  vendor.Contact,
		"email":    vendor.Email,
		"address":  vendor.Address,
		"rating":   vendor.Rating,
		"created_at": vendor.CreatedAt,
		"updated_at": vendor.UpdatedAt,
	}

	_, err := s.repo.Insert("vendors", data)
	if err != nil {
		return nil, err
	}
	return &vendor, nil
}

func (s *VendorService) UpdateVendor(ctx context.Context, id string, req model.UpdateVendorRequest) (*model.Vendor, error) {
	data := map[string]any{
		"updated_at": time.Now(),
	}
	if req.Name != "" {
		data["name"] = req.Name
	}
	if req.Contact != "" {
		data["contact"] = req.Contact
	}
	if req.Email != "" {
		data["email"] = req.Email
	}
	if req.Address != "" {
		data["address"] = req.Address
	}
	if req.Rating > 0 {
		data["rating"] = req.Rating
	}

	_, err := s.repo.Update("vendors", id, data)
	if err != nil {
		return nil, err
	}
	return s.GetVendor(ctx, id)
}

func (s *VendorService) DeleteVendor(ctx context.Context, id string) error {
	return s.repo.Delete("vendors", id)
}

func (s *VendorService) mapRowsToVendors(rows []map[string]any) ([]model.Vendor, error) {
	vendors := make([]model.Vendor, 0, len(rows))
	for _, row := range rows {
		vendors = append(vendors, s.mapRowToVendor(row))
	}
	return vendors, nil
}

func (s *VendorService) mapRowToVendor(row map[string]any) model.Vendor {
	v := model.Vendor{
		ID:        getString(row, "id"),
		Code:      getString(row, "code"),
		Name:      getString(row, "name"),
		Contact:   getString(row, "contact"),
		Email:     getString(row, "email"),
		Address:   getString(row, "address"),
		Rating:    getFloat(row, "rating"),
		CreatedAt: getTime(row, "created_at"),
		UpdatedAt: getTime(row, "updated_at"),
	}
	if sla := getFloat(row, "sla_delivery_rate"); sla > 0 {
		v.SLADeliveryRate = sla
	}
	return v
}

// Helpers
func getString(m map[string]any, key string) string {
	if v, ok := m[key]; ok {
		if s, ok := v.(string); ok {
			return s
		}
	}
	return ""
}

func getFloat(m map[string]any, key string) float64 {
	if v, ok := m[key]; ok {
		switch n := v.(type) {
		case float64:
			return n
		case int:
			return float64(n)
		}
	}
	return 0
}

func getTime(m map[string]any, key string) time.Time {
	if v, ok := m[key]; ok {
		if s, ok := v.(string); ok {
			t, _ := time.Parse(time.RFC3339, s)
			return t
		}
	}
	return time.Time{}
}
