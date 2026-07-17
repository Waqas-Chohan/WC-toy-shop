'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { Product } from '@/types';

import { useProductStore } from '@/stores/productStore';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = React.use(params);
  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const product = products.find(p => p.slug === slug);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore(state => state.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product?.id || '');

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-gray-500 text-lg">Product not found</p>
        <Link href="/products">
          <Button className="mt-4">Back to Products</Button>
        </Link>
      </div>
    );
  }

  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <div className="flex gap-2 text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-gray-900">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-gray-900">
          Products
        </Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image */}
        <div>
          <div className="relative w-full aspect-square bg-gray-200 rounded-lg overflow-hidden group">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
            />
            {discount > 0 && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded font-bold">
                -{discount}%
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <span className="text-gray-600">
              {product.rating} ({product.reviews_count} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl font-bold text-blue-600">
              ${product.price.toFixed(2)}
            </span>
            {product.compare_at_price && (
              <span className="text-2xl text-gray-500 line-through">
                ${product.compare_at_price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            {product.description}
          </p>

          {/* Stock */}
          <div className="mb-6">
            {product.stock_quantity > 20 ? (
              <p className="text-green-600 font-semibold">✓ In Stock</p>
            ) : product.stock_quantity > 0 ? (
              <p className="text-orange-600 font-semibold">
                Only {product.stock_quantity} left in stock
              </p>
            ) : (
              <p className="text-red-600 font-semibold">Out of Stock</p>
            )}
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-8">
            <label className="font-semibold">Quantity:</label>
            <div className="flex items-center border border-gray-300 rounded">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-gray-100"
              >
                −
              </button>
              <span className="px-4 py-2">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                className="px-3 py-2 hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mb-8">
            <Button
              onClick={() => addItem(product, quantity)}
              disabled={product.stock_quantity === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-lg"
              size="lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
            <button
              onClick={() => toggleItem(product.id)}
              className={`px-6 border-2 rounded-lg font-semibold transition ${
                inWishlist
                  ? 'border-red-500 bg-red-500 text-white'
                  : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
              }`}
            >
              <Heart className="w-5 h-5" fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Benefits */}
          <div className="space-y-3 pt-6 border-t">
            <div className="flex gap-3">
              <span className="text-2xl">🚚</span>
              <div>
                <p className="font-semibold">Free Shipping</p>
                <p className="text-sm text-gray-600">On orders over $100</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <p className="font-semibold">Secure Payment</p>
                <p className="text-sm text-gray-600">100% encrypted</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
