/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShoppingBag } from 'lucide-react';

const FLOW_STEPS: { title: string; description: string; tone: 'teal' | 'amber' }[] = [
  {
    title: '1. Input SKU Master',
    description: 'Daftarkan SKU obat/BMHP & batasi batas minimum.',
    tone: 'teal',
  },
  {
    title: '2. Buat Pengajuan PR',
    description: 'Unit rekrut item; sistem cek di bawah stock minimum.',
    tone: 'teal',
  },
  {
    title: '3. Manager Approval',
    description: 'Review PR untuk status Approved atau Rejected.',
    tone: 'amber',
  },
  {
    title: '4. PO & Pembelian',
    description: 'PR divalidasi, PO diterbitkan ke vendor.',
    tone: 'teal',
  },
];

export function ProcessFlowWidget() {
  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-4 shadow-sm border border-slate-800">
      <h4 className="text-[11px] uppercase font-bold text-teal-400 mb-2 tracking-wider flex items-center gap-1.5">
        <ShoppingBag className="w-3.5 h-3.5" />
        Siklus Alur Procurement
      </h4>

      <ol className="text-xs text-slate-300 space-y-2 relative border-l border-slate-700 ml-1.5 pl-3">
        {FLOW_STEPS.map(step => (
          <li key={step.title} className="relative">
            <span
              className={`absolute -left-[17px] top-1 rounded-full w-2.5 h-2.5 ${
                step.tone === 'amber' ? 'bg-amber-500' : 'bg-teal-500'
              }`}
            />
            <span className="font-semibold text-slate-200 block">
              {step.title}
            </span>
            <p className="text-[10px] text-slate-400">{step.description}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
