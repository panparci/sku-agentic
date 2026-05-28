/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, Copy } from 'lucide-react';
import { documentationData, type DocSection } from '../../documentation';

export function DocsPage() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-teal-600" />
          Blueprint & Dokumentasi Teknis Sistem
        </h1>
        <p className="text-sm text-slate-500">
          Kumpulan blueprint lengkap arsitektur pengadaan (procurement) rumah
          sakit, relasi database, kontrak API, dan schema relasional.
        </p>
      </div>

      <div className="space-y-8">
        {documentationData.map((sec, idx) => (
          <DocsSection key={idx} section={sec} />
        ))}
      </div>
    </div>
  );
}

function DocsSection({ section }: { section: DocSection }) {
  const handleCopy = () => {
    if (!section.code) return;
    navigator.clipboard.writeText(section.code);
    alert('Kode disalin ke clipboard!');
  };

  return (
    <div className="border-b border-slate-100 last:border-b-0 pb-6 last:pb-0">
      <h2 className="text-md font-bold text-slate-900 mb-1">{section.title}</h2>
      <p className="text-xs text-teal-700 font-semibold mb-2">
        {section.description}
      </p>

      <div className="text-sm text-slate-700 space-y-2 whitespace-pre-line leading-relaxed">
        {section.content}
      </div>

      {section.code && (
        <div className="mt-4 rounded-lg bg-slate-950 p-4 border border-slate-850 relative font-mono text-xs text-slate-350 max-h-[350px] overflow-auto">
          <div className="absolute right-3 top-3 flex items-center gap-1.5 z-10">
            <button
              onClick={handleCopy}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold py-1 px-2 rounded-md flex items-center gap-1"
            >
              <Copy className="w-3 h-3" /> Salin Kode
            </button>
          </div>
          <pre className="text-slate-100 text-left leading-relaxed">
            <code>{section.code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
