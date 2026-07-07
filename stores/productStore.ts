import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  badge: string;
  cta: string;
}

interface ProductState {
  products: Product[];
  slides: HeroSlide[];
  addProduct: (product: Omit<Product, 'id' | 'slug' | 'rating' | 'reviews_count'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addSlide: (slide: Omit<HeroSlide, 'id'>) => void;
  updateSlide: (id: string, slide: Partial<HeroSlide>) => void;
  deleteSlide: (id: string) => void;
}

const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'Classic Wooden Blocks',
    slug: 'classic-wooden-blocks',
    description: 'Colorful wooden building blocks for creative play. Perfect for developing motor skills and imagination in young children.',
    price: 24.99,
    compare_at_price: 34.99,
    stock_quantity: 50,
    images: ['https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&h=500&fit=crop'],
    category_id: 'building',
    category_name: 'Building Toys',
    rating: 4.8,
    reviews_count: 120,
  },
  {
    id: '2',
    name: 'Remote Control Car',
    slug: 'remote-control-car',
    description: 'High-speed RC car with impressive handling and responsive controls. Great for outdoor play and racing.',
    price: 49.99,
    stock_quantity: 30,
    images: ['https://images.unsplash.com/photo-1532737475122-5e9c4c12b9d5?w=500&h=500&fit=crop'],
    category_id: 'rc',
    category_name: 'RC Toys',
    rating: 4.6,
    reviews_count: 89,
  },
  {
    id: '3',
    name: 'Puzzle Master 1000',
    slug: 'puzzle-master-1000',
    description: 'Challenging 1000-piece puzzle with beautiful artwork. Perfect for family time and mental stimulation.',
    price: 19.99,
    compare_at_price: 29.99,
    stock_quantity: 100,
    images: ['https://images.unsplash.com/photo-1616314049395-033edfde40bb?w=500&h=500&fit=crop'],
    category_id: 'puzzles',
    category_name: 'Puzzles',
    rating: 4.9,
    reviews_count: 200,
  },
  {
    id: '4',
    name: 'Action Figure Set',
    slug: 'action-figure-set',
    description: 'Set of 5 collectible figures. Highly detailed and fully poseable for hours of active fun.',
    price: 39.99,
    stock_quantity: 45,
    images: ['https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&h=500&fit=crop'],
    category_id: 'figures',
    category_name: 'Action Figures',
    rating: 4.7,
    reviews_count: 156,
  },
  {
    id: '5',
    name: 'Drone with Camera',
    slug: 'drone-with-camera',
    description: 'Beginner-friendly drone with a built-in camera, altitude hold, and headless mode for simple flying.',
    price: 79.99,
    compare_at_price: 99.99,
    stock_quantity: 20,
    images: ['https://images.unsplash.com/photo-1579381841314-f59012e225e7?w=500&h=500&fit=crop'],
    category_id: 'drones',
    category_name: 'Drones',
    rating: 4.5,
    reviews_count: 145,
  },
  {
    id: '6',
    name: 'Board Game Collection',
    slug: 'board-game-collection',
    description: 'Pack of 3 classic board games to bring family and friends together for a fun game night.',
    price: 34.99,
    stock_quantity: 60,
    images: ['https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&h=500&fit=crop'],
    category_id: 'games',
    category_name: 'Games',
    rating: 4.8,
    reviews_count: 178,
  },
];

const defaultSlides: HeroSlide[] = [
  {
    id: '1',
    title: 'Experience the Future',
    subtitle: 'Discover cutting-edge toys designed for tomorrow',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=1200&h=500&fit=crop',
    badge: 'NEW COLLECTION',
    cta: 'Explore Now',
  },
  {
    id: '2',
    title: 'Premium Quality',
    subtitle: 'Handpicked toys for every age and interest',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200&h=500&fit=crop',
    badge: 'BESTSELLERS',
    cta: 'Shop Collection',
  },
  {
    id: '3',
    title: 'Smart Play',
    subtitle: 'Tech-enabled toys for modern kids',
    image: 'https://images.unsplash.com/photo-1532737475122-5e9c4c12b9d5?w=1200&h=500&fit=crop',
    badge: 'TECH TOYS',
    cta: 'View Catalog',
  },
  {
    id: '4',
    title: 'Creative Fun',
    subtitle: 'Inspire imagination with our curated selection',
    image: 'https://images.unsplash.com/photo-1616314049395-033edfde40bb?w=1200&h=500&fit=crop',
    badge: 'CREATIVE',
    cta: 'Discover More',
  },
];

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

export const useProductStore = create<ProductState>()(
  persist(
    (set) => ({
      products: defaultProducts,
      slides: defaultSlides,

      addProduct: (newProd) => set((state) => {
        const id = (Math.max(...state.products.map(p => parseInt(p.id) || 0), 0) + 1).toString();
        const slug = generateSlug(newProd.name);
        const product: Product = {
          ...newProd,
          id,
          slug,
          rating: 5.0,
          reviews_count: 0,
        };
        return { products: [...state.products, product] };
      }),

      updateProduct: (id, updatedFields) => set((state) => {
        const products = state.products.map((p) => {
          if (p.id === id) {
            const name = updatedFields.name ?? p.name;
            const slug = updatedFields.name ? generateSlug(updatedFields.name) : p.slug;
            return {
              ...p,
              ...updatedFields,
              slug,
            };
          }
          return p;
        });
        return { products };
      }),

      deleteProduct: (id) => set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      })),

      addSlide: (newSlide) => set((state) => {
        const id = (Math.max(...state.slides.map(s => parseInt(s.id) || 0), 0) + 1).toString();
        const slide: HeroSlide = {
          ...newSlide,
          id,
        };
        return { slides: [...state.slides, slide] };
      }),

      updateSlide: (id, updatedFields) => set((state) => ({
        slides: state.slides.map((s) => (s.id === id ? { ...s, ...updatedFields } : s)),
      })),

      deleteSlide: (id) => set((state) => ({
        slides: state.slides.filter((s) => s.id !== id),
      })),
    }),
    {
      name: 'toy-shop-products-storage',
    }
  )
);
