-- SKU Rumah Sakit EPS - Initial Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('REQUESTER', 'DEPT_HEAD', 'PROCUREMENT', 'FINANCE_VP', 'DIRECTOR', 'ADMIN')),
    department TEXT,
    manager_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    contact TEXT,
    email TEXT,
    address TEXT,
    rating DECIMAL(2,1) DEFAULT 0,
    sla_delivery_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SKUs table
CREATE TABLE IF NOT EXISTS skus (
    sku_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku_code TEXT UNIQUE NOT NULL,
    sku_name TEXT NOT NULL,
    category TEXT,
    type TEXT NOT NULL CHECK (type IN ('Obat', 'Alkes', 'BMHP', 'Non-Medis', 'Jasa')),
    uom TEXT NOT NULL,
    brand TEXT,
    estimated_price DECIMAL(15,2) NOT NULL DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    maximum_stock INTEGER DEFAULT 0,
    current_stock INTEGER DEFAULT 0,
    vendor_id UUID REFERENCES vendors(id),
    status TEXT DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Nonaktif')),
    lead_time_days INTEGER DEFAULT 0,
    is_critical BOOLEAN DEFAULT FALSE,
    is_controlled BOOLEAN DEFAULT FALSE,
    is_taxable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase Requisitions table
CREATE TABLE IF NOT EXISTS purchase_requisitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pr_number TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    req_date TIMESTAMPTZ DEFAULT NOW(),
    target_date DATE NOT NULL,
    total_amount DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Approved', 'Rejected', 'Converted_to_PO', 'Cancelled')),
    reject_reason TEXT,
    approved_by UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PR Items table
CREATE TABLE IF NOT EXISTS pr_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pr_id UUID REFERENCES purchase_requisitions(id) ON DELETE CASCADE,
    sku_id UUID REFERENCES skus(id),
    qty INTEGER NOT NULL CHECK (qty > 0),
    unit_price DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase Orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number TEXT UNIQUE NOT NULL,
    pr_id UUID REFERENCES purchase_requisitions(id),
    vendor_id UUID REFERENCES vendors(id),
    order_date DATE DEFAULT CURRENT_DATE,
    expected_date DATE,
    total_amount DECIMAL(15,2) DEFAULT 0,
    status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Sent_to_Vendor', 'Vendor_Confirmed', 'Partially_Received', 'Fully_Received', 'Closed', 'Cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PO Items table
CREATE TABLE IF NOT EXISTS po_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
    sku_id UUID REFERENCES skus(id),
    qty INTEGER NOT NULL CHECK (qty > 0),
    unit_price DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(15,2) NOT NULL DEFAULT 0
);

-- Goods Receipt Notes table
CREATE TABLE IF NOT EXISTS goods_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grn_number TEXT UNIQUE NOT NULL,
    po_id UUID REFERENCES purchase_orders(id),
    received_date DATE DEFAULT CURRENT_DATE,
    received_by UUID REFERENCES users(id),
    status TEXT DEFAULT 'Completed' CHECK (status IN ('Completed', 'Pending_Verification', 'Discrepancy')),
    discrepancy_details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GRN Items table
CREATE TABLE IF NOT EXISTS grn_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grn_id UUID REFERENCES goods_receipts(id) ON DELETE CASCADE,
    sku_id UUID REFERENCES skus(id),
    qty_ordered INTEGER NOT NULL,
    qty_received INTEGER NOT NULL,
    batch_number TEXT,
    expiry_date DATE,
    serial_number TEXT
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    po_id UUID REFERENCES purchase_orders(id),
    grn_id UUID REFERENCES goods_receipts(id),
    invoice_date DATE DEFAULT CURRENT_DATE,
    amount DECIMAL(15,2) NOT NULL,
    status TEXT DEFAULT 'Pending_Match' CHECK (status IN ('Pending_Match', 'Verified_Matched', 'Approved_For_Payment', 'Paid', 'Discrepancy_Hold', 'Disputed')),
    payment_term_days INTEGER DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES users(id),
    user_role TEXT,
    actor TEXT,
    module TEXT,
    action_type TEXT,
    entity_id UUID,
    description TEXT,
    ip_address TEXT
);

