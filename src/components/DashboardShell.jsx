import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Home,
  Users,
  Building,
  MessageSquare,
  Heart,
  Calendar,
  ShoppingBag,
  Star,
  TrendingUp,
  Settings,
  Shield,
  User,
  BarChart3,
  Bell,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

// Role-based navigation items
const getNavItems = (role) => {
  const baseItems = {
    admin: [
      { id: 'overview', icon: BarChart3, label: 'Overview', path: '/admin-dashboard' },
      { id: 'users', icon: Users, label: 'Users', path: '/admin/users' },
      { id: 'properties', icon: Building, label: 'Properties', path: '/admin/properties' },
      { id: 'messages', icon: MessageSquare, label: 'Messages', path: '/admin/messages' },
      { id: 'reviews', icon: Star, label: 'Reviews', path: '/admin-dashboard?tab=reviews' },
      { id: 'selling', icon: TrendingUp, label: 'All Sales', path: '/admin-dashboard?tab=selling' },
    ],
    buyer: [
      { id: 'overview', icon: Home, label: 'Overview', path: '/buyer-dashboard' },
      { id: 'favorites', icon: Heart, label: 'Favorites', path: '/buyer-dashboard?tab=favorites' },
      { id: 'visits', icon: Calendar, label: 'Scheduled Visits', path: '/buyer-dashboard?tab=visits' },
      { id: 'purchased', icon: ShoppingBag, label: 'Purchased', path: '/buyer-dashboard?tab=purchased' },
      { id: 'messages', icon: MessageSquare, label: 'Messages', path: '/messages' },
    ],
    seller: [
      { id: 'overview', icon: BarChart3, label: 'Overview', path: '/seller-dashboard' },
      { id: 'properties', icon: Building, label: 'My Listings', path: '/seller-dashboard?tab=properties' },
      { id: 'inquiries', icon: MessageSquare, label: 'Inquiries', path: '/seller-dashboard?tab=inquiries' },
      { id: 'sales', icon: TrendingUp, label: 'Sales', path: '/seller-dashboard?tab=sales' },
      { id: 'reviews', icon: Star, label: 'Reviews', path: '/seller-dashboard?tab=reviews' },
    ],
    agent: [
      { id: 'overview', icon: BarChart3, label: 'Overview', path: '/agent-dashboard' },
      { id: 'properties', icon: Building, label: 'Listings', path: '/agent-dashboard?tab=properties' },
      { id: 'clients', icon: Users, label: 'Clients', path: '/agent-dashboard?tab=clients' },
      { id: 'appointments', icon: Calendar, label: 'Appointments', path: '/agent-dashboard?tab=appointments' },
      { id: 'messages', icon: MessageSquare, label: 'Messages', path: '/messages' },
    ],
    employee: [
      { id: 'overview', icon: BarChart3, label: 'Overview', path: '/employee-dashboard' },
      { id: 'tasks', icon: Calendar, label: 'Tasks', path: '/employee-dashboard?tab=tasks' },
      { id: 'messages', icon: MessageSquare, label: 'Messages', path: '/messages' },
    ],
  };
  return baseItems[role] || baseItems.buyer;
};

