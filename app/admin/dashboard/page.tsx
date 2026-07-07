'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Sidebar, Section } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { OverviewSection } from '@/components/dashboard/sections/overview';
import { PipelineSection } from '@/components/dashboard/sections/pipeline';
import { DealsSection } from '@/components/dashboard/sections/deals';
import { CustomersSection } from '@/components/dashboard/sections/customers';
import { TeamSection } from '@/components/dashboard/sections/team';
import { ForecastingSection } from '@/components/dashboard/sections/forecasting';
import { ReportsSection } from '@/components/dashboard/sections/reports';
import { SettingsSection } from '@/components/dashboard/sections/settings';
import { ToysSection } from '@/components/dashboard/sections/toys';
import { SlidersSection } from '@/components/dashboard/sections/sliders';
import { ShieldAlert, ArrowLeft, Terminal } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Guard: Must be logged in as Admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden select-none">
        {/* Futuristic Grid and Glow Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Access Denied Card */}
        <div className="relative glass-card border-red-500/20 max-w-lg p-10 rounded-3xl shadow-2xl shadow-red-500/5 backdrop-blur-xl border flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
          
          {/* Crimson Warning Header */}
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6 shadow-lg shadow-red-500/10">
            <ShieldAlert className="w-10 h-10 text-red-500 animate-pulse" />
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-xs font-semibold text-red-400 tracking-wider uppercase mb-4">
            <Terminal className="w-3.5 h-3.5" />
            Security Protocol 403
          </div>

          <h1 className="text-3xl font-extrabold text-white mb-3 tracking-tight">
            Access Denied
          </h1>
          <p className="text-slate-400 text-sm md:text-base mb-8 max-w-sm leading-relaxed">
            This workspace is encrypted. Only verified System Administrators are authorized to view catalog inventory operations.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link
              href="/"
              className="flex-1 px-6 h-12 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />;
      case 'toys':
        return <ToysSection />;
      case 'sliders':
        return <SlidersSection />;
      case 'pipeline':
        return <PipelineSection />;
      case 'deals':
        return <DealsSection />;
      case 'customers':
        return <CustomersSection />;
      case 'team':
        return <TeamSection />;
      case 'forecasting':
        return <ForecastingSection />;
      case 'reports':
        return <ReportsSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <OverviewSection />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Dashboard Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      
      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-out ${
          sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'
        }`}
      >
        <Header activeSection={activeSection} />
        
        <main className="flex-1 p-6 overflow-auto">
          <div
            key={activeSection}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
