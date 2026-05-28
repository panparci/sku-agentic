package service

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"

	"sku-rumahsakit/internal/model"
	"sku-rumahsakit/internal/repository"
)

type SKUService struct {
	repo *repository.SupabaseRepository
	redis *repository.RedisRepository
}

func NewSKUService(repo *repository.SupabaseRepository, redis *repository.RedisRepository) *SKUService {
	return &SKUService{repo: repo, redis: redis}
}

func (s *SKUService) ListSKUs(ctx context.Context, status string) ([]model.SKU, error) {
	cacheKey := fmt.Sprintf("skus:list:%s", status)
	
	// Try cache first
	if s.redis != nil {
		if cached, err := s.redis.Get(ctx, cacheKey); err == nil && cached != "" {
			var skus []model.SKU
			if err := json.Unmarshal([]byte(cached), &skus); err == nil {
				return skus, nil
			}
		}
	}

	query := "select=*&order=sku_name.asc"
	if status != "" {
		query = fmt.Sprintf("select=*&status=eq.%s&order=sku_name.asc", status)
	}
	
	rows, err := s.repo.List("skus", query)
	if err != nil {
		return nil, err
	}

	skus := s.mapRowsToSKUs(rows)
	
	// Cache for 2 minutes
	if s.redis != nil && len(skus) > 0 {
		s.redis.Set(ctx, cacheKey, skus, 2*time.Minute)
	}
	
	return skus, nil
}

func (s *SKUService) GetSKU(ctx context.Context, id string) (*model.SKU, error) {
	row, err := s.repo.Get("skus", id)
	if err != nil {
		return nil, err
	}
	sku := s.mapRowToSKU(row)
	return &sku, nil
}

func (s *SKUService) CreateSKU(ctx context.Context, req model.CreateSKURequest) (*model.SKU, error) {
	now := time.Now()
	id := uuid.New().String()
	sku := model.SKU{
		SKUID:         id,
		SKUCode:       req.SKUCode,
		SKUName:       req.SKUName,
		Category:      req.Category,
		Type:          req.Type,
		UOM:           req.UOM,
		Brand:         req.Brand,
		EstimatedPrice: req.EstimatedPrice,
		MinimumStock:  req.MinimumStock,
		MaximumStock:  req.MaximumStock,
		CurrentStock:  0,
		VendorID:      req.VendorID,
		Status:        "Aktif",
		LeadTimeDays:  req.LeadTimeDays,
		IsCritical:    req.IsCritical,
		IsControlled:  req.IsControlled,
		IsTaxable:     req.IsTaxable,
		CreatedAt:     now,
		UpdatedAt:     now,
	}

	data := map[string]any{
		"sku_id":          sku.SKUID,
		"sku_code":       sku.SKUCode,
		"sku_name":       sku.SKUName,
		"category":       sku.Category,
		"type":           sku.Type,
		"uom":            sku.UOM,
		"brand":          sku.Brand,
		"estimated_price": sku.EstimatedPrice,
		"minimum_stock":  sku.MinimumStock,
		"maximum_stock":  sku.MaximumStock,
		"current_stock":  0,
		"vendor_id":      sku.VendorID,
		"status":         "Aktif",
		"lead_time_days":  sku.LeadTimeDays,
		"is_critical":    sku.IsCritical,
		"is_controlled":  sku.IsControlled,
		"is_taxable":     sku.IsTaxable,
		"created_at":     now,
		"updated_at":     now,
	}

	_, err := s.repo.Insert("skus", data)
	if err != nil {
		return nil, err
	}

	// Invalidate cache
	s.invalidateCache(ctx)

	return &sku, nil
}

func (s *SKUService) UpdateSKU(ctx context.Context, id string, req model.UpdateSKURequest) (*model.SKU, error) {
	data := map[string]any{
		"updated_at": time.Now(),
	}
	if req.SKUName != "" {
		data["sku_name"] = req.SKUName
	}
	if req.Category != "" {
		data["category"] = req.Category
	}
	if req.UOM != "" {
		data["uom"] = req.UOM
	}
	if req.Brand != "" {
		data["brand"] = req.Brand
	}
	if req.EstimatedPrice > 0 {
		data["estimated_price"] = req.EstimatedPrice
	}
	if req.MinimumStock > 0 {
		data["minimum_stock"] = req.MinimumStock
	}
	if req.MaximumStock > 0 {
		data["maximum_stock"] = req.MaximumStock
	}
	if req.CurrentStock >= 0 {
		data["current_stock"] = req.CurrentStock
	}
	if req.LeadTimeDays > 0 {
		data["lead_time_days"] = req.LeadTimeDays
	}
	data["is_critical"] = req.IsCritical
	data["is_controlled"] = req.IsControlled
	data["is_taxable"] = req.IsTaxable

	_, err := s.repo.Update("skus", id, data)
	if err != nil {
		return nil, err
	}

	s.invalidateCache(ctx)
	return s.GetSKU(ctx, id)
}

func (s *SKUService) ToggleStatus(ctx context.Context, id string, status string) error {
	_, err := s.repo.Update("skus", id, map[string]any{
		"status":     status,
		"updated_at": time.Now(),
	})
	s.invalidateCache(ctx)
	return err
}

func (s *SKUService) DeleteSKU(ctx context.Context, id string) error {
	err := s.repo.Delete("skus", id)
	s.invalidateCache(ctx)
	return err
}

func (s *SKUService) GetCriticalStock(ctx context.Context) ([]model.SKU, error) {
	rows, err := s.repo.List("skus", "select=*&current_stock=lt.minimum_stock&status=eq.Aktif")
	if err != nil {
		return nil, err
	}
	return s.mapRowsToSKUs(rows), nil
}

func (s *SKUService) invalidateCache(ctx context.Context) {
	if s.redis != nil {
		s.redis.Del(ctx, "skus:list:", "skus:list:Aktif", "skus:list:Nonaktif", "skus:list:")
	}
}

func (s *SKUService) mapRowsToSKUs(rows []map[string]any) []model.SKU {
	skus := make([]model.SKU, 0, len(rows))
	for _, row := range rows {
		skus = append(skus, s.mapRowToSKU(row))
	}
	return skus
}

func (s *SKUService) mapRowToSKU(row map[string]any) model.SKU {
	return model.SKU{
		SKUID:         getString(row, "sku_id"),
		SKUCode:       getString(row, "sku_code"),
		SKUName:       getString(row, "sku_name"),
		Category:      getString(row, "category"),
		Type:          getString(row, "type"),
		UOM:           getString(row, "uom"),
		Brand:         getString(row, "brand"),
		EstimatedPrice: getFloat(row, "estimated_price"),
		MinimumStock:  int(getFloat(row, "minimum_stock")),
		MaximumStock:  int(getFloat(row, "maximum_stock")),
		CurrentStock:  int(getFloat(row, "current_stock")),
		VendorID:      getString(row, "vendor_id"),
		Status:        getString(row, "status"),
		LeadTimeDays:  int(getFloat(row, "lead_time_days")),
		IsCritical:    getBool(row, "is_critical"),
		IsControlled:  getBool(row, "is_controlled"),
		IsTaxable:     getBool(row, "is_taxable"),
		CreatedAt:     getTime(row, "created_at"),
		UpdatedAt:     getTime(row, "updated_at"),
	}
}

func getBool(m map[string]any, key string) bool {
	if v, ok := m[key]; ok {
		if b, ok := v.(bool); ok {
			return b
		}
		if s, ok := v.(string); ok {
			return s == "true" || s == "t"
		}
	}
	return false
}
