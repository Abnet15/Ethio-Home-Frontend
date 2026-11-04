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
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

// Role-based navigation items
const getNavItems = (role, currentLanguage) => {
  const isAm = currentLanguage === 'am';
  const baseItems = {
    admin: [
      { id: 'overview', icon: BarChart3, label: isAm ? 'አጠቃላይ እይታ' : 'Overview', path: '/admin-dashboard' },
      { id: 'users', icon: Users, label: isAm ? 'ተጠቃሚዎች' : 'Users', path: '/admin/users' },
      { id: 'properties', icon: Building, label: isAm ? 'ንብረቶች' : 'Properties', path: '/admin/properties' },
      { id: 'messages', icon: MessageSquare, label: isAm ? 'መልዕክቶች' : 'Messages', path: '/admin/messages' },
      { id: 'reviews', icon: Star, label: isAm ? 'ግምገማዎች' : 'Reviews', path: '/admin-dashboard?tab=reviews' },
      { id: 'selling', icon: TrendingUp, label: isAm ? 'ሽያጮች' : 'All Sales', path: '/admin-dashboard?tab=selling' },
    ],
    buyer: [
      { id: 'overview', icon: Home, label: isAm ? 'አጠቃላይ እይታ' : 'Overview', path: '/buyer-dashboard' },
      { id: 'favorites', icon: Heart, label: isAm ? 'የተወደዱ' : 'Favorites', path: '/buyer-dashboard?tab=favorites' },
      { id: 'visits', icon: Calendar, label: isAm ? 'ቀጠሮዎች' : 'Scheduled Visits', path: '/buyer-dashboard?tab=visits' },
      { id: 'purchased', icon: ShoppingBag, label: isAm ? 'የተገዙ' : 'Purchased', path: '/buyer-dashboard?tab=purchased' },
      { id: 'messages', icon: MessageSquare, label: isAm ? 'መልዕክቶች' : 'Messages', path: '/messages' },
    ],
    seller: [
      { id: 'overview', icon: BarChart3, label: isAm ? 'አጠቃላይ እይታ' : 'Overview', path: '/seller-dashboard' },
      { id: 'properties', icon: Building, label: isAm ? 'የእኔ ንብረቶች' : 'My Listings', path: '/seller-dashboard?tab=properties' },
      { id: 'inquiries', icon: MessageSquare, label: isAm ? 'ጥያቄዎች' : 'Inquiries', path: '/seller-dashboard?tab=inquiries' },
      { id: 'sales', icon: TrendingUp, label: isAm ? 'የሽያጭ ታሪክ' : 'Sales', path: '/seller-dashboard?tab=sales' },
      { id: 'reviews', icon: Star, label: isAm ? 'ግምገማዎች' : 'Reviews', path: '/seller-dashboard?tab=reviews' },
    ],
    agent: [
      { id: 'overview', icon: BarChart3, label: isAm ? 'አጠቃላይ እይታ' : 'Overview', path: '/agent-dashboard' },
      { id: 'properties', icon: Building, label: isAm ? 'ንብረቶች' : 'Listings', path: '/agent-dashboard?tab=properties' },
      { id: 'clients', icon: Users, label: isAm ? 'ደንበኞች' : 'Clients', path: '/agent-dashboard?tab=clients' },
      { id: 'appointments', icon: Calendar, label: isAm ? 'ቀጠሮዎች' : 'Appointments', path: '/agent-dashboard?tab=appointments' },
      { id: 'messages', icon: MessageSquare, label: isAm ? 'መልዕክቶች' : 'Messages', path: '/messages' },
    ],
    employee: [
      { id: 'overview', icon: BarChart3, label: isAm ? 'አጠቃላይ እይታ' : 'Overview', path: '/employee-dashboard' },
      { id: 'tasks', icon: Calendar, label: isAm ? 'ተግባራት' : 'Tasks', path: '/employee-dashboard?tab=tasks' },
      { id: 'messages', icon: MessageSquare, label: isAm ? 'መልዕክቶች' : 'Messages', path: '/messages' },
    ],
  };
  return baseItems[role] || baseItems.buyer;
};

