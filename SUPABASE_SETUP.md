# Toy Shop Pro - Supabase Setup

## ⚠️ CRITICAL: Run this SQL in your Supabase SQL Editor

The `products` table in your Supabase database is **missing the `slug` column**. This causes:
1. Admin dashboard orders section to fail (`column products_2.slug does not exist`)
2. Adding new products to fail (`Could not find the 'slug' column of 'products'`)

### Fix: Run this SQL

Open your Supabase dashboard → SQL Editor → Paste and run:

```sql
-- Add slug column to products if missing
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Generate slugs for existing products that don't have one
UPDATE products 
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-z0-9]+', '-', 'g'))
WHERE slug IS NULL;
```

## Code Changes Already Applied

The following fixes have been made to the source code:

### 1. `app/api/orders/route.ts`
- **Problem**: Used `user:user_id(id,name,email)` join which failed because `orders.user_id` references `auth.users` (not `user_profiles`)
- **Fix**: Separated into two queries - fetch orders, then fetch user profiles manually
- Also removed `slug` from `product:product_id(id,name,price,images)` since the column is missing

### 2. `app/api/products/route.ts`
- **Problem**: Tried to insert a `slug` column that doesn't exist in the database
- **Fix**: Removed `slug` from the insert payload

### 3. `app/globals.css`
- **Problem**: Imported non-existent `shadcn/tailwind.css`
- **Fix**: Removed the invalid import

## Required Steps

1. ✅ Run the SQL migration above in Supabase SQL Editor
2. ✅ Refresh your browser - the website should work fully