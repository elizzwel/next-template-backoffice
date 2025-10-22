import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkPermission } from '@/lib/checkPermission';
import { RouteResponse} from '@/types/types';

interface MenuItem {
  id: string;
  path: string;
  name: string;
  permission_code?: string | null;
  is_active: boolean;
  sort_order: number;
  [key: string]: any;
}

export async function GET() {
  try {
    const hasPermission = await checkPermission('roles.manage');
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to view routes' },
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

    const routes: RouteResponse[] = (menuItems as MenuItem[]).map(item => ({
      path: item.path,
      name: item.name,
      permission: item.permission_code,
      active: item.is_active,
    }));

    return NextResponse.json({ routes });
  } catch (error) {
    console.error('Fetch routes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch routes' },
      { status: 500 }
    );
  }
}