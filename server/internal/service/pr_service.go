package service

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"

	"sku-rumahsakit/internal/model"
	"sku-rumahsakit/internal/repository"
)

type PRService struct {
	repo  *repository.SupabaseRepository
	redis *repository.RedisRepository
}

func NewPRService(repo *repository.SupabaseRepository, redis *repository.RedisRepository) *PRService {
	return &PRService{repo: repo, redis: redis}
}

func (s *PRService) ListPRs(ctx context.Context, status string, department string) ([]model.PurchaseRequisition, error) {
	query := "select=*,pr_items(*)&order=created_at.desc"
	if status != "" {
		query += fmt.Sprintf("&status=eq.%s", status)
	}
	if department != "" {
		query += fmt.Sprintf("&department=eq.%s", department)
	}

	rows, err := s.repo.List("purchase_requisitions", query)
	if err != nil {
		return nil, err
	}
	return s.mapRowsToPRs(rows)
}

func (s *PRService) GetPR(ctx context.Context, id string) (*model.PurchaseRequisition, error) {
	query := fmt.Sprintf("select=*,pr_items(*)&id=eq.%s", id)
	rows, err := s.repo.List("purchase_requisitions", query)
	if err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return nil, fmt.Errorf("PR not found")
	}
	pr := s.mapRowToPR(rows[0])
	return &pr, nil
}

func (s *PRService) CreatePR(ctx context.Context, req model.CreatePRRequest) (*model.PurchaseRequisition, error) {
	now := time.Now()
	prID := uuid.New().String()
	prNumber := generatePRNumber()

	// Calculate total
	var totalAmount float64
	for _, item := range req.Items {
		// Get SKU price
		sku, err := s.getSKU(item.SKUID)
		if err != nil {
			// Skip or use estimated
			continue
		}
		totalAmount += float64(item.Qty) * sku.EstimatedPrice
	}

	pr := model.PurchaseRequisition{
		PRID:        prID,
		PRNumber:    prNumber,
		Department:  req.Department,
		ReqDate:     now,
		TargetDate:  parseDate(req.TargetDate),
		TotalAmount: totalAmount,
		Description: req.Description,
		Status:      model.PRDraft,
		Items:       []model.PRItem{},
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	// Insert PR header
	prData := map[string]any{
		"id":           pr.PRID,
		"pr_number":    pr.PRNumber,
		"department":   pr.Department,
		"req_date":     pr.ReqDate.Format(time.RFC3339),
		"target_date":  pr.TargetDate.Format("2006-01-02"),
		"total_amount": pr.TotalAmount,
		"description":  pr.Description,
		"status":       string(pr.Status),
		"created_at":   pr.CreatedAt,
		"updated_at":   pr.UpdatedAt,
	}

	_, err := s.repo.Insert("purchase_requisitions", prData)
	if err != nil {
		return nil, err
	}

	// Insert PR items
	for _, item := range req.Items {
		sku, _ := s.getSKU(item.SKUID)
		unitPrice := 0.0
		if sku != nil {
			unitPrice = sku.EstimatedPrice
		}
		
		itemID := uuid.New().String()
		itemData := map[string]any{
			"id":           itemID,
			"pr_id":        prID,
			"sku_id":       item.SKUID,
			"qty":          item.Qty,
			"unit_price":   unitPrice,
			"total_price":  float64(item.Qty) * unitPrice,
		}
		s.repo.Insert("pr_items", itemData)

		pr.Items = append(pr.Items, model.PRItem{
			ID:         itemID,
			SKUID:      item.SKUID,
			Qty:        item.Qty,
			UnitPrice:  unitPrice,
			TotalPrice: float64(item.Qty) * unitPrice,
		})
	}

	s.invalidateCache(ctx)
	return &pr, nil
}

func (s *PRService) UpdatePRStatus(ctx context.Context, id string, req model.UpdatePRStatusRequest, userID string) (*model.PurchaseRequisition, error) {
	data := map[string]any{
		"status":     string(req.Status),
		"updated_at": time.Now(),
	}

	if req.Status == model.PRRejected && req.RejectReason != "" {
		data["reject_reason"] = req.RejectReason
	}
	if req.Status == model.PRApproved {
		data["approved_by"] = userID
	}

	_, err := s.repo.Update("purchase_requisitions", id, data)
	if err != nil {
		return nil, err
	}

	s.invalidateCache(ctx)
	return s.GetPR(ctx, id)
}

func (s *PRService) DeletePR(ctx context.Context, id string) error {
	// Delete items first (best effort)
	s.repo.Delete("pr_items", "pr_id=eq."+id)
	// Delete PR
	s.repo.Delete("purchase_requisitions", id)
	s.invalidateCache(ctx)
	return nil
}

func (s *PRService) getSKU(skuID string) (*model.SKU, error) {
	row, err := s.repo.Get("skus", skuID)
	if err != nil {
		return nil, err
	}
	sku := &model.SKU{
		SKUID:         getString(row, "sku_id"),
		SKUCode:       getString(row, "sku_code"),
		SKUName:       getString(row, "sku_name"),
		EstimatedPrice: getFloat(row, "estimated_price"),
	}
	return sku, nil
}

func (s *PRService) invalidateCache(ctx context.Context) {
	if s.redis != nil {
		s.redis.Del(ctx, "prs:list:")
	}
}

func (s *PRService) mapRowsToPRs(rows []map[string]any) ([]model.PurchaseRequisition, error) {
	prs := make([]model.PurchaseRequisition, 0, len(rows))
	for _, row := range rows {
		prs = append(prs, s.mapRowToPR(row))
	}
	return prs, nil
}

func (s *PRService) mapRowToPR(row map[string]any) model.PurchaseRequisition {
	pr := model.PurchaseRequisition{
		PRID:         getString(row, "id"),
		PRNumber:     getString(row, "pr_number"),
		Department:   getString(row, "department"),
		TotalAmount:  getFloat(row, "total_amount"),
		Description:  getString(row, "description"),
		Status:       model.PRStatus(getString(row, "status")),
		RejectReason: getString(row, "reject_reason"),
		ApprovedBy:    getString(row, "approved_by"),
		CreatedAt:    getTime(row, "created_at"),
		UpdatedAt:    getTime(row, "updated_at"),
	}

	if t := getString(row, "req_date"); t != "" {
		pr.ReqDate = getTime(row, "req_date")
	}
	if t := getString(row, "target_date"); t != "" {
		pr.TargetDate = getTime(row, "target_date")
	}

	// Parse items if present
	if itemsRaw, ok := row["pr_items"]; ok {
		if items, ok := itemsRaw.([]any); ok {
			for _, itemRaw := range items {
				if item, ok := itemRaw.(map[string]any); ok {
					pr.Items = append(pr.Items, model.PRItem{
						ID:         getString(item, "id"),
						SKUID:      getString(item, "sku_id"),
						Qty:        int(getFloat(item, "qty")),
						UnitPrice:  getFloat(item, "unit_price"),
						TotalPrice: getFloat(item, "total_price"),
					})
				}
			}
		}
	}

	return pr
}

func generatePRNumber() string {
	now := time.Now()
	return fmt.Sprintf("PR-%s-%04d", now.Format("20060102"), now.UnixNano()%10000)
}

func parseDate(s string) time.Time {
	t, err := time.Parse("2006-01-02", s)
	if err != nil {
		return time.Now().AddDate(0, 0, 14) // Default 2 weeks
	}
	return t
}
