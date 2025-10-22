import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { checkPermission } from '@/lib/checkPermission';
import type { Permission, PermissionCreateRequest } from '@/types/types';

export async function GET() {
  try {
    const hasPermission = await checkPermission('roles.read');
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to view permissions' },
        { status: 403 }
      );
    }

    const { data: permissions, error } = await supabase
      .from('permissions')
      .select('*')
      .order('category', { ascending: true })
      .order('code', { ascending: true });

    if (error) {
      return NextResponse.json(
        handleSupabaseError(error),
        { status: 500 }
      );
    }

    if (!permissions) {
      return NextResponse.json(
        { error: 'No permissions found' },
        { status: 404 }
      );
    }

    const typedPermissions = permissions as Permission[];

    return NextResponse.json({ permissions: typedPermissions });
  } catch (error) {
    console.error('Fetch permissions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const hasPermission = await checkPermission('roles.manage');
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to create permissions' },
        { status: 403 }
      );
    }

    const body: PermissionCreateRequest = await request.json();
    const { code, name, description, category } = body;

    if (!code || !name) {
      return NextResponse.json(
        { error: 'Code and name are required' },
        { status: 400 }
      );
    }

    const { data: permission, error } = await supabase
      .from('permissions')
      .insert([{ code, name, description, category }])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        handleSupabaseError(error),
        { status: 500 }
      );
    }

    if (!permission) {
      return NextResponse.json(
        { error: 'Failed to create permission' },
        { status: 500 }
      );
    }

    const typedPermission = permission as Permission;

    return NextResponse.json({ permission: typedPermission }, { status: 201 });
  } catch (error) {
    console.error('Create permission error:', error);
    return NextResponse.json(
      { error: 'Failed to create permission' },
      { status: 500 }
    );
  }
}