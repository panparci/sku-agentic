/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { PrArchiveTable } from './PrArchiveTable';
import { PrFormModal } from './PrFormModal';
import { PrManagerPanel } from './PrManagerPanel';

export function PrPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-6">
        <PrManagerPanel onCreate={() => setShowModal(true)} />
        <PrArchiveTable />
      </div>
      <PrFormModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
