'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ShoppingCart, Heart, LogOut, User } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useAuthStore } from '@/stores/authStore';
import { ThemeToggle } from './ThemeToggle';
import { AuthModal } from '@/components/auth/AuthModal';
import { Sidebar } from './Sidebar';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const totalItems = useCartStore(state => state.getTotalItems());
  const toggleDrawer = useCartStore(state => state.toggleDrawer);
  const wishlistItems = useWishlistStore(state => state.items);
  const { user, logout } = useAuthStore();

  return (
    <>
      <header className="sticky top-0 z-40 glass-card border-b border-cyan-500/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent hidden sm:inline group-hover:to-purple-600 transition-all">
                ToyShop Pro
              </span>
            </Link>

            {/* Center Nav */}
            <nav className="hidden lg:flex gap-8 mx-auto">
              <Link href="/" className="text-slate-300 hover:text-cyan-400 transition-colors duration-300 font-medium">
                Home
              </Link>
              <Link href="/products" className="text-slate-300 hover:text-cyan-400 transition-colors duration-300 font-medium">
                Products
              </Link>
              <Link href="/wishlist" className="text-slate-300 hover:text-cyan-400 transition-colors duration-300 font-medium">
                Wishlist
              </Link>
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-3 md:gap-4">
              <ThemeToggle />

              <Link
                href="/wishlist"
                className="relative p-2.5 hover:bg-cyan-500/10 rounded-lg transition-colors duration-300 border border-transparent hover:border-cyan-500/30"
              >
                <Heart className="w-5 h-5 text-slate-300 hover:text-cyan-400 transition-colors" />
                {wishlistItems.length > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500/80 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              <button
                onClick={toggleDrawer}
                className="relative p-2.5 hover:bg-cyan-500/10 rounded-lg transition-colors duration-300 border border-transparent hover:border-cyan-500/30"
              >
                <ShoppingCart className="w-5 h-5 text-slate-300 hover:text-cyan-400 transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 bg-cyan-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Auth Section */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-cyan-500/10 transition-colors border border-cyan-500/20 hover:border-cyan-400/40"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-6 h-6 rounded-full border border-cyan-400"
                    />
                    <span className="text-sm text-cyan-400 hidden sm:inline">{user.name}</span>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 glass-card rounded-lg shadow-2xl p-2 animate-fade-in">
                      <div className="px-4 py-3 border-b border-cyan-500/20">
                        <p className="text-sm font-semibold text-cyan-400">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg font-medium transition-all duration-300 text-sm hidden sm:inline-block"
                >
                  Sign In
                </button>
              )}

              {/* Mobile Menu */}
              <button
                className="lg:hidden p-2.5 hover:bg-cyan-500/10 rounded-lg transition-colors border border-transparent hover:border-cyan-500/30"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <Sidebar onClose={() => setMobileOpen(false)} />
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
