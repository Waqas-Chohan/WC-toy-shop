'use client';

import { useEffect } from 'react';
import { HeroCarousel } from '@/components/hero/HeroCarousel';
import { ProductCard } from '@/components/product/ProductCard';
import Link from 'next/link';
import { Zap, Shield, Rocket, TrendingUp } from 'lucide-react';
import { AnimatedSphere } from '@/components/ui/AnimatedSphere';
import { useProductStore } from '@/stores/productStore';

export default function Page() {
  const { products, fetchProducts, fetchSlides } = useProductStore();

  useEffect(() => {
    fetchProducts();
    fetchSlides();
  }, [fetchProducts, fetchSlides]);

  return (
    <>
      {/* Hero Carousel */}
      <section className="mb-12 animate-slide-in-up">
        <HeroCarousel />
      </section>

      {/* Trending Now Section */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <Rocket className="w-6 h-6 text-cyan-400" />
          <div>
            <h2 className="text-3xl font-bold gradient-text-glow">Trending Now</h2>
            <p className="text-slate-400">Most loved by our community</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.slice(0, 3).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Featured Collection */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-6 h-6 text-cyan-400" />
          <div>
            <h2 className="text-3xl font-bold gradient-text-glow">Featured Collection</h2>
            <p className="text-slate-400">Premium picks for discerning toy enthusiasts</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.slice(3, 6).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/products"
            className="btn-futuristic inline-block"
          >
            View All Products
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 gradient-text-glow">Shop by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Building Toys', icon: '🧱', gradient: 'from-cyan-500 to-blue-500' },
            { name: 'RC Toys', icon: '🚗', gradient: 'from-blue-500 to-purple-500' },
            { name: 'Puzzles', icon: '🧩', gradient: 'from-purple-500 to-pink-500' },
            { name: 'Action Figures', icon: '🦸', gradient: 'from-pink-500 to-cyan-500' },
          ].map(category => (
            <Link
              key={category.name}
              href={`/products?category=${category.name.toLowerCase()}`}
              className="glass-card p-6 rounded-2xl hover-lift border-transparent hover:border-cyan-500/30"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center text-2xl mb-4 shadow-lg shadow-cyan-500/20`}>
                {category.icon}
              </div>
              <h3 className="font-bold text-lg text-white mb-1">{category.name}</h3>
              <p className="text-slate-400 text-sm">Explore collection</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-8 rounded-2xl border-cyan-500/10 hover:border-cyan-500/30 transition-all">
            <Rocket className="w-10 h-10 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Lightning Fast</h3>
            <p className="text-slate-400">Experience blazing-fast checkout and instant order processing</p>
          </div>

          <div className="glass-card p-8 rounded-2xl border-cyan-500/10 hover:border-cyan-500/30 transition-all">
            <Shield className="w-10 h-10 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Secure & Safe</h3>
            <p className="text-slate-400">Military-grade encryption protects your data 24/7</p>
          </div>

          <div className="glass-card p-8 rounded-2xl border-cyan-500/10 hover:border-cyan-500/30 transition-all">
            <Zap className="w-10 h-10 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">AI Powered</h3>
            <p className="text-slate-400">Smart recommendations tailored just for you</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden rounded-3xl mb-16">
        <div className="glass-card p-12 md:p-16 border-cyan-500/10">

          {/* Animated Sphere — decorative background */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '50%',
              right: '-60px',
              transform: 'translateY(-50%)',
              width: '420px',
              height: '420px',
              opacity: 0.55,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            <AnimatedSphere />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 max-w-2xl">
              Ready to explore the future of toys?
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-xl">
              Join thousands of happy customers and discover amazing products handpicked just for you.
            </p>
            <Link href="/products" className="btn-futuristic inline-block">
              Start Shopping Now
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
