/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertTriangle, Check, Clock, Plus, Trash } from 'lucide-react';
import { useState } from 'react';

import { DEPARTMENT_OPTIONS } from '../../constants/options';
import {
  PrFormInput,
  useProcurement,
} from '../../context/ProcurementContext';
import { addDaysISO, formatIDR } from '../../utils/format';
import { Modal } from '../ui/Modal';

interface PrFormModalProps {
  open: boolean;
  onClose: () => void;
}

const buildEmptyForm = (): PrFormInput => ({
  department: 'Instalasi Gawat Darurat (IGD)',
  target_date: addDaysISO(7),
  description: '',
  items: [{ sku_id: '', qty: 1 }],
});

export function PrFormModal({ open, onClose }: PrFormModalProps) {
  const { skus, addPr } = useProcurement();
  const [form, setForm] = useState<PrFormInput>(buildEmptyForm);

  const handleItemChange = (index: number, skuId: string, qty: number) => {
    setForm(prev => {
      const items = [...prev.items];
      items[index] = { sku_id: skuId, qty };
      return { ...prev, items };
    });
  };

  const addRow = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { sku_id: '', qty: 1 }],
    }));
  };

  const removeRow = (index: number) => {
    setForm(prev => {
      const updated = prev.items.filter((_, i) => i !== index);
      return {
        ...prev,
        items: updated.length ? updated : [{ sku_id: '', qty: 1 }],
      };
    });
  };

  const handleSubmit = (status: 'Draft' | 'Submitted') => {
    const ok = addPr(form, status);
    if (ok) {
      setForm(buildEmptyForm());
      onClose();
    }
  };

  const totalEstimate = form.items.reduce((sum, current) => {
    const match = skus.find(s => s.sku_id === current.sku_id);
    return sum + (match ? match.estimated_price * current.qty : 0);
  }, 0);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pengajuan Formulir Purchase Requisition (PR)"
      subtitle="Pilih barang-barang medis dari SKU Master terstandarisasi untuk order restock."
      maxWidthClass="max-w-2xl"
    >
      <div className="p-5 max-h-[80vh] overflow-y-auto space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              DEPARTEMEN PENGAJU *
            </label>
            <select
              value={form.department}
              onChange={e =>
                setForm(prev => ({ ...prev, department: e.target.value }))
              }
              className="w-full border border-slate-250 bg-slate-50/50 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {DEPARTMENT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              TARGET TANGGAL TERIMA PEMBELIAN
            </label>
            <input
              type="date"
              required
              value={form.target_date}
              onChange={e =>
                setForm(prev => ({ ...prev, target_date: e.target.value }))
              }
              className="w-full border border-slate-250 bg-slate-50/50 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">
            DESKRIPSI / JUSTIFIKASI URGENT
          </label>
          <textarea
            rows={2}
            placeholder="Contoh: Kebutuhan darurat dikarenakan adanya peningkatan jumlah pasien operasi bulan ini."
            value={form.description}
            onChange={e =>
              setForm(prev => ({ ...prev, description: e.target.value }))
            }
            className="w-full border border-slate-250 bg-slate-50/50 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="space-y-2 border-t border-b border-slate-150 py-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-650 uppercase tracking-wide">
              Daftar Barang yang Diminta (Selected Items)
            </h4>
            <button
              type="button"
              onClick={addRow}
              className="bg-teal-50 hover:bg-teal-100 text-teal-850 font-bold text-[11px] py-1 px-2.5 rounded border border-teal-200 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Baris Barang
            </button>
          </div>

          {form.items.map((row, idx) => {
            const correlatedSku = skus.find(s => s.sku_id === row.sku_id);
            const isBelowMin =
              correlatedSku &&
              correlatedSku.current_stock < correlatedSku.minimum_stock;

            return (
              <div
                key={idx}
                className="flex flex-col sm:flex-row gap-2 border border-slate-200/80 rounded-lg p-3 bg-slate-50/40 relative"
              >
                <div className="flex-1">
                  <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">
                    Pilih SKU Barang Medis
                  </label>
                  <select
                    value={row.sku_id}
                    onChange={e =>
                      handleItemChange(idx, e.target.value, row.qty)
                    }
                    className="w-full border border-slate-250 bg-white rounded-lg p-1.5 text-xs text-slate-850 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">-- Silakan Pilih SKU --</option>
                    {skus
                      .filter(s => s.status === 'Aktif')
                      .map(s => (
                        <option key={s.sku_id} value={s.sku_id}>
                          {s.sku_name} ({s.sku_code}) -{' '}
                          {formatIDR(s.estimated_price)} / {s.uom}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="w-24 shrink-0">
                  <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">
                    Jumlah (QTY)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={row.qty}
                    onChange={e =>
                      handleItemChange(
                        idx,
                        row.sku_id,
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    }
                    className="w-full border border-slate-250 bg-white rounded-lg p-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-slate-800"
                  />
                </div>

                <div className="w-36 shrink-0 text-right flex flex-col justify-end pt-1 bg-white sm:bg-transparent rounded px-1">
                  <span className="text-[10px] text-slate-400 block uppercase leading-none">
                    Sub-estimasi:
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900 leading-normal block">
                    {correlatedSku
                      ? formatIDR(correlatedSku.estimated_price * row.qty)
                      : 'Rp0'}
                  </span>
                </div>

                <div className="flex items-end pb-1 ml-1">
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    className="bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 p-2 rounded-lg transition-colors border border-slate-220"
                    title="Hapus baris"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isBelowMin && correlatedSku && (
                  <div className="w-full left-0 bottom-0 mt-2 bg-amber-50 text-amber-800 border border-amber-200 p-1.5 rounded-md text-[10px] flex items-center gap-1 leading-tight animate-fade-in">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      <b>Warning:</b> Stock obat/BMHP ini dalam kondisi sangat
                      kritis{' '}
                      <b>
                        ({correlatedSku.current_stock} / Min:{' '}
                        {correlatedSku.minimum_stock} {correlatedSku.uom})
                      </b>
                      . Pengadaan ini didahulukan dalam antrean prioritas.
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2 bg-teal-50 px-4 rounded-xl border border-teal-200">
          <div className="text-xs text-teal-850">
            <span className="font-bold block text-[10px] uppercase text-teal-600">
              Perhitungan Anggaran Pengadaan:
            </span>
            Semua harga ditarik otomatis dari basis data SKU Master dengan
            formulir waktu nyata.
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block uppercase font-bold text-[9px]">
              TOTAL ESTIMASI BIAYA
            </span>
            <span className="text-lg font-mono font-black text-teal-900 block leading-tight">
              {formatIDR(totalEstimate)}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-150 pt-4 flex flex-col sm:flex-row justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-lg transition-colors order-3 sm:order-1"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('Draft')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs py-2.5 px-4 rounded-lg transition-colors order-2 sm:order-2 flex items-center gap-1"
          >
            <Clock className="w-3.5 h-3.5 shrink-0" /> Simpan sebagai Draf
            (Draft)
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('Submitted')}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg shadow-md transition-colors order-1 sm:order-3 flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5 shrink-0" /> Submit PR Berkas Lengkap
          </button>
        </div>
      </div>
    </Modal>
  );
}
