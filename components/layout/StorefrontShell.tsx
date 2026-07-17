'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ChatBot } from '@/components/chat/ChatBot';
import { WhatsAppButton } from '@/components/chat/WhatsAppButton';
import { SplashScreen } from '@/components/ui/SplashScreen';
import { AuthSync } from '@/components/AuthSync';

/**
 * Wraps all storefront-specific chrome (header, cart drawer, chat, splash).
 * Hidden entirely on /admin routes so the admin dashboard gets a clean canvas.
 */
export function StorefrontShell() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) return <AuthSync />;

  return (
    <>
      <SplashScreen />
      <Header />
      <AuthSync />
      <CartDrawer />
      <div id="chatbot-widget">
        <ChatBot />
      </div>
      <WhatsAppButton />
    </>
  );
}
