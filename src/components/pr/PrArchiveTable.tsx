/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileText, Trash } from 'lucide-react';

import { PurchaseRequisition } from '../../types';
import { useProcurement } from '../../context/ProcurementContext';
import { formatIDR } from '../../utils/format';

const STATUS_BADGE_CLASSES: Record<PurchaseRequisition['status'], string> = {
  Approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Rejected: 'bg-rose-50 text-rose-700 border border-rose-200',
  Submitted: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  Draft: 'bg-slate-100 text-slate-600 border border-slate-300',
  Converted_to_PO: 'bg-teal-50 text-teal-700 border border-teal-200',
  Cancelled: 'bg-slate-100 text-slate-600 border border-slate-300',
};

export function PrArchiveTable() {
  const { prs, updatePrStatus, deletePr } = useProcurement();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-5 border-b border-slate-100">
        <h3 className="font-bold text-slate-950 flex items-center gap-2">
          <FileText className="h-5 w-5 text-slate-600" />
          Arsip & Draf Dokumen Purchase Requisition
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Semua dokumen PR yang pernah dibuat oleh departemen rumah sakit.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-150">
              <th className="py-2.5 px-4">No Dokumen PR</th>
              <th className="py-2.5 px-4 font-semibold">Departemen Pengaju</th>
              <th className="py-2.5 px-4">Tanggal Pengajuan</th>
              <th className="py-2.5 px-4">Deskripsi Rencana</th>
              <th className="py-2.5 px-4 text-center">Jumlah Item</th>
              <th className="py-2.5 px-4 text-right">Total Anggaran</th>
              <th className="py-2.5 px-4 text-center pb-2.5">Status PR</th>
              <th className="py-2.5 px-4 text-center">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {prs.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-8 text-slate-400 italic"
                >
                  Belum ada draf atau dokumen PR yang diajukan. Gunakan tombol
                  'Ajukan Permintaan Baru' untuk memulai.
                </td>
              </tr>
            ) : (
              prs.map(pr => (
                <tr
                  key={pr.pr_id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {pr.pr_number}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {pr.department}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{pr.req_date}</td>
                  <td
                    className="py-3 px-4 text-slate-500 max-w-[200px] truncate"
                    title={pr.description}
                  >
                    {pr.description}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-700">
                    {pr.items.length} item
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                    {formatIDR(pr.total_amount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_BADGE_CLASSES[pr.status]}`}
                    >
                      {pr.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {pr.status === 'Draft' ? (
                        <>
                          <button
                            onClick={() => updatePrStatus(pr.pr_id, 'Submitted')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] py-1 px-1.5 rounded"
                            title="Kirim dokumen draf ini ke Manager"
                          >
                            Submit PR
                          </button>
                          <button
                            onClick={() => deletePr(pr.pr_id)}
                            className="bg-rose-100 hover:bg-rose-200 text-rose-700 p-1 rounded"
                            title="Hapus draf"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : pr.status === 'Approved' ? (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                          📥 Siap Beli (PO)
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 block">
                          -
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-50 p-3 text-[11px] text-slate-500 border-t border-slate-100 italic">
        * PR Berstatus <b>Approved</b> menandakan bahwa proses administrasi
        selesai, dan data SKU akan diubah di sistem PO manual terpisah.
      </div>
    </div>
  );
}
