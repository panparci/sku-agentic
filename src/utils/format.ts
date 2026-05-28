/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const formatIDR = (value: number): string =>
  `Rp${value.toLocaleString('id-ID')}`;

export const formatTimeID = (date: Date = new Date()): string =>
  date.toLocaleTimeString('id-ID');

export const todayISO = (): string => new Date().toISOString().split('T')[0];

export const addDaysISO = (days: number, base: Date = new Date()): string =>
  new Date(base.getTime() + days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

export const generateId = (prefix: string): string =>
  `${prefix}-${Date.now()}`;

export const randomShortId = (): string =>
  Math.random().toString(36).substring(7);
