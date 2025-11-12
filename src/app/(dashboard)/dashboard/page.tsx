'use client';

import { useEffect, useState } from 'react';
import { Users, Shield, Activity, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [showPermissionDemo, setShowPermissionDemo] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRoles: 0,
    activeUsers: 0,
    pendingUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/roles'),
      ]);

      const usersData = await usersRes.json();
      const rolesData = await rolesRes.json();

      setStats({
        totalUsers: usersData.users?.length || 0,
        totalRoles: rolesData.roles?.length || 0,
        activeUsers: usersData.users?.length || 0,
        pendingUsers: 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Total Roles',
      value: stats.totalRoles,
      icon: Shield,
      color: 'bg-green-500',
      change: '+5%',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: Activity,
      color: 'bg-yellow-500',
      change: '+8%',
    },
    {
      title: 'Growth',
      value: '23%',
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+3%',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {loading ? '...' : stat.value}
                  </p>
                  <p className="text-sm text-green-600 mt-2 flex items-center">
                    <TrendingUp size={16} className="mr-1" />
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="text-blue-600" size={20} />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">User {i}</p>
                    <p className="text-xs text-gray-500">user{i}@example.com</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">2h ago</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-gray-600">Version</span>
              <span className="text-sm font-medium text-gray-900">v1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-gray-600">Environment</span>
              <span className="text-sm font-medium text-gray-900">Production</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-gray-600">Database</span>
              <span className="text-sm font-medium text-green-600">Connected</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">Last Backup</span>
              <span className="text-sm font-medium text-gray-900">2 hours ago</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <Users className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-sm font-medium text-gray-700">Add New User</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <Shield className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-sm font-medium text-gray-700">Create Role</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <Activity className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-sm font-medium text-gray-700">View Reports</p>
          </button>
        </div>
      </div>
    </div>
  );
}






