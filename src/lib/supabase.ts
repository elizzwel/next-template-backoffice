import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SupabaseErrorResponse {
  error: string;
}

export function handleSupabaseError(error: any): SupabaseErrorResponse {
  console.error('Supabase error:', error);
  return {
    error: error.message || 'Database error occurred',
  };
}

// Permissions helpers
interface Permission {
  code: string;
  name: string;
  description?: string;
  category?: string;
}

interface RolePermission {
  permission_code: string;
  permissions: Permission | Permission[] | null;
}

export async function getPermissionsByRole(role_id: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('role_permissions')
    .select(`
      permission_code,
      permissions (
        code,
        name,
        description,
        category
      )
    `)
    .eq('role_id',role_id );

  if (error) {
    console.error('Error fetching permissions:', error);
    return [];
  }

  if (!data) return [];

  return (data as unknown as RolePermission[]).map(item => item.permission_code);
}

// Menu helpers
interface MenuItem {
  id: string;
  name: string;
  path?: string;
  icon?: string;
  permission_code?: string | null;
  is_active: boolean;
  sort_order: number;
  parent_id?: string | null;
  [key: string]: any;
}

export async function getMenuItems(permissionCodes: string[] = []): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }

  if (!data) return [];

  // Filter menu items based on user permissions
  return (data as MenuItem[]).filter(item => {
    if (!item.permission_code) return true; // No permission required
    return permissionCodes.includes(item.permission_code);
  });
}