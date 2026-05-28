/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vendor, SKU, PurchaseRequisition, PurchaseOrder, GoodsReceipt, Invoice, DepartmentBudget, AuditLog } from './types';

export const initialVendors: Vendor[] = [
  {
    id: 'VND-001',
    code: 'VND-BF',
    name: 'PT. Bio Farma (Persero)',
    contact: 'Ibu Dian Lestari (0812-3456-7890)',
    email: 'sales@biofarma.co.id',
    address: 'Jl. Pasteur No. 28, Bandung, Jawa Barat',
    rating: 4.8,
    sla_delivery_rate: 98.2
  },
  {
    id: 'VND-002',
    code: 'VND-OM',
    name: 'PT. OneMed Health Indo',
    contact: 'Bapak Rudi Hermawan (0821-4455-6677)',
    email: 'info@onemed.co.id',
    address: 'Kawasan Industri SIER, Surabaya, Jawa Timur',
    rating: 4.5,
    sla_delivery_rate: 94.6
  },
  {
    id: 'VND-003',
    code: 'VND-KF',
    name: 'PT. Kimia Farma Tbk',
    contact: 'Ibu Amelia Siregar (0811-9988-7766)',
    email: 'order@kimiafarma.co.id',
    address: 'Jl. Veteran No. 9, Jakarta Pusat, DKI Jakarta',
    rating: 4.9,
    sla_delivery_rate: 99.1
  },
  {
    id: 'VND-004',
    code: 'VND-KLB',
    name: 'PT. Kalbe Farma Tbk',
    contact: 'Bapak Andi Wijaya (0813-8899-0011)',
    email: 'institutional.sales@kalbe.co.id',
    address: 'Jl. Letjen Suprapto Kav. 4, Jakarta Pusat, DKI Jakarta',
    rating: 4.7,
    sla_delivery_rate: 97.4
  },
  {
    id: 'VND-005',
    code: 'VND-ATK',
    name: 'PT. ATK Sejahtera Lestari',
    contact: 'Bapak Danu Prasetyo (0878-1122-3344)',
    email: 'marketing@atksejahtera.com',
    address: 'Ruko Margonda Raya No. 12, Depok, Jawa Barat',
    rating: 4.2,
    sla_delivery_rate: 91.5
  }
];

