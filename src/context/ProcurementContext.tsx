/**
 * ProcurementContext — full API fetching (no localStorage)
 */

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { skuApi, vendorApi, prApi, type SKU, type Vendor, type PurchaseRequisition } from '../services/api';
import { useApiLogs, type ApiLog } from '../hooks/useApiLogs';

interface SkuFormInput {
  sku_code: string;
  sku_name: string;
  category: string;
  uom: string;
  estimated_price: number;
  minimum_stock: number;
  current_stock: number;
  vendor_id: string;
  status: 'Aktif' | 'Nonaktif';
}

interface VendorFormInput {
  code: string;
  name: string;
  contact: string;
  email: string;
  address: string;
}

interface PrFormItemInput {
  sku_id: string;
  qty: number;
}

interface PrFormInput {
  department: string;
  target_date: string;
  description: string;
  items: PrFormItemInput[];
}

interface ProcurementContextValue {
  vendors: Vendor[];
  skus: SKU[];
  prs: PurchaseRequisition[];
  loading: boolean;
  apiLogs: ApiLog[];
  clearApiLogs: () => void;
  criticalStockCount: number;
  pendingPrCount: number;
  addSku: (input: SkuFormInput) => Promise<boolean>;
  toggleSkuStatus: (skuId: string) => Promise<void>;
  addVendor: (input: VendorFormInput) => Promise<boolean>;
  addPr: (input: PrFormInput, status: 'Draft' | 'Submitted') => Promise<boolean>;
  updatePrStatus: (prId: string, nextStatus: 'Submitted' | 'Approved' | 'Rejected') => Promise<void>;
  deletePr: (prId: string) => Promise<void>;
  refreshSkus: () => Promise<void>;
  refreshVendors: () => Promise<void>;
  refreshPrs: () => Promise<void>;
}

const ProcurementContext = createContext<ProcurementContextValue | undefined>(undefined);

