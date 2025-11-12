'use client';

import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import RoleForm from '@/components/forms/RoleForm';
import PermissionGate from '@/components/auth/PermissionGate';
import RouteGuard from '@/components/auth/RouteGuard';
import { usePermission } from '@/hooks/usePermission';
import toast from 'react-hot-toast';

type Role = { id: string | number; name: string; description?: string; permissions?: string[]; created_at?: string };

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  const { can } = usePermission();

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    filterRoles();
  }, [searchTerm, roles]);

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/roles');
      const data = await res.json();
      setRoles((data.roles || []) as Role[]);
    } catch (error) {
      toast.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const filterRoles = () => {
    if (searchTerm) {
      setFilteredRoles(
        roles.filter(role =>
          role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          role.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredRoles(roles);
    }
  };

  const handleEdit = (role: Role) => {
    if (!can.updateRoles()) {
      toast.error('You do not have permission to edit roles');
      return;
    }
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleDelete = async (role: Role) => {
    if (!can.deleteRoles()) {
      toast.error('You do not have permission to delete roles');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${role.name} role?`)) return;

    try {
      const res = await fetch(`/api/roles/${role.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Role deleted successfully');
        fetchRoles();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete role');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRole(null);
  };

  const handleFormSuccess = () => {
    handleModalClose();
    fetchRoles();
  };

  const columns = [
    { key: 'name', label: 'Role Name' },
    { key: 'description', label: 'Description' },
    {
      key: 'permissions',
      label: 'Permissions',
      render: (permissions: string[]) => (
        <div className="flex flex-wrap gap-1">
          {permissions?.slice(0, 3).map((perm, index) => (
            <Badge key={index} variant="info">
              {perm}
            </Badge>
          ))}
          {permissions?.length > 3 && (
            <Badge variant="default">+{permissions.length - 3}</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Created At',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const showEditButton = can.updateRoles();
  const showDeleteButton = can.deleteRoles();

  return (
    <RouteGuard permission="roles.read">
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Roles Management</h1>
          <p className="text-gray-600 mt-1">Manage roles and permissions</p>
        </div>
        
        <PermissionGate permission="roles.create">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            Add Role
          </Button>
        </PermissionGate>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Roles</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{roles.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Filtered Results</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{filteredRoles.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading roles...</p>
        </div>
      ) : (
        <Table
          columns={columns}
          data={filteredRoles as any}
          onEdit={showEditButton ? handleEdit : undefined}
          onDelete={showDeleteButton ? handleDelete : undefined}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={selectedRole ? 'Edit Role' : 'Create New Role'}
        size="lg"
      >
        <RoleForm
          role={selectedRole as any}
          onSuccess={handleFormSuccess}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
    </RouteGuard>
  );
}