export const initialSKUs: SKU[] = [
  {
    sku_id: 'SKU-001',
    sku_code: 'SKU-MED-001',
    sku_name: 'Vaksin Influenza Flubio Vial 0.5 ml',
    category: 'Obat-obatan',
    type: 'Obat',
    uom: 'Vial',
    brand: 'Bio Farma',
    estimated_price: 150000,
    minimum_stock: 50,
    maximum_stock: 500,
    current_stock: 120,
    vendor_id: 'VND-001',
    status: 'Aktif',
    lead_time_days: 5,
    is_critical: true,
    is_controlled: true,
    is_taxable: true
  },
  {
    sku_id: 'SKU-002',
    sku_code: 'SKU-MED-002',
    sku_name: 'Paracetamol 500mg Tablet (Box isi 100)',
    category: 'Obat-obatan',
    type: 'Obat',
    uom: 'Box',
    brand: 'Kimia Farma',
    estimated_price: 45000,
    minimum_stock: 30,
    maximum_stock: 300,
    current_stock: 15, // STOCK WARNING
    vendor_id: 'VND-003',
    status: 'Aktif',
    lead_time_days: 3,
    is_critical: false,
    is_controlled: false,
    is_taxable: true
  },
  {
    sku_id: 'SKU-003',
    sku_code: 'SKU-MED-003',
    sku_name: 'Cairan Infus Ringer Laktat (RL) 500ml',
    category: 'BMHP',
    type: 'BMHP',
    uom: 'Botol',
    brand: 'Sanbe',
    estimated_price: 12500,
    minimum_stock: 100,
    maximum_stock: 1000,
    current_stock: 250,
    vendor_id: 'VND-003',
    status: 'Aktif',
    lead_time_days: 4,
    is_critical: true,
    is_controlled: false,
    is_taxable: false
  },
  {
    sku_id: 'SKU-004',
    sku_code: 'SKU-MED-004',
    sku_name: 'Disposable Syringe 3cc dengan Jarum OneMed',
    category: 'BMHP',
    type: 'BMHP',
    uom: 'Box',
    brand: 'OneMed',
    estimated_price: 85000,
    minimum_stock: 40,
    maximum_stock: 400,
    current_stock: 12, // STOCK WARNING
    vendor_id: 'VND-002',
    status: 'Aktif',
    lead_time_days: 2,
    is_critical: false,
    is_controlled: false,
    is_taxable: true
  },
  {
    sku_id: 'SKU-005',
    sku_code: 'SKU-MED-005',
    sku_name: 'Masker Bedah 3-Ply Earloop (Box isi 50)',
    category: 'BMHP',
    type: 'BMHP',
    uom: 'Box',
    brand: 'OneMed',
    estimated_price: 35000,
    minimum_stock: 100,
    maximum_stock: 1000,
    current_stock: 80, // STOCK WARNING
    vendor_id: 'VND-002',
    status: 'Aktif',
    lead_time_days: 2,
    is_critical: false,
    is_controlled: false,
    is_taxable: false
  },
  {
    sku_id: 'SKU-006',
    sku_code: 'SKU-MED-006',
    sku_name: 'Sevoflurane Cairan Inhalasi Anastesi 250ml',
    category: 'Obat-obatan',
    type: 'Obat',
    uom: 'Botol',
    brand: 'Kalbe Farma',
    estimated_price: 1650000,
    minimum_stock: 5,
    maximum_stock: 50,
    current_stock: 4, // STOCK WARNING
    vendor_id: 'VND-004',
    status: 'Aktif',
    lead_time_days: 7,
    is_critical: true,
    is_controlled: true,
    is_taxable: true
  },
  {
    sku_id: 'SKU-007',
    sku_code: 'SKU-MED-007',
    sku_name: 'Elektroda EKG Disposable Skintact (Pack isi 30)',
    category: 'Alkes',
    type: 'Alkes',
    uom: 'Pack',
    brand: 'Skintact',
    estimated_price: 120000,
    minimum_stock: 20,
    maximum_stock: 200,
    current_stock: 45,
    vendor_id: 'VND-002',
    status: 'Aktif',
    lead_time_days: 5,
    is_critical: false,
    is_controlled: false,
    is_taxable: true
  },
  {
    sku_id: 'SKU-008',
    sku_code: 'SKU-ATK-001',
    sku_name: 'Kertas Thermal USG Sony UPP-110S',
    category: 'Non-Medis',
    type: 'Non-Medis',
    uom: 'Roll',
    brand: 'Sony',
    estimated_price: 245000,
    minimum_stock: 10,
    maximum_stock: 100,
    current_stock: 8, // STOCK WARNING
    vendor_id: 'VND-005',
    status: 'Aktif',
    lead_time_days: 3,
    is_critical: false,
    is_controlled: false,
    is_taxable: true
  }
];

