/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormEvent, useState } from 'react';

import {
  VendorFormInput,
  useProcurement,
} from '../../context/ProcurementContext';
import { Modal } from '../ui/Modal';

interface VendorFormModalProps {
  open: boolean;
  onClose: () => void;
}

const EMPTY_FORM: VendorFormInput = {
  code: '',
  name: '',
  contact: '',
  email: '',
  address: '',
};

export function VendorFormModal({ open, onClose }: VendorFormModalProps) {
  const { addVendor } = useProcurement();
  const [form, setForm] = useState<VendorFormInput>(EMPTY_FORM);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const ok = addVendor(form);
    if (ok) {
      setForm(EMPTY_FORM);
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrasi Vendor / Supplier Baru"
      subtitle="Digunakan untuk relasi satu-ke-banyak dengan SKU."
      maxWidthClass="max-w-md"
    >
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              KODE VENDOR *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: BF, OM, KF, DS"
              value={form.code}
              onChange={e => setForm({ ...form, code: e.target.value })}
              className="w-full border border-slate-250 bg-slate-50/50 rounded-lg p-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">
              (Format Internal)
            </label>
            <p className="text-[11px] text-slate-500 pt-2 font-semibold">
              Tersimpan: VND-[KODE]
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">
            NAMA PERUSAHAAN VENDOR *
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: PT. Kimia Farma Tbk"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full border border-slate-250 bg-slate-50/50 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              PIC / Nomor Handphone
            </label>
            <input
              type="text"
              placeholder="Contoh: Bpk Andi (0812-33)"
              value={form.contact}
              onChange={e => setForm({ ...form, contact: e.target.value })}
              className="w-full border border-slate-250 bg-slate-50/50 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Email Sales
            </label>
            <input
              type="email"
              placeholder="sales@nama-vendor.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border border-slate-250 bg-slate-50/50 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">
            Kantor / Alamat Lengkap Perusahaan
          </label>
          <textarea
            rows={2}
            placeholder="Jl. Raya Salemba No. 12, Jakarta"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            className="w-full border border-slate-250 bg-slate-50/50 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="border-t border-slate-150 pt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 px-4 rounded-lg"
          >
            Batal
          </button>
          <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-2 px-4 rounded-lg shadow-sm"
          >
            Daftarkan Vendor
          </button>
        </div>
      </form>
    </Modal>
  );
}
