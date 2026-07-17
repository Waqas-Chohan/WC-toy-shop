import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Product } from '@/types';

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  badge: string;
  cta: string;
  display_order?: number;
}

interface ProductState {
  products: Product[];
  slides: HeroSlide[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  fetchSlides: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'slug' | 'rating' | 'reviews_count'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addSlide: (slide: Omit<HeroSlide, 'id'>) => Promise<void>;
  updateSlide: (id: string, slide: Partial<HeroSlide>) => Promise<void>;
  deleteSlide: (id: string) => Promise<void>;
}

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const getCurrentUser = () => useAuthStore.getState().user;

export const useProductStore = create<ProductState>()((set, get) => ({
  products: [],
  slides: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedProducts: Product[] = (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        compare_at_price: p.discount_percent
          ? Number((p.price / (1 - p.discount_percent / 100)).toFixed(2))
          : undefined,
        stock_quantity: p.stock_quantity,
        images: p.images || [],
        category_id: p.category || 'general',
        category_name: p.category,
        rating: p.rating || 4.5,
        reviews_count: p.reviews_count || 0,
        slug: p.slug || generateSlug(p.name),
        discount_percent: p.discount_percent,
      }));

      set({ products: mappedProducts, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      console.error('Error fetching products:', err);
    }
  },

  fetchSlides: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('sliders')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      const mappedSlides: HeroSlide[] = (data || []).map((s) => ({
        id: s.id,
        title: s.title,
        subtitle: s.subtitle,
        image: s.image,
        badge: s.badge,
        cta: s.cta_text,
        display_order: s.display_order,
      }));

      set({ slides: mappedSlides, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      console.error('Error fetching slides:', err);
    }
  },

  addProduct: async (product) => {
    const user = getCurrentUser();
    if (!user) {
      const error = new Error('Please sign in to add a product');
      set({ error: error.message });
      throw error;
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email,
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          ...product,
          category: product.category_name,
          images: product.images,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add product');
      }

      await get().fetchProducts();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  updateProduct: async (id, updates) => {
    const user = getCurrentUser();
    if (!user) {
      const error = new Error('Please sign in to update a product');
      set({ error: error.message });
      throw error;
    }

    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email,
          'x-user-id': user.id,
        },
        body: JSON.stringify({ id, ...updates, category: updates.category_name }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update product');
      }

      await get().fetchProducts();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteProduct: async (id) => {
    const user = getCurrentUser();
    if (!user) {
      const error = new Error('Please sign in to delete a product');
      set({ error: error.message });
      throw error;
    }

    try {
      const response = await fetch(`/api/products?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'x-user-email': user.email,
          'x-user-id': user.id,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete product');
      }

      await get().fetchProducts();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  addSlide: async (slide) => {
    const user = getCurrentUser();
    if (!user) {
      const error = new Error('Please sign in to add a slide');
      set({ error: error.message });
      throw error;
    }

    try {
      const response = await fetch('/api/sliders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email,
          'x-user-id': user.id,
        },
        body: JSON.stringify(slide),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add slide');
      }

      await get().fetchSlides();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  updateSlide: async (id, updates) => {
    const user = getCurrentUser();
    if (!user) {
      const error = new Error('Please sign in to update a slide');
      set({ error: error.message });
      throw error;
    }

    try {
      const response = await fetch('/api/sliders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email,
          'x-user-id': user.id,
        },
        body: JSON.stringify({ id, ...updates }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update slide');
      }

      await get().fetchSlides();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteSlide: async (id) => {
    const user = getCurrentUser();
    if (!user) {
      const error = new Error('Please sign in to delete a slide');
      set({ error: error.message });
      throw error;
    }

    try {
      const response = await fetch(`/api/sliders?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'x-user-email': user.email,
          'x-user-id': user.id,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete slide');
      }

      await get().fetchSlides();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },
}));