export const initialPRs: PurchaseRequisition[] = [
  {
    pr_id: 'PR-2026-001',
    pr_number: 'PR/202605/APT-01',
    department: 'Farmasi & Apotek',
    req_date: '2026-05-20',
    target_date: '2026-06-05',
    total_amount: 1425000,
    description: 'Pengajuan restock antibiotik kritis karena lonjakan pasien rawat inap pediatrik, dikombinasikan dengan pemenuhan vaksin darurat untuk stockpile apotek.',
    status: 'Approved',
    approved_by: 'dr. Hidayat (Head of Pharmacy)',
    items: [
      {
        id: 'PR-ITEM-001',
        sku_id: 'SKU-002', // Paracetamol (Box)
        qty: 15,
        unit_price: 45000,
        total_price: 675000
      },
      {
        id: 'PR-ITEM-002',
        sku_id: 'SKU-001', // Vaksin Influenza (Vial)
        qty: 5,
        unit_price: 150000,
        total_price: 750000
      }
    ]
  },
  {
    pr_id: 'PR-2026-002',
    pr_number: 'PR/202605/IGD-02',
    department: 'Instalasi Gawat Darurat (IGD)',
    req_date: '2026-05-25',
    target_date: '2026-06-01',
    total_amount: 4425000,
    description: 'Permintaan restock BMHP (Syringe 3cc dan Infus RL) untuk kebutuhan siaga emergency operasional IGD menjelang libur nasional panjang.',
    status: 'Submitted',
    items: [
      {
        id: 'PR-ITEM-003',
        sku_id: 'SKU-003', // Ringer Laktat Infus
        qty: 150,
        unit_price: 12500,
        total_price: 1875000
      },
      {
        id: 'PR-ITEM-004',
        sku_id: 'SKU-004', // Disposable Syringe 3cc
        qty: 30,
        unit_price: 85000,
        total_price: 2550000
      }
    ]
  },
  {
    pr_id: 'PR-2026-003',
    pr_number: 'PR/202605/IBS-03',
    department: 'Instalasi Bedah Sentral (IBS)',
    req_date: '2026-05-28',
    target_date: '2026-06-08',
    total_amount: 3300000,
    description: 'Kebutuhan mendesak anestesi cair Sevoflurane untuk ruang operasi IBS. Status draf untuk ditinjau oleh kepala ruangan bedah.',
    status: 'Draft',
    items: [
      {
        id: 'PR-ITEM-005',
        sku_id: 'SKU-006', // Sevoflurane (Botol)
        qty: 2,
        unit_price: 1650000,
        total_price: 3300000
      }
    ]
  }
];

export const initialPOs: PurchaseOrder[] = [
  {
    po_id: 'PO-2026-001',
    po_number: 'PO/202605/VND-OM/001',
    pr_number: 'PR/202605/IGD-02',
    vendor_id: 'VND-002', // PT OneMed Health Indo
    order_date: '2026-05-26',
    expected_date: '2026-06-02',
    total_amount: 2550000,
    status: 'Sent_to_Vendor',
    items: [
      {
        id: 'PO-ITEM-001',
        sku_id: 'SKU-004', // Syringe 3cc
        qty: 30,
        unit_price: 85000,
        total_price: 2550000
      }
    ]
  },
  {
    po_id: 'PO-2026-002',
    po_number: 'PO/202605/VND-KF/002',
    pr_number: 'PR/202605/APT-01',
    vendor_id: 'VND-003', // PT Kimia Farma Tbk
    order_date: '2026-05-22',
    expected_date: '2026-05-29',
    total_amount: 675000,
    status: 'Vendor_Confirmed',
    items: [
      {
        id: 'PO-ITEM-002',
        sku_id: 'SKU-002', // Paracetamol
        qty: 15,
        unit_price: 45000,
        total_price: 675000
      }
    ]
  }
];

export const initialGRNs: GoodsReceipt[] = [
  {
    grn_id: 'GRN-2026-001',
    grn_number: 'GRN/202605/GUD-001',
    po_number: 'PO/202605/VND-KF/002',
    received_date: '2026-05-27',
    received_by: 'Budi Kusuma (Staff Gudang)',
    status: 'Completed',
    items: [
      {
        id: 'GRN-ITEM-001',
        sku_id: 'SKU-002', // Paracetamol
        qty_ordered: 15,
        qty_received: 15,
        batch_number: 'BATCH-PCT500-A2',
        expiry_date: '2028-12-01'
      }
    ]
  }
];

export const initialInvoices: Invoice[] = [
  {
    invoice_id: 'INV-2026-001',
    invoice_number: 'INV/KF/2026118',
    po_number: 'PO/202605/VND-KF/002',
    grn_number: 'GRN/202605/GUD-001',
    invoice_date: '2026-05-28',
    due_date: '2026-06-28',
    sub_total: 675000,
    tax: 74250, // 11% Tax
    total_billed: 749250,
    status: 'Pending_Match',
    payment_term_days: 30,
    items: [
      {
        id: 'INV-ITEM-001',
        sku_id: 'SKU-002',
        qty: 15,
        unit_price_billed: 45000,
        total_price_billed: 675000
      }
    ]
  }
];

