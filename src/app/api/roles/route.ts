import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { checkPermission } from '@/lib/checkPermission';
import type { Role, RoleCreateRequest, RolePermissionResponse, RoleWithPermissions, RolePermissionInsert } from '@/types/types';

export async function GET() {
  try {
    const hasPermission = await checkPermission('roles.read');
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to view roles' },
        { status: 403 }
      );
    }

    const { data: roles, error } = await supabase
      .from('roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        handleSupabaseError(error),
        { status: 500 }
      );
    }

    if (!roles) {
      return NextResponse.json(
        { error: 'No roles found' },
        { status: 404 }
      );
    }

    const typedRoles = roles as Role[];

    // Get permissions for each role
    const rolesWithPermissions: RoleWithPermissions[] = await Promise.all(
      typedRoles.map(async (role) => {
        const { data: rolePermissions } = await supabase
          .from('role_permissions')
          .select('permission_code')
          .eq('role_id', role.id);

        const permissions = (rolePermissions as RolePermissionResponse[] | null)?.map(
          rp => rp.permission_code
        ) || [];

        return {
          ...role,
          permissions,
        };
      })
    );

    return NextResponse.json({ roles: rolesWithPermissions });
  } catch (error) {
    console.error('Fetch roles error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const hasPermission = await checkPermission('roles.create');
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to create roles' },
        { status: 403 }
      );
    }

    const body: RoleCreateRequest = await request.json();
    const { name, description, permissions } = body;

    if (!name || !permissions || permissions.length === 0) {
      return NextResponse.json(
        { error: 'Name and at least one permission are required' },
        { status: 400 }
      );
    }

    // Create role
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .insert([{ name, description }])
      .select()
      .single();

    if (roleError) {
      return NextResponse.json(
        handleSupabaseError(roleError),
        { status: 500 }
      );
    }

    if (!role) {
      return NextResponse.json(
        { error: 'Failed to create role' },
        { status: 500 }
      );
    }

    const typedRole = role as Role;

    // Add permissions
    const rolePermissions: RolePermissionInsert[] = permissions.map(
      permissionCode => ({
        role_id: typedRole.id,
        permission_code: permissionCode,
      })
    );

    const { error: permError } = await supabase
      .from('role_permissions')
      .insert(rolePermissions);

    if (permError) {
      // Rollback: delete the role if permissions insertion fails
      await supabase.from('roles').delete().eq('id', typedRole.id);
      return NextResponse.json(
        handleSupabaseError(permError),
        { status: 500 }
      );
    }

    const roleWithPermissions: RoleWithPermissions = {
      ...typedRole,
      permissions,
    };

    return NextResponse.json({ 
      role: roleWithPermissions
    }, { status: 201 });
  } catch (error) {
    console.error('Create role error:', error);
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    );
  }
}