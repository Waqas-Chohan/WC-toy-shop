export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number;
  stock_quantity: number;
  images: string[];
  category_id: string;
  category_name?: string;
  rating?: number;
  reviews_count?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  total: number;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'customer' | 'admin';
  created_at: string;
}
