/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Central state + business actions for the procurement system.
 * Keeps `App.tsx` and presentation components free of mutation logic.
 */

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react';

import { STORAGE_KEYS } from '../constants/options';
import { initialPRs, initialSKUs, initialVendors } from '../initialData';
import {
  PurchaseRequisition,
  PurchaseRequisitionItem,
  SKU,
  Vendor,
} from '../types';
import { usePersistentState } from '../hooks/usePersistentState';
import { useApiLogs, type ApiLog } from '../hooks/useApiLogs';
import { generateId, todayISO } from '../utils/format';
import { buildPrNumber } from '../utils/prNumber';
import { categoryToType } from '../utils/skuCategory';

export interface SkuFormInput {
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

export interface VendorFormInput {
  code: string;
  name: string;
  contact: string;
  email: string;
  address: string;
}

export interface PrFormItemInput {
  sku_id: string;
  qty: number;
}

export interface PrFormInput {
  department: string;
  target_date: string;
  description: string;
  items: PrFormItemInput[];
}

interface ProcurementContextValue {
  // Data
  vendors: Vendor[];
  skus: SKU[];
  prs: PurchaseRequisition[];

  // API simulation
  apiLogs: ApiLog[];
  clearApiLogs: () => void;

  // Derived metrics
  criticalStockCount: number;
  pendingPrCount: number;

  // Actions: SKU
  addSku: (input: SkuFormInput) => boolean;
  toggleSkuStatus: (skuId: string) => void;

  // Actions: Vendor
  addVendor: (input: VendorFormInput) => boolean;

