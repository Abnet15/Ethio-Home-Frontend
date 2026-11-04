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
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { Sheet, SheetContent } from '../ui/sheet';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

const AdminLayout = ({ children, activeTab = 'overview', onTabChange }) => {
  const { user } = useAuth();
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const mainNavItems = [
    { id: 'overview', icon: BarChart3, label: currentLanguage === 'am' ? 'አጠቃላይ እይታ' : 'Overview', path: '/admin-dashboard' },
    { id: 'users', icon: Users, label: currentLanguage === 'am' ? 'ተጠቃሚዎች' : 'Users', path: '/admin/users' },
    { id: 'properties', icon: Building, label: currentLanguage === 'am' ? 'ንብረቶች' : 'Properties', path: '/admin/properties' },
    { id: 'messages', icon: MessageSquare, label: currentLanguage === 'am' ? 'መልዕክቶች' : 'Messages', path: '/admin/messages' },
    { id: 'selling', icon: TrendingUp, label: currentLanguage === 'am' ? 'ሽያጮች' : 'All Sales', path: null },
    { id: 'reviews', icon: Star, label: currentLanguage === 'am' ? 'ግምገማዎች' : 'Reviews', path: '/admin/reviews' },
    { id: 'activity', icon: Activity, label: currentLanguage === 'am' ? 'እንቅስቃሴ' : 'Activity', path: '/admin/activity' },
  ];

  const managementNavItems = [
    { id: 'contacts', icon: FileText, label: currentLanguage === 'am' ? 'እውቂያዎች' : 'Contacts', path: null },
    { id: 'faq', icon: HelpCircle, label: currentLanguage === 'am' ? 'ጥያቄና መልስ' : 'FAQ Management', path: null },
    { id: 'departments', icon: Layers, label: currentLanguage === 'am' ? 'ክፍሎች' : 'Departments', path: null },
    { id: 'subscriptions', icon: Bell, label: currentLanguage === 'am' ? 'ምዝገባዎች' : 'Subscriptions', path: null },
    { id: 'notifications', icon: Bell, label: currentLanguage === 'am' ? 'ማሳወቂያዎች' : 'Notifications', path: null },
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
    <div className="flex flex-col h-full bg-white dark:bg-[#141A17] text-[#1A1A1A] dark:text-[#F8F4EC] transition-colors duration-200">
      {/* Sidebar header */}
      <div className="relative z-10 mb-6 pb-6 border-b border-[#E5E0D8] dark:border-[#2A342E]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-[#0B6E4F] flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-[#1A1A1A] dark:text-[#F8F4EC]">
              Ethio<span className="text-[#0B6E4F] dark:text-[#10B981]">Admin</span>
            </h2>
            <p className="text-[10px] font-bold text-[#D4A017] dark:text-[#EAB308] uppercase tracking-widest">Control Panel</p>
          </div>
        </div>
        
        {/* User info */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F0EDE6] dark:bg-[#1C2420] border border-[#E5E0D8] dark:border-[#2A342E]">
          <div className="w-9 h-9 rounded-xl bg-[#0B6E4F] flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-xs sm:text-sm truncate">{user?.name || 'Administrator'}</p>
            <p className="text-[10px] text-[#6B7280] dark:text-[#6B7A73] uppercase font-bold tracking-wider">Super Admin</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="relative z-10 flex-1 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-[#6B7280] dark:text-[#6B7A73] uppercase tracking-widest mb-2 px-3">
          {currentLanguage === 'am' ? 'አሰሳ' : 'Core Navigation'}
        </p>
        
        {mainNavItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                active
                  ? 'bg-[#0B6E4F] text-white font-bold shadow-md' 
                  : 'text-[#4B5563] dark:text-[#A8B5AE] hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420] hover:text-[#1A1A1A] dark:hover:text-[#F8F4EC]'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                active
                  ? 'bg-white/20 text-white' 
                  : 'text-[#6B7280] dark:text-[#A8B5AE] group-hover:text-[#0B6E4F] dark:group-hover:text-[#10B981]'
              }`}>
                <Icon size={16} />
              </div>
              <span className="font-semibold text-xs sm:text-sm">{item.label}</span>
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D4A017] dark:bg-[#EAB308] animate-pulse" />
              )}
            </button>
          );
        })}
        
        {/* Management Section */}
        <div className="pt-4 mt-4 border-t border-[#E5E0D8] dark:border-[#2A342E]">
          <p className="text-[10px] font-bold text-[#6B7280] dark:text-[#6B7A73] uppercase tracking-widest mb-2 px-3">
            {currentLanguage === 'am' ? 'አስተዳደር' : 'System Modules'}
          </p>
          
          {managementNavItems.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                  active
                    ? 'bg-[#0B6E4F] text-white font-bold shadow-md' 
                    : 'text-[#4B5563] dark:text-[#A8B5AE] hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420] hover:text-[#1A1A1A] dark:hover:text-[#F8F4EC]'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  active
                    ? 'bg-white/20 text-white' 
                    : 'text-[#6B7280] dark:text-[#A8B5AE] group-hover:text-[#0B6E4F] dark:group-hover:text-[#10B981]'
                }`}>
                  <Icon size={16} />
                </div>
                <span className="font-semibold text-xs sm:text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom actions */}
      <div className="relative z-10 pt-4 border-t border-[#E5E0D8] dark:border-[#2A342E] mt-4 space-y-1">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#4B5563] dark:text-[#A8B5AE] hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420] transition-all cursor-pointer"
        >
          <Home size={16} />
          <span>{currentLanguage === 'am' ? 'ወደ መነሻ' : 'Back to Home'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="admin-layout min-h-screen bg-[#F8F4EC] dark:bg-[#0B0F0D] text-[#1A1A1A] dark:text-[#F8F4EC] relative transition-colors duration-200">
      
      {/* Mobile hamburger button */}
      <button
        className="lg:hidden fixed top-24 left-4 z-[60] w-11 h-11 rounded-2xl bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] shadow-xl flex items-center justify-center text-[#1A1A1A] dark:text-[#F8F4EC] hover:border-[#0B6E4F] transition-all cursor-pointer"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Sheet Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent 
          side="left" 
          className="w-[280px] sm:w-[320px] p-0 bg-white dark:bg-[#141A17] border-r border-[#E5E0D8] dark:border-[#2A342E]"
        >
          <div className="h-full p-5 overflow-y-auto">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex relative z-10 min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-72 xl:w-80 bg-white dark:bg-[#141A17] border-r border-[#E5E0D8] dark:border-[#2A342E] min-h-screen p-5 xl:p-6 sticky top-0 h-screen overflow-y-auto">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 w-full">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
