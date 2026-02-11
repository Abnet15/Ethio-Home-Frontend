import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Users,
  Building,
  MessageSquare,
  TrendingUp,
  BarChart3,
  Activity,
  Star,
  Shield,
  Settings,
  Menu,
  X,
  ChevronRight,
  Home,
  Bell,
  FileText,
  HelpCircle,
  Layers
} from 'lucide-react';
import { Sheet, SheetContent } from '../ui/sheet';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

const AdminLayout = ({ children, activeTab = 'overview', onTabChange }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const mainNavItems = [
    { id: 'overview', icon: BarChart3, label: 'Overview', path: '/admin-dashboard' },
    { id: 'users', icon: Users, label: 'Users', path: '/admin/users' },
    { id: 'properties', icon: Building, label: 'Properties', path: '/admin/properties' },
    { id: 'messages', icon: MessageSquare, label: 'Messages', path: '/admin/messages' },
    { id: 'selling', icon: TrendingUp, label: 'All Sales', path: null },
    { id: 'reviews', icon: Star, label: 'Reviews', path: '/admin/reviews' },
    { id: 'activity', icon: Activity, label: 'Activity', path: '/admin/activity' },
  ];

  const managementNavItems = [
    { id: 'contacts', icon: FileText, label: 'Contacts', path: null },
    { id: 'faq', icon: HelpCircle, label: 'FAQ Management', path: null },
    { id: 'departments', icon: Layers, label: 'Departments', path: null },
    { id: 'subscriptions', icon: Bell, label: 'Subscriptions', path: null },
    { id: 'notifications', icon: Bell, label: 'Notifications', path: null },
  ];

  const handleNavClick = (item) => {
    if (item.path) {
      navigate(item.path);
    } else if (onTabChange) {
      onTabChange(item.id);
    }
    setSidebarOpen(false);
  };

  const isActive = (item) => {
    if (item.path) {
      return location.pathname === item.path;
    }
    return activeTab === item.id;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Sidebar gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-purple-900/10 pointer-events-none" />
      
      {/* Sidebar header */}
      <div className="relative z-10 mb-6 lg:mb-10">
        <div className="flex items-center gap-3 mb-4 lg:mb-6">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
          </div>
          <div>
            <h2 className="font-serif text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-300 to-purple-100 bg-clip-text text-transparent">Admin</h2>
            <p className="text-[10px] lg:text-xs text-purple-300/60 uppercase tracking-wider">Control Panel</p>
          </div>
        </div>
        
        {/* Purple accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-purple-500 via-purple-400 to-purple-600 rounded-full mb-4 lg:mb-6" />
        
        {/* User info */}
        <div className="flex items-center gap-3 p-3 lg:p-4 rounded-xl bg-gradient-to-r from-purple-900/80 to-purple-950/50 border border-purple-700/50">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-purple-100 truncate text-sm lg:text-base">{user?.name || 'Admin'}</p>
            <p className="text-[10px] lg:text-xs text-purple-300/60">Administrator</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="relative z-10 flex-1 space-y-1 lg:space-y-2 overflow-y-auto">
        <p className="text-[10px] lg:text-xs font-bold text-purple-400/60 uppercase tracking-widest mb-2 lg:mb-4 px-3">Navigation</p>
        
        {mainNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item)}
            className={`group w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg lg:rounded-xl text-left transition-all duration-300 ${
              isActive(item)
                ? 'bg-gradient-to-r from-purple-500/30 to-purple-600/10 text-purple-200 border border-purple-500/40 shadow-lg shadow-purple-500/10' 
                : 'text-purple-300/70 hover:text-purple-100 hover:bg-purple-800/40'
            }`}
          >
            <div className={`w-7 h-7 lg:w-9 lg:h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
              isActive(item)
                ? 'bg-purple-500/30' 
                : 'bg-purple-900/60 group-hover:bg-purple-800/60'
            }`}>
              <item.icon size={16} className={`lg:w-[18px] lg:h-[18px] ${isActive(item) ? 'text-purple-200' : 'text-purple-400 group-hover:text-purple-200'}`} />
            </div>
            <span className="font-medium text-sm lg:text-base">{item.label}</span>
            {isActive(item) && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            )}
          </button>
        ))}
        
        {/* Management Section */}
        <div className="pt-3 lg:pt-4 mt-3 lg:mt-4 border-t border-purple-800/50">
          <p className="text-[10px] lg:text-xs font-bold text-purple-400/60 uppercase tracking-widest mb-2 lg:mb-4 px-3">Management</p>
          
          {managementNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`group w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg lg:rounded-xl text-left transition-all duration-300 ${
                isActive(item)
                  ? 'bg-gradient-to-r from-purple-500/30 to-purple-600/10 text-purple-200 border border-purple-500/40 shadow-lg shadow-purple-500/10' 
                  : 'text-purple-300/70 hover:text-purple-100 hover:bg-purple-800/40'
              }`}
            >
              <div className={`w-7 h-7 lg:w-9 lg:h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                isActive(item)
                  ? 'bg-purple-500/30' 
                  : 'bg-purple-900/60 group-hover:bg-purple-800/60'
              }`}>
                <item.icon size={16} className={`lg:w-[18px] lg:h-[18px] ${isActive(item) ? 'text-purple-200' : 'text-purple-400 group-hover:text-purple-200'}`} />
              </div>
              <span className="font-medium text-sm lg:text-base">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom actions */}
      <div className="relative z-10 pt-4 border-t border-purple-800/50 mt-4">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg lg:rounded-xl text-purple-300/70 hover:text-purple-100 hover:bg-purple-800/40 transition-all duration-300"
        >
          <Home size={16} className="lg:w-[18px] lg:h-[18px]" />
          <span className="font-medium text-sm lg:text-base">Back to Home</span>
        </button>
        <button
          className="w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg lg:rounded-xl text-purple-300/70 hover:text-purple-100 hover:bg-purple-800/40 transition-all duration-300"
        >
          <Settings size={16} className="lg:w-[18px] lg:h-[18px]" />
          <span className="font-medium text-sm lg:text-base">Settings</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="admin-layout min-h-screen bg-gray-950 relative">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-0 right-0 w-[600px] lg:w-[900px] h-[600px] lg:h-[900px] rounded-full opacity-30"
          style={{ 
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 60%)', 
            filter: 'blur(120px)' 
          }} 
        />
        <div 
          className="absolute bottom-0 left-0 w-[400px] lg:w-[700px] h-[400px] lg:h-[700px] rounded-full opacity-25"
          style={{ 
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, transparent 60%)', 
            filter: 'blur(100px)' 
          }} 
        />
      </div>

      {/* Mobile hamburger button - always visible on mobile, positioned below navbar */}
      <button
        className="lg:hidden fixed top-20 left-4 z-[60] w-12 h-12 rounded-xl bg-gray-900/95 backdrop-blur-xl border border-gray-700 shadow-xl flex items-center justify-center hover:bg-gray-800 hover:border-purple-500/50 transition-all duration-200 hover:shadow-purple-500/20"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu size={20} className="text-gray-300" />
      </button>

      {/* Mobile Sheet Sidebar - Overlay drawer */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent 
          side="left" 
          className="w-[280px] sm:w-[320px] p-0 bg-gray-900 border-r border-gray-800"
        >
          <div className="h-full p-4 sm:p-5 overflow-y-auto">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex relative z-10 min-h-screen">
        {/* Desktop Sidebar - hidden on mobile */}
        <aside className="hidden lg:flex flex-col w-72 xl:w-80 bg-gray-900/80 backdrop-blur-2xl border-r border-gray-800 min-h-screen p-5 xl:p-6 sticky top-0 h-screen overflow-y-auto">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 w-full">
          <div className="p-4 sm:p-5 lg:p-6 xl:p-8 pt-4 lg:pt-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
