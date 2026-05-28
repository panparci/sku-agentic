/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';

import { ProcurementProvider } from './context/ProcurementContext';
import { DocsPage } from './components/docs/DocsPage';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import type { ActiveTab } from './components/layout/Navigation';
import { PrPage } from './components/pr/PrPage';
import { SkuPage } from './components/sku/SkuPage';
import { VendorPage } from './components/vendor/VendorPage';

export default function App() {
  return (
    <ProcurementProvider>
      <ProcurementShell />
    </ProcurementProvider>
  );
}

function ProcurementShell() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('skus');

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Sidebar activeTab={activeTab} onChangeTab={setActiveTab} />

        <section className="lg:col-span-3 flex flex-col gap-6">
          {activeTab === 'skus' && <SkuPage />}
          {activeTab === 'prs' && <PrPage />}
          {activeTab === 'vendors' && <VendorPage />}
          {activeTab === 'docs' && <DocsPage />}
        </section>
      </main>

      <Footer />
    </div>
  );
}
