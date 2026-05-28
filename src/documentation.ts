/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DocSection {
  title: string;
  description: string;
  content: string;
  code?: string;
  language?: string;
}

export const documentationData: DocSection[] = [
  {
    title: "A. Executive Summary",
    description: "Ringkasan Eksekutif Sistem Pengadaan Rumah Sakit",
    content: `Aplikasi Enterprise Procurement System (EPS) RS Medika Sejahtera dirancang sebagai solusi pengadaan kebutuhan medis dan non-medis terpadu berstandar kepatuhan tinggi (Highly Compliant). 

Tujuan Utama Sistem:
1. Otomasi Siklus Pengadaan: Menghubungkan unit operasional (IGD, Farmasi, Radiologi, Bedah) dengan divisi pengadaan, gudang, dan keuangan (Accounts Payable).
2. Kontrol Anggaran (Budget Block): Mencegah pembelanjaan berlebih di tingkat cost center departemen sebelum draf pengadaan diajukan ke manajemen.
3. Kepatuhan Klinis & Traceability: Melacak data kritis obat-obatan (Batch & Expiry Date) dan aset rumah sakit (Serial Number) secara real-time pada saat penerimaan barang (Goods Receipt).
4. Mitigasi Risiko Stockout: Menggunakan algoritma otomatis berdasarkan titik draf reorder point untuk SKU medis esensial.`
  },
  {
    title: "B. End-to-End Business Process",
    description: "Alur Proses Pengadaan dari Kebutuhan hingga Pembayaran",
    content: `Alur kerja procurement rumah sakit berjalan sesuai SOP sebagai berikut:

1. Perencanaan & Titik Pembelian (Reorder): Apotek Gudang memantau ketersediaan barang medis. SKU dengan status stok < batas minimum memicu pengajuan draf PR otomatis.
2. Pengajuan PR (Purchase Requisition): Requester department menyusun dokumen PR. Sistem secara otomatis melakukan validasi ketersediaan budget cost center dan memblokir pengajuan jika nominal melampaui sisa plafon.
3. Approval Berjenjang (RBAC):
   - PR < Rp10 Juta: Cukup disetujui oleh Kepala Departemen (Department Head).
   - PR > Rp10 Juta - Rp100 Juta: Memerlukan approval dari Procurement Reviewer & Finance VP.
   - PR > Rp100 Juta: Memerlukan persetujuan Direktur Utama.
4. Tinjauan Procurement & Penerbitan PO (Purchase Order): Divisi采购 memeriksa pemasok, melakukan split PR ke beberapa PO berbasis vendor pilihan, atau merge beberapa draf PR menjadi satu PO sebelum diterbitkan ke vendor eksternal.
5. Goods Receipt Note (GRN): Staff logistik menerima barang di dermaga bongkar muat gudang. Dilakukan pengecekan fisik parsial atau lengkap, pencatatan batch number & tanggal kedaluwarsa (untuk obat ampul/vial) serta serial number (untuk alkes elektro-medis).
6. Rekonsiliasi 3-Way Matching: Akuntan Finance/AP memverifikasi dokumen PO vs GRN vs Tagihan Invoice Supplier. Jika kuantitas dan harga unit teraplikasi sama, invoice dinyatakan 'Approved for Payment' dan dijadwalkan dibayar menggunakan Term of Payment (TOP).`
  },
  {
    title: "C. Module Breakdown",
    description: "Daftar Modul Fungsional di Dalam Sistem",
    content: `Sistem ini terbagi atas sasis modul modular sebagai berikut:

- Modul 1: Manajemen SKU Master & Katalog Medis. Mencakup atribut spesifikasi alkes, UOM, preferensi vendor, dan bendera (flag) critical/controlled item.
- Modul 2: Permintaan Pembelian (Purchase Requisition). Penggabungan item kebutuhan per departemen, perhitungan estimasi biaya, audit reasons, dan workflow submission.
- Modul 3: Manajemen Pemesanan (Purchase Order / PO). Konversi PR yang telah disetujui menjadi PO eksternal, validasi harga kontrak, dan status pengiriman vendor.
- Modul 4: Penerimaan Bahan (Goods Receipt Note / GRN). Modul gudang pelacak batch, inventori, mutasi stok, pencetakan barcode/QR, dan laporan dekrepan kuantitas (discrepancy reporting).
- Modul 5: Pencocokan Tagihan (Invoice matching & 3-Way Reconciliation). Filter pencocokan dokumen, hitungan PPN, kontrol audit compliance, dan penjadwalan pembayaran (Accounts Payable).
- Modul 6: Budget & Cost Center Monitoring. Pembatasan akses anggaran per cost center departemen, visualisasi utilitas, perlindungan overspending.`
  },
  {
    title: "D. ERD Relational Design",
    description: "Hubungan Antar Tabel Database Rumah Sakit",
    content: `Relasi fisik database relasional digambarkan sebagai berikut:

- users terikat ke roles & departments.
- roles terhubung ke permissions melalui tabel jembatan role_permissions.
- skus berafiliasi Many-to-One ke vendors dan kategorinya.
- purchase_requisitions menampung many purchase_requisition_items, yang mendelegasikan Foreign Key ke skus.
- purchase_orders menampung purchase_order_items, yang terhubung ke purchase_requisitions dan vendors.
- goods_receipts berafiliasi ke purchase_orders. Item-item di dalam goods_receipt_items menyimpan relasi kuantitas yang diterima terhadap purchase_order_items.
- invoices membandingkan purchase_orders, goods_receipt_s, serta invoices itu sendiri untuk 3-way matching.
- audit_logs merekam seluruh perubahan record terpenting.`
  },
  {
    title: "E. Database Schema Detail (PostgreSQL SQL)",
    description: "Spesifikasi Perintah DDL SQL Produksi Lengkap",
    content: "Di bawah ini adalah query SQL DDL murni lengkap untuk mendeploy semua tabel relasional dengan tipe data presisi tinggi, foreign key restraints, serta rekomendasi indexing untuk optimasi query pembacaan inventori dan akuntansi.",
    language: "sql",
    code: `-- 1. Master Tabel Pengguna & Hak Akses
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE departments (
    dept_id SERIAL PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL UNIQUE,
    cost_center_code VARCHAR(30) UNIQUE NOT NULL
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT REFERENCES roles(role_id),
    dept_id INT REFERENCES departments(dept_id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Master Tabel Vendor & SKU barang
CREATE TABLE vendors (
    vendor_id SERIAL PRIMARY KEY,
    vendor_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    contact_pic VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    address TEXT,
    rating DECIMAL(2,1),
    sla_delivery_rate DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE skus (
    sku_id SERIAL PRIMARY KEY,
    sku_code VARCHAR(50) UNIQUE NOT NULL,
    sku_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Obat', 'BMHP', 'Alkes', 'Non-Medis'
    uom VARCHAR(25) NOT NULL, -- 'Box', 'Vial', 'Pcs'
    brand VARCHAR(100),
    estimated_price DECIMAL(15,2) NOT NULL,
    minimum_stock INT NOT NULL DEFAULT 10,
    maximum_stock INT NOT NULL DEFAULT 500,
    current_stock INT NOT NULL DEFAULT 0,
    vendor_id INT REFERENCES vendors(vendor_id),
    status VARCHAR(15) DEFAULT 'Aktif', -- 'Aktif', 'Nonaktif'
    is_critical BOOLEAN DEFAULT FALSE,
    is_controlled BOOLEAN DEFAULT FALSE, -- controlled drug seperti psikotropika
    is_taxable BOOLEAN DEFAULT TRUE,
    lead_time_days INT DEFAULT 3,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Tabel Anggaran (Budgeting)
CREATE TABLE budgets (
    budget_id SERIAL PRIMARY KEY,
    cost_center_code VARCHAR(30) REFERENCES departments(cost_center_code),
    fiscal_year INT NOT NULL,
    total_limit DECIMAL(15,2) NOT NULL,
    blocked_amount DECIMAL(15,2) DEFAULT 0.00,
    spent_amount DECIMAL(15,2) DEFAULT 0.00,
    CONSTRAINT unique_budget_year UNIQUE (cost_center_code, fiscal_year)
);

-- 4. Tabel Transaksi PR (Purchase Requisition)
CREATE TABLE purchase_requisitions (
    pr_id SERIAL PRIMARY KEY,
    pr_number VARCHAR(50) UNIQUE NOT NULL,
    dept_id INT REFERENCES departments(dept_id),
    req_date DATE DEFAULT CURRENT_DATE,
    target_date DATE NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    description TEXT,
    status VARCHAR(25) DEFAULT 'Draft', -- 'Draft', 'Submitted', 'Approved', 'Rejected', 'Cancelled'
    reject_reason TEXT,
    approved_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE purchase_requisition_items (
    pr_item_id SERIAL PRIMARY KEY,
    pr_id INT REFERENCES purchase_requisitions(pr_id) ON DELETE CASCADE,
    sku_id INT REFERENCES skus(sku_id),
    qty INT NOT NULL CHECK (qty > 0),
    unit_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL
);

-- 5. Tabel Transaksi PO (Purchase Order)
CREATE TABLE purchase_orders (
    po_id SERIAL PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    pr_id INT REFERENCES purchase_requisitions(pr_id),
    vendor_id INT REFERENCES vendors(vendor_id),
    order_date DATE DEFAULT CURRENT_DATE,
    expected_date DATE,
    total_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(25) DEFAULT 'Draft', -- 'Draft', 'Sent_to_Vendor', 'Partially_Received', 'Fully_Received'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE purchase_order_items (
    po_item_id SERIAL PRIMARY KEY,
    po_id INT REFERENCES purchase_orders(po_id) ON DELETE CASCADE,
    sku_id INT REFERENCES skus(sku_id),
    qty INT NOT NULL CHECK (qty > 0),
    unit_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL
);

-- 6. Penerimaan Barang & Inventori
CREATE TABLE goods_receipts (
    grn_id SERIAL PRIMARY KEY,
    grn_number VARCHAR(50) UNIQUE NOT NULL,
    po_id INT REFERENCES purchase_orders(po_id),
    received_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    received_by VARCHAR(100) NOT NULL,
    status VARCHAR(25) DEFAULT 'Completed'
);

CREATE TABLE goods_receipt_items (
    grn_item_id SERIAL PRIMARY KEY,
    grn_id INT REFERENCES goods_receipts(grn_id) ON DELETE CASCADE,
    sku_id INT REFERENCES skus(sku_id),
    qty_ordered INT NOT NULL,
    qty_received INT NOT NULL,
    batch_number VARCHAR(50), -- Wajib untuk Obat/Vaksin/BMHP
    expiry_date DATE,         -- Tanggal Kedaluwarsa Medis
    serial_number VARCHAR(100) -- Wajib untuk Aset Alkes Besar
);

-- 7. Finance & 3-Way Matching
CREATE TABLE invoices (
    invoice_id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    po_id INT REFERENCES purchase_orders(po_id),
    grn_id INT REFERENCES goods_receipts(grn_id),
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    sub_total DECIMAL(15,2) NOT NULL,
    tax DECIMAL(15,2) NOT NULL,
    total_billed DECIMAL(15,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'Pending_Match', -- 'Verified_Matched', 'Discrepancy_Hold', 'Paid'
    payment_term_days INT NOT NULL DEFAULT 30
);

-- 8. Audit logs & Log Trail
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_role VARCHAR(100) NOT NULL,
    actor VARCHAR(150) NOT NULL,
    module VARCHAR(50) NOT NULL,
    action_type VARCHAR(20) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    description TEXT,
    payload_json TEXT
);

-- INDEKS PENTING UNTUK OPTIMASI PERFORMA QUERY CEPAT
CREATE INDEX idx_skus_code ON skus(sku_code);
CREATE INDEX idx_skus_current ON skus(current_stock, minimum_stock);
CREATE INDEX idx_pr_number ON purchase_requisitions(pr_number);
CREATE INDEX idx_po_number ON purchase_orders(po_number);
CREATE INDEX idx_grn_number ON goods_receipts(grn_number);
CREATE INDEX idx_audit_entity ON audit_logs(entity_id);
`
  },
  {
    title: "F. API Endpoint Design",
    description: "Kontrak API RESTful Komprehensif Berstandar Korporasi",
    content: `Dokumen REST API ini mendeskripsikan rute utama yang diperlukan untuk operasional full-stack aplikasi procurement:

1. Modul SKU Master:
   - GET /api/skus -> Ambil daftar SKU medis dengan filter kategori dan warning stock.
   - POST /api/skus -> Mendaftarkan SKU baru lengkap dengan ambang minimum aman.
   - PATCH /api/skus/:id/stock -> Update jumlah persediaan (Stock Opname adjustment).

2. Modul Purchase Requisition (PR):
   - GET /api/purchase-requisitions -> Mengambil seluruh draf/dokumen PR.
   - POST /api/purchase-requisitions -> Membuat PR baru. Memanggil pengecekan budget secara transaksional.
   - PUT /api/purchase-requisitions/:id/status -> Otorisasi approval (Approved/Rejected dengan isi alasan).

3. Modul Purchase Order (PO):
   - POST /api/purchase-orders/convert -> Membuat PO terpisah berbasis vendor dari PR yang disetujui.
   - PATCH /api/purchase-orders/:id/status -> Vendor mengonfirmasi pesanan (Vendor Confirmed).

4. Modul Receiving (GRN):
   - POST /api/goods-receipts -> Input penerimaan di gudang obat. Update stok barang di tabel SKU otomatis.

5. Modul Invoices:
   - POST /api/invoices/match-verify -> Menjalankan prosedur 3-way matching robotik sebelum pelepasan dana.`
  },
  {
    title: "G. UI Page Structure",
    description: "Struktur & Hierarki Navigasi Antarmuka Pengguna",
    content: `EPS Rumah Sakit ini direkayasa ke dalam layout dashboard modular sebagai berikut:

1. Dashboard KPI Hub: Panel metrik finansial dan operasional. Menghitung siklus waktu pengadaan (SLA), utilisasi budget Cost Center, restock alerts, dan performansi logistik vendor.
2. SKU Catalog Master: Antarmuka pengeditan SKU, filter stok kritis, input barang critical & controlled, serta detail preferensi import.
3. Form PR & Inbox Otorisasi: Wizard pembuatan PR dengan pencocokan budget dinamis. Menyertakan kotak masuk persetujuan untuk Department Head, Purchasing, dan Direksi Keuangan.
4. PO Release Center: Daftar PO eksternal dikelompokkan per vendor mitra dengan indikator status pengiriman.
5. Receiving (Gudang): Loket pencatatan penerimaan barang. User mengentri tanggal kedaluwarsa dan nomor cetakan batch industri obat demi menjamin FIFO di apotek.
6. 3-Way Matching Auditor: Panel verifikasi visual yang mensandingkan tabel PO vs GRN vs Invoice. Jika terdapat deviasi harga atau jumlah, bendera 'Hold Discrepancy' dipasang permanen.`
  },
  {
    title: "H. Role Permission Matrix (RBAC)",
    description: "Matriks Hak Akses & Pembatasan Otoritas",
    content: `Pengaturan hak akses sistem dikonfigurasi secara ketat berdasarkan Role-Based Access Control (RBAC):

- Super Admin: Hak penuh (View, Create, Edit, Approve, Reject, Manage master data).
- Requester Dept (Pegawai ruangan): Hak View SKU, Create PR (Draf), Edit PR buatannya sendiri. Tidak bisa menyetujui PR buatan sendiri.
- Department Head: Hak View SKU, Approve/Reject PR khusus departemennya sendiri sesuai plafon (Max Rp10 juta).
- Procurement Admin (Buyer): Hak View SKU, Edit SKU, Review PR, Convert PR Approved menjadi PO, View PO, Edit PO.
- Warehouse/Gudang Officer: Hak View PO, Create GRN (Goods Receipt), pelacak batch & serial number alkes.
- Finance/AP Specialist: Hak View Budget, View PO, View GRN, Create Invoice, Melakukan 3-Way matching, melepaskan tagihan pembayaran (Pay Invoice).
- Auditor: Hak hanya-baca (Read-Only) pada semua modul, mengunduh laporan Excel audit trail log aktivitas sistem.`
  },
  {
    title: "I. Workflow Status Diagram",
    description: "Aliran Status Siklus Hidup Dokumen Pengadaan",
    content: `Siklus dokumen procurement mengalir melewati transisi status berikut:

Dokumen PR:
[Draft] -> Diinput oleh staff ruangan.
   Lalu di-Submit:
[Submitted] -> Menunggu persetujuan Kepala Departemen.
   Jika nominal / kategori kritis:
   -> [Approved] (Lolos verifikasi budget & otoritas) atau [Rejected] (Tolak & wajib input alasan).
      Untuk PR yang Approved:
      -> [Converted_to_PO] -> Divisi pengadaan menerbitkan nomor PO eksternal.

Dokumen PO:
[Draft] -> [Sent_to_Vendor] -> [Vendor_Confirmed] -> [Partially_Received] -> [Fully_Received] -> [Closed].

Dokumen Invoice:
[Pending_Match] -> Verifikasi 3-Way Match -> [Verified_Matched] atau [Discrepancy_Hold] -> [Approved_For_Payment] -> [Paid].`
  },
  {
    title: "J. Business Rules (Aturan Utama Sistem)",
    description: "Aturan Logika & Proteksi Transaksional Sistem EPS",
    content: `SOP Utama Rumah Sakit yang ditanam pada logika software:

Rule 1 (Budget Lock): Sistem menghentikan pengajuan PR (menolak Submission) jika total anggaran item yang diajukan melampaui sisa alokasi dana tersimpan (remaining budget) departemen peminta untuk tahun anggaran berjalan.
Rule 2 (Anti Approval-Sendiri): Pembuat PR tidak diperkenankan menyetujui (Approve) hasil buatannya sendiri, wajib disubmit ke atasan di hierarki structural.
Rule 3 (Validasi Obat & Psikotropika): Setiap penerimaan barang (GRN status Completed) untuk komoditas berkategori 'Obat-obatan' wajib menyertakan data Batch Number dan Expiry Date berformat tanggal valid. Komoditas 'Alkes' bernilai tinggi wajib menyimpan serial number aset tunggal.
Rule 4 (3-Way Matching): Pembayaran AP hanya diizinkan lepas jika kuantitas barang terbayar pada invoice ≤ kuantitas yang benar-benar diterima pada dokumen penerimaan barang (GRN), dan harga per unit berselisih 0% terhadap PO.
Rule 5 (Controlled Items Audit): Pengadaan obat golongan narkotika/psikotropika membutuhkan approval level tertinggi direktorat tanpa memandang batas nominal pengajuan.`
  },
  {
    title: "K. Suggested Folder Structure",
    description: "Rancangan Folder Aplikasi Full-Stack Produksi",
    content: `Penyusunan kode disarankan mengikuti arsitektur modular berikut demi kemudahan maintenance:

hospital-procurement-system/
├── prisma/
│   └── schema.prisma                 # Skema single-source of truth database relajs
├── src/
│   ├── components/                   # Komponen visual reusable (layout, buttons, dll)
│   ├── hooks/                        # Custom React hooks (useAuth, useBudget)
│   ├── routes/                       # Rute API backend Express (api/skus, api/prs, dll)
│   ├── services/                     # Kompleks algoritma bisnis (matchingEngine, budgetBlocking)
│   ├── types.ts                      # Definisi tipe TypeScript global
│   ├── initialData.ts                # Database dummy state untuk inisialisasi awal
│   └── App.tsx                       # Sasis router utama frontend & simulator UI
├── .env                              # Parameter rahasia (DB URI, GEMINI KEY)
├── package.json                      # Daftar library dependensi
└── webpack.config.js / vite.config.ts # Konfigurasi bundler`
  },
  {
    title: "M. Prisma Schema Draft (Prisma ORM)",
    description: "Pemodelan Prisma untuk Auto-Migrasi Skema PostgreSQL",
    content: "Di bawah ini adalah draf lengkap file `schema.prisma` yang mendefinisikan relasi referensial database secara menyeluruh lengkap dengan atribut-atribut enterprise.",
    language: "typescript",
    code: `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Department {
  id               Int                   @id @default(autoincrement())
  name             String                @unique
  costCenterCode   String                @unique
  users            User[]
  requisitions     PurchaseRequisition[]
  budgets          Budget[]

  @@map("departments")
}

model User {
  id           Int          @id @default(autoincrement())
  username     String       @unique
  email        String       @unique
  passwordHash String
  role         String       // 'Admin' | 'Requester' | 'Approver' | 'Auditor'
  departmentId Int
  department   Department   @relation(fields: [departmentId], references: [id])
  isActive     Boolean      @default(true)
  createdAt    DateTime     @default(now())

  @@map("users")
}

model Vendor {
  id              String          @id @default(uuid())
  code            String          @unique
  name            String
  contactPic      String?
  email           String?         @unique
  address         String?
  rating          Decimal?        @db.Decimal(2, 1)
  slaDeliveryRate Decimal?        @db.Decimal(5, 2)
  skus            Sku[]
  purchaseOrders  PurchaseOrder[]

  @@map("vendors")
}

model Sku {
  id             String                    @id @default(uuid())
  skuCode        String                    @unique
  skuName        String
  category       String                    // 'Obat' | 'BMHP' | 'Alkes' | 'Non-Medis'
  uom            String
  brand          String?
  estimatedPrice Decimal                   @db.Decimal(12, 2)
  minimumStock   Int                       @default(10)
  maximumStock   Int                       @default(500)
  currentStock   Int                       @default(0)
  vendorId       String
  vendor         Vendor                    @relation(fields: [vendorId], references: [id])
  status         String                    @default("Aktif") // 'Aktif' | 'Nonaktif'
  isCritical     Boolean                   @default(false)
  isControlled   Boolean                   @default(false)
  isTaxable      Boolean                   @default(true)
  leadTimeDays   Int                       @default(3)
  prItems        PurchaseRequisitionItem[]
  poItems        PurchaseOrderItem[]

  @@map("skus")
}

model Budget {
  id               Int        @id @default(autoincrement())
  costCenterCode   String
  department       Department @relation(fields: [costCenterCode], references: [costCenterCode])
  fiscalYear       Int
  totalLimit       Decimal    @db.Decimal(15, 2)
  blockedAmount    Decimal    @default(0.00) @db.Decimal(15, 2)
  spentAmount      Decimal    @default(0.00) @db.Decimal(15, 2)

  @@unique([costCenterCode, fiscalYear])
  @@map("budgets")
}

model PurchaseRequisition {
  id             String                    @id @default(uuid())
  prNumber       String                    @unique
  departmentId   Int
  department     Department                @relation(fields: [departmentId], references: [id])
  reqDate        DateTime                  @default(now())
  targetDate     DateTime
  totalAmount    Decimal                   @default(0.00) @db.Decimal(15, 2)
  description    String?                   @db.Text
  status         String                    @default("Draft") // 'Draft' | 'Submitted' | 'Approved'
  rejectReason    String?                   @db.Text
  approvedBy     String?
  items          PurchaseRequisitionItem[]
  purchaseOrders PurchaseOrder[]

  @@map("purchase_requisitions")
}

model PurchaseRequisitionItem {
  id            String              @id @default(uuid())
  prId          String
  requisition   PurchaseRequisition @relation(fields: [prId], references: [id], onDelete: Cascade)
  skuId         String
  sku           Sku                 @relation(fields: [skuId], references: [id])
  qty           Int
  unitPrice     Decimal             @db.Decimal(12, 2)
  totalPrice    Decimal             @db.Decimal(15, 2)

  @@map("purchase_requisition_items")
}

model PurchaseOrder {
  id             String              @id @default(uuid())
  poNumber       String              @unique
  prId           String
  requisition    PurchaseRequisition @relation(fields: [prId], references: [id])
  vendorId       String
  vendor         Vendor              @relation(fields: [vendorId], references: [id])
  orderDate      DateTime            @default(now())
  expectedDate   DateTime?
  totalAmount    Decimal             @db.Decimal(15, 2)
  status         String              @default("Draft") // 'Draft' | 'Sent' | 'Received'
  items          PurchaseOrderItem[]
  goodsReceipts  GoodsReceipt[]

  @@map("purchase_orders")
}

model PurchaseOrderItem {
  id         String        @id @default(uuid())
  poId       String
  order      PurchaseOrder @relation(fields: [poId], references: [id], onDelete: Cascade)
  skuId      String
  sku        Sku           @relation(fields: [skuId], references: [id])
  qty        Int
  unitPrice  Decimal       @db.Decimal(12, 2)
  totalPrice Decimal       @db.Decimal(15, 2)

  @@map("purchase_order_items")
}

model GoodsReceipt {
  id           String             @id @default(uuid())
  grnNumber    String             @unique
  poId         String
  order        PurchaseOrder      @relation(fields: [poId], references: [id])
  receivedDate DateTime           @default(now())
  receivedBy   String
  status       String             @default("Completed")
  items        GoodsReceiptItem[]

  @@map("goods_receipts")
}

model GoodsReceiptItem {
  id           String       @id @default(uuid())
  grnId        String
  receipt      GoodsReceipt @relation(fields: [grnId], references: [id], onDelete: Cascade)
  skuId        String
  qtyOrdered   Int
  qtyReceived  Int
  batchNumber  String?
  expiryDate   DateTime?
  serialNumber String?

  @@map("goods_receipt_items")
}`
  },
  {
    title: "P. Testing Scenario & Rencana Uji",
    description: "Daftar Skenario Uji untuk Verifikasi Kepatuhan Sistem",
    content: `Direkomendasikan melakukan Uji Penerimaan Pengguna (UAT) berdasarkan matriks pengujian berikut:

1. Test Case 1: Validasi Budget Block
   - Skenario: Requester membuat PR senilai Rp200 Juta untuk departemen IT yang hanya memiliki budget tersisa Rp150 Juta.
   - Hasil yang Diharapkan: Sistem menolak submission, menampilkan pesan error peringatan kegagalan budget, dan status PR tertahan di 'Draft'.

2. Test Case 2: Approval Berjenjang & Hak Akses
   - Skenario: Mengajukan PR senilai Rp25 Juta. Pengguna masuk menggunakan role Head of Department, lalu mencoba menyetujui langsung.
   - Hasil yang Diharapkan: PR membutuhkan review tambahan dari Procurement & Finance. Tombol setuju langsung tidak diizinkan melebihi limit Rp10 Juta.

3. Test Case 3: 3-Way Matching Deviasi
   - Skenario: Melakukan matching invoice berkas senilai Rp600.000, padahal PO asli bernilai Rp500.000.
   - Hasil yang Diharapkan: Sistem memblokir approval invoice dengan alasan discrepancy, status invoice masuk ke 'Discrepancy_Hold'.`
  },
  {
    title: "Q. Rencana Pengembangan Selanjutnya (Future Enhancements)",
    description: "Rencana Peta Jalan (Roadmap) Fitur ke Depan",
    content: `Pengembangan EPS Rumah Sakit versi selanjutnya mencakup rilis:

1. Integrasi Sistem Informasi Manajemen RS (SIMRS / HIS): Sinkronisasi langsung resep dokter, penggunaan farmasi klinis di bangsal, ke modul inventori restock.
2. Sourcing Otomatis Berbasis AI: Memprediksi harga pasar obat fluktuatif serta merekomendasikan split PO vendor terbaik menggunakan model machine learning.
3. Mobile Warehouse Barcode Scanner: Aplikasi Android native pendukung barcode 2D GS1 untuk mempercepat scanning batch dan masa kedaluwarsa sewaktu pembongkaran kargo.`
  }
];
