import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkPermission } from '@/lib/checkPermission';
import type { RouteParams, RolePermissionResponse } from '@/types/types';

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const hasPermission = await checkPermission('roles.read');
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to view role permissions' },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from('role_permissions')
      .select('permission_code')
      .eq('role_id', params.id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'No permissions found for this role' },
        { status: 404 }
      );
    }

    const typedData = data as RolePermissionResponse[];
    const permissions = typedData.map(item => item.permission_code);

    return NextResponse.json({ permissions });
  } catch (error) {
    console.error('Fetch role permissions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch role permissions' },
      { status: 500 }
    );
  }
}