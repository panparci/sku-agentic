/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertTriangle } from 'lucide-react';
import { SKU, Vendor } from '../../types';
import { formatIDR } from '../../utils/format';

interface SkuTableProps {
  skus: SKU[];
  vendors: Vendor[];
  onToggleStatus: (skuId: string) => void;
}

export function SkuTable({ skus, vendors, onToggleStatus }: SkuTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
            <th className="py-3 px-4">Kode SKU</th>
            <th className="py-3 px-4">Nama Barang</th>
            <th className="py-3 px-4">Kategori / Satuan</th>
            <th className="py-3 px-4 text-right font-semibold">
              Harga Estimasi
            </th>
            <th className="py-3 px-4 text-center">Status Stok</th>
            <th className="py-3 px-4">Vendor Partner</th>
            <th className="py-3 px-4 text-center">Status</th>
            <th className="py-3 px-4 text-center">Ubah Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {skus.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="text-center py-12 text-slate-400 italic"
              >
                Tidak ditemukan SKU yang cocok dengan filter pencarian Anda.
              </td>
            </tr>
          ) : (
            skus.map(s => (
              <SkuTableRow
                key={s.sku_id}
                sku={s}
                vendor={vendors.find(v => v.id === s.vendor_id)}
                onToggleStatus={onToggleStatus}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

interface SkuTableRowProps {
  sku: SKU;
  vendor?: Vendor;
  onToggleStatus: (skuId: string) => void;
}

function SkuTableRow({ sku, vendor, onToggleStatus }: SkuTableRowProps) {
  const isUnderStock = sku.current_stock < sku.minimum_stock;

  return (
    <tr className="hover:bg-slate-50/80 transition-colors">
      <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-900">
        {sku.sku_code}
      </td>
      <td className="py-3.5 px-4 font-medium text-slate-800">
        <div>
          {sku.sku_name}
          {isUnderStock && (
            <span className="ml-2 inline-flex items-center gap-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md animate-pulse">
              <AlertTriangle className="w-3 h-3 text-rose-500" />
              Restock!
            </span>
          )}
        </div>
      </td>
      <td className="py-3.5 px-4 text-xs text-slate-600">
        <span className="bg-slate-100 px-2 py-0.5 rounded font-medium mr-1">
          {sku.category}
        </span>
        <span className="text-slate-400 font-mono">({sku.uom})</span>
      </td>
      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
        {formatIDR(sku.estimated_price)}
      </td>
      <td className="py-3.5 px-4">
        <div className="flex flex-col items-center justify-center">
          <span
            className={`text-xs font-mono font-bold ${
              isUnderStock ? 'text-red-600' : 'text-slate-700'
            }`}
          >
            {sku.current_stock}
          </span>
          <span className="text-[10px] text-slate-400">
            Min: {sku.minimum_stock}
          </span>
        </div>
      </td>
      <td className="py-3.5 px-4">
        <span
          className="text-xs text-slate-900 font-semibold block"
          title={vendor?.name}
        >
          {vendor?.name.split(' ')[1] || vendor?.name}
        </span>
        <span className="text-[10px] text-slate-400 font-mono uppercase">
          {vendor?.code}
        </span>
      </td>
      <td className="py-3.5 px-4 text-center">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            sku.status === 'Aktif'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}
        >
          {sku.status}
        </span>
      </td>
      <td className="py-3.5 px-4 text-center">
        <button
          onClick={() => onToggleStatus(sku.sku_id)}
          className={`text-[11px] font-bold px-2 py-1 rounded transition-colors ${
            sku.status === 'Aktif'
              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
          }`}
        >
          {sku.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
        </button>
      </td>
    </tr>
  );
}
