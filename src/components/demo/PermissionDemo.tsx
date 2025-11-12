'use client';

import { usePermission } from '@/hooks/usePermission';
import PermissionGate from '@/components/auth/PermissionGate';
import RoleGate from '@/components/auth/RoleGate';
import Badge from '@/components/ui/Badge';

export default function PermissionDemo() {
  const { can, permissions } = usePermission();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Permissions</h2>
        <div className="flex flex-wrap gap-2">
          {permissions.length === 0 ? (
            <Badge variant="warning">No Permissions</Badge>
          ) : (
            permissions.map((permission, index) => (
              <Badge key={index} variant="info">
                {permission}
              </Badge>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Permission Checks</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span>Can Read Users</span>
            <Badge variant={can.readUsers() ? 'success' : 'danger'}>
              {can.readUsers() ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span>Can Create Users</span>
            <Badge variant={can.createUsers() ? 'success' : 'danger'}>
              {can.createUsers() ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span>Can Update Users</span>
            <Badge variant={can.updateUsers() ? 'success' : 'danger'}>
              {can.updateUsers() ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span>Can Delete Users</span>
            <Badge variant={can.deleteUsers() ? 'success' : 'danger'}>
              {can.deleteUsers() ? 'Yes' : 'No'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Conditional Rendering Examples</h2>
        
        <div className="space-y-4">
          <PermissionGate 
            permission="users.create"
            fallback={<div className="p-3 bg-red-50 text-red-700 rounded">You cannot create users</div>}
          >
            <div className="p-3 bg-green-50 text-green-700 rounded">
              ✓ You can create users!
            </div>
          </PermissionGate>

          <PermissionGate 
            permissions={['users.update', 'users.delete']}
            requireAll={true}
            fallback={<div className="p-3 bg-red-50 text-red-700 rounded">You need both update and delete permissions</div>}
          >
            <div className="p-3 bg-green-50 text-green-700 rounded">
              ✓ You can update AND delete users!
            </div>
          </PermissionGate>

          <RoleGate 
            roles={['Admin']}
            fallback={<div className="p-3 bg-red-50 text-red-700 rounded">Admin only section</div>}
          >
            <div className="p-3 bg-green-50 text-green-700 rounded">
              ✓ Welcome Admin!
            </div>
          </RoleGate>
        </div>
      </div>
    </div>
  );
}