  // Actions: PR
  addPr: (input: PrFormInput, status: 'Draft' | 'Submitted') => boolean;
  updatePrStatus: (
    prId: string,
    nextStatus: 'Submitted' | 'Approved' | 'Rejected'
  ) => void;
  deletePr: (prId: string) => void;
}

const ProcurementContext = createContext<ProcurementContextValue | undefined>(
  undefined
);

export function ProcurementProvider({ children }: { children: ReactNode }) {
  const [vendors, setVendors] = usePersistentState<Vendor[]>(
    STORAGE_KEYS.vendors,
    initialVendors
  );
  const [skus, setSkus] = usePersistentState<SKU[]>(
    STORAGE_KEYS.skus,
    initialSKUs
  );
  const [prs, setPrs] = usePersistentState<PurchaseRequisition[]>(
    STORAGE_KEYS.prs,
    initialPRs
  );

  const { logs: apiLogs, addLog, clearLogs: clearApiLogs } = useApiLogs();

  const criticalStockCount = useMemo(
    () => skus.filter(s => s.current_stock < s.minimum_stock).length,
    [skus]
  );

  const pendingPrCount = useMemo(
    () => prs.filter(p => p.status === 'Submitted').length,
    [prs]
  );

  // ============ SKU Actions ============
  const toggleSkuStatus = useCallback(
    (skuId: string) => {
      setSkus(prev =>
        prev.map(item => {
          if (item.sku_id !== skuId) return item;
          const nextStatus: 'Aktif' | 'Nonaktif' =
            item.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
          const result = { ...item, status: nextStatus };
          addLog(
            'PATCH',
            `/api/skus/${skuId}/status`,
            { status: nextStatus },
            { success: true, updatedSku: result }
          );
          return result;
        })
      );
    },
    [addLog, setSkus]
  );

  const addSku = useCallback<ProcurementContextValue['addSku']>(
    input => {
      if (!input.sku_code || !input.sku_name || !input.vendor_id) {
        alert('Mohon isi semua data wajib.');
        return false;
      }

      const newSku: SKU = {
        sku_id: generateId('SKU'),
        sku_code: input.sku_code.toUpperCase(),
        sku_name: input.sku_name,
        category: input.category,
        type: categoryToType(input.category),
        uom: input.uom,
        brand: 'Generik',
        estimated_price: Number(input.estimated_price),
        minimum_stock: Number(input.minimum_stock),
        maximum_stock: Number(input.minimum_stock) * 10,
        current_stock: Number(input.current_stock),
        vendor_id: input.vendor_id,
        status: input.status,
        lead_time_days: 3,
        is_critical: input.category === 'Obat-obatan',
        is_controlled: false,
        is_taxable: true,
      };

      setSkus(prev => [newSku, ...prev]);
      addLog('POST', '/api/skus', input, {
        success: true,
        message: 'SKU Berhasil ditambahkan!',
        data: newSku,
      });
      return true;
    },
    [addLog, setSkus]
  );

  // ============ Vendor Actions ============
  const addVendor = useCallback<ProcurementContextValue['addVendor']>(
    input => {
      if (!input.code || !input.name) {
        alert('Mohon isi kode dan nama vendor.');
        return false;
      }

      const newVendor: Vendor = {
        id: `VND-${Date.now().toString().slice(-4)}`,
        code: `VND-${input.code.toUpperCase()}`,
        name: input.name,
        contact: input.contact || 'Melalui Admin',
        email: input.email || 'sales@vendor.co.id',
        address: input.address || 'Alamat Belum Diisi',
        rating: 4.5,
        sla_delivery_rate: 95.0,
      };

      setVendors(prev => [...prev, newVendor]);
      addLog('POST', '/api/vendors', input, {
        success: true,
        message: 'Vendor baru didaftarkan!',
        data: newVendor,
      });
      return true;
    },
    [addLog, setVendors]
  );

  // ============ PR Actions ============
  const addPr = useCallback<ProcurementContextValue['addPr']>(
    (input, status) => {
      if (!input.department) {
        alert('Mohon tentukan departemen pengaju.');
        return false;
      }

      const filledItems = input.items.filter(it => it.sku_id !== '');
      if (filledItems.length === 0) {
        alert('Mohon tambahkan minimal satu barang (SKU) ke daftar PR.');
        return false;
      }

      let totalAmount = 0;
      const finalItems: PurchaseRequisitionItem[] = filledItems.map(
        (item, idx) => {
          const matchSku = skus.find(s => s.sku_id === item.sku_id);
          const price = matchSku ? matchSku.estimated_price : 0;
          const total = price * item.qty;
          totalAmount += total;
          return {
            id: `PR-ITEM-${Date.now()}-${idx}`,
            sku_id: item.sku_id,
            qty: item.qty,
            unit_price: price,
            total_price: total,
          };
        }
      );

      const newPR: PurchaseRequisition = {
        pr_id: generateId('PR'),
        pr_number: buildPrNumber(input.department),
        department: input.department,
        req_date: todayISO(),
        target_date: input.target_date,
        total_amount: totalAmount,
        description:
          input.description || 'Kebutuhan Unit Operasional Rumah Sakit.',
        status,
        items: finalItems,
      };

      setPrs(prev => [newPR, ...prev]);
      addLog(
        'POST',
        '/api/purchase-requisitions',
        { ...input, status },
        {
          success: true,
          pr_id: newPR.pr_id,
          pr_number: newPR.pr_number,
          total_amount: totalAmount,
        }
      );
      return true;
    },
    [addLog, setPrs, skus]
  );

  const updatePrStatus = useCallback<ProcurementContextValue['updatePrStatus']>(
    (prId, nextStatus) => {
      setPrs(prev =>
        prev.map(pr => {
          if (pr.pr_id !== prId) return pr;
          const result = { ...pr, status: nextStatus };
          addLog(
            'PUT',
            `/api/purchase-requisitions/${prId}/status`,
            { status: nextStatus },
            { success: true, pr_id: prId, new_status: nextStatus }
          );
          return result;
        })
      );
    },
    [addLog, setPrs]
  );

  const deletePr = useCallback<ProcurementContextValue['deletePr']>(
    prId => {
      if (!confirm('Apakah Anda yakin ingin menghapus PR ini?')) return;
      setPrs(prev => prev.filter(pr => pr.pr_id !== prId));
      addLog('DELETE', `/api/purchase-requisitions/${prId}`, null, {
        success: true,
        message: 'Draf PR berhasil dihapus',
      });
    },
    [addLog, setPrs]
  );

  const value = useMemo<ProcurementContextValue>(
    () => ({
      vendors,
      skus,
      prs,
      apiLogs,
      clearApiLogs,
      criticalStockCount,
      pendingPrCount,
      addSku,
      toggleSkuStatus,
      addVendor,
      addPr,
      updatePrStatus,
      deletePr,
    }),
    [
      vendors,
      skus,
      prs,
      apiLogs,
      clearApiLogs,
      criticalStockCount,
      pendingPrCount,
      addSku,
      toggleSkuStatus,
      addVendor,
      addPr,
      updatePrStatus,
      deletePr,
    ]
  );

  return (
    <ProcurementContext.Provider value={value}>
      {children}
    </ProcurementContext.Provider>
  );
}

export function useProcurement(): ProcurementContextValue {
  const ctx = useContext(ProcurementContext);
  if (!ctx) {
    throw new Error('useProcurement must be used within a ProcurementProvider');
  }
  return ctx;
}
