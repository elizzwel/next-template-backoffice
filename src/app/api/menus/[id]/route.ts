import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkPermission } from '@/lib/checkPermission';
import { MenuItem, MenuItemUpdate, RouteParams } from '@/types/types';

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const hasPermission = await checkPermission('roles.manage');
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to update menus' },
        { status: 403 }
      );
    }

    const updates: MenuItemUpdate = await request.json();

    const { data, error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    const menuItem = data as MenuItem;

    return NextResponse.json({ menuItem });
  } catch (error) {
    console.error('Update menu error:', error);
    return NextResponse.json(
      { error: 'Failed to update menu' },
      { status: 500 }
    );
  }
}