/**
 * BFF API Client — SKU Rumah Sakit
 * fetch-based, auth via localStorage cgp_token
 */

const BASE_URL = "/api/v1";
const TOKEN_KEY = "cgp_token";

function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: { code?: string; message: string; details?: unknown };
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const url = BASE_URL + path;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = "Bearer " + token;
  const res = await fetch(url, {
    method, headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  const data: ApiResponse<T> = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error?.message || "Request failed: " + res.status);
  return data.data as T;
}

// ============ Auth ============
export const authApi = {
  login: (email: string, password: string) =>
    request<{ user: User; access_token: string }>("POST", "/auth/login", { email, password }),
  logout: () => request("POST", "/auth/logout"),
  me: () => request<User>("GET", "/me"),
};

// ============ Vendors ============
export const vendorApi = {
  list: () => request<Vendor[]>("GET", "/vendors"),
  get: (id: string) => request<Vendor>("GET", "/vendors/" + id),
  create: (data: CreateVendorInput) => request<Vendor>("POST", "/vendors", data),
  update: (id: string, data: UpdateVendorInput) => request<Vendor>("PUT", "/vendors/" + id, data),
  delete: (id: string) => request("DELETE", "/vendors/" + id),
};

// ============ SKUs ============
export const skuApi = {
  list: (status?: string) =>
    request<SKU[]>("GET", status ? "/skus?status=" + status : "/skus"),
  get: (id: string) => request<SKU>("GET", "/skus/" + id),
  create: (data: CreateSKUInput) => request<SKU>("POST", "/skus", data),
  update: (id: string, data: UpdateSKUInput) => request<SKU>("PUT", "/skus/" + id, data),
  toggleStatus: (id: string, status: string) =>
    request("PATCH", "/skus/" + id + "/status", { status }),
  delete: (id: string) => request("DELETE", "/skus/" + id),
  criticalStock: () => request<SKU[]>("GET", "/skus/critical"),
};

// ============ PRs ============
export const prApi = {
  list: (status?: string, department?: string) => {
    let path = "/purchase-requisitions";
    const params: string[] = [];
    if (status) params.push("status=" + status);
    if (department) params.push("department=" + department);
    if (params.length) path += "?" + params.join("&");
    return request<PurchaseRequisition[]>("GET", path);
  },
  get: (id: string) => request<PurchaseRequisition>("GET", "/purchase-requisitions/" + id),
  create: (data: CreatePRInput) => request<PurchaseRequisition>("POST", "/purchase-requisitions", data),
  updateStatus: (id: string, status: string, rejectReason?: string) =>
    request("PUT", "/purchase-requisitions/" + id + "/status", { status, reject_reason: rejectReason }),
  delete: (id: string) => request("DELETE", "/purchase-requisitions/" + id),
};

// ============ Types ============
export interface User { id: string; email: string; name: string; role: string; department?: string; }
export interface Vendor { id: string; code: string; name: string; contact: string; email: string; address: string; rating: number; sla_delivery_rate: number; }
export interface SKU {
  sku_id: string; sku_code: string; sku_name: string; category: string; type: string;
  uom: string; brand: string; estimated_price: number; minimum_stock: number;
  maximum_stock: number; current_stock: number; vendor_id: string; status: string;
  lead_time_days: number; is_critical: boolean; is_controlled: boolean; is_taxable: boolean;
  created_at?: string; updated_at?: string;
}
export interface PurchaseRequisition {
  pr_id: string; pr_number: string; department: string; req_date: string; target_date: string;
  total_amount: number; description?: string; status: string; reject_reason?: string;
  approved_by?: string; items: PurchaseRequisitionItem[];
}
export interface PurchaseRequisitionItem { id: string; sku_id: string; qty: number; unit_price: number; total_price: number; }
export interface CreateVendorInput { code: string; name: string; contact: string; email: string; address?: string; }
export interface UpdateVendorInput { name?: string; contact?: string; email?: string; address?: string; }
export interface CreateSKUInput {
  sku_code: string; sku_name: string; category: string; type: string; uom: string;
  estimated_price: number; minimum_stock?: number; maximum_stock?: number;
  vendor_id: string; is_critical?: boolean; is_controlled?: boolean; is_taxable?: boolean;
}
export interface UpdateSKUInput {
  sku_name?: string; category?: string; uom?: string; estimated_price?: number;
  minimum_stock?: number; maximum_stock?: number; current_stock?: number;
  is_critical?: boolean; is_controlled?: boolean; is_taxable?: boolean;
}
export interface CreatePRInput { department: string; target_date: string; description?: string; items: { sku_id: string; qty: number }[]; }
