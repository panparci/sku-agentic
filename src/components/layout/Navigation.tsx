/**
import React from "react";
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, FileText, Package, Users } from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';

export type ActiveTab = 'skus' | 'prs' | 'vendors' | 'docs';

interface NavigationProps {
  activeTab: ActiveTab;
  onChange: (tab: ActiveTab) => void;
}

export function Navigation({ activeTab, onChange }: NavigationProps) {
  const { vendors, criticalStockCount, pendingPrCount } = useProcurement();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-250 p-4">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
        Navigasi Utama
      </h3>

      <nav className="flex flex-col gap-1.5" id="nav-procurement">
        <NavButton
          active={activeTab === 'skus'}
          onClick={() => onChange('skus')}
          icon={
            <Package
              className={`h-4 w-4 ${
                activeTab === 'skus' ? 'text-teal-600' : 'text-slate-400'
              }`}
            />
          }
          label="1. SKU Master"
          badge={
            criticalStockCount > 0 ? (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {criticalStockCount} Restock
              </span>
            ) : null
          }
        />

        <NavButton
          active={activeTab === 'prs'}
          onClick={() => onChange('prs')}
          icon={
            <FileText
              className={`h-4 w-4 ${
                activeTab === 'prs' ? 'text-teal-600' : 'text-slate-400'
              }`}
            />
          }
          label="2. Purchase Requisition"
          badge={
            pendingPrCount > 0 ? (
              <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                {pendingPrCount} Pending
              </span>
            ) : null
          }
        />

        <NavButton
          active={activeTab === 'vendors'}
          onClick={() => onChange('vendors')}
          icon={
            <Users
              className={`h-4 w-4 ${
                activeTab === 'vendors' ? 'text-teal-600' : 'text-slate-400'
              }`}
            />
          }
          label="3. Daftar Vendor"
          badge={
            <span className="text-slate-400 text-xs">{vendors.length}</span>
          }
        />

        <button
          onClick={() => onChange('docs')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 bg-slate-900/5 hover:bg-slate-100 ${
            activeTab === 'docs'
              ? 'bg-teal-900/10 text-teal-950 border-l-4 border-teal-700'
              : 'text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <BookOpen
              className={`h-4 w-4 ${
                activeTab === 'docs' ? 'text-teal-700' : 'text-slate-600'
              }`}
            />
            <span>📖 Blueprint & Dokumen</span>
          </div>
          <span className="bg-slate-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
            Full
          </span>
        </button>
      </nav>
    </div>
  );
}

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge: React.ReactNode;
}

function NavButton({ active, onClick, icon, label, badge }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
        active
          ? 'bg-teal-50 text-teal-800 border-l-4 border-teal-600'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <div className="flex items-center gap-2.5">
        {icon}
        <span>{label}</span>
      </div>
      {badge}
    </button>
  );
}
