/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Package, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useProcurement } from '../../context/ProcurementContext';
import { SkuFilters, type StockFilter } from './SkuFilters';
import { SkuFormModal } from './SkuFormModal';
import { SkuTable } from './SkuTable';

export function SkuPage() {
  const { skus, vendors, toggleSkuStatus, loading } = useProcurement();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState<StockFilter>('All');
  const [showModal, setShowModal] = useState(false);

  const filteredSkus = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return skus.filter(s => {
      const matchesSearch =
        s.sku_code.toLowerCase().includes(query) ||
        s.sku_name.toLowerCase().includes(query);
      const matchesCategory =
        categoryFilter === 'All' || s.category === categoryFilter;
      const matchesStock =
        stockFilter === 'All' || s.current_stock < s.minimum_stock;
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [skus, searchQuery, categoryFilter, stockFilter]);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Package className="h-5.5 w-5.5 text-teal-600" />
              Manajemen SKU Master Rumah Sakit
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar obat-obatan, Alkes, dan BMHP terstandar dengan monitoring
              ambang stok.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-2 px-3.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500"
            id="btn-tambah-sku"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            Tambah SKU Baru
          </button>
        </div>

        <SkuFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          stockFilter={stockFilter}
          onStockFilterChange={setStockFilter}
        />
        {loading && (
          <div className="p-8 text-center text-slate-500">
            <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full inline-block mb-2"></div>
            <p>Memuat data SKU...</p>
          </div>
        )}



        <SkuTable
          skus={filteredSkus}
          vendors={vendors}
          onToggleStatus={toggleSkuStatus}
        />

        <div className="bg-slate-50 p-3 text-xs text-slate-500 border-t border-slate-100 flex items-center justify-between">
          <span>
            Menampilkan <b>{filteredSkus.length}</b> sku dari{' '}
            <b>{skus.length}</b> terdaftar
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block"></span>
            Indikator baris restock menandakan draf PR wajib memicu draf restock
            otomatis.
          </span>
        </div>
      </div>

      <SkuFormModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
