import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

        if (existingIndex > -1) {
          const updatedItems = [...items];
          const newQuantity = items[existingIndex].quantity + quantity;

          if (newQuantity > product.stock_quantity) {
            return;
          }

          updatedItems[existingIndex].quantity = newQuantity;
          set({ items: updatedItems });
        } else {
          if (quantity > product.stock_quantity) {
            return;
          }

          set({
            items: [
              ...items,
              {
                id: product.id,
                name: product.name,
                price: product.price,
                quantity,
                image: product.images?.[0] || '/placeholder.jpg',
                slug: product.slug,
                maxStock: product.stock_quantity,
              },
            ],
          });
        }

        get().openDrawer();
      },

      removeItem: (id) => {
        set({ items: get().items.filter(item => item.id !== id) });
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
      },

      clearCart: () => {
        set({ items: [] });
      },

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
