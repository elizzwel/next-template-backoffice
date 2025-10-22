import { NextResponse } from 'next/server';
import { supabase, getMenuItems } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import type { MenuItem } from '@/types/types';

export async function GET() {
  try {
    // Get user permissions from token
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get menu items filtered by user permissions
    const permissions = Array.isArray(payload.permissions) 
      ? payload.permissions as string[] 
      : [];
    
    const menuItems: MenuItem[] = await getMenuItems(permissions);

    return NextResponse.json({ menuItems });
  } catch (error) {
    console.error('Fetch menu error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}