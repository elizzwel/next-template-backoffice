'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import PermissionGate from '@/components/auth/PermissionGate';
import RouteGuard from '@/components/auth/RouteGuard';
import toast from 'react-hot-toast';

type MenuItem = {
  id: string | number;
  name: string;
  path: string;
  icon: string;
  permission_code?: string | null;
  sort_order?: number;
  is_active?: boolean;
};

export default function MenusPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const res = await fetch('/api/menus/all');
      const data = await res.json();
      setMenus((data.menuItems || []) as MenuItem[]);
    } catch (error) {
      toast.error('Failed to fetch menus');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (menu: MenuItem) => {
    try {
      const res = await fetch(`/api/menus/${menu.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !menu.is_active }),
      });

      if (res.ok) {
        toast.success(`Menu ${menu.is_active ? 'disabled' : 'enabled'}`);
        fetchMenus();
      } else {
        toast.error('Failed to update menu');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'path', label: 'Path' },
    { key: 'icon', label: 'Icon' },
    {
      key: 'permission_code',
      label: 'Permission',
      render: (value: string | null) => value ? (
        <Badge variant="info">{value}</Badge>
      ) : (
        <Badge variant="default">No Permission</Badge>
      ),
    },
    { key: 'sort_order', label: 'Order' },
    {
      key: 'is_active',
      label: 'Status',
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'danger'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  return (
    <RouteGuard permission="roles.manage">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
            <p className="text-gray-600 mt-1">Manage navigation menu items</p>
          </div>
          
          <PermissionGate permission="roles.manage">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus size={20} />
              Add Menu
            </Button>
          </PermissionGate>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading menus...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table
              columns={columns as any}
              data={menus as any}
              onEdit={(menu) => {
                setSelectedMenu(menu as any);
                setIsModalOpen(true);
              }}
              onDelete={handleToggleActive as any}
            />
          </div>
        )}
      </div>
    </RouteGuard>
  );
}






