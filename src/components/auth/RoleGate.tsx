'use client';

import type { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

type RoleGateProps = {
  children: ReactNode;
  roles?: string[];
  fallback?: ReactNode;
};

export default function RoleGate({ 
  children, 
  roles = [],
  fallback = null 
}: RoleGateProps) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return fallback;
  }

  return <>{children}</>;
}




