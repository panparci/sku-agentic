/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Static dropdown options shared across the procurement UI.
 */

export const SKU_CATEGORIES = [
  'Obat-obatan',
  'BMHP',
  'Alkes',
  'Saniter',
] as const;

export const SKU_CATEGORY_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: 'All', label: 'Semua Kategori' },
  { value: 'Obat-obatan', label: '💊 Obat-obatan' },
  { value: 'BMHP', label: '🩺 Bahan Medis Habis Pakai' },
  { value: 'Alkes', label: '🧪 Alat Kesehatan (Alkes)' },
  { value: 'Saniter', label: '🧼 Saniter & Kebersihan' },
];

export const SKU_FORM_CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: 'Obat-obatan', label: 'Obat-obatan' },
  { value: 'BMHP', label: 'Bahan Medis Habis Pakai (BMHP)' },
  { value: 'Alkes', label: 'Alat Kesehatan (Alkes)' },
  { value: 'Saniter', label: 'Saniter & Kebersihan' },
];

export const UOM_OPTIONS = [
  'Box',
  'Vial',
  'Botol',
  'Pcs',
  'Roll',
  'Ampul',
  'Aturan khusus',
] as const;

export const DEPARTMENT_OPTIONS: { value: string; label: string }[] = [
  { value: 'Instalasi Gawat Darurat (IGD)', label: '🚨 Instalasi Gawat Darurat (IGD)' },
  { value: 'Farmasi & Apotek', label: '💊 Farmasi & Apotek' },
  { value: 'Instalasi Bedah Sentral (IBS)', label: '🩺 Instalasi Bedah Sentral (IBS)' },
  { value: 'Poliklinik Rawat Jalan', label: '🏥 Poliklinik Rawat Jalan' },
  { value: 'Instalasi Gizi Rumah Sakit', label: '🍏 Instalasi Gizi Rumah Sakit' },
];

export const STORAGE_KEYS = {
  vendors: 'rs_procure_vendors',
  skus: 'rs_procure_skus',
  prs: 'rs_procure_prs',
} as const;

export const MAX_API_LOGS = 5;
