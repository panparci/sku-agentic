/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Helpers for generating Purchase Requisition (PR) document numbers.
 *
 * Format: PR/YYYYMM/<DEPT_CODE>-<NN>
 *   - YYYYMM : tahun + bulan pengajuan (UTC)
 *   - DEPT_CODE : 3 huruf kode departemen (IGD, APT, IBS, GEN)
 *   - NN : nomor urut acak 2 digit (10-99)
 */

const DEPARTMENT_TO_CODE: { match: string; code: string }[] = [
  { match: 'IGD', code: 'IGD' },
  { match: 'Farmasi', code: 'APT' },
  { match: 'Bedah', code: 'IBS' },
];

export const resolveDepartmentCode = (department: string): string => {
  const found = DEPARTMENT_TO_CODE.find(d => department.includes(d.match));
  return found ? found.code : 'GEN';
};

export const buildPrNumber = (department: string, now: Date = new Date()): string => {
  const code = resolveDepartmentCode(department);
  const randomTwoDigit = Math.floor(10 + Math.random() * 90);
  const yyyymm = now.toISOString().slice(0, 7).replace('-', '');
  return `PR/${yyyymm}/${code}-${randomTwoDigit}`;
};
