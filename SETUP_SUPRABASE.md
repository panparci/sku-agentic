# Supabase Schema Setup - SKU Rumah Sakit

## Steps

### 1. Create Supabase Project
- Go to https://app.supabase.com
- Create new project: `sku-rumahsakit`
- Save database password

### 2. Get API Keys
- Settings → API
- Copy: Project URL, anon_key, service_role_key

### 3. Run Migration
Open SQL Editor in Supabase Dashboard and run:

```sql
-- (paste contents of migrations/001_init_schema.sql)
```

### 4. Verify Tables Created
Check in Table Editor:
- [ ] users
- [ ] vendors
- [ ] skus
- [ ] purchase_requisitions
- [ ] pr_items
- [ ] purchase_orders
- [ ] po_items
- [ ] goods_receipts
- [ ] grn_items
- [ ] invoices
- [ ] audit_logs

### 5. Test Login
```bash
curl -X POST https://your-project.supabase.co/functions/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rs-medika.com","password":"admin123"}'
```

Expected: JWT token returned

### 6. Update .env with Real Keys
Update `server/.env` with actual Supabase credentials before deploy.

## Credentials Needed

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```
