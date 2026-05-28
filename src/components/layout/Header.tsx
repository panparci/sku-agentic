/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Activity, AlertTriangle, FileCheck, Package } from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';

export function Header() {
  const { skus, criticalStockCount, pendingPrCount } = useProcurement();

  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-teal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">

        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-teal-500 to-emerald-400 p-2 rounded-lg text-slate-950 shadow">
            <Activity className="h-6 w-6 stroke-[3]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-teal-300 to-white bg-clip-text text-transparent">
                RS Medika Utama Procurement
              </span>
              <span className="bg-teal-900/80 border border-teal-500/30 text-teal-300 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full">
                Admin & Logistik
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sistem Pengendalian Logistik & Draf Pengadaan Barang Rumah Sakit
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center md:text-right">
          <MetricChip
            icon={<Package className="h-4 w-4 text-slate-400 shrink-0" />}
            label="Total SKU"
            value={skus.length}
            valueClass="text-teal-400"
          />
          <MetricChip
            icon={
              <AlertTriangle
                className={`h-4 w-4 ${
                  criticalStockCount > 0
                    ? 'text-amber-400 animate-pulse'
                    : 'text-slate-400'
                } shrink-0`}
              />
            }
            label="Kritis"
            value={criticalStockCount}
            valueClass={
              criticalStockCount > 0 ? 'text-amber-400' : 'text-slate-400'
            }
          />
          <MetricChip
            icon={<FileCheck className="h-4 w-4 text-emerald-400 shrink-0" />}
            label="Antrean PR"
            value={pendingPrCount}
            valueClass="text-emerald-400"
          />
        </div>
      </div>
    </header>
  );
}

interface MetricChipProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  valueClass: string;
}

function MetricChip({ icon, label, value, valueClass }: MetricChipProps) {
  return (
    <div className="bg-slate-800/80 border border-slate-700/50 rounded-lg px-3 py-1 flex items-center gap-2">
      {icon}
      <div className="text-left">
        <p className="text-[9px] text-slate-400 uppercase font-bold">{label}</p>
        <p className={`text-sm font-semibold ${valueClass}`}>{value}</p>
      </div>
    </div>
  );
}
