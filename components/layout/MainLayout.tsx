'use client';

import { usePathname } from 'next/navigation';
import React from 'react';
import { SidebarProvider, useSidebar } from '@/components/providers/SidebarProvider';
import { Sidebar } from './Sidebar';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    // Admin pages get a clean full-screen layout without the storefront sidebar
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <SidebarProvider>
      <MainLayoutInner>{children}</MainLayoutInner>
    </SidebarProvider>
  );
}

function MainLayoutInner({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <>
      <div className="flex">
        <Sidebar />
        <main
          className={`flex-1 min-h-screen transition-all duration-300 ${
            collapsed ? 'ml-20' : 'ml-20 lg:ml-64'
          }`}
        >
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>

      <footer
        className={`glass-card border-t border-cyan-500/20 mt-12 transition-all duration-300 ${
          collapsed ? 'ml-20' : 'ml-20 lg:ml-64'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4 gradient-text">About</h3>
              <p className="text-slate-400 text-sm">Premium toys and games engineered for tomorrow's generation.</p>
            </div>
            <div>
              <h3 className="font-bold mb-4 gradient-text">Shop</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="/products" className="hover:text-cyan-400 transition-colors">All Products</a></li>
                <li><a href="/products" className="hover:text-cyan-400 transition-colors">Categories</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 gradient-text">Support</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="https://wa.me/923187055975" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 gradient-text">Legal</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-cyan-500/10 pt-8 text-center text-slate-500 text-sm">
            <p>&copy; 2024 ToyShop Pro. Redefining retail innovation.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
