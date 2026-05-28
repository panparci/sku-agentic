/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertTriangle } from 'lucide-react';
import { FormEvent, useState } from 'react';

import {
  SKU_FORM_CATEGORY_OPTIONS,
  UOM_OPTIONS,
} from '../../constants/options';
import {
  SkuFormInput,
  useProcurement,
} from '../../context/ProcurementContext';
import { Modal } from '../ui/Modal';

interface SkuFormModalProps {
  open: boolean;
  onClose: () => void;
}

const buildEmptyForm = (vendorId: string): SkuFormInput => ({
  sku_code: '',
  sku_name: '',
  category: 'Obat-obatan',
  uom: 'Box',
  estimated_price: 15000,
  minimum_stock: 20,
  current_stock: 45,
  vendor_id: vendorId,
  status: 'Aktif',
});

export function SkuFormModal({ open, onClose }: SkuFormModalProps) {
  const { vendors, addSku } = useProcurement();
  const [form, setForm] = useState<SkuFormInput>(() =>
    buildEmptyForm(vendors[0]?.id ?? '')
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const ok = addSku(form);
    if (ok) {
      setForm(buildEmptyForm(vendors[0]?.id ?? ''));
      onClose();
    }
  };

  const stockWarning = form.current_stock < form.minimum_stock;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pendaftaran SKU Baru (Master Data)"
      subtitle="Pastikan relasi vendor partner yang valid sudah dipilih."
    >
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              KODE SKU *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: SKU-MED-220"
              value={form.sku_code}
              onChange={e => setForm({ ...form, sku_code: e.target.value })}
              className="w-full border border-slate-250 bg-slate-50/50 rounded-lg p-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              UOM (Satuan) *
            </label>
            <select
              value={form.uom}
              onChange={e => setForm({ ...form, uom: e.target.value })}
              className="w-full border border-slate-250 bg-slate-50/50 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {UOM_OPTIONS.map(uom => (
                <option key={uom} value={uom}>
                  {uom === 'Aturan khusus' ? 'Lainnya' : uom}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">
            NAMA BARANG SEBENARNYA *
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Paracetamol Tablet 500mg (Box isi 100)"
            value={form.sku_name}
            onChange={e => setForm({ ...form, sku_name: e.target.value })}
            className="w-full border border-slate-250 bg-slate-50/50 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Kategori Barang *
            </label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full border border-slate-250 bg-slate-50/50 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {SKU_FORM_CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Vendor Partner Utama *
            </label>
            <select
              value={form.vendor_id}
              onChange={e => setForm({ ...form, vendor_id: e.target.value })}
              className="w-full border border-slate-250 bg-slate-50/50 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
            >
              {vendors.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <NumberInput
            label="Harga Estimasi (Rp) *"
            value={form.estimated_price}
            onChange={v => setForm({ ...form, estimated_price: v })}
          />
          <NumberInput
            label="Stok Minimum *"
            value={form.minimum_stock}
            onChange={v => setForm({ ...form, minimum_stock: v })}
          />
          <NumberInput
            label="Stok Saat Ini (Current) *"
            value={form.current_stock}
            onChange={v => setForm({ ...form, current_stock: v })}
          />
        </div>

        {stockWarning && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2 animate-pulse">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">
                Peringatan: Stok di bawah batas minimum!
              </span>
              Stok saat ini ({form.current_stock}) lebih kecil dari stok minimum
              aman ({form.minimum_stock}). Sistem otomatis menandai SKU ini untuk
              segera diajukan pengisian kembali.
            </div>
          </div>
        )}

        <div className="border-t border-slate-150 pt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 px-4 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-2 px-4 rounded-lg shadow-sm transition-colors"
          >
            Simpan SKU Baru
          </button>
        </div>
      </form>
    </Modal>
  );
}

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (n: number) => void;
}

function NumberInput({ label, value, onChange }: NumberInputProps) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1">
        {label}
      </label>
      <input
        type="number"
        required
        min={0}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full border border-slate-250 bg-slate-50/50 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
    </div>
  );
}
