/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Vendor {
  id: string;
  code: string;
  name: string;
  contact: string;
  email: string;
  address: string;
  rating: number; // 1-5 stars
  sla_delivery_rate: number; // percentage (e.g. 98.5)
}

export interface SKU {
  sku_id: string;
  sku_code: string;
  sku_name: string;
  category: string;
  type: 'Obat' | 'Alkes' | 'BMHP' | 'Non-Medis' | 'Jasa';
  uom: string;
  brand: string;
  estimated_price: number;
  minimum_stock: number;
  maximum_stock: number;
  current_stock: number;
  vendor_id: string;
  status: 'Aktif' | 'Nonaktif';
  lead_time_days: number;
  is_critical: boolean;
  is_controlled: boolean;
  is_taxable: boolean;
}

export interface PurchaseRequisitionItem {
  id: string;
  sku_id: string;
  qty: number;
  unit_price: number; // estimated_price at time of PR creation
  total_price: number;
}

export interface PurchaseRequisition {
  pr_id: string;
  pr_number: string;
  department: string;
  req_date: string;
  target_date: string;
  total_amount: number;
  description: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Converted_to_PO' | 'Cancelled';
  reject_reason?: string;
  approved_by?: string;
  items: PurchaseRequisitionItem[];
}

export interface PurchaseOrderItem {
  id: string;
  sku_id: string;
  qty: number;
  unit_price: number;
  total_price: number;
}

export interface PurchaseOrder {
  po_id: string;
  po_number: string;
  pr_number: string;
  vendor_id: string;
  order_date: string;
  expected_date: string;
  total_amount: number;
  status: 'Draft' | 'Sent_to_Vendor' | 'Vendor_Confirmed' | 'Partially_Received' | 'Fully_Received' | 'Closed' | 'Cancelled';
  items: PurchaseOrderItem[];
}

export interface GoodsReceiptItem {
  id: string;
  sku_id: string;
  qty_ordered: number;
  qty_received: number;
  batch_number?: string; // mandatory for Medicine (Obat)
  expiry_date?: string; // mandatory for Medicine (Obat)
  serial_number?: string; // mandatory for Assets
}

export interface GoodsReceipt {
  grn_id: string;
  grn_number: string;
  po_number: string;
  received_date: string;
  received_by: string;
  status: 'Completed' | 'Pending_Verification' | 'Discrepancy';
  discrepancy_details?: string;
  items: GoodsReceiptItem[];
}

export interface InvoiceItem {
  id: string;
  sku_id: string;
  qty: number;
  unit_price_billed: number;
  total_price_billed: number;
}

export interface Invoice {
  invoice_id: string;
  invoice_number: string;
  po_number: string;
  grn_number: string;
  invoice_date: string;
  due_date: string;
  sub_total: number;
  tax: number;
  total_billed: number;
  status: 'Pending_Match' | 'Verified_Matched' | 'Discrepancy_Hold' | 'Approved_For_Payment' | 'Paid' | 'Disputed';
  payment_term_days: number;
  matching_score?: {
    po_match: boolean;
    grn_match: boolean;
    price_match: boolean;
    details: string;
  };
  items: InvoiceItem[];
}

export interface DepartmentBudget {
  cost_center_code: string;
  department_name: string;
  fiscal_year: number;
  total_limit: number;
  blocked_amount: number; // Amount blocked by pending/approved PRs
  spent_amount: number; // Realized PO payments
  remaining_allocated: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user_role: string;
  actor: string;
  module: 'SKU_Master' | 'PR' | 'PO' | 'GRN' | 'Invoice_matching' | 'Budget' | 'System';
  action_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'MATCH' | 'PAY';
  entity_id: string; // PR Number / SKU code etc.
  description: string;
  payload_json?: string;
}
