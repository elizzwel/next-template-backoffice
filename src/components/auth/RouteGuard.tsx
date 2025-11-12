'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermission } from '@/hooks/usePermission';

type RouteGuardProps = {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallbackUrl?: string;
};

export default function RouteGuard({ 
  children, 
  permission, 
  permissions,
  requireAll = false,
  fallbackUrl = '/forbidden'
}: RouteGuardProps) {
  const router = useRouter();
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();

  useEffect(() => {
    let hasAccess = false;

    if (permission) {
      hasAccess = hasPermission(permission);
    } else if (permissions) {
      hasAccess = requireAll 
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);
    } else {
      hasAccess = true; // No permission required
    }

    if (!hasAccess) {
      const url = new URL(fallbackUrl, window.location.origin);
      url.searchParams.set('route', window.location.pathname);
      if (permission) {
        url.searchParams.set('permission', permission);
      }
      router.push(url.toString());
    }
  }, [permission, permissions, requireAll, hasPermission, hasAnyPermission, hasAllPermissions, router, fallbackUrl]);

  return <>{children}</>;
}







