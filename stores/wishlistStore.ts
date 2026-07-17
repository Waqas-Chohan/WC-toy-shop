import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from '@/stores/authStore';

interface WishlistStore {
  items: string[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  setItems: (items: string[]) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId) => {
        const { items } = get();
        const authUser = useAuthStore.getState().user;
        if (!items.includes(productId)) {
          set({ items: [...items, productId] });
          if (authUser) {
            fetch('/api/wishlist', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-user-id': authUser.id,
                'x-user-email': authUser.email,
              },
              body: JSON.stringify({ product_id: productId }),
            }).catch(() => {});
          }
        }
      },

      removeItem: (productId) => {
        const authUser = useAuthStore.getState().user;
        set({ items: get().items.filter(id => id !== productId) });
        if (authUser) {
          fetch(`/api/wishlist?product_id=${encodeURIComponent(productId)}`, {
            method: 'DELETE',
            headers: {
              'x-user-id': authUser.id,
              'x-user-email': authUser.email,
            },
          }).catch(() => {});
        }
      },

      toggleItem: (productId) => {
        const { items } = get();
        if (items.includes(productId)) {
          get().removeItem(productId);
        } else {
          get().addItem(productId);
        }
      },

      isInWishlist: (productId) => get().items.includes(productId),

      setItems: (items) => set({ items }),

      clearWishlist: () => {
        const authUser = useAuthStore.getState().user;
        set({ items: [] });
        if (authUser) {
          // delete all wishlist items for user
          fetch('/api/wishlist', {
            method: 'DELETE',
            headers: {
              'x-user-id': authUser.id,
              'x-user-email': authUser.email,
            },
          }).catch(() => {});
        }
      },
    }),
    {
      name: 'wishlist-store',
    }
  )
);
