import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkPermission } from '@/lib/checkPermission';
import type { MenuItem } from '@/types/types';

export async function GET() {
  try {
    const hasPermission = await checkPermission('roles.manage');
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to view all menus' },
        { status: 403 }
      );
    }

    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!menuItems) {
      return NextResponse.json(
        { error: 'No menu items found' },
        { status: 404 }
      );
    }

    const typedMenuItems = menuItems as MenuItem[];

    return NextResponse.json({ menuItems: typedMenuItems });
  } catch (error) {
    console.error('Fetch all menus error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menus' },
      { status: 500 }
    );
  }
}