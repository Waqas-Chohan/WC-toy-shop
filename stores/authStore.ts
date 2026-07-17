import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

// Whitelist of emails allowed to log in as admin
const ADMIN_WHITELIST = ['waqaschohan3355@gmail.com', 'f233041@cfd.nu.edu.pk'];

const isAdminEmail = (email: string) => ADMIN_WHITELIST.includes(email.toLowerCase());

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'admin' | 'customer';
}


interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, isAdmin?: boolean) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  setUser: (user: User | null) => void;
  syncSession: () => Promise<void>;
}

const buildUserFromProfile = (profile: any): User => ({
  id: profile.id,
  name: profile.name,
  email: profile.email,
  role: profile.role === 'admin' ? 'admin' : 'customer',
  avatar: profile.avatar_url || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,

      syncSession: async () => {
        set({ isLoading: true });
        try {
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          if (error) {
            throw error;
          }

          if (!session?.user) {
            set({ user: null, isLoading: false });
            return;
          }

          const authUser = session.user;
          const email = authUser.email?.toLowerCase() || '';
          const name =
            authUser.user_metadata?.full_name ||
            authUser.user_metadata?.name ||
            email.split('@')[0];
          const avatar =
            authUser.user_metadata?.avatar_url ||
            authUser.user_metadata?.picture ||
            `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`;

          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

          if (profileError && profileError.message.includes('No rows found')) {
            const role = isAdminEmail(email) ? 'admin' : 'customer';
            await supabase.from('user_profiles').insert([
              {
                id: authUser.id,
                name,
                email,
                role,
                avatar_url: avatar,
              },
            ]);

            set({
              user: {
                id: authUser.id,
                name,
                email,
                role,
                avatar,
              },
              isLoading: false,
            });
            return;
          }

          if (profile) {
            if (isAdminEmail(email) && profile.role !== 'admin') {
              await supabase
                .from('user_profiles')
                .update({ role: 'admin' })
                .eq('id', authUser.id);

              profile.role = 'admin';
            }

            set({ user: buildUserFromProfile(profile), isLoading: false });
            return;
          }

          set({
            user: {
              id: authUser.id,
              name,
              email,
              role: isAdminEmail(email) ? 'admin' : 'customer',
              avatar,
            },
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          console.error('Error syncing auth session:', error);
        }
      },

      login: async (email: string, password: string, isAdmin: boolean = false) => {
        set({ isLoading: true });
        const normalizedEmail = email.toLowerCase();
        try {
          if (isAdmin && !isAdminEmail(normalizedEmail)) {
            throw new Error('This email is not authorized as admin.');
          }

          const { data, error } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });

          if (error) {
            const message = error.message?.toLowerCase() || '';
            const alreadyRegistered =
              message.includes('already registered') ||
              message.includes('already exists');
            const shouldCreateAdmin =
              isAdmin &&
              !alreadyRegistered &&
              (error.status === 400 ||
                message.includes('invalid login credentials') ||
                message.includes('user not found'));

            if (alreadyRegistered) {
              throw new Error(
                'Admin account already exists. Please use Google login or reset the password for this email.'
              );
            }

            if (shouldCreateAdmin) {
              const signUpResult = await supabase.auth.signUp({
                email: normalizedEmail,
                password,
              });

              if (signUpResult.error) {
                const signUpMessage = signUpResult.error.message?.toLowerCase() || '';
                if (
                  signUpMessage.includes('already registered') ||
                  signUpMessage.includes('already exists') ||
                  signUpMessage.includes('user already exists')
                ) {
                  throw new Error(
                    'Admin account already exists. Please use Google login or reset the password for this email.'
                  );
                }
                throw signUpResult.error;
              }

              if (!signUpResult.data.session) {
                const signInAgain = await supabase.auth.signInWithPassword({
                  email,
                  password,
                });
                if (signInAgain.error) {
                  throw signInAgain.error;
                }
              }

              await get().syncSession();
              return;
            }

            throw error;
          }

          await get().syncSession();

          if (isAdmin && get().user?.role !== 'admin') {
            throw new Error('Access Denied: Admin credentials required.');
          }
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      googleLogin: async () => {
        set({ isLoading: true });
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: window.location.origin,
            },
          });

          if (error) {
            throw error;
          }
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
        } catch (error: any) {
          console.error('Error signing out:', error);
        } finally {
          set({ user: null, isLoading: false });
        }
      },

      signup: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        const normalizedEmail = email.toLowerCase();
        try {
          const { data, error } = await supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: {
              data: {
                full_name: name,
              },
            },
          });

          if (error) {
            throw error;
          }

          if (data.user) {
            const role = normalizedEmail === 'admin@toyshop.com' ? 'admin' : 'customer';
            await supabase.from('user_profiles').upsert([
              {
                id: data.user.id,
                name,
                email: normalizedEmail,
                role,
                avatar_url: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
              },
            ]);
            await get().syncSession();
          }
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        } finally {
          set({ isLoading: false });
        }
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
