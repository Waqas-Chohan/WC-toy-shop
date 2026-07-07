'use client';

import { useState } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useProductStore } from '@/stores/productStore';

export default function ProductsPage() {
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 150]);
  const { products } = useProductStore();

  const filteredProducts = products
    .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8 gradient-text-glow">Products</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="space-y-6 glass-card p-6 rounded-2xl border-cyan-500/10">
            {/* Sort */}
            <div>
              <h3 className="font-bold mb-3 text-primary">Sort By</h3>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-primary bg-secondary text-primary rounded-lg focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="featured" className="bg-slate-900 text-white">Featured</option>
                <option value="price-low" className="bg-slate-900 text-white">Price: Low to High</option>
                <option value="price-high" className="bg-slate-900 text-white">Price: High to Low</option>
                <option value="rating" className="bg-slate-900 text-white">Highest Rated</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-bold mb-3 text-primary">Price Range</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-sm text-secondary">Min: ${priceRange[0]}</label>
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={priceRange[0]}
                    onChange={e => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-full accent-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-secondary">Max: ${priceRange[1]}</label>
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={priceRange[1]}
                    onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-bold mb-3 text-primary">Categories</h3>
              <div className="space-y-2">
                {[
                  { label: 'Building Toys', value: 'building' },
                  { label: 'RC Toys', value: 'rc' },
                  { label: 'Puzzles', value: 'puzzles' },
                  { label: 'Action Figures', value: 'figures' },
                ].map(cat => (
                  <label key={cat.value} className="flex items-center gap-2 cursor-pointer hover:bg-cyan-500/10 p-2 rounded-lg transition-colors">
                    <input type="checkbox" className="rounded accent-cyan-500" />
                    <span className="text-sm text-secondary">{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-tertiary">{filteredProducts.length} products</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-tertiary text-lg">No products found in this price range</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