// Sidebar Navigation Component
const SidebarNav = ({ navItems, activeId, onNavigate, userRole, userName, onClose }) => {
  const getRoleIcon = () => {
    switch (userRole) {
      case 'admin': return ShieldCheck;
      case 'seller': return Building;
      case 'agent': return Users;
      case 'employee': return Settings;
      default: return User;
    }
  };
  
  const RoleIcon = getRoleIcon();
  
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#141A17] text-[#1A1A1A] dark:text-[#F8F4EC] border-r border-[#E5E0D8] dark:border-[#2A342E] transition-colors duration-200">
      {/* Header */}
      <div className="p-6 border-b border-[#E5E0D8] dark:border-[#2A342E]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0B6E4F] flex items-center justify-center text-white shadow-md">
              <RoleIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-[#1A1A1A] dark:text-[#F8F4EC] capitalize">{userRole}</h2>
              <p className="text-[10px] font-bold text-[#D4A017] dark:text-[#EAB308] uppercase tracking-wider">Dashboard</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden w-8 h-8 rounded-xl bg-[#F0EDE6] dark:bg-[#1C2420] hover:bg-[#E5E0D8] dark:hover:bg-[#2A342E] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* User info */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F0EDE6] dark:bg-[#1C2420] border border-[#E5E0D8] dark:border-[#2A342E]">
          <div className="w-9 h-9 rounded-xl bg-[#0B6E4F] flex items-center justify-center text-white font-bold text-sm">
            {userName?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-xs sm:text-sm truncate">{userName || 'User'}</p>
            <p className="text-[10px] text-[#6B7280] dark:text-[#6B7A73] capitalize font-semibold">{userRole}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-[#6B7280] dark:text-[#6B7A73] uppercase tracking-widest mb-3 px-3">Navigation</p>
        
        {navItems.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.path, item.id)}
              className={`group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#0B6E4F] text-white font-bold shadow-md'
                  : 'text-[#4B5563] dark:text-[#A8B5AE] hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420] hover:text-[#1A1A1A] dark:hover:text-[#F8F4EC]'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-[#6B7280] dark:text-[#A8B5AE] group-hover:text-[#0B6E4F] dark:group-hover:text-[#10B981]'
              }`}>
                <item.icon size={16} />
              </div>
              <span className="font-semibold text-xs sm:text-sm">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D4A017] dark:bg-[#EAB308] animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#E5E0D8] dark:border-[#2A342E]">
        <button
          onClick={() => onNavigate('/profile', 'profile')}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#4B5563] dark:text-[#A8B5AE] hover:bg-[#F0EDE6] dark:hover:bg-[#1C2420] transition-all cursor-pointer"
        >
          <Settings size={16} />
          <span>Settings</span>
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
  const { currentLanguage } = useLanguage();
  
  const navItems = getNavItems(role, currentLanguage);
  
  const handleNavigate = (path, id) => {
    navigate(path);
    setSidebarOpen(false);
  };
  
  return (
    <div className="min-h-screen bg-[#F8F4EC] dark:bg-[#0B0F0D] text-[#1A1A1A] dark:text-[#F8F4EC] transition-colors duration-200">
      <div className="flex relative z-10 min-h-screen">
        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-24 left-4 z-50 w-11 h-11 rounded-2xl bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] shadow-xl flex items-center justify-center text-[#1A1A1A] dark:text-[#F8F4EC] hover:border-[#0B6E4F] transition-all cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Sidebar Drawer */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-80 border-r border-[#E5E0D8] dark:border-[#2A342E] bg-white dark:bg-[#141A17]">
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
            <div className="bg-white/80 dark:bg-[#141A17]/80 backdrop-blur-xl border-b border-[#E5E0D8] dark:border-[#2A342E] sticky top-0 z-30">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="pl-14 lg:pl-0">
                    <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] dark:text-[#F8F4EC] tracking-tight">{title}</h1>
                    {subtitle && (
                      <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#A8B5AE] mt-1">{subtitle}</p>
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
  color = 'emerald',
  onClick 
}) => {
  return (
    <div 
      onClick={onClick}
      className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#6B7A73]">{title}</span>
        <div className="w-10 h-10 rounded-xl bg-[#0B6E4F]/10 dark:bg-[#10B981]/15 text-[#0B6E4F] dark:text-[#10B981] flex items-center justify-center">
          <Icon size={18} />
        </div>
      </div>
      <div className="text-2xl sm:text-3xl font-black text-[#D4A017] dark:text-[#EAB308] tracking-tight mb-1">
        {value}
      </div>
      {trend && (
        <p className="text-xs text-[#0B6E4F] dark:text-[#10B981] font-semibold">{trend} {trendLabel}</p>
      )}
    </div>
  );
};

export default DashboardShell;
