import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { supabase, handleSupabaseError, getPermissionsByRole } from '@/lib/supabase';
import { verifyPassword, createToken } from '@/lib/auth';
import { UserResponse, LoginRequest, User, Role } from '@/types/types';

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    console.log('Login attempt for:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password harus diisi' },
        { status: 400 }
      );
    }

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      console.log('User not found:', email);
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    console.log('User found:', user.email);

    const typedUser = user as User;

    // Verify password
    const isValid = await verifyPassword(password, typedUser.password);

    if (!isValid) {
      console.log('Invalid password for:', email);
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Get user role
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('*')
      .eq('id', typedUser.role_id)
      .single();

    if (roleError || !role) {
      return NextResponse.json(
        { error: 'User role not found' },
        { status: 500 }
      );
    }

    const typedRole = role as Role;

    // Get permissions from role_permissions table
    const permissions = await getPermissionsByRole(typedRole.id);

    console.log('User permissions:', permissions);

    // Create JWT token
    const token = await createToken({
      userId: typedUser.id,
      email: typedUser.email,
      role: typedRole.name,
      role_id: typedRole.id,
      permissions: permissions,
    });

    const userResponse: UserResponse = {
      id: typedUser.id,
      name: typedUser.name,
      email: typedUser.email,
      role: typedRole.name,
      role_id: typedRole.id,
      permissions: permissions,
    };

    const response = NextResponse.json({
      success: true,
      user: userResponse,
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    console.log('Login successful for:', email);
    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}