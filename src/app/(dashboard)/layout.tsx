'use client';

import { useState, type ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from '@/components/layouts/Sidebar';
import Header from '@/components/layouts/Header';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import RouteProtection from '@/components/auth/RouteProtection';

type PropsWithChildren = { children: ReactNode };

function DashboardContent({ children }: PropsWithChildren) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <RouteProtection>
      <div className="flex h-screen bg-gray-100">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
          <Header 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            sidebarCollapsed={sidebarCollapsed}
          />
          
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </RouteProtection>
  );
}

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}




