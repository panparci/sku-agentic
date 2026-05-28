/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Building2, Plus, Users } from 'lucide-react';
import { useState } from 'react';

import { Vendor } from '../../types';
import { useProcurement } from '../../context/ProcurementContext';
import { VendorFormModal } from './VendorFormModal';

export function VendorPage() {
  const { vendors, skus } = useProcurement();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-5.5 w-5.5 text-teal-600" />
              Manajemen Vendor & Supplier Terdaftar
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Datar PT Farmasi dan Supplier Alat Medis Resmi RS Medika Utama.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-2 px-3.5 rounded-lg flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            Daftarkan Vendor Baru
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map(v => (
            <VendorCard
              key={v.id}
              vendor={v}
              skuCount={skus.filter(s => s.vendor_id === v.id).length}
            />
          ))}
        </div>
      </div>

      <VendorFormModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}

interface VendorCardProps {
  vendor: Vendor;
  skuCount: number;
}

function VendorCard({ vendor, skuCount }: VendorCardProps) {
  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 hover:bg-white transition-all shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="bg-teal-50 text-teal-700 px-2 py-0.5 font-mono text-[10px] font-bold rounded">
          {vendor.code}
        </div>
        <Building2 className="w-5 h-5 text-slate-400" />
      </div>

      <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1">
        {vendor.name}
      </h3>
      <p className="text-xs text-slate-500 mb-2">{vendor.address}</p>

      <div className="border-t border-slate-200 pt-2.5 mt-2.5 space-y-1 text-xs text-slate-600">
        <div>
          <span className="font-semibold text-slate-400 block text-[9px] uppercase">
            Kontak PIC
          </span>
          {vendor.contact}
        </div>
        <div>
          <span className="font-semibold text-slate-400 block text-[9px] uppercase">
            Email Korespondensi
          </span>
          <span className="text-teal-700 font-mono text-[11px]">
            {vendor.email}
          </span>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-2 mt-2.5 flex items-center justify-between text-xs text-slate-500">
        <span>Menyediakan SKU:</span>
        <span className="font-bold text-slate-800">{skuCount} Barang</span>
      </div>
    </div>
  );
}
