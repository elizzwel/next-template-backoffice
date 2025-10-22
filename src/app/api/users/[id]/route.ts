import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';
import { checkPermission } from '@/lib/checkPermission';
import type { User, Role, RouteParams, UserWithRole, UserUpdateRequest } from '@/types/types';

interface UserResponse {
  id: string;
  name: string;
  email: string;
  role_id: string;
  role: Role | Role[] | null;
  createdAt: string;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const hasPermission = await checkPermission('users.read');
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to view users' },
        { status: 403 }
      );
    }

    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        role_id,
        created_at,
        roles (
          id,
          name,
          description,
          permissions
        )
      `)
      .eq('id', params.id)
      .single();
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const typedUser = user as unknown as UserWithRole;

    const userResponse: UserResponse = {
      id: typedUser.id,
      name: typedUser.name,
      email: typedUser.email,
      role_id: typedUser.role_id,
      role: typedUser.roles,
      createdAt: typedUser.created_at,
    };

    return NextResponse.json({ user: userResponse });
  } catch (error) {
    console.error('Fetch user error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const hasPermission = await checkPermission('users.update');
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to update users' },
        { status: 403 }
      );
    }

    const body: UserUpdateRequest = await request.json();
    const updates: UserUpdateRequest = { ...body };

    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        handleSupabaseError(error),
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const typedUser = user as User;
    const { password: _, ...userWithoutPassword } = typedUser;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const hasPermission = await checkPermission('users.delete');
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to delete users' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', params.id);

    if (error) {
      return NextResponse.json(
        handleSupabaseError(error),
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}