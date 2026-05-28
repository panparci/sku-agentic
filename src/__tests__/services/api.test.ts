/**
 * API Service Tests
 */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { authApi, vendorApi, skuApi, prApi } from '../../services/api';

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('authApi', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should login successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          user: { id: '1', email: 'admin@test.com', name: 'Admin', role: 'ADMIN' },
          access_token: 'jwt-token-here',
        },
      }),
    } as Response);

    const result = await authApi.login('admin@test.com', 'password123');

    expect(result.success).toBe(true);
    expect(result.data?.user.email).toBe('admin@test.com');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('should handle login failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: { message: 'Invalid credentials' },
      }),
    } as Response);

    const result = await authApi.login('bad@test.com', 'wrong');

    expect(result.success).toBe(false);
    expect(result.error?.message).toBe('Invalid credentials');
  });

  it('should logout successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Logged out' }),
    } as Response);

    const result = await authApi.logout();

    expect(result.success).toBe(true);
  });
});

describe('vendorApi', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should list vendors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [
          { id: '1', code: 'VND-001', name: 'Vendor A', contact: '123', email: 'a@b.com', address: 'Alamat A', rating: 4.5, sla_delivery_rate: 95 },
        ],
      }),
    } as Response);

    const result = await vendorApi.list();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data?.[0].name).toBe('Vendor A');
  });

  it('should create vendor', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { id: '2', code: 'VND-002', name: 'Vendor B' },
      }),
    } as Response);

    const result = await vendorApi.create({
      code: 'VND-002',
      name: 'Vendor B',
      contact: '456',
      email: 'b@c.com',
    });

    expect(result.success).toBe(true);
    expect(result.data?.code).toBe('VND-002');
  });
});

describe('skuApi', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should list SKUs', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [
          {
            sku_id: 'SKU-001',
            sku_code: 'SKU-MED-001',
            sku_name: 'Paracetamol 500mg',
            category: 'Obat-obatan',
            type: 'Obat',
            uom: 'Box',
            estimated_price: 45000,
            minimum_stock: 30,
            current_stock: 15,
            status: 'Aktif',
            is_critical: false,
            is_controlled: false,
            is_taxable: true,
          },
        ],
      }),
    } as Response);

    const result = await skuApi.list('Aktif');

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data?.[0].current_stock).toBeLessThan(result.data?.[0].minimum_stock);
  });

  it('should get critical stock', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [
          { sku_id: 'SKU-001', sku_name: 'Low Stock Item', current_stock: 5, minimum_stock: 50 },
        ],
      }),
    } as Response);

    const result = await skuApi.criticalStock();

    expect(result.success).toBe(true);
    expect(result.data?.[0].current_stock).toBeLessThan(result.data?.[0].minimum_stock);
  });
});

describe('prApi', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should list PRs', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [
          {
            pr_id: 'PR-001',
            pr_number: 'PR-20260101-0001',
            department: 'IGD',
            total_amount: 450000,
            status: 'Submitted',
            items: [],
          },
        ],
      }),
    } as Response);

    const result = await prApi.list('Submitted');

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data?.[0].status).toBe('Submitted');
  });

  it('should create PR', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          pr_id: 'PR-NEW',
          pr_number: 'PR-20260101-9999',
          department: 'IGD',
          status: 'Draft',
          items: [{ sku_id: 'SKU-001', qty: 10, unit_price: 45000, total_price: 450000 }],
        },
      }),
    } as Response);

    const result = await prApi.create({
      department: 'IGD',
      target_date: '2026-01-15',
      description: 'Emergency stock',
      items: [{ sku_id: 'SKU-001', qty: 10 }],
    });

    expect(result.success).toBe(true);
    expect(result.data?.pr_number).toContain('PR-');
  });
});
