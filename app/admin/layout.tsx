import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard — WC ToyShop',
  description: 'Admin control panel for managing products, orders, and users.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // The root layout's StorefrontShell and MainLayout both detect /admin paths
  // and skip rendering the storefront sidebar/header automatically.
  // This layout just provides the admin-specific metadata.
  return <>{children}</>;
}
