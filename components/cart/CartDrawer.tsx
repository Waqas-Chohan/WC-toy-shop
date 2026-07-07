'use client';

import { X, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/stores/cartStore';
import { Button } from '@/components/ui/button';

export function CartDrawer() {
  const { items, isOpen, closeDrawer, removeItem, updateQuantity, getSubtotal, getTotal } = useCartStore();

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const tax = subtotal * 0.1;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = getTotal();

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={closeDrawer}
      />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 z-50 flex flex-col shadow-2xl rounded-l-3xl">
        <div className="flex items-center justify-between p-6 border-b border-cyan-500/20">
          <h2 className="text-lg font-bold text-white">Shopping Cart</h2>
          <button onClick={closeDrawer} className="p-2 hover:bg-cyan-500/10 rounded-lg transition-colors text-tertiary hover:text-primary">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-tertiary">Your cart is empty</p>
              <Link href="/products" onClick={closeDrawer}>
                <Button>Continue Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 glass-card p-4 rounded-xl border-cyan-500/10">
                  <div className="relative w-16 h-16 flex-shrink-0 bg-slate-800 rounded-lg overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-primary">{item.name}</h3>
                    <p className="text-cyan-400 font-bold">${item.price.toFixed(2)}</p>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 rounded text-sm text-cyan-400 transition-colors"
                      >
                        −
                      </button>
                      <span className="px-2 text-secondary">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 rounded text-sm text-cyan-400 transition-colors"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-cyan-500/20 p-6 space-y-3 bg-gradient-to-t from-slate-950 to-slate-900">
            <div className="flex justify-between text-sm text-secondary">
              <span>Subtotal</span>
              <span className="text-cyan-400">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-secondary">
              <span>Tax (10%)</span>
              <span className="text-cyan-400">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-secondary">
              <span>Shipping</span>
              <span className={shipping === 0 ? 'text-emerald-400 font-semibold' : 'text-cyan-400'}>
                {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            {subtotal > 100 && <p className="text-xs text-emerald-400">✓ Free shipping applied</p>}

            <div className="flex justify-between font-bold text-lg pt-3 border-t border-cyan-500/20">
              <span className="text-primary">Total</span>
              <span className="gradient-text-glow">${total.toFixed(2)}</span>
            </div>

            <Link href="/checkout" onClick={closeDrawer} className="block mt-4">
              <Button className="w-full btn-futuristic" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
