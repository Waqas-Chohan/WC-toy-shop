import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from '@/stores/authStore';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
  maxStock: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: any, quantity: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  toggleDrawer: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity) => {
        const { items } = get();
        const existingIndex = items.findIndex(item => item.id === product.id);
        const authUser = useAuthStore.getState().user;

        if (existingIndex > -1) {
          const updatedItems = [...items];
          const newQuantity = items[existingIndex].quantity + quantity;

          if (newQuantity > product.stock_quantity) {
            return;
          }

          updatedItems[existingIndex].quantity = newQuantity;
          set({ items: updatedItems });

          // persist update
          if (authUser) {
            fetch('/api/cart', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'x-user-id': authUser.id,
                'x-user-email': authUser.email,
              },
              body: JSON.stringify({ product_id: product.id, quantity: newQuantity }),
            }).catch(() => {});
          }
        } else {
          if (quantity > product.stock_quantity) {
            return;
          }

          const newItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity,
            image: product.images?.[0] || '/placeholder.jpg',
            slug: product.slug,
            maxStock: product.stock_quantity,
          };

          set({ items: [...items, newItem] });

          // persist to server
          if (authUser) {
            fetch('/api/cart', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-user-id': authUser.id,
                'x-user-email': authUser.email,
              },
              body: JSON.stringify({ product_id: product.id, quantity }),
            }).catch(() => {});
          }
        }

        get().openDrawer();
      },

      removeItem: (id) => {
        const authUser = useAuthStore.getState().user;
        set({ items: get().items.filter(item => item.id !== id) });
        if (authUser) {
          fetch(`/api/cart?product_id=${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: {
              'x-user-id': authUser.id,
              'x-user-email': authUser.email,
            },
          }).catch(() => {});
        }
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }

        const item = get().items.find(i => i.id === id);
        if (quantity > (item?.maxStock || 0)) {
          return;
        }

        set({
          items: get().items.map(item =>
            item.id === id ? { ...item, quantity } : item
          ),
        });

        const authUser = useAuthStore.getState().user;
        if (authUser) {
          fetch('/api/cart', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': authUser.id,
              'x-user-email': authUser.email,
            },
            body: JSON.stringify({ product_id: id, quantity }),
          }).catch(() => {});
        }
      },

      clearCart: () => {
        const authUser = useAuthStore.getState().user;
        set({ items: [] });
        if (authUser) {
          // delete all server-side cart items for user
          fetch('/api/cart', {
            method: 'DELETE',
            headers: {
              'x-user-id': authUser.id,
              'x-user-email': authUser.email,
            },
          }).catch(() => {});
        }
      },

      setItems: (items) => set({ items }),

      toggleDrawer: () => set({ isOpen: !get().isOpen }),
      openDrawer: () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),

      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      getSubtotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      getTotal: () => {
        const subtotal = get().getSubtotal();
        const tax = subtotal * 0.1;
        const shipping = subtotal > 100 ? 0 : 10;
        return subtotal + tax + shipping;
      },
    }),
    {
      name: 'cart-store',
    }
  )
);
