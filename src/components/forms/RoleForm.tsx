'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

type Role = { id: string | number; name?: string; description?: string };
type Permission = { code: string; name: string; category: string; description?: string };

type RoleFormProps = {
  role?: Role | null;
  onSuccess: () => void;
  onCancel: () => void;
};

type FormData = {
  name: string;
  description: string;
  selectedPermissions: string[];
};

type FormErrors = Partial<Record<'name' | 'permissions', string>> & { [key: string]: string };

export default function RoleForm({ role, onSuccess, onCancel }: RoleFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    selectedPermissions: [],
  });
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPermissions();
    if (role) {
      loadRoleData();
    }
  }, [role]);

  const fetchPermissions = async () => {
    try {
      const res = await fetch('/api/permissions');
      const data = await res.json();
      setPermissions((data.permissions || []) as Permission[]);
    } catch (error) {
      toast.error('Failed to fetch permissions');
    }
  };

  const loadRoleData = async () => {
    try {
      if (!role) return;
      const res = await fetch(`/api/roles/${role.id}/permissions`);
      const data = await res.json();
      
      setFormData({
        name: role.name || '',
        description: role.description || '',
        selectedPermissions: (data.permissions || []) as string[],
      });
    } catch (error) {
      console.error('Failed to load role data:', error);
    }
  };

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    }

    if (formData.selectedPermissions.length === 0) {
      newErrors.permissions = 'At least one permission is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const url = role ? `/api/roles/${role.id}` : '/api/roles';
      const method = role ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          permissions: formData.selectedPermissions,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(role ? 'Role updated successfully' : 'Role created successfully');
        onSuccess();
      } else {
        toast.error(data.error || 'Failed to save role');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePermissionChange = (permissionCode: string) => {
    setFormData(prev => {
      const selectedPermissions = prev.selectedPermissions.includes(permissionCode)
        ? prev.selectedPermissions.filter(p => p !== permissionCode)
        : [...prev.selectedPermissions, permissionCode];
      return { ...prev, selectedPermissions };
    });
    if (errors.permissions) {
      setErrors(prev => ({ ...prev, permissions: '' }));
    }
  };

  const selectAllInCategory = (category: string) => {
    const categoryPermissions = permissions
      .filter(p => p.category === category)
      .map(p => p.code);
    
    const allSelected = categoryPermissions.every(p => 
      formData.selectedPermissions.includes(p)
    );

    if (allSelected) {
      setFormData(prev => ({
        ...prev,
        selectedPermissions: prev.selectedPermissions.filter(p => !categoryPermissions.includes(p))
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedPermissions: [...new Set([...prev.selectedPermissions, ...categoryPermissions])]
      }));
    }
  };

  const categories = [...new Set(permissions.map(p => p.category))];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-6">
      {/* Non-scrollable section */}
      <div className="space-y-6">
        <Input
          label="Role Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="e.g., Manager, Editor"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the role and its responsibilities"
          />
        </div>
      </div>

      {/* Scrollable permissions section */}
      <div className="flex-1 overflow-y-auto my-6">
        <label className="block text-sm font-medium text-gray-700 mb-3 sticky top-0 bg-white">
          Permissions
          {errors.permissions && (
            <span className="text-red-500 text-sm ml-2">{errors.permissions}</span>
          )}
        </label>

        <div className="space-y-4">
          {categories.map(category => {
            const categoryPerms = permissions.filter(p => p.category === category);
            const allSelected = categoryPerms.every(p => formData.selectedPermissions.includes(p.code));

            return (
              <div key={category} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{category}</h4>
                  <button
                    type="button"
                    onClick={() => selectAllInCategory(category)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {categoryPerms.map(permission => (
                    <label
                      key={permission.code}
                      className="flex items-start space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedPermissions.includes(permission.code)}
                        onChange={() => handlePermissionChange(permission.code)}
                        className="w-4 h-4 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700">{permission.name}</span>
                        {permission.description && (
                          <p className="text-xs text-gray-500">{permission.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Non-scrollable footer */}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving...' : role ? 'Update Role' : 'Create Role'}
        </Button>
      </div>
    </form>
  );
}







