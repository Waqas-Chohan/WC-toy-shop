'use client';

import { useCartStore } from '@/stores/cartStore';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getSubtotal, getTotal } = useCartStore();

  const subtotal = getSubtotal();
  const tax = subtotal * 0.1;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = getTotal();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8 gradient-text-glow">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-tertiary text-lg mb-4">Your cart is empty</p>
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map(item => (
                <div
                  key={item.id}
                  className="flex gap-4 p-6 glass-card rounded-2xl border-cyan-500/10"
                >
                  <div className="relative w-24 h-24 flex-shrink-0 bg-slate-800 rounded-lg overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <Link href={`/products/${item.slug}`}>
                      <h3 className="font-bold text-primary hover:text-cyan-400 transition-colors">{item.name}</h3>
                    </Link>
                    <p className="text-lg font-bold text-cyan-400 mt-1">
                      ${item.price.toFixed(2)}
                    </p>

                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg text-cyan-400 transition-colors"
                      >
                        −
                      </button>
                      <span className="px-3 py-1 border border-cyan-500/30 rounded-lg text-secondary">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg text-cyan-400 transition-colors"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-cyan-400">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button
                onClick={() => clearCart()}
                className="px-6 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors font-medium bg-red-500/5"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl border-cyan-500/10 p-8 sticky top-20 h-fit">
              <h2 className="font-bold text-lg text-white mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-cyan-500/20">
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
              </div>

              {subtotal > 100 && (
                <p className="text-xs text-emerald-400 mb-4">✓ Free shipping applied</p>
              )}

              <div className="flex justify-between font-bold text-lg mb-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-4 rounded-xl border border-cyan-500/20">
                <span className="text-primary">Total</span>
                <span className="gradient-text-glow">${total.toFixed(2)}</span>
              </div>

              <Link href="/checkout" className="block mb-3">
                <button className="w-full btn-futuristic">
                  Proceed to Checkout
                </button>
              </Link>

              <Link href="/products" className="block">
                <button className="w-full px-6 py-3 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-colors font-medium">
                  Continue Shopping
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
