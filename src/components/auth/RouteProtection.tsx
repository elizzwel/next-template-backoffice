'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

type RouteProtectionProps = { children: ReactNode };

export default function RouteProtection({ children }: RouteProtectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Public routes
    const publicRoutes = ['/login', '/forbidden'];
    if (publicRoutes.includes(pathname)) return;

    // Check if user is authenticated
    if (!user) {
      router.push(`/login?redirect=${pathname}`);
      return;
    }

    // Validate route exists in menu or allowed routes
    validateRoute();
  }, [user, loading, pathname, router]);

  const validateRoute = async () => {
    try {
      const res = await fetch('/api/menus');
      if (res.ok) {
        const data = await res.json();
        const menuPaths: string[] = data.menuItems?.map((item: any) => item.path) || [];
        
        // Check if current path is in menu
        const isAllowed = menuPaths.includes(pathname) || 
                         pathname === '/dashboard' ||
                         menuPaths.some(path => pathname.startsWith(path + '/'));

        if (!isAllowed) {
          console.log('🚫 Route not in menu:', pathname);
          router.push('/forbidden?error=route-not-found');
        }
      }
    } catch (error) {
      console.error('Route validation error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}







