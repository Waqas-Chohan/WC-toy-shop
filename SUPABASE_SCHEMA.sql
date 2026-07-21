-- Database Schema for ToyShop Pro
-- Run this in your Supabase SQL Editor

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  images TEXT[], -- Array of image URLs
  category TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Slider/Carousel Table
CREATE TABLE IF NOT EXISTS sliders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image TEXT NOT NULL,
  badge TEXT,
  cta_text TEXT,
  cta_link TEXT,
  display_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Users Table (extends auth)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_number BIGSERIAL UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer', -- 'customer' or 'admin'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'prepared', 'dispatched', 'delivered', 'cancelled'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sliders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Products (public read, admin write)
CREATE POLICY "products_read_public" ON products FOR SELECT USING (true);
CREATE POLICY "products_insert_admin" ON products FOR INSERT WITH CHECK (
  (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
);
CREATE POLICY "products_update_admin" ON products FOR UPDATE USING (
  (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
);
CREATE POLICY "products_delete_admin" ON products FOR DELETE USING (
  (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
);

-- RLS Policies for Sliders (public read, admin write)
CREATE POLICY "sliders_read_public" ON sliders FOR SELECT USING (true);
CREATE POLICY "sliders_insert_admin" ON sliders FOR INSERT WITH CHECK (
  (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
);
CREATE POLICY "sliders_update_admin" ON sliders FOR UPDATE USING (
  (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
);
CREATE POLICY "sliders_delete_admin" ON sliders FOR DELETE USING (
  (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
);

-- RLS Policies for User Profiles
CREATE POLICY "user_profiles_read_own" ON user_profiles FOR SELECT USING (
  auth.uid() = id OR (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
);
CREATE POLICY "user_profiles_update_own" ON user_profiles FOR UPDATE USING (
  auth.uid() = id
);

-- RLS Policies for Cart (user specific + admin read)
CREATE POLICY "cart_read_own" ON cart_items FOR SELECT USING (
  auth.uid() = user_id OR (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
);
CREATE POLICY "cart_insert_own" ON cart_items FOR INSERT WITH CHECK (
  auth.uid() = user_id
);
CREATE POLICY "cart_update_own" ON cart_items FOR UPDATE USING (
  auth.uid() = user_id
);
CREATE POLICY "cart_delete_own" ON cart_items FOR DELETE USING (
  auth.uid() = user_id
);

-- RLS Policies for Wishlist (user specific + admin read)
CREATE POLICY "wishlist_read_own" ON wishlist FOR SELECT USING (
  auth.uid() = user_id OR (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
);
CREATE POLICY "wishlist_insert_own" ON wishlist FOR INSERT WITH CHECK (
  auth.uid() = user_id
);
CREATE POLICY "wishlist_delete_own" ON wishlist FOR DELETE USING (
  auth.uid() = user_id
);

-- RLS Policies for Orders (user specific + admin)
CREATE POLICY "orders_read_own" ON orders FOR SELECT USING (
  auth.uid() = user_id OR (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
);

-- Insert sample data
INSERT INTO products (name, slug, description, price, discount_percent, stock_quantity, category, images) VALUES
  ('Premium Robot Toy', 'premium-robot-toy', 'Advanced interactive robot with LED lights', 49.99, 10, 50, 'Robots', ARRAY['https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&h=500&fit=crop']),
  ('Building Blocks Set', 'building-blocks-set', 'Creative construction set for kids', 29.99, 5, 100, 'Building', ARRAY['https://images.unsplash.com/photo-1532737475122-5e9c4c12b9d5?w=500&h=500&fit=crop']),
  ('Action Figure Hero', 'action-figure-hero', 'Collectible action figure with accessories', 19.99, 0, 75, 'Figures', ARRAY['https://images.unsplash.com/photo-1616314049395-033edfde40bb?w=500&h=500&fit=crop']),
  ('Electric RC Car', 'electric-rc-car', 'High-speed remote control car with battery', 59.99, 15, 40, 'Remote Control', ARRAY['https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&h=500&fit=crop']),
  ('Puzzle Game Plus', 'puzzle-game-plus', 'Brain teaser puzzle set for all ages', 24.99, 8, 60, 'Puzzles', ARRAY['https://images.unsplash.com/photo-1579381841314-f59012e225e7?w=500&h=500&fit=crop'])
ON CONFLICT DO NOTHING;

INSERT INTO sliders (title, subtitle, image, badge, cta_text, cta_link, display_order, is_active) VALUES
  ('Summer Collection 2024', 'Get up to 40% off on selected items', 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=1200&h=500&fit=crop', 'Limited Time', 'Shop Now', '/products', 1, true),
  ('New Arrivals', 'Check out the latest toys this season', 'https://images.unsplash.com/photo-1532737475122-5e9c4c12b9d5?w=1200&h=500&fit=crop', 'New', 'Explore', '/products', 2, true)
ON CONFLICT DO NOTHING;