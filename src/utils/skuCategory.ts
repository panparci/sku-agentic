/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SKU } from '../types';

/**
 * Maps a SKU's user-facing category to the canonical internal `type`.
 */
export const categoryToType = (category: string): SKU['type'] => {
  if (category === 'Obat-obatan') return 'Obat';
  if (category === 'Alkes') return 'Alkes';
  if (category === 'BMHP') return 'BMHP';
  return 'Non-Medis';
};
