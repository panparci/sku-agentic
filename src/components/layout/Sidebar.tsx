/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ActiveTab, Navigation } from './Navigation';
import { ProcessFlowWidget } from './ProcessFlowWidget';
import { ApiLogConsole } from './ApiLogConsole';

interface SidebarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export function Sidebar({ activeTab, onChangeTab }: SidebarProps) {
  return (
    <section className="lg:col-span-1 flex flex-col gap-6">
      <Navigation activeTab={activeTab} onChange={onChangeTab} />
      <ProcessFlowWidget />
      <ApiLogConsole />
    </section>
  );
}
