import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'admin' | 'user';
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, isAdmin?: boolean) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,

      login: async (email: string, password: string, isAdmin: boolean = false) => {
        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 800));
          
          if (isAdmin) {
            if (email.toLowerCase() === 'admin@toyshop.com' && password === 'admin123') {
              set({
                user: {
                  id: 'admin',
                  name: 'System Admin',
                  email,
                  role: 'admin',
                  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
                },
                isLoading: false,
              });
            } else {
              set({ isLoading: false });
              throw new Error('Access Denied: Invalid admin credentials.');
            }
          } else {
            // Check if they are trying to log in as user using admin email
            if (email.toLowerCase() === 'admin@toyshop.com') {
              set({ isLoading: false });
              throw new Error('Access Denied: Please use the Admin Login portal for this account.');
            }
            set({
              user: {
                id: '1',
                name: email.split('@')[0],
                email,
                role: 'user',
                avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
              },
              isLoading: false,
            });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 800));
          set({
            user: {
              id: Math.random().toString(),
              name,
              email,
              avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
            },
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null });
      },

      setUser: (user) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
