# Sistem Procurement Rumah Sakit (EPS) — RS Medika Utama

> **Enterprise Procurement System (EPS)** — Aplikasi simulasi front-end untuk sistem pengadaan barang medis & non-medis rumah sakit. Dibangun dengan **React 19 + TypeScript + Vite + Tailwind v4**.

Dokumen ini menjelaskan **secara detail** baik dari sisi **teknis** (arsitektur, struktur folder, alur data, modul) maupun **bisnis** (alur procurement, peran, dokumen, kontrol budget, kepatuhan klinis).

---

## Daftar Isi

1. [Tentang Aplikasi](#1-tentang-aplikasi)
2. [Tujuan & Ruang Lingkup](#2-tujuan--ruang-lingkup)
3. [Tech Stack](#3-tech-stack)
4. [Struktur Folder (Setelah Refactor)](#4-struktur-folder-setelah-refactor)
5. [Arsitektur Aplikasi](#5-arsitektur-aplikasi)
6. [Model Data (Domain Entities)](#6-model-data-domain-entities)
7. [Modul & Halaman](#7-modul--halaman)
8. [Business Process End-to-End](#8-business-process-end-to-end)
9. [Diagram Alur Status Dokumen](#9-diagram-alur-status-dokumen)
10. [State Management & Persistensi](#10-state-management--persistensi)
11. [Simulasi API & Audit Log](#11-simulasi-api--audit-log)
12. [Konvensi UI/UX](#12-konvensi-uiux)
13. [Cara Menjalankan](#13-cara-menjalankan)
14. [Rencana Pengembangan Berikutnya](#14-rencana-pengembangan-berikutnya)

---

## 1. Tentang Aplikasi

**RS Medika Utama Procurement** adalah aplikasi web yang mensimulasikan **siklus pengadaan rumah sakit** mulai dari pencatatan master SKU, pengajuan kebutuhan oleh unit (Purchase Requisition), persetujuan manajemen, hingga konversi ke Purchase Order — disertai panel dokumentasi blueprint sistem (ERD, DDL PostgreSQL, kontrak API, RBAC, alur status).

Aplikasi ini berperan sebagai **prototype/demo** edukatif tentang bagaimana sistem procurement rumah sakit harusnya berperilaku: kontrol stok kritis, validasi minimum, jejak audit, dan workflow approval. Semua data disimpan lokal di `localStorage` browser — tanpa backend — sehingga cocok untuk presentasi maupun belajar workflow procurement medis.

**Aktor utama yang disimulasikan:**

| Aktor | Peran di sistem |
| --- | --- |
| **Requester Department** (IGD, Farmasi, IBS, Poliklinik, Gizi) | Membuat draft PR & submit untuk approval |
| **Department Head / Manager** | Approve atau Reject PR yang berstatus Submitted |
| **Procurement Admin / Logistik** | Mengelola master SKU, master Vendor, monitoring stok kritis |
| **Auditor** | Melihat jejak aktivitas via **API Request Stream** (panel simulasi) |

---

## 2. Tujuan & Ruang Lingkup

### Tujuan Bisnis
1. **Otomasi Siklus Pengadaan** — Menghubungkan unit operasional (IGD, Farmasi, Radiologi, Bedah) dengan divisi pengadaan, gudang, dan keuangan.
2. **Kontrol Anggaran (Budget Block)** — Mencegah pembelanjaan berlebih di tingkat *cost center* departemen sebelum draf pengadaan diajukan ke manajemen.
3. **Kepatuhan Klinis & Traceability** — Melacak data kritis obat (Batch & Expiry Date) dan aset rumah sakit (Serial Number) secara real-time pada saat penerimaan barang (Goods Receipt).
4. **Mitigasi Risiko Stockout** — Algoritma otomatis berdasarkan *reorder point* untuk SKU medis esensial; baris SKU yang `current_stock < minimum_stock` ditandai sebagai **Restock!**

### Ruang Lingkup Aplikasi (Yang Sudah Diimplementasikan)
Modul yang aktif & dapat dioperasikan di UI:

- ✅ **SKU Master** (CRUD ringan: tambah, toggle status, filter, pencarian)
- ✅ **Purchase Requisition (PR)** — buat draft / submit, approve, reject, hapus draft
- ✅ **Vendor Master** — daftar & registrasi vendor baru
- ✅ **Dashboard metrik header** — Total SKU, Stok Kritis, Antrean PR
- ✅ **API Request Stream** — simulasi log HTTP per aksi
- ✅ **Dokumentasi Blueprint** — embedded di tab "Blueprint & Dokumen"

### Modul Konseptual (Belum Diimplementasi UI-nya, Hanya Didokumentasikan)
- ⏳ **Purchase Order (PO)** — sudah ada type & data dummy
- ⏳ **Goods Receipt Note (GRN)** — sudah ada type & data dummy
- ⏳ **Invoice & 3-Way Matching** — sudah ada type & data dummy
- ⏳ **Budget Cost Center Monitoring** — sudah ada type & data dummy
- ⏳ **Audit Log Persisten** — sudah ada type & data dummy

---

## 3. Tech Stack

| Layer | Teknologi | Versi |
| --- | --- | --- |
| Bahasa | TypeScript | ~5.8 |
| Framework UI | React | 19 |
| Bundler / Dev Server | Vite | ^6.2 |
| Styling | Tailwind CSS | v4 |
| Icons | lucide-react | ^0.546 |
| Animasi | motion (Framer Motion) | ^12.23 |
| Build helper | esbuild | ^0.25 |
| AI helper (opsional) | @google/genai | ^2.4 |

**Lint script:** `npm run lint` → `tsc --noEmit`

---

## 4. Struktur Folder (Setelah Refactor)

Refactor memecah `App.tsx` monolitik (±1.500 baris) menjadi struktur **feature-based**:

```
src/
├── App.tsx                       # Orchestrator tipis (~50 baris)
├── main.tsx                      # Entry point React
├── index.css                     # Tailwind v4 setup + custom scrollbar
├── types.ts                      # Domain types (Vendor, SKU, PR, PO, GRN, Invoice, AuditLog)
├── initialData.ts                # Seed/dummy data lengkap
├── documentation.ts              # Konten dokumentasi blueprint (rendered di tab Docs)
│
├── constants/
│   └── options.ts                # Dropdown options (kategori, UOM, departemen)
│                                 # STORAGE_KEYS, MAX_API_LOGS
│
├── utils/
│   ├── format.ts                 # formatIDR, todayISO, addDaysISO, generateId
│   ├── prNumber.ts               # buildPrNumber, resolveDepartmentCode
│   └── skuCategory.ts            # categoryToType (mapping kategori → type)
│
├── hooks/
│   ├── usePersistentState.ts     # useState + localStorage sync
│   └── useApiLogs.ts             # log API call simulator
│
├── context/
│   └── ProcurementContext.tsx    # Single source of truth state + actions:
│                                 #   addSku, toggleSkuStatus,
│                                 #   addVendor,
│                                 #   addPr, updatePrStatus, deletePr
│
└── components/
    ├── ui/
    │   └── Modal.tsx             # Modal generik (header gelap + close)
    │
    ├── layout/
    │   ├── Header.tsx            # Top bar + metric chips
    │   ├── Footer.tsx            # Versi & copyright
    │   ├── Sidebar.tsx           # Container: Navigation + Flow + ApiLog
    │   ├── Navigation.tsx        # 4-tab sidebar
    │   ├── ProcessFlowWidget.tsx # Diagram siklus 4-langkah
    │   └── ApiLogConsole.tsx     # Terminal-style stream log
    │
    ├── sku/
    │   ├── SkuPage.tsx           # Page wrapper (search + filter + table)
    │   ├── SkuFilters.tsx        # Search bar + dropdown kategori & stok
    │   ├── SkuTable.tsx          # Table renderer
    │   └── SkuFormModal.tsx      # Modal tambah SKU + form state lokal
    │
    ├── pr/
    │   ├── PrPage.tsx            # Page wrapper
    │   ├── PrManagerPanel.tsx    # Inbox Submitted PRs (Approve/Reject)
    │   ├── PrArchiveTable.tsx    # Arsip semua PR
    │   └── PrFormModal.tsx       # Modal pengajuan PR (multi-item)
    │
    ├── vendor/
    │   ├── VendorPage.tsx        # Grid vendor card
    │   └── VendorFormModal.tsx   # Modal registrasi vendor
    │
    └── docs/
        └── DocsPage.tsx          # Renderer documentationData[]
```

### Prinsip Refactor

1. **Single Responsibility** — Tiap file fokus satu tanggung jawab (layout / data / logic / presentation).
2. **Co-location** — File satu modul (SKU, PR, Vendor, Docs) berada di folder yang sama.
3. **Context API untuk State Global** — `ProcurementProvider` membungkus aplikasi; komponen hanya `useProcurement()` untuk akses data + actions, tanpa prop drilling.
4. **Custom hooks reusable** — `usePersistentState` & `useApiLogs` bisa dipakai ulang di tempat lain.
5. **Tanpa perubahan perilaku** — Refactor 100% non-fungsional: UI, alur klik, dan data tetap identik.

---

## 5. Arsitektur Aplikasi

### Diagram Komposisi (High-Level)

```
┌──────────────────────────── App.tsx ──────────────────────────────┐
│                                                                   │
│  <ProcurementProvider>  ← state global (skus, vendors, prs, logs) │
│  │                                                                │
│  └─ <ProcurementShell>  ← layout 3-kolom + tab switcher           │
│     │                                                             │
│     ├─ <Header>         ← brand + metric chips                    │
│     │                                                             │
│     ├─ <main>                                                     │
│     │  ├─ <Sidebar>                                               │
│     │  │  ├─ <Navigation>          (4 tab)                        │
│     │  │  ├─ <ProcessFlowWidget>   (timeline 4-step)              │
│     │  │  └─ <ApiLogConsole>       (live HTTP stream)             │
│     │  │                                                          │
│     │  └─ <section> Page Renderer                                 │
│     │     ├─ <SkuPage>     → SkuFilters + SkuTable + SkuFormModal │
│     │     ├─ <PrPage>      → PrManagerPanel + PrArchiveTable      │
│     │     │                  + PrFormModal                        │
│     │     ├─ <VendorPage>  → VendorCard[] + VendorFormModal       │
│     │     └─ <DocsPage>    → DocsSection[]                        │
│     │                                                             │
│     └─ <Footer>                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Aliran Data (Read & Write)

```
                       ┌────────────────────────────┐
                       │   ProcurementContext       │
                       │  (state + business actions)│
                       └─────────┬──────────────────┘
                                 │
   ┌─────────────────────────────┼──────────────────────────────┐
   ▼                             ▼                              ▼
[ Components ]            [ useApiLogs hook ]         [ usePersistentState ]
useProcurement()                  │                            │
   │                              ▼                            ▼
   │                       in-memory log buffer        localStorage:
   │                                                   - rs_procure_skus
   ▼                                                   - rs_procure_vendors
ApiLogConsole renders                                  - rs_procure_prs
```

- **Read:** Komponen panggil `useProcurement()` → dapat akses `skus`, `vendors`, `prs`, `apiLogs`, plus derived metrics (`criticalStockCount`, `pendingPrCount`).
- **Write:** Komponen panggil action (`addSku`, `addPr`, `updatePrStatus`, dll). Context update state → `usePersistentState` auto-sync ke `localStorage` → `useApiLogs.addLog()` mencatat ke stream → re-render selesai.

---

## 6. Model Data (Domain Entities)

Semua type didefinisikan di `src/types.ts`. Berikut ringkasannya:

### 6.1 `Vendor`
Master pemasok rumah sakit.

| Field | Tipe | Catatan |
| --- | --- | --- |
| `id` | string | PK internal (`VND-001`) |
| `code` | string | Display code (`VND-BF`) |
| `name`, `contact`, `email`, `address` | string | Kontak vendor |
| `rating` | number | 1-5 (bintang penilaian) |
| `sla_delivery_rate` | number | % ketepatan delivery |

### 6.2 `SKU`
Master barang medis & non-medis.

| Field | Tipe | Catatan |
| --- | --- | --- |
| `sku_id`, `sku_code`, `sku_name` | string | Identitas SKU |
| `category` | string | Display kategori (Obat-obatan, BMHP, Alkes, Saniter) |
| `type` | enum | `Obat \| Alkes \| BMHP \| Non-Medis \| Jasa` |
| `uom` | string | Satuan (Box, Vial, Botol, Pcs, Roll, Ampul) |
| `brand` | string | Merek (Generik default saat tambah baru) |
| `estimated_price` | number | Harga estimasi per UOM |
| `minimum_stock`, `maximum_stock`, `current_stock` | number | Inventori |
| `vendor_id` | string | FK ke `Vendor.id` |
| `status` | `'Aktif' \| 'Nonaktif'` | Aktif = boleh dipilih di PR |
| `lead_time_days` | number | Hari estimasi pengiriman vendor |
| `is_critical` | boolean | Bila true → SKU darurat |
| `is_controlled` | boolean | Obat psikotropika/narkotika |
| `is_taxable` | boolean | Kena PPN |

> **Aturan stok kritis:** `current_stock < minimum_stock` → ditandai **Restock!** (animasi merah berdenyut) dan termasuk dalam `criticalStockCount`.

### 6.3 `PurchaseRequisition` (PR)
Dokumen permintaan barang dari unit ke Procurement.

| Field | Tipe | Catatan |
| --- | --- | --- |
| `pr_id` | string | PK internal |
| `pr_number` | string | Nomor publik `PR/YYYYMM/<DEPT_CODE>-<NN>` |
| `department` | string | Departemen pengaju |
| `req_date` | string (YYYY-MM-DD) | Tanggal pengajuan |
| `target_date` | string | Target diterima |
| `total_amount` | number | Total estimasi semua item |
| `description` | string | Justifikasi/catatan |
| `status` | enum | `Draft \| Submitted \| Approved \| Rejected \| Converted_to_PO \| Cancelled` |
| `items[]` | `PurchaseRequisitionItem[]` | Daftar SKU + qty + harga snapshot |

**`PurchaseRequisitionItem`:** `{ id, sku_id, qty, unit_price (snapshot saat buat PR), total_price }`.

### 6.4 Entitas Lain (Documented-only)

`PurchaseOrder`, `PurchaseOrderItem`, `GoodsReceipt`, `GoodsReceiptItem`, `Invoice`, `InvoiceItem`, `DepartmentBudget`, `AuditLog` — sudah ada di `types.ts` + seed di `initialData.ts`, dipakai sebagai konteks dokumentasi di tab Blueprint.

### 6.5 Relasi ERD (Konseptual)

```
        ┌─────────┐         ┌──────────┐
        │ Vendor  │◄────────│   SKU    │
        └────┬────┘ 1     N └────┬─────┘
             │                   │
             │                   │ N
             │                   ▼
             │           ┌───────────────┐
             │           │  PR_Item      │
             │           └───────┬───────┘
             │                   │ N : 1
             │                   ▼
             │           ┌───────────────────────┐
             │           │ PurchaseRequisition   │
             │           └──────────┬────────────┘
             │                      │
             │ 1                    │ 1
             ▼                      ▼
        ┌────────────────────────────────┐
        │      Purchase Order            │
        └──────────┬─────────────────────┘
                   │ 1
                   ▼
            ┌──────────────┐
            │ GoodsReceipt │
            └──────┬───────┘
                   │ 1
                   ▼
            ┌──────────────┐
            │   Invoice    │   ← 3-way matching (PO, GRN, Invoice)
            └──────────────┘
```

---

## 7. Modul & Halaman

### 7.1 Tab "SKU Master" (`SkuPage`)

**Fitur:**
- Tabel SKU dengan kolom: Kode, Nama, Kategori/UOM, Harga, Stok (current/min), Vendor, Status, Aksi.
- **Filter cepat:** Search (kode/nama), Dropdown Kategori, Toggle "Stok Kritis Saja".
- **Badge "Restock!"** otomatis muncul di baris SKU yang stoknya di bawah minimum.
- **Tombol "Aktifkan/Nonaktifkan"** untuk mengubah `status` SKU (PATCH).
- **Modal "Tambah SKU Baru"** — form dengan validasi field wajib, peringatan dini jika stok input < minimum.

**Aksi yang dipanggil:**
- `addSku(form)` — POST `/api/skus`
- `toggleSkuStatus(skuId)` — PATCH `/api/skus/:id/status`

### 7.2 Tab "Purchase Requisition" (`PrPage`)

Halaman dibagi 2 bagian:

#### A. **Manager Panel** (`PrManagerPanel`) — Background gelap
Inbox PR berstatus **`Submitted`** yang menunggu approval. Tiap PR ditampilkan sebagai kartu berisi:
- Nomor PR, Departemen, Tanggal pengajuan & target
- **Detail Item** — daftar SKU + qty + harga, dengan peringatan stok kurang per item
- **Catatan justifikasi**
- **Estimasi Anggaran**
- 2 tombol aksi: **Setujui (Approve)** / **Tolak (Reject)**

#### B. **Arsip PR** (`PrArchiveTable`) — Tabel putih
Tampilan semua PR (semua status) dengan badge warna sesuai status:
- 🔘 `Draft` — abu — punya aksi **Submit PR** & **Hapus**
- 🟦 `Submitted` — indigo — menunggu approval
- 🟢 `Approved` — emerald — label "📥 Siap Beli (PO)"
- 🔴 `Rejected` — rose — tertolak

**Tombol "Ajukan Permintaan (PR) Baru"** membuka modal multi-item (`PrFormModal`):
- Pilih departemen (5 opsi)
- Pilih target tanggal terima
- Tulis justifikasi
- Tambah baris item (SKU dropdown + qty)
- Sub-estimasi & total estimasi real-time
- Warning otomatis jika SKU yang dipilih stoknya kritis
- 2 mode simpan: **Draft** atau **Submitted** langsung

**Aksi yang dipanggil:**
- `addPr(form, 'Draft' | 'Submitted')` — POST `/api/purchase-requisitions`
- `updatePrStatus(prId, status)` — PUT `/api/purchase-requisitions/:id/status`
- `deletePr(prId)` — DELETE `/api/purchase-requisitions/:id` (hanya untuk Draft, ada konfirmasi)

### 7.3 Tab "Daftar Vendor" (`VendorPage`)

- Grid kartu vendor (3 kolom desktop).
- Tiap kartu menampilkan: kode, nama, alamat, PIC, email, **jumlah SKU yang dipasok**.
- Modal "Daftarkan Vendor Baru" — form dengan auto-prefix `VND-<KODE>`.

**Aksi:** `addVendor(form)` — POST `/api/vendors`

### 7.4 Tab "Blueprint & Dokumen" (`DocsPage`)

Render `documentationData[]` dari `src/documentation.ts` (10 section: Executive Summary, Business Process, Module Breakdown, ERD, DDL SQL PostgreSQL lengkap, REST API design, UI structure, RBAC matrix, Status Workflow, Future Roadmap). Ada tombol **Salin Kode** untuk DDL SQL.

---

## 8. Business Process End-to-End

Ini adalah **alur procurement lengkap rumah sakit** sesuai SOP industri (sebagian disimulasikan di UI, sebagian didokumentasikan untuk roadmap):

### Tahap 1 — Perencanaan & Reorder Point
- Apotek/Logistik memantau master SKU.
- Sistem otomatis menandai SKU yang `current_stock < minimum_stock` sebagai **kritis** (badge merah, ikon `AlertTriangle`).
- Indikator ini muncul juga di **header counter "Kritis"** & **badge tab "1. SKU Master"**.

### Tahap 2 — Pengajuan PR (Purchase Requisition)
- Requester (mis. Supervisor IGD) membuka tab PR, klik **"Ajukan Permintaan Baru"**.
- Isi: departemen, target tanggal, justifikasi, daftar SKU + qty.
- Sistem menghitung **`total_amount`** otomatis dari `estimated_price × qty` per item.
- Sistem generate `pr_number` otomatis: `PR/YYYYMM/<DEPT_CODE>-<NN>`.
- Pilihan simpan:
  - **Draft** — tersimpan, bisa di-edit/dihapus, belum mengonsumsi alur approval.
  - **Submitted** — masuk ke inbox Manager.

> **Konseptual (belum di UI):** validasi `total_amount ≤ remaining_allocated` per cost center; jika overspend → blok pengajuan.

### Tahap 3 — Approval Berjenjang (RBAC)
Saat ini di UI: **flat approval** — siapa saja (sebagai Manager) bisa klik Approve/Reject. Secara konseptual SOP-nya:

| Nominal PR | Approver yang dibutuhkan |
| --- | --- |
| < Rp 10 Juta | Department Head (cukup Lv 1) |
| Rp 10 – 100 Juta | Department Head + Procurement Reviewer + Finance VP |
| > Rp 100 Juta | + Direktur Utama |

Aksi di UI:
- **Approve** → status berubah ke `Approved`, badge hijau, label "📥 Siap Beli (PO)".
- **Reject** → status berubah ke `Rejected`.

### Tahap 4 — Tinjauan Procurement & Penerbitan PO
> *Konseptual / Roadmap*

- PR yang `Approved` ditinjau staff Procurement.
- Staff bisa **split** satu PR ke beberapa PO (per vendor) atau **merge** banyak PR menjadi satu PO.
- PO diterbitkan ke vendor eksternal (dummy data sudah ada di `initialPOs`).
- Status PO mengikuti enum: `Draft → Sent_to_Vendor → Vendor_Confirmed → Partially_Received → Fully_Received → Closed`.

### Tahap 5 — Goods Receipt Note (GRN)
> *Konseptual / Roadmap*

- Staf gudang menerima fisik barang dari vendor.
- Wajib mencatat:
  - **Batch number + Expiry date** untuk Obat / Vaksin / BMHP konsumsi.
  - **Serial number** untuk Alkes/Aset bernilai tinggi.
- Status GRN: `Completed | Pending_Verification | Discrepancy`.
- Jika qty diterima < qty PO → flag **Discrepancy** & catat alasan.

### Tahap 6 — Rekonsiliasi 3-Way Matching (Finance/AP)
> *Konseptual / Roadmap*

- Sistem matching otomatis 3 dokumen: **PO ↔ GRN ↔ Invoice Supplier**.
- `matching_score` mengevaluasi 3 hal:
  - `po_match` — invoice merujuk PO yang sah
  - `grn_match` — qty invoice ≤ qty GRN
  - `price_match` — harga invoice = harga PO
- Jika semua match → status **Approved_For_Payment**, dijadwalkan dibayar sesuai `payment_term_days`.
- Jika beda → **Discrepancy_Hold** → eskalasi ke buyer untuk dispute.

### Tahap 7 — Audit Trail
- Setiap mutasi penting dicatat di `audit_logs` (di UI saat ini disimulasikan via `ApiLogConsole`).
- Field yang ditangkap: `timestamp, user_role, actor, module, action_type, entity_id, description`.

---

## 9. Diagram Alur Status Dokumen

### 9.1 Lifecycle Purchase Requisition (PR)

```
   ┌───────┐    submit     ┌───────────┐    approve     ┌───────────┐
   │ Draft │ ────────────► │ Submitted │ ─────────────► │ Approved  │
   └───┬───┘                └─────┬─────┘                └─────┬─────┘
       │                          │                            │ convert_to_PO
       │ delete                   │ reject                     ▼
       ▼                          ▼                       ┌──────────────────┐
   (removed)                  ┌──────────┐                │ Converted_to_PO  │
                              │ Rejected │                └──────────────────┘
                              └──────────┘
```

### 9.2 Lifecycle Purchase Order (PO) — *Konseptual*

```
Draft → Sent_to_Vendor → Vendor_Confirmed → Partially_Received → Fully_Received → Closed
                                       │
                                       └─→ Cancelled (anytime)
```

### 9.3 Lifecycle Invoice — *Konseptual*

```
Pending_Match → Verified_Matched → Approved_For_Payment → Paid
            │
            └→ Discrepancy_Hold → Disputed
```

---

## 10. State Management & Persistensi

### Single Source of Truth
`ProcurementProvider` di `src/context/ProcurementContext.tsx` adalah satu-satunya pemilik state global. Komponen anak mengakses via:

```tsx
const { skus, vendors, prs, addSku, updatePrStatus } = useProcurement();
```

### `usePersistentState<T>`
Hook tipis (wrapper `useState`) yang:
1. Pada mount: baca `localStorage.getItem(key)` → parse JSON → jadi initial value (fallback ke `initialValue` jika kosong / parse gagal).
2. Setiap perubahan state: `localStorage.setItem(key, JSON.stringify(value))`.

3 entity persist dengan storage key:

| Key | Isi |
| --- | --- |
| `rs_procure_vendors` | Array `Vendor[]` |
| `rs_procure_skus` | Array `SKU[]` |
| `rs_procure_prs` | Array `PurchaseRequisition[]` |

> **Cara reset data:** Buka DevTools → Application → Local Storage → hapus 3 key di atas → refresh.

### Derived State (Memo)
`criticalStockCount` & `pendingPrCount` di-`useMemo` agar tidak recompute jika array sumber tidak berubah.

---

## 11. Simulasi API & Audit Log

### `useApiLogs` Hook
- Menyimpan max **5 log terakhir** (`MAX_API_LOGS`).
- Setiap business action di context memanggil `addLog(method, endpoint, payload, response)`.
- Render-nya ada di `ApiLogConsole` (sidebar kiri bawah) bergaya terminal hitam + animasi titik hijau berdenyut.

### Endpoint yang Disimulasikan

| Action | Method | Endpoint | Payload |
| --- | --- | --- | --- |
| Tambah SKU | POST | `/api/skus` | full form SKU |
| Toggle status SKU | PATCH | `/api/skus/:id/status` | `{ status }` |
| Tambah Vendor | POST | `/api/vendors` | full form vendor |
| Buat PR (Draft/Submit) | POST | `/api/purchase-requisitions` | form + status |
| Ubah Status PR | PUT | `/api/purchase-requisitions/:id/status` | `{ status }` |
| Hapus PR | DELETE | `/api/purchase-requisitions/:id` | `null` |

Method-method ini sengaja dibuat **REST-style** untuk memudahkan migrasi ke backend nyata (Express / Laravel / NestJS) di masa depan — tinggal swap implementasi di context dengan `fetch()`.

---

## 12. Konvensi UI/UX

### Palette
- **Brand Primary:** Teal-600 (`#0d9488`) → emerald-400.
- **Background:** Slate-50 (terang) / Slate-900 (dark panels).
- **Critical / Warning:** Rose-700, Amber-400.
- **Success:** Emerald-600.
- **Info:** Indigo-600.

### Tipografi
- Sans: **Inter** (UI).
- Mono: **JetBrains Mono** (kode SKU, harga, log).

### Pola Komponen
- **Header card:** `bg-white rounded-xl shadow-sm border border-slate-200`
- **Modal:** komponen reusable `<Modal>` dengan header gelap dan tombol tutup `✕`.
- **Status badge:** pill `rounded-full text-[10px] font-bold` dengan kombinasi warna `bg-*-50 text-*-700 border-*-200`.
- **Tombol primer:** `bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg`.

### Keyboard / Accessibility
- Semua form punya `<label>` eksplisit.
- Tombol `type="button"` dipakai di modal untuk mencegah submit tak sengaja.
- Modal pakai `backdrop-blur-xs` + overlay opaque.

---

## 13. Cara Menjalankan

**Prasyarat:** Node.js ≥ 18.

```bash
# 1. Install dependencies
npm install

# 2. (Opsional) set API key Gemini di .env.local
echo "GEMINI_API_KEY=your_key_here" > .env.local

# 3. Jalankan dev server
npm run dev
# ⇒ http://localhost:3000

# 4. Lint type-check
npm run lint

# 5. Build produksi
npm run build
```

Karena data tersimpan di `localStorage`, **state akan persisten** antar refresh — bagus untuk demo & QA.

---

## 14. Rencana Pengembangan Berikutnya

Sesuai blueprint di tab Docs, modul-modul berikut tinggal mengikuti pola yang sama (`<Module>Page` + `<Module>FormModal` + actions di `ProcurementContext`):

1. **PO Release Center** — convert PR `Approved` → PO ke vendor, split/merge PR.
2. **GRN Receiving Station** — input penerimaan + batch/expiry/serial.
3. **3-Way Matching Auditor** — panel verifikasi PO vs GRN vs Invoice.
4. **Budget Cost Center Dashboard** — visualisasi utilisasi anggaran per departemen.
5. **Audit Log Persistent View** — listing AuditLog (sekarang baru in-memory).
6. **RBAC & Auth** — login + role-based menu visibility.
7. **Backend Integration** — ganti `useApiLogs` log menjadi real `fetch()` ke API REST (kontrak endpoint sudah didokumentasikan).
8. **Notifikasi & Email** — saat PR Submitted/Approved/Rejected.
9. **Export Excel/PDF** untuk arsip PR & laporan audit.

---

> **Catatan untuk developer:** Setelah refactor, total LOC `App.tsx` turun dari ±1.515 → ~50 baris. Logika tersebar ke ~22 file kecil yang fokus per domain. Tambahkan unit test di setiap action context (`addPr`, `addSku`, dll) untuk meningkatkan keandalan menuju versi produksi.