export const initialBudgets: DepartmentBudget[] = [
  {
    cost_center_code: 'CC-FAR',
    department_name: 'Farmasi & Apotek',
    fiscal_year: 2026,
    total_limit: 500000000, // 500 Juta
    blocked_amount: 1425000,
    spent_amount: 749250,
    remaining_allocated: 497825750
  },
  {
    cost_center_code: 'CC-IGD',
    department_name: 'Instalasi Gawat Darurat (IGD)',
    fiscal_year: 2026,
    total_limit: 350000000, // 350 Juta
    blocked_amount: 4425000,
    spent_amount: 0,
    remaining_allocated: 345575000
  },
  {
    cost_center_code: 'CC-IBS',
    department_name: 'Instalasi Bedah Sentral (IBS)',
    fiscal_year: 2026,
    total_limit: 800000000, // 800 Juta
    blocked_amount: 0, // Draf is not blocked yet
    spent_amount: 0,
    remaining_allocated: 800000000
  },
  {
    cost_center_code: 'CC-LAB',
    department_name: 'Laboratorium Klinis',
    fiscal_year: 2026,
    total_limit: 250000000,
    blocked_amount: 0,
    spent_amount: 0,
    remaining_allocated: 250000000
  },
  {
    cost_center_code: 'CC-ITD',
    department_name: 'Departemen IT & SIMRS',
    fiscal_year: 2026,
    total_limit: 150000000,
    blocked_amount: 0,
    spent_amount: 0,
    remaining_allocated: 150000000
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'LOG-001',
    timestamp: '2026-05-20 09:12:44',
    user_role: 'Requester Department',
    actor: 'dr. Hidayat (Apoteker Kepala)',
    module: 'PR',
    action_type: 'CREATE',
    entity_id: 'PR/202605/APT-01',
    description: 'Membuat draft pengajuan PR untuk restock Paracetamol Tablet dan Vaksin Influenza.'
  },
  {
    id: 'LOG-002',
    timestamp: '2026-05-20 11:30:15',
    user_role: 'Department Head',
    actor: 'Marlyn Siregar (Manager Farmako)',
    module: 'PR',
    action_type: 'APPROVE',
    entity_id: 'PR/202605/APT-01',
    description: 'Memberikan persetujuan berjenjang level 1 untuk PR Apotek karena stok berada di bawah level aman.'
  },
  {
    id: 'LOG-003',
    timestamp: '2026-05-22 14:22:11',
    user_role: 'Procurement Admin',
    actor: 'Agus Santoso (Purchasing Sourcing)',
    module: 'PO',
    action_type: 'CREATE',
    entity_id: 'PO/202605/VND-KF/002',
    description: 'Mengonversi PR/202605/APT-01 ke dokumen PO resmi ke Kimia Farma dengan harga terkontrak.'
  },
  {
    id: 'LOG-004',
    timestamp: '2026-05-25 10:05:00',
    user_role: 'Requester Department',
    actor: 'Ns. Ratna (Supervisor IGD)',
    module: 'PR',
    action_type: 'CREATE',
    entity_id: 'PR/202605/IGD-02',
    description: 'Menyerahkan pengajuan PR urgent untuk logistik infusan RL dan Syringe 3cc menyambut libur panjang.'
  },
  {
    id: 'LOG-005',
    timestamp: '2026-05-27 15:45:30',
    user_role: 'Warehouse/Gudang',
    actor: 'Budi Kusuma (Apoteker Gudang)',
    module: 'GRN',
    action_type: 'CREATE',
    entity_id: 'GRN/202605/GUD-001',
    description: 'Menerima pengiriman fisik Paracetamol dari PO/202605/VND-KF/002 secara lengkap, mendaftarkan Batch: BATCH-PCT500-A2, Expiry: 2028-12-01.'
  }
];
