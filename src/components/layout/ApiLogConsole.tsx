/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RefreshCw } from 'lucide-react';
import { useProcurement } from '../../context/ProcurementContext';
import type { ApiLogMethod } from '../../hooks/useApiLogs';

const METHOD_STYLES: Record<ApiLogMethod, string> = {
  GET: 'bg-zinc-850 text-zinc-300',
  POST: 'bg-teal-950 text-teal-400',
  PUT: 'bg-blue-950 text-blue-400',
  PATCH: 'bg-blue-950 text-blue-400',
  DELETE: 'bg-rose-950 text-rose-400',
};

export function ApiLogConsole() {
  const { apiLogs, clearApiLogs } = useProcurement();

  return (
    <div className="bg-black text-emerald-400 rounded-xl p-4 font-mono text-xs shadow-md border-t-2 border-slate-700 flex-1">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
        <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          API Request Stream
        </span>
        <button
          onClick={clearApiLogs}
          className="text-zinc-500 hover:text-emerald-400 text-[10px] flex items-center gap-1"
          title="Bersihkan log"
        >
          <RefreshCw className="w-2.5 h-2.5" /> Clear
        </button>
      </div>

      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
        {apiLogs.length === 0 ? (
          <p className="text-zinc-500 text-[11px] italic">
            Belum ada aktivitas HTTP. Klik tombol atau simulasikan transaksi di
            sistem untuk melihat rute log API.
          </p>
        ) : (
          apiLogs.map(log => (
            <div
              key={log.id}
              className="border-b border-zinc-900 pb-2.5 last:border-0 leading-tight"
            >
              <div className="flex items-center justify-between text-[10px]">
                <span
                  className={`px-1 py-0.5 rounded font-bold ${
                    METHOD_STYLES[log.method] || 'bg-zinc-850 text-zinc-300'
                  }`}
                >
                  {log.method}
                </span>
                <span className="text-zinc-500">{log.timestamp}</span>
              </div>
              <p className="text-[11px] text-zinc-300 font-semibold mt-1 break-all">
                {log.endpoint}
              </p>

              {log.payload != null && (
                <div className="text-[9px] text-zinc-500 mt-1 pl-2 border-l border-zinc-800">
                  Payload: {JSON.stringify(log.payload)}
                </div>
              )}
              <div className="text-[10px] text-emerald-500/90 mt-1 bg-zinc-950/50 p-1 rounded font-sans text-[10.5px]">
                Response:{' '}
                <span className="font-semibold">
                  {JSON.stringify(log.response)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <p className="text-[9px] text-zinc-600 mt-2 text-right">
        Merekam RESTful status endpoints secara lokal
      </p>
    </div>
  );
}
