'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import UserForm from '@/components/forms/UserForm';
import PermissionGate from '@/components/auth/PermissionGate';
import RouteGuard from '@/components/auth/RouteGuard';
import { usePermission } from '@/hooks/usePermission';
import toast from 'react-hot-toast';
import type { User, Role } from '@/types/types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  
  const { can } = usePermission();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filterRole, users]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers((data.users || []) as User[]);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/roles');
      const data = await res.json();
      setRoles((data.roles || []) as Role[]);
    } catch (error) {
      console.error('Failed to fetch roles');
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRole) {
      filtered = filtered.filter(user => String(user.role_id) === filterRole);
    }

    setFilteredUsers(filtered);
  };

  const handleEdit = (user: User) => {
    if (!can.updateUsers()) {
      toast.error('You do not have permission to edit users');
      return;
    }
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (user: User) => {
    if (!can.deleteUsers()) {
      toast.error('You do not have permission to delete users');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${user.name}?`)) return;

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        toast.error('Failed to delete user');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleFormSuccess = () => {
    handleModalClose();
    fetchUsers();
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (_: any, row: User) => (
        <Badge variant="info">{row.role?.name || 'No Role'}</Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const showEditButton = can.updateUsers();
  const showDeleteButton = can.deleteUsers();

  return (
    <RouteGuard permission="users.read">
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-1">Manage system users and their permissions</p>
        </div>
        
        <PermissionGate permission="users.create">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            Add User
          </Button>
        </PermissionGate>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              {roles.map(role => (
                <option key={role.id} value={String(role.id)}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {(searchTerm || filterRole) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setFilterRole('');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Filtered Results</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{filteredUsers.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Active Roles</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{roles.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading users...</p>
        </div>
      ) : (
        <Table
          columns={columns as any}
          data={filteredUsers as any}
          onEdit={showEditButton ? handleEdit : undefined}
          onDelete={showDeleteButton ? handleDelete : undefined}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={selectedUser ? 'Edit User' : 'Create New User'}
        size="md"
      >
        <UserForm
          user={selectedUser as any}
          onSuccess={handleFormSuccess}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
    </RouteGuard>
  );
}






