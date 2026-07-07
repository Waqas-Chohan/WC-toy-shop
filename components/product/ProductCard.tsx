'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, Zap } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore(state => state.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);

  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlist = () => {
    toggleItem(product.id);
    toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="glass-card rounded-2xl overflow-hidden group border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300 hover-lift h-full flex flex-col cursor-pointer">
        {/* Image Container */}
        <div className="relative h-56 bg-slate-800 overflow-hidden">
          <Image
            src={product.images?.[0] || '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1 rounded-lg font-bold text-sm shadow-lg shadow-cyan-500/50 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              {discount}% OFF
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              handleWishlist();
            }}
            className={`absolute top-3 left-3 p-2.5 rounded-lg transition-all duration-300 backdrop-blur-md ${
              inWishlist
                ? 'bg-red-500/80 text-white shadow-lg shadow-red-500/30'
                : 'bg-white/10 text-white hover:bg-red-500/60 border border-white/20 hover:border-red-400/50'
            }`}
          >
            <Heart className="w-5 h-5" fill={inWishlist ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
            {product.name}
          </h3>

          <p className="text-slate-400 text-sm mb-4 line-clamp-2 flex-1">
            {product.description}
          </p>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(product.rating || 0)
                        ? 'text-cyan-400 fill-cyan-400'
                        : 'text-slate-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-400">
                ({product.reviews_count || 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              ${product.price.toFixed(2)}
            </span>
            {product.compare_at_price && (
              <span className="text-sm text-slate-500 line-through">
                ${product.compare_at_price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className={`text-xs font-semibold mb-4 ${
            product.stock_quantity > 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              if (product.stock_quantity > 0) {
                handleAddToCart();
              }
            }}
            disabled={product.stock_quantity === 0}
            className="w-full btn-futuristic disabled:opacity-50 disabled:cursor-not-allowed text-sm py-2"
          >
            {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </Link>
  );
}
