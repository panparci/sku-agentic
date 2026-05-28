/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search } from 'lucide-react';
import { SKU_CATEGORY_FILTER_OPTIONS } from '../../constants/options';

export type StockFilter = 'All' | 'Low';

interface SkuFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  stockFilter: StockFilter;
  onStockFilterChange: (value: StockFilter) => void;
}

export function SkuFilters({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  stockFilter,
  onStockFilterChange,
}: SkuFiltersProps) {
  return (
    <div className="p-4 bg-slate-50/70 border-b border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-3">
      <div className="relative md:col-span-2">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari SKU berdasarkan kode atau nama barang..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-9 pr-4 py-1.5 w-full bg-white border border-slate-250 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
        />
      </div>

      <div>
        <select
          value={categoryFilter}
          onChange={e => onCategoryChange(e.target.value)}
          className="w-full px-3 py-1.5 bg-white border border-slate-250 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {SKU_CATEGORY_FILTER_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <select
          value={stockFilter}
          onChange={e => onStockFilterChange(e.target.value as StockFilter)}
          className="w-full px-3 py-1.5 bg-white border border-slate-250 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="All">Semua Status Stok</option>
          <option value="Low">⚠️ Stok Kritis (Under Minimum)</option>
        </select>
      </div>
    </div>
  );
}
