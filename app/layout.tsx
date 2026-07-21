import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from 'sonner'
import { MainLayout } from '@/components/layout/MainLayout'
import { StorefrontShell } from '@/components/layout/StorefrontShell'

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
          {/* StorefrontShell hides itself on /admin/* routes */}
          <StorefrontShell />

          <MainLayout>
            {children}
          </MainLayout>

          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}