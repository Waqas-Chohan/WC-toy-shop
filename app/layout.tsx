import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { ChatBot } from '@/components/chat/ChatBot'
import { WhatsAppButton } from '@/components/chat/WhatsAppButton'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from 'sonner'
import { SplashScreen } from '@/components/ui/SplashScreen'
import { MainLayout } from '@/components/layout/MainLayout'

export const metadata: Metadata = {
  title: 'ToyShop Pro - Premium Toys & Games',
  description: 'Experience futuristic shopping with AI-powered recommendations',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        <ThemeProvider>
          <SplashScreen />
          <Header />
          
          <MainLayout>
            {children}
          </MainLayout>

          <CartDrawer />
          <div id="chatbot-widget">
            <ChatBot />
          </div>
          <WhatsAppButton />
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
