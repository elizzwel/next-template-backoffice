'use client';

import type { ReactNode } from 'react';
import { usePermission } from '@/hooks/usePermission';

type PermissionGateProps = {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
};

export default function PermissionGate({ 
  children, 
  permission, 
  permissions,
  requireAll = false,
  fallback = null 
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  if (!hasAccess) {
    return fallback;
  }

  return <>{children}</>;
}







