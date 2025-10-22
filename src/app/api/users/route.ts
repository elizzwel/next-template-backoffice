import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';
import { checkPermission } from '@/lib/checkPermission';
import type { User, UserWithRole, TransformedUser, UserCreateRequest } from '@/types/types';

export async function GET() {
  try {
    // Check permission
    const hasPermission = await checkPermission('users.read');
    
    if (!hasPermission) {
      console.log('Permission denied: users.read');
      return NextResponse.json(
        { error: 'You do not have permission to view users' },
        { status: 403 }
      );
    }

    const { data: users, error } = await supabase
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
          description
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        handleSupabaseError(error),
        { status: 500 }
      );
    }

    if (!users) {
      return NextResponse.json(
        { error: 'No users found' },
        { status: 404 }
      );
    }

    const typedUsers = users as unknown as UserWithRole[];

    const transformedUsers: TransformedUser[] = typedUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role_id: user.role_id,
      role: user.roles,
      createdAt: user.created_at,
    }));

    return NextResponse.json({ users: transformedUsers });
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const hasPermission = await checkPermission('users.create');
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to create users' },
        { status: 403 }
      );
    }

    const body: UserCreateRequest = await request.json();
    const { name, email, password, role_id } = body;

    if (!name || !email || !password || !role_id) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah digunakan' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const { data: user, error } = await supabase
      .from('users')
      .insert([
        {
          name,
          email,
          password: hashedPassword,
          role_id: role_id,
        },
      ])
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
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    const typedUser = user as User;
    const { password: _, ...userWithoutPassword } = typedUser;

    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}