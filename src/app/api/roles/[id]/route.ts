import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { checkPermission } from '@/lib/checkPermission';
import type { Role, RouteParams, RolePermissionInsert, RolePermissionResponse, RoleUpdateRequest, RoleWithPermissions } from '@/types/types';

interface UserCheckResponse {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const hasPermission = await checkPermission('roles.read');
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to view roles' },
        { status: 403 }
      );
    }

    const { data: role, error } = await supabase
      .from('roles')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (error || !role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    const typedRole = role as Role;

    // Get role permissions
    const { data: rolePermissions } = await supabase
      .from('role_permissions')
      .select('permission_code')
      .eq('role_id', params.id);

    const permissions = (rolePermissions as RolePermissionResponse[] | null)?.map(
      rp => rp.permission_code
    ) || [];

    const roleWithPermissions: RoleWithPermissions = {
      ...typedRole,
      permissions,
    };

    return NextResponse.json({ role: roleWithPermissions });
  } catch (error) {
    console.error('Fetch role error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch role' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const hasPermission = await checkPermission('roles.update');
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to update roles' },
        { status: 403 }
      );
    }

    const body: RoleUpdateRequest = await request.json();
    const { name, description, permissions } = body;

    // Update role basic info
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .update({ name, description })
      .eq('id', params.id)
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
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    const typedRole = role as Role;

    // Update permissions if provided
    if (permissions) {
      // Delete existing permissions
      await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', params.id);

      // Insert new permissions
      if (permissions.length > 0) {
        const rolePermissions: RolePermissionInsert[] = permissions.map(
          permissionCode => ({
            role_id: params.id,
            permission_code: permissionCode,
          })
        );

        const { error: permError } = await supabase
          .from('role_permissions')
          .insert(rolePermissions);

        if (permError) {
          return NextResponse.json(
            handleSupabaseError(permError),
            { status: 500 }
          );
        }
      }
    }

    const roleWithPermissions: RoleWithPermissions = {
      ...typedRole,
      permissions: permissions || [],
    };

    return NextResponse.json({ role: roleWithPermissions });
  } catch (error) {
    console.error('Update role error:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const hasPermission = await checkPermission('roles.delete');
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to delete roles' },
        { status: 403 }
      );
    }

    // Check if role is being used
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('role_id', params.id);
    
    const typedUsers = users as UserCheckResponse[] | null;

    if (typedUsers && typedUsers.length > 0) {
      return NextResponse.json(
        { error: `Cannot delete role. ${typedUsers.length} user(s) are assigned to this role.` },
        { status: 400 }
      );
    }

    // Delete role permissions first (cascade should handle this but doing it explicitly)
    await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', params.id);

    // Delete role
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', params.id);

    if (error) {
      return NextResponse.json(
        handleSupabaseError(error),
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Role deleted successfully' 
    });
  } catch (error) {
    console.error('Delete role error:', error);
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    );
  }
}