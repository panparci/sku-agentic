/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  /** Tailwind max-width utility, e.g. "max-w-lg" / "max-w-2xl". */
  maxWidthClass?: string;
  children: ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  maxWidthClass = 'max-w-lg',
  children,
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
      <div
        className={`bg-white rounded-xl shadow-xl border border-slate-250 ${maxWidthClass} w-full overflow-hidden my-8 animate-in fade-in-50 zoom-in-95 duration-150`}
      >
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm tracking-wide">{title}</h3>
            {subtitle && (
              <p className="text-[11px] text-zinc-400">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white font-bold text-lg focus:outline-none"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
