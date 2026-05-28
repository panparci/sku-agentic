/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Check, FileCheck, Plus, XCircle } from 'lucide-react';

import { PurchaseRequisition, SKU } from '../../types';
import { useProcurement } from '../../context/ProcurementContext';
import { formatIDR } from '../../utils/format';

interface PrManagerPanelProps {
  onCreate: () => void;
}

export function PrManagerPanel({ onCreate }: PrManagerPanelProps) {
  const { prs, skus, updatePrStatus } = useProcurement();
  const pendingPrs = prs.filter(p => p.status === 'Submitted');

  return (
    <div className="bg-slate-900 text-white rounded-xl shadow-md p-5 border border-slate-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-3.5">
        <div>
          <h2 className="text-base font-bold text-teal-400 flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-teal-400" />
            Otorisasi & Persetujuan Requisition (Manager Panel)
          </h2>
          <p className="text-xs text-slate-400">
            Gunakan panel ini untuk mensimulasikan persetujuan (Approved) atau
            penolakan (Rejected) PR yang telah di-submit oleh Unit.
          </p>
        </div>

        <button
          onClick={onCreate}
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs py-2 px-3.5 rounded-lg flex items-center gap-1.5 shadow transition-all"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          Ajukan Permintaan (PR) Baru
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {pendingPrs.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs italic bg-slate-800/40 rounded-lg border border-slate-700/30">
            Tidak ada antrean PR berstatus "Submitted" saat ini. Silakan buat PR
            Baru di bawah, lalu klik "Submit".
          </div>
        ) : (
          pendingPrs.map(pr => (
            <PendingPrCard
              key={pr.pr_id}
              pr={pr}
              skus={skus}
              onApprove={() => updatePrStatus(pr.pr_id, 'Approved')}
              onReject={() => updatePrStatus(pr.pr_id, 'Rejected')}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface PendingPrCardProps {
  pr: PurchaseRequisition;
  skus: SKU[];
  onApprove: () => void;
  onReject: () => void;
}

function PendingPrCard({ pr, skus, onApprove, onReject }: PendingPrCardProps) {
  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-4 transition-all hover:border-slate-600">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-2 mb-3">
        <div>
          <span className="text-xs text-teal-400 font-mono font-bold">
            {pr.pr_number}
          </span>
          <span className="mx-2 text-slate-500">|</span>
          <span className="text-xs font-semibold text-slate-200">
            {pr.department}
          </span>
        </div>
        <div className="text-xs text-slate-400">
          Diajukan: <span className="font-semibold">{pr.req_date}</span> |
          Target: <span className="font-semibold">{pr.target_date}</span>
        </div>
      </div>

      <div className="text-xs text-slate-300 space-y-2 mb-3 bg-slate-900/40 p-2.5 rounded border border-slate-800">
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
          Daftar Kebutuhan Barang:
        </p>
        {pr.items.map(it => {
          const matchSku = skus.find(s => s.sku_id === it.sku_id);
          const isLowStock =
            matchSku && matchSku.current_stock < matchSku.minimum_stock;

          return (
            <div
              key={it.id}
              className="flex justify-between items-center text-slate-200 text-xs leading-none"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0"></span>
                <span>{matchSku?.sku_name || 'SKU Tidak Diketahui'}</span>
                <span className="text-slate-400 font-mono text-[10px]">
                  ({matchSku?.sku_code})
                </span>
                {isLowStock && matchSku && (
                  <span className="text-amber-400 text-[9px] bg-amber-950 px-1 py-0.5 rounded font-semibold flex items-center gap-0.5 ml-1">
                    ⚠️ Stok Kurang ({matchSku.current_stock} / Min:{' '}
                    {matchSku.minimum_stock})
                  </span>
                )}
              </div>
              <div className="font-mono text-right text-slate-300">
                {it.qty} {matchSku?.uom} @ {formatIDR(it.unit_price)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-slate-400 mb-3 italic">
        Catatan: "{pr.description}"
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-xs text-slate-300">
          Estimasi Anggaran:{' '}
          <span className="text-teal-400 font-mono font-bold text-sm">
            {formatIDR(pr.total_amount)}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onApprove}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3 rounded-md flex items-center gap-1 shadow-sm"
          >
            <Check className="w-3.5 h-3.5 shrink-0" /> Setujui (Approve)
          </button>
          <button
            onClick={onReject}
            className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs py-1.5 px-3 rounded-md flex items-center gap-1 shadow-sm"
          >
            <XCircle className="w-3.5 h-3.5 shrink-0" /> Tolak (Reject)
          </button>
        </div>
      </div>
    </div>
  );
}
