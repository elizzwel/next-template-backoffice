'use client';

import { useAuth } from '@/contexts/AuthContext';

interface PermissionActions {
  // User permissions
  readUsers: () => boolean;
  createUsers: () => boolean;
  updateUsers: () => boolean;
  deleteUsers: () => boolean;
  
  // Role permissions
  readRoles: () => boolean;
  createRoles: () => boolean;
  updateRoles: () => boolean;
  deleteRoles: () => boolean;
}

interface UsePermissionReturn {
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  can: PermissionActions;
  permissions: string[];
}

export function usePermission(): UsePermissionReturn {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user || !user.permissions) return false;
    return permissions.some(permission => user.permissions.includes(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user || !user.permissions) return false;
    return permissions.every(permission => user.permissions.includes(permission));
  };

  const can: PermissionActions = {
    // User permissions
    readUsers: () => hasPermission('users.read'),
    createUsers: () => hasPermission('users.create'),
    updateUsers: () => hasPermission('users.update'),
    deleteUsers: () => hasPermission('users.delete'),
    
    // Role permissions
    readRoles: () => hasPermission('roles.read'),
    createRoles: () => hasPermission('roles.create'),
    updateRoles: () => hasPermission('roles.update'),
    deleteRoles: () => hasPermission('roles.delete'),
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    can,
    permissions: user?.permissions || [],
  };
}