export function ProcurementProvider({ children }: { children: ReactNode }) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [skus, setSkus] = useState<SKU[]>([]);
  const [prs, setPrs] = useState<PurchaseRequisition[]>([]);
  const [loading, setLoading] = useState(true);
  const { logs: apiLogs, addLog, clearLogs: clearApiLogs } = useApiLogs();

  const criticalStockCount = useMemo(() => skus.filter((s) => s.current_stock < s.minimum_stock).length, [skus]);
  const pendingPrCount = useMemo(() => prs.filter((p) => p.status === 'Submitted').length, [prs]);

  const refreshSkus = useCallback(async () => {
    try {
      const data = await skuApi.list();
      setSkus(data || []);
    } catch (e: unknown) {
      addLog('GET', '/skus', undefined, { success: false, message: (e as Error).message });
    }
  }, [addLog]);

  const refreshVendors = useCallback(async () => {
    try {
      const data = await vendorApi.list();
      setVendors(data || []);
    } catch (e: unknown) {
      addLog('GET', '/vendors', undefined, { success: false, message: (e as Error).message });
    }
  }, [addLog]);

  const refreshPrs = useCallback(async () => {
    try {
      const data = await prApi.list();
      setPrs(data || []);
    } catch (e: unknown) {
      addLog('GET', '/purchase-requisitions', undefined, { success: false, message: (e as Error).message });
    }
  }, [addLog]);

  // Initial data fetch
  useEffect(() => {
    Promise.all([refreshSkus(), refreshVendors(), refreshPrs()])
      .finally(() => setLoading(false));
  }, []);

  const toggleSkuStatus = useCallback(
    async (skuId: string) => {
      const sku = skus.find((s) => s.sku_id === skuId);
      if (!sku) return;
      const nextStatus = sku.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
      try {
        await skuApi.toggleStatus(skuId, nextStatus);
        setSkus((prev) => prev.map((s) => (s.sku_id === skuId ? { ...s, status: nextStatus } : s)));
        addLog('PATCH', `/skus/${skuId}/status`, { status: nextStatus }, { success: true });
      } catch (e: unknown) {
        addLog('PATCH', `/skus/${skuId}/status`, { status: nextStatus }, { success: false, message: (e as Error).message });
      }
    },
    [skus, addLog]
  );

  const addSku = useCallback(
    async (input: SkuFormInput): Promise<boolean> => {
      if (!input.sku_code || !input.sku_name || !input.vendor_id) {
        alert('Mohon isi semua data wajib.');
        return false;
      }
      try {
        const typeMap: Record<string, string> = {
          'Obat-obatan': 'Obat', 'BMHP': 'BMHP', 'Alat Kesehatan': 'Alkes', 'Non-Medis': 'Non-Medis',
        };
        const newSku = await skuApi.create({
          sku_code: input.sku_code.toUpperCase(),
          sku_name: input.sku_name,
          category: input.category,
          type: typeMap[input.category] || input.category,
          uom: input.uom,
          estimated_price: Number(input.estimated_price),
          minimum_stock: Number(input.minimum_stock),
          maximum_stock: Number(input.minimum_stock) * 10,
          vendor_id: input.vendor_id,
          is_critical: input.category === 'Obat-obatan',
          is_controlled: false,
          is_taxable: true,
        });
        setSkus((prev) => [newSku, ...prev]);
        addLog('POST', '/skus', input, { success: true, data: newSku });
        return true;
      } catch (e: unknown) {
        alert(`Gagal menambah SKU: ${(e as Error).message}`);
        return false;
      }
    },
    [addLog]
  );

  const addVendor = useCallback(
    async (input: VendorFormInput): Promise<boolean> => {
      if (!input.code || !input.name) {
        alert('Mohon isi kode dan nama vendor.');
        return false;
      }
      try {
        const newVendor = await vendorApi.create({
          code: input.code.toUpperCase(),
          name: input.name,
          contact: input.contact || 'Melalui Admin',
          email: input.email || 'sales@vendor.co.id',
          address: input.address || 'Alamat Belum Diisi',
        });
        setVendors((prev) => [...prev, newVendor]);
        addLog('POST', '/vendors', input, { success: true, data: newVendor });
        return true;
      } catch (e: unknown) {
        alert(`Gagal menambah vendor: ${(e as Error).message}`);
        return false;
      }
    },
    [addLog]
  );

  const addPr = useCallback(
    async (input: PrFormInput, status: 'Draft' | 'Submitted'): Promise<boolean> => {
      if (!input.department) {
        alert('Mohon tentukan departemen pengaju.');
        return false;
      }
      const filledItems = input.items.filter((it) => it.sku_id !== '');
      if (filledItems.length === 0) {
        alert('Mohon tambahkan minimal satu barang (SKU) ke daftar PR.');
        return false;
      }
      try {
        const newPr = await prApi.create({ ...input, items: filledItems });
        setPrs((prev) => [newPr, ...prev]);
        addLog('POST', '/purchase-requisitions', { ...input, status }, { success: true, pr_id: newPr.pr_id });
        return true;
      } catch (e: unknown) {
        alert(`Gagal membuat PR: ${(e as Error).message}`);
        return false;
      }
    },
    [addLog]
  );

  const updatePrStatus = useCallback(
    async (prId: string, nextStatus: 'Submitted' | 'Approved' | 'Rejected') => {
      try {
        await prApi.updateStatus(prId, nextStatus);
        setPrs((prev) => prev.map((pr) => (pr.pr_id === prId ? { ...pr, status: nextStatus } : pr)));
        addLog('PUT', `/purchase-requisitions/${prId}/status`, { status: nextStatus }, { success: true });
      } catch (e: unknown) {
        alert(`Gagal update status PR: ${(e as Error).message}`);
      }
    },
    [addLog]
  );

  const deletePr = useCallback(
    async (prId: string) => {
      if (!confirm('Apakah Anda yakin ingin menghapus PR ini?')) return;
      try {
        await prApi.delete(prId);
        setPrs((prev) => prev.filter((pr) => pr.pr_id !== prId));
        addLog('DELETE', `/purchase-requisitions/${prId}`, null, { success: true });
      } catch (e: unknown) {
        alert(`Gagal hapus PR: ${(e as Error).message}`);
      }
    },
    [addLog]
  );

  const value = useMemo<ProcurementContextValue>(
    () => ({
      vendors, skus, prs, loading, apiLogs, clearApiLogs,
      criticalStockCount, pendingPrCount,
      addSku, toggleSkuStatus, addVendor, addPr, updatePrStatus, deletePr,
      refreshSkus, refreshVendors, refreshPrs,
    }),
    [vendors, skus, prs, loading, apiLogs, clearApiLogs, criticalStockCount, pendingPrCount]
  );

  return <ProcurementContext.Provider value={value}>{children}</ProcurementContext.Provider>;
}

export function useProcurement(): ProcurementContextValue {
  const ctx = useContext(ProcurementContext);
  if (!ctx) throw new Error('useProcurement must be used within ProcurementProvider');
  return ctx;
}
