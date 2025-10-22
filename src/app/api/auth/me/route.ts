import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { supabase, getPermissionsByRole } from '@/lib/supabase';
import { UserResponse, User, Role } from '@/types/types';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', payload.userId)
      .single();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const typedUser = user as User;

    // Get role with permissions
    const { data: role } = await supabase
      .from('roles')
      .select('*')
      .eq('id', typedUser.role_id)
      .single();

    const typedRole = role as Role | null;

    // Get permissions from role_permissions table
    const permissions = await getPermissionsByRole(typedUser.role_id);

    const userData: UserResponse = {
      id: typedUser.id,
      name: typedUser.name,
      email: typedUser.email,
      role: typedRole?.name,
      roleId: typedUser.role_id,
      permissions: permissions,
    };

    return NextResponse.json({
      user: userData,
    });
  } catch (error) {
    console.error('❌ Auth check error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}