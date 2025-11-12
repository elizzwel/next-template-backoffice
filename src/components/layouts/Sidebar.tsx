'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  Settings,
  LogOut,
  X,
  Loader,
  ChevronLeft,
  ChevronRight,
  Search,
  Sun,
  Moon,
  Bell,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Icon mapping
const ICON_MAP: Record<string, any> = {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
};

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
};

type MenuItem = {
  id: string | number;
  name: string;
  path: string;
  icon: string;
};

export default function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<MenuItem['id'] | null>(null);

  useEffect(() => {
    fetchMenuItems();
  }, [user]);

  const fetchMenuItems = async () => {
    try {
      const res = await fetch('/api/menus');
      if (res.ok) {
        const data = await res.json();
        setMenuItems((data.menuItems || []) as MenuItem[]);
      }
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const isActive = (href: string) => pathname === href;

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 z-30 h-full text-gray-900 transform transition-all duration-500 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${collapsed ? 'w-20' : 'w-64'}
        lg:translate-x-0 lg:static lg:inset-0
        bg-white
        backdrop-blur-2xl border-r border-gray-200/60
        shadow-2xl shadow-gray-900/10
        
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200/60 bg-gradient-to-r from-gray-50/50 to-transparent backdrop-blur-sm">
            <Link href="/dashboard" className="flex items-center group">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/30 transition-all duration-300 group-hover:scale-110">
                <Sparkles className="text-white" size={16} />
              </div>
              {!collapsed && (
                <span className="ml-3 text-xl font-semibold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                  Admin Panel
                </span>
              )}
            </Link>
            <div className="flex items-center justify-end">
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100/80 transition-all duration-300 hover:scale-105 group relative"
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <div className="flex items-center justify-center w-full h-full">
                  {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </div>
                {/* Tooltip */}
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                </div>
              </button>
              <button
                onClick={onClose}
                className="lg:hidden flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100/80 transition-all duration-300"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Search */}
          {!collapsed && (
            <div className="px-4 py-2 border-b border-gray-200/60">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50/80 border border-gray-200/60 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-white/90 transition-all duration-300 backdrop-blur-sm"
                />
              </div>
            </div>
          )}

          {/* User Info */}
          <div className="px-4 py-4 border-b border-gray-200/60 bg-gradient-to-r from-gray-50/50 to-transparent backdrop-blur-sm">
            <div className="flex items-center group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-300 group-hover:scale-110">
                  <span className="text-white font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              {!collapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto sidebar-scroll">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="relative">
                  <Loader className="animate-spin text-indigo-500" size={32} />
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-pulse"></div>
                </div>
              </div>
            ) : (
              filteredMenuItems.map((item, index) => {
                const IconComponent = ICON_MAP[item.icon] || LayoutDashboard;
                const isItemActive = isActive(item.path);
                const isItemHovered = hoveredItem === item.id;
                
                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    className={`group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm ${
                      isItemActive
                        ? 'bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 text-indigo-700 shadow-lg shadow-indigo-500/20 border border-indigo-500/30 backdrop-blur-md'
                        : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-100/80 hover:to-gray-50/80 hover:text-gray-900 hover:shadow-lg hover:shadow-gray-200/50 hover:backdrop-blur-md'
                    } ${collapsed ? 'justify-center' : ''}`}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    title={collapsed ? item.name : ''}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animationName: 'fadeInUp',
                      animationDuration: '0.5s',
                      animationTimingFunction: 'ease-out',
                      animationFillMode: 'forwards'
                    }}
                  >
                    {/* Active indicator */}
                    {isItemActive && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-r-full shadow-lg"></div>
                    )}
                    
                    {/* Icon with glow effect */}
                    <div className={`relative transition-all duration-300 ${
                      isItemActive ? 'text-indigo-600' : 'text-gray-500 group-hover:text-gray-900'
                    }`}>
                      <IconComponent 
                        size={20} 
                        className={`transition-all duration-300 ${
                          isItemHovered ? 'animate-pulse' : ''
                        }`}
                      />
                      {isItemActive && (
                        <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-md animate-pulse"></div>
                      )}
                    </div>
                    
                    {!collapsed && (
                      <span className="ml-3 transition-all duration-300 group-hover:translate-x-1">
                        {item.name}
                      </span>
                    )}
                    
                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                );
              })
            )}
          </nav>

          {/* Theme Toggle & Logout */}
          <div className="px-2 py-4 border-t border-gray-200/60 space-y-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`group flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-xl hover:bg-gradient-to-r hover:from-gray-100/80 hover:to-gray-50/80 hover:text-gray-900 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm hover:backdrop-blur-md ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? (isDarkMode ? 'Light mode' : 'Dark mode') : ''}
            >
              <div className="relative">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              {!collapsed && (
                <span className="ml-3 transition-all duration-300 group-hover:translate-x-1">
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </span>
              )}
            </button>

            {/* Notifications */}
            <button
              className={`group relative flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-xl hover:bg-gradient-to-r hover:from-gray-100/80 hover:to-gray-50/80 hover:text-gray-900 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm hover:backdrop-blur-md ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? 'Notifications' : ''}
            >
              <div className="relative">
                <Bell size={20} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 rounded-full bg-rose-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              {!collapsed && (
                <span className="ml-3 transition-all duration-300 group-hover:translate-x-1">
                  Notifications
                </span>
              )}
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              className={`group flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-xl hover:bg-gradient-to-r hover:from-rose-500/10 hover:to-red-500/10 hover:text-rose-600 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm hover:backdrop-blur-md ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? 'Logout' : ''}
            >
              <div className="relative">
                <LogOut size={20} />
                <div className="absolute inset-0 rounded-full bg-rose-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              {!collapsed && (
                <span className="ml-3 transition-all duration-300 group-hover:translate-x-1">
                  Logout
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}