// Sidebar Navigation Component
const SidebarNav = ({ navItems, activeId, onNavigate, userRole, userName, onClose }) => {
  const getRoleIcon = () => {
    switch (userRole) {
      case 'admin': return Shield;
      case 'seller': return Building;
      case 'agent': return Users;
      case 'employee': return Settings;
      default: return User;
    }
  };
  
  const RoleIcon = getRoleIcon();
  
  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <RoleIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white capitalize">{userRole}</h2>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Dashboard</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-300" />
            </button>
          )}
        </div>
        
        {/* User info */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 border border-gray-700/50">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
            {userName?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-200 truncate text-sm">{userName}</p>
            <p className="text-xs text-gray-500 capitalize">{userRole}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Navigation</p>
        
        {navItems.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.path, item.id)}
              className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600/30 to-purple-500/20 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/10'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/70'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-purple-500/20'
                  : 'bg-gray-800 group-hover:bg-gray-700'
              }`}>
                <item.icon size={16} className={isActive ? 'text-purple-400' : ''} />
              </div>
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => onNavigate('/profile', 'profile')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-gray-800/70 transition-all"
        >
          <Settings size={16} />
          <span className="font-medium text-sm">Settings</span>
        </button>
      </div>
    </div>
  );
};

// Main DashboardShell Component
const DashboardShell = ({ 
  children, 
  role = 'buyer',
  activeTab = 'overview',
  title,
  subtitle,
  headerActions
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const navItems = getNavItems(role);
  
  const handleNavigate = (path, id) => {
    navigate(path);
    setSidebarOpen(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Animated background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20 animate-pulse"
          style={{ 
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 60%)', 
            filter: 'blur(100px)',
            animationDuration: '4s'
          }} 
        />
        <div 
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-15 animate-pulse"
          style={{ 
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 60%)', 
            filter: 'blur(80px)',
            animationDelay: '-2s',
            animationDuration: '4s'
          }} 
        />
      </div>
      
      <div className="flex relative z-10 min-h-screen">
        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-20 left-4 z-50 w-12 h-12 rounded-xl bg-gray-900/95 backdrop-blur-xl border border-gray-700 shadow-xl flex items-center justify-center hover:bg-gray-800 hover:border-purple-500/50 transition-all duration-200 hover:shadow-purple-500/20"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5 text-gray-300" />
        </button>

        {/* Mobile Sidebar Drawer */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-80 border-gray-800 bg-gray-900">
            <SidebarNav
              navItems={navItems}
              activeId={activeTab}
              onNavigate={handleNavigate}
              userRole={role}
              userName={user?.name}
              onClose={() => setSidebarOpen(false)}
            />
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 sticky top-0 h-screen">
          <SidebarNav
            navItems={navItems}
            activeId={activeTab}
            onNavigate={handleNavigate}
            userRole={role}
            userName={user?.name}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Header */}
          {title && (
            <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-30">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="pl-14 lg:pl-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">{title}</h1>
                    {subtitle && (
                      <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
                    )}
                  </div>
                  {headerActions && (
                    <div className="flex items-center gap-3">
                      {headerActions}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Content */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// Stat Card Component for dashboards
export const DashboardStatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  trendLabel,
  color = 'purple',
  onClick 
}) => {
  const colorClasses = {
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 shadow-purple-500/10',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30 shadow-green-500/10',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 shadow-blue-500/10',
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30 shadow-orange-500/10',
    pink: 'from-pink-500/20 to-pink-600/10 border-pink-500/30 shadow-pink-500/10',
  };
  
  const iconColorClasses = {
    purple: 'text-purple-400',
    green: 'text-green-400',
    blue: 'text-blue-400',
    orange: 'text-orange-400',
    pink: 'text-pink-400',
  };
  
  return (
    <motion.div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl p-5 bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-1 font-medium">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
          {trend !== undefined && (
            <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${
              trend >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              <TrendingUp size={12} className={trend < 0 ? 'rotate-180' : ''} />
              <span>{Math.abs(trend)}% {trendLabel || 'from last month'}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gray-800/50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon size={22} className={iconColorClasses[color]} />
        </div>
      </div>
    </motion.div>
  );
};

// Dashboard Card Component
export const DashboardCard = ({ title, children, className = '', actions }) => (
  <div className={`bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden ${className}`}>
    {title && (
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
        <h3 className="font-semibold text-white">{title}</h3>
        {actions}
      </div>
    )}
    <div className="p-5">
      {children}
    </div>
  </div>
);

// Dashboard Table Component
export const DashboardTable = ({ headers, children, emptyMessage = "No data found" }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-full table-fixed">
      <thead>
        <tr className="border-b border-gray-800">
          {headers.map((header, i) => (
            <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-800">
        {children || (
          <tr>
            <td colSpan={headers.length} className="px-4 py-8 text-center text-gray-500">
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

// Dashboard Empty State
export const DashboardEmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
      <Icon size={28} className="text-gray-500" />
    </div>
    <h3 className="text-lg font-semibold text-gray-300 mb-2">{title}</h3>
    <p className="text-gray-500 text-sm max-w-sm mb-4">{description}</p>
    {action}
  </div>
);

// Loading Skeleton
export const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-800 rounded-xl" />
      ))}
    </div>
    <div className="h-64 bg-gray-800 rounded-xl" />
    <div className="h-48 bg-gray-800 rounded-xl" />
  </div>
);

export default DashboardShell;
