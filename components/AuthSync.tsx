'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';

export function AuthSync() {
  const user = useAuthStore((state) => state.user);
  const setCartItems = useCartStore((state) => state.setItems);
  const setWishlistItems = useWishlistStore((state) => state.setItems);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!user?.id || !user?.email) return;

    let cancelled = false;

    const syncCartAndWishlist = async () => {
      if (isSyncing) return;
      setIsSyncing(true);

      try {
        const headers: HeadersInit = {
          'x-user-id': user.id,
          'x-user-email': user.email,
        };

        const [cartRes, wishlistRes] = await Promise.all([
          fetch('/api/cart', { headers }),
          fetch('/api/wishlist', { headers }),
        ]);

        if (cancelled) return;

        if (cartRes.ok) {
          const data = await cartRes.json();
          const items = (data.items || []).map((item: any) => ({
            id: item.product?.id || item.product_id,
            name: item.product?.name || 'Product',
            price: item.product?.price || 0,
            quantity: item.quantity,
            image: item.product?.images?.[0] || '/placeholder.jpg',
            slug: item.product?.slug || '',
            maxStock: item.product?.stock_quantity || 0,
          }));
          if (items.length) {
            setCartItems(items);
          }
        }

        if (cancelled) return;

        if (wishlistRes.ok) {
          const data = await wishlistRes.json();
          const items = (data.items || []).map((item: any) => item.product?.id || item.product_id).filter(Boolean);
          if (items.length) {
            setWishlistItems(items);
          }
        }
      } catch (error) {
        console.error('AuthSync error:', error);
      } finally {
        if (!cancelled) {
          setIsSyncing(false);
        }
      }
    };

    syncCartAndWishlist();

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.email, setCartItems, setWishlistItems]);

  return null;
}
