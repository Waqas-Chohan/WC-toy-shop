'use client';

import { useWishlistStore } from '@/stores/wishlistStore';
import { useCartStore } from '@/stores/cartStore';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock products data
const allProducts: any[] = [
  {
    id: '1',
    name: 'Classic Wooden Blocks',
    slug: 'classic-wooden-blocks',
    price: 24.99,
    compare_at_price: 34.99,
    images: ['https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&h=500&fit=crop'],
    stock_quantity: 50,
  },
  {
    id: '2',
    name: 'Remote Control Car',
    slug: 'remote-control-car',
    price: 49.99,
    images: ['https://images.unsplash.com/photo-1532737475122-5e9c4c12b9d5?w=500&h=500&fit=crop'],
    stock_quantity: 30,
  },
  {
    id: '3',
    name: 'Puzzle Master 1000',
    slug: 'puzzle-master-1000',
    price: 19.99,
    compare_at_price: 29.99,
    images: ['https://images.unsplash.com/photo-1616314049395-033edfde40bb?w=500&h=500&fit=crop'],
    stock_quantity: 100,
  },
  {
    id: '4',
    name: 'Action Figure Set',
    slug: 'action-figure-set',
    price: 39.99,
    images: ['https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&h=500&fit=crop'],
    stock_quantity: 45,
  },
  {
    id: '5',
    name: 'Drone with Camera',
    slug: 'drone-with-camera',
    price: 79.99,
    compare_at_price: 99.99,
    images: ['https://images.unsplash.com/photo-1579381841314-f59012e225e7?w=500&h=500&fit=crop'],
    stock_quantity: 20,
  },
];

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const addItem = useCartStore(state => state.addItem);

  const wishlistProducts = allProducts.filter(p => items.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8 gradient-text-glow">My Wishlist</h1>

      {wishlistProducts.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 mx-auto text-slate-500 mb-4" />
          <p className="text-tertiary text-lg mb-4">Your wishlist is empty</p>
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 mb-8">
            {wishlistProducts.map(product => {
              const discount = product.compare_at_price
                ? Math.round((1 - product.price / product.compare_at_price) * 100)
                : 0;

              return (
                <div
                  key={product.id}
                  className="flex gap-6 p-6 glass-card rounded-2xl border-cyan-500/10 hover:border-cyan-500/30 transition-all"
                >
                  <div className="relative w-32 h-32 flex-shrink-0 bg-slate-800 rounded-xl overflow-hidden">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    {discount > 0 && (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-2 py-1 rounded-lg text-sm font-semibold shadow-lg shadow-cyan-500/30">
                        -{discount}%
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="font-bold text-lg text-primary hover:text-cyan-400 transition-colors">{product.name}</h3>
                      </Link>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-2xl font-bold text-cyan-400">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.compare_at_price && (
                          <span className="text-lg text-tertiary line-through">
                            ${product.compare_at_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {product.stock_quantity > 0 ? (
                        <button
                          onClick={() => addItem(product, 1)}
                          className="flex-1 btn-futuristic flex items-center justify-center gap-2"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </button>
                      ) : (
                        <button disabled className="flex-1 px-4 py-2 border border-slate-600 text-tertiary rounded-xl opacity-50 cursor-not-allowed bg-slate-700/30">
                          Out of Stock
                        </button>
                      )}
                      <button
                        onClick={() => removeItem(product.id)}
                        className="px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <p className="text-tertiary mb-4">
              {wishlistProducts.length} item{wishlistProducts.length !== 1 ? 's' : ''} in your wishlist
            </p>
          </div>
        </>
      )}
    </div>
  );
}
