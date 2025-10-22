import { headers } from 'next/headers';
import { cookies } from 'next/headers';
import { verifyToken } from './auth';

export async function getPermissionsFromRequest(): Promise<string[]> {
  try {
    // PRIORITY 1: Headers (set by middleware)
    const headersList = await headers();
    const permissionsHeader = headersList.get('x-user-permissions');
    
    if (permissionsHeader) {
      try {
        const permissions = JSON.parse(permissionsHeader) as string[];
        console.log('✅ Permissions from headers:', permissions);
        return permissions;
      } catch (parseError) {
        console.error('Failed to parse permissions header:', parseError);
      }
    }

    // PRIORITY 2: Token (fallback)
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (token) {
      const payload = await verifyToken(token);
      if (payload?.permissions && Array.isArray(payload.permissions)) {
        console.log('✅ Permissions from token:', payload.permissions);
        return payload.permissions as string[];
      }
    }

    console.log('⚠️ No permissions found');
    return [];
  } catch (error) {
    console.error('❌ Error getting permissions:', error);
    return [];
  }
}

export async function checkPermission(requiredPermission: string): Promise<boolean> {
  // TEMPORARY: Bypass untuk admin testing
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (token) {
    const payload = await verifyToken(token);
    if (payload?.role === 'Admin') {
      console.log('🔓 Admin bypass enabled');
      return true; // TEMPORARY: Admin has all permissions
    }
  }

  const permissions = await getPermissionsFromRequest();
  const hasPermission = permissions.includes(requiredPermission);
  
  return hasPermission;
}

export async function checkAnyPermission(requiredPermissions: string[]): Promise<boolean> {
  const permissions = await getPermissionsFromRequest();
  return requiredPermissions.some(p => permissions.includes(p));
}

export async function checkAllPermissions(requiredPermissions: string[]): Promise<boolean> {
  const permissions = await getPermissionsFromRequest();
  return requiredPermissions.every(p => permissions.includes(p));
}