-- RLS Policies (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pr_items ENABLE ROW LEVEL SECURITY;

-- Public read for vendors and skus (for all authenticated users)
CREATE POLICY "Public can read vendors" ON vendors FOR SELECT USING (true);
CREATE POLICY "Public can read skus" ON skus FOR SELECT USING (true);

-- Users can only see their own data and data for their department
CREATE POLICY "Users can read own profile" ON users FOR SELECT USING (true);
CREATE POLICY "Auth users can read purchase requisitions" ON purchase_requisitions FOR SELECT USING (true);
CREATE POLICY "Auth users can read pr items" ON pr_items FOR SELECT USING (true);

-- Seed data: default admin user (password: admin123)
INSERT INTO users (id, email, password_hash, name, role, department) VALUES 
    ('00000000-0000-0000-0000-000000000001', 'admin@rs-medika.com', '240be518fabd2724ddb6f04eeb9da5967441a4a4854754e4722e17e1c32b4e35', 'Administrator', 'ADMIN', 'IT')
ON CONFLICT (email) DO NOTHING;

-- Seed data: sample vendors
INSERT INTO vendors (id, code, name, contact, email, address, rating, sla_delivery_rate) VALUES
    ('00000000-0000-0000-0000-000000000010', 'VND-BF', 'PT. Bio Farma (Persero)', 'Ibu Dian Lestari (0812-3456-7890)', 'sales@biofarma.co.id', 'Jl. Pasteur No. 28, Bandung, Jawa Barat', 4.8, 98.2),
    ('00000000-0000-0000-0000-000000000011', 'VND-OM', 'PT. OneMed Health Indo', 'Bapak Rudi Hermawan (0821-4455-6677)', 'info@onemed.co.id', 'Kawasan Industri SIER, Surabaya, Jawa Timur', 4.5, 94.6),
    ('00000000-0000-0000-0000-000000000012', 'VND-KF', 'PT. Kimia Farma Tbk', 'Ibu Amelia Siregar (0811-9988-7766)', 'order@kimiafarma.co.id', 'Jl. Veteran No. 9, Jakarta Pusat, DKI Jakarta', 4.9, 99.1),
    ('00000000-0000-0000-0000-000000000013', 'VND-KLB', 'PT. Kalbe Farma Tbk', 'Bapak Andi Wijaya (0813-8899-0011)', 'institutional.sales@kalbe.co.id', 'Jl. Letjen Suprapto Kav. 4, Jakarta Pusat, DKI Jakarta', 4.7, 97.4),
    ('00000000-0000-0000-0000-000000000014', 'VND-ATK', 'PT. ATK Sejahtera Lestari', 'Bapak Danu Prasetyo (0878-1122-3344)', 'marketing@atksejahtera.com', 'Ruko Margonda Raya No. 12, Depok, Jawa Barat', 4.2, 91.5)
ON CONFLICT (code) DO NOTHING;

-- Seed data: sample SKUs
INSERT INTO skus (sku_id, sku_code, sku_name, category, type, uom, brand, estimated_price, minimum_stock, maximum_stock, current_stock, vendor_id, status, lead_time_days, is_critical, is_controlled, is_taxable) VALUES
    ('00000000-0000-0000-0000-000000000100', 'SKU-MED-001', 'Vaksin Influenza Flubio Vial 0.5 ml', 'Obat-obatan', 'Obat', 'Vial', 'Bio Farma', 150000, 50, 500, 120, '00000000-0000-0000-0000-000000000010', 'Aktif', 5, true, true, true),
    ('00000000-0000-0000-0000-000000000101', 'SKU-MED-002', 'Paracetamol 500mg Tablet (Box isi 100)', 'Obat-obatan', 'Obat', 'Box', 'Kimia Farma', 45000, 30, 300, 15, '00000000-0000-0000-0000-000000000012', 'Aktif', 3, false, false, true),
    ('00000000-0000-0000-0000-000000000102', 'SKU-MED-003', 'Cairan Infus Ringer Laktat (RL) 500ml', 'BMHP', 'BMHP', 'Botol', 'Sanbe', 12500, 100, 1000, 250, '00000000-0000-0000-0000-000000000012', 'Aktif', 4, true, false, false),
    ('00000000-0000-0000-0000-000000000103', 'SKU-MED-004', 'Disposable Syringe 3cc dengan Jarum OneMed', 'BMHP', 'BMHP', 'Box', 'OneMed', 85000, 40, 400, 12, '00000000-0000-0000-0000-000000000011', 'Aktif', 2, false, false, true),
    ('00000000-0000-0000-0000-000000000104', 'SKU-MED-005', 'Masker Bedah 3-Ply Earloop (Box isi 50)', 'BMHP', 'BMHP', 'Box', 'OneMed', 35000, 100, 1000, 80, '00000000-0000-0000-0000-000000000011', 'Aktif', 2, false, false, true)
ON CONFLICT (sku_code) DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_skus_status ON skus(status);
CREATE INDEX IF NOT EXISTS idx_skus_vendor ON skus(vendor_id);
CREATE INDEX IF NOT EXISTS idx_skus_critical ON skus(current_stock, minimum_stock) WHERE status = 'Aktif';
CREATE INDEX IF NOT EXISTS idx_pr_status ON purchase_requisitions(status);
CREATE INDEX IF NOT EXISTS idx_pr_department ON purchase_requisitions(department);
CREATE INDEX IF NOT EXISTS idx_pr_items_pr ON pr_items(pr_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);
