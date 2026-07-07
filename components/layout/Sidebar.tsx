'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, Home, Package, Heart, ShoppingCart, Settings, LogOut, Menu, MessageCircle, Phone, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { useSidebar } from '@/components/providers/SidebarProvider';

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const { collapsed, setCollapsed } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { icon: Home, label: 'Home', href: '/' },
    ...(user?.role === 'admin'
      ? [{ icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' }]
      : []),
    { icon: Package, label: 'Products', href: '/products' },
    { icon: Heart, label: 'Wishlist', href: '/wishlist' },
    { icon: ShoppingCart, label: 'Cart', href: '/cart' },
    { icon: Phone, label: 'Contact Us', href: 'https://wa.me/923187055975', external: true },
  ];

  const isActive = (href: string) => pathname === href;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    onClose?.();
  };

  const handleChatClick = () => {
    const element = document.getElementById('chatbot-widget');
    if (element) {
      element.classList.toggle('hidden');
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && !collapsed && (
        <div 
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`${
          collapsed ? 'w-20' : 'w-64'
        } fixed left-0 top-16 h-[calc(100vh-64px)] bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-xl z-40 transition-all duration-300 border-r border-cyan-500/20 overflow-hidden flex flex-col rounded-r-2xl`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/20">
          {!collapsed && <h3 className="font-bold text-lg text-white">Menu</h3>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-cyan-500/20 rounded-lg transition-colors text-cyan-400 hover:text-cyan-300"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = item.external ? false : isActive(item.href);
            const className = `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
              active
                ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/20 border border-cyan-500/40 text-white'
                : 'text-slate-300 hover:text-white hover:bg-cyan-500/10'
            }`;

            if (item.external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                  {!collapsed && (
                    <span className="text-sm font-medium">
                      {item.label}
                    </span>
                  )}
                </a>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={className}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 transition-colors ${active ? 'text-cyan-300' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                {!collapsed && (
                  <span className={`text-sm font-medium transition-colors ${active ? 'text-white' : ''}`}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Chat & Settings */}
        <div className="p-4 border-t border-cyan-500/20 space-y-2">
          {user && !collapsed && (
            <div className="px-4 py-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl mb-2 text-sm border border-cyan-500/20">
              <p className="text-white font-semibold">{user.name}</p>
              <p className="text-slate-400 text-xs">{user.email}</p>
            </div>
          )}

          <button
            onClick={handleChatClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-purple-500/20 transition-colors group text-slate-300 hover:text-white"
            title={collapsed ? 'Chat' : undefined}
          >
            <MessageCircle className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
            {!collapsed && <span className="text-sm font-medium">Chat Support</span>}
          </button>

          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-cyan-500/20 transition-colors group text-slate-300 hover:text-white"
            title={collapsed ? 'Settings' : undefined}
          >
            <Settings className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            {!collapsed && <span className="text-sm font-medium">Settings</span>}
          </button>

          {user && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 transition-colors group text-slate-300 hover:text-white"
              title={collapsed ? 'Logout' : undefined}
            >
              <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
              {!collapsed && <span className="text-sm font-medium">Logout</span>}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
