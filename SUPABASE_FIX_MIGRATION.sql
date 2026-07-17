-- Migration: Fix existing order statuses to match the new schema
-- Run this in your Supabase SQL Editor

-- 1. Add slug column to products if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- 2. Generate slugs for existing products that don't have one
UPDATE products 
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- 3. Fix existing order statuses: map 'completed' → 'delivered', 'cancelled' stays
-- This ensures any orders created with the old schema statuses show up correctly
UPDATE orders SET status = 'delivered' WHERE status = 'completed';
UPDATE orders SET status = 'pending' WHERE status NOT IN ('pending', 'prepared', 'dispatched', 'delivered', 'cancelled');

-- 4. Fix RLS for cart_items to allow admin read (in case not updated)
DROP POLICY IF EXISTS "cart_read_own" ON cart_items;
CREATE POLICY "cart_read_own" ON cart_items FOR SELECT USING (
  auth.uid() = user_id OR (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
);

-- 5. Fix RLS for wishlist to allow admin read
DROP POLICY IF EXISTS "wishlist_read_own" ON wishlist;
CREATE POLICY "wishlist_read_own" ON wishlist FOR SELECT USING (
  auth.uid() = user_id OR (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
);

-- 6. Fix RLS for user_profiles to allow admin read all profiles
DROP POLICY IF EXISTS "user_profiles_read_own" ON user_profiles;
CREATE POLICY "user_profiles_read_own" ON user_profiles FOR SELECT USING (
  auth.uid() = id OR (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
);