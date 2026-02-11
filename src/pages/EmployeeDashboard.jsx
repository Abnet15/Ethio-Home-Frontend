import { 
  Users, 
  Building, 
  MessageSquare, 
  Calendar, 
  Shield, 
  TrendingUp,
  TrendingDown,
  Eye,
  UserPlus,
  Home,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  MapPin,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronRight,
  MoreVertical,
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  UserCheck,
  CalendarDays,
  ClipboardList,
  Briefcase,
  Target,
  Award,
  Phone,
  CreditCard,
  FileCheck,
  UserX,
  CheckSquare,
  XSquare,
  MessageCircle,
  PhoneCall,
  LogOut,
  Menu as MenuIcon,
  Bath,
  Maximize,
  Edit
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import ContactManagement from '../components/ContactManagement';
import FAQManagement from '../components/FAQManagement';
import DepartmentManagement from '../components/DepartmentManagement';
import MessageManagement from '../components/MessageManagement';
import ReviewManagement from '../components/ReviewManagement';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { messageService } from '../services/messageService';
import { propertyService } from '../services/propertyService';
import { userService } from '../services/userService';
import { SERVER_BASE_URL } from '../config/api';
import '../styles/employee-dashboard.css';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // Utility function for safe date formatting
  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toISOString().split('T')[0];
    } catch (error) {
      return 'N/A';
    }
  };
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stats, setStats] = useState({
    pendingVerifications: 0,
    totalProperties: 0,
    activeClients: 0,
    completedTasks: 0,
    pendingReports: 0,
    scheduledInspections: 0,
    totalMessages: 0,
    totalReviews: 0,
    totalContacts: 0,
    completedInspections: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentClients, setRecentClients] = useState([]);

  // Real data from API
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [clients, setClients] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ id: '', title: '', type: 'inspection', date: '', time: '', location: '', contactName: '', contactEmail: '', contactPhone: '' });
  // const [inspections, setInspections] = useState([]); // Commented out: Property Inspections feature disabled
  const [verifications, setVerifications] = useState([]);
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [soldProperties, setSoldProperties] = useState([]);

  // Menu items configuration
  const menuItems = [
    {
      id: 'overview',
      label: 'Dashboard Overview',
      icon: BarChart3,
      description: 'View overall statistics and recent activities'
    },
    {
      id: 'verifications',
      label: 'Property Verifications',
      icon: FileCheck,
      description: 'Review and approve property listings'
    },
    // {
    //   id: 'inspections',
    //   label: 'Property Inspections',
    //   icon: Target,
    //   description: 'Schedule and conduct property inspections'
    // },
    // {
    //   id: 'clients',
    //   label: 'Client Management',
    //   icon: Users,
    //   description: 'Manage client relationships and information'
    // },
    // {
    //   id: 'tasks',
    //   label: 'Task Management',
    //   icon: ClipboardList,
    //   description: 'Track and manage assigned tasks'
    // },
    /* {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: FileText,
      description: 'Generate and view activity reports'
    }, */
    {
      id: 'schedule',
      label: 'Schedule & Calendar',
      icon: Calendar,
      description: 'Manage appointments and schedules'
    },
    {
      id: 'messages',
      label: 'Message Center',
      icon: MessageCircle,
      description: 'Handle user inquiries and messages'
    },
    {
      id: 'reviews',
      label: 'Review Management',
      icon: Star,
      description: 'Moderate and manage property reviews'
    },
    {
      id: 'selling',
      label: 'All Selling Properties',
      icon: TrendingUp,
      description: 'View all sold properties'
    },
    {
      id: 'contacts',
      label: 'Contact Forms',
      icon: Mail,
      description: 'Process contact form submissions'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Manage account and preferences'
    }
  ];

  useEffect(() => {
    if (!user?._id) return;
    fetchDashboardData();
  }, [user?._id]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all dashboard data in parallel with error handling
      const [propertiesResponse, usersResponse, messagesResponse] = await Promise.allSettled([
        // pull recent unverified first, but do not rely solely on it elsewhere
        propertyService.getProperties({ isVerified: false, limit: 50 }),
        userService.getUsers({ role: 'seller', limit: 20 }),
        messageService.getMessageStats()
      ]);

      // Extract results from Promise.allSettled
      const propertiesResult = propertiesResponse.status === 'fulfilled' ? propertiesResponse.value : { success: false };
      const usersResult = usersResponse.status === 'fulfilled' ? usersResponse.value : { success: false };
      const messagesResult = messagesResponse.status === 'fulfilled' ? messagesResponse.value : { success: false };

      // Process properties data
      if (propertiesResult.success) {
        const properties = propertiesResult.data?.data?.data || [];
        const pendingVerifications = properties.filter(p => !p.isVerified).length;
        
        setRecentTasks(properties.slice(0, 5).map(prop => ({
          id: prop._id,
          title: `Review property: ${prop.title}`,
          priority: prop.price > 10000000 ? 'high' : 'medium',
          status: 'pending',
          assignedDate: formatDate(prop.createdAt),
          dueDate: formatDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))
        })));

        setStats(prev => ({
          ...prev,
          pendingVerifications,
          totalProperties: properties.length
        }));
      } else {
        // If properties API call fails, set default values
        setRecentTasks([]);
        setStats(prev => ({
          ...prev,
          pendingVerifications: 0,
          totalProperties: 0
        }));
      }

      // Process users data
      if (usersResult.success) {
        const users = usersResult.data?.data?.data || [];
        const activeClients = users.filter(user => user.isVerified).length;
        
        setRecentClients(users.slice(0, 5).map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          status: user.isVerified ? 'active' : 'pending',
          lastContact: formatDate(user.updatedAt),
          assignedProperties: 0
        })));

        setStats(prev => ({
          ...prev,
          activeClients
        }));
      } else {
        // If users API call fails, set default values
        setRecentClients([]);
        setStats(prev => ({
          ...prev,
          activeClients: 0
        }));
      }

      // Process messages data
      if (messagesResult.success) {
        const messagesData = messagesResult.data || {};
        setStats(prev => ({
          ...prev,
          totalMessages: messagesData.totalMessages || 0
        }));
      } else {
        // If messages API call fails, set default values
        setStats(prev => ({
          ...prev,
          totalMessages: 0
        }));
      }

      // Generate recent activities
      setRecentActivities([
        { id: 1, type: 'verification', message: 'Property verification completed', time: '2 minutes ago', icon: CheckCircle },
        { id: 2, type: 'client', message: 'Client information updated', time: '5 minutes ago', icon: UserCheck },
        { id: 3, type: 'inspection', message: 'Property inspection scheduled', time: '10 minutes ago', icon: CalendarDays },
        { id: 4, type: 'report', message: 'Monthly report submitted', time: '15 minutes ago', icon: FileText },
        { id: 5, type: 'task', message: 'New verification task assigned', time: '20 minutes ago', icon: ClipboardList }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values on error to prevent dashboard from being completely broken
      setStats(prev => ({
        ...prev,
        pendingVerifications: 0,
        totalProperties: 0,
        activeClients: 0,
        totalMessages: 0
      }));
      setRecentTasks([]);
      setRecentClients([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sold properties when component mounts
  useEffect(() => {
    if (!user?._id) return;
    fetchSoldPropertiesData();
  }, [user?._id]);

  // Fetch sold properties data
  const fetchSoldPropertiesData = async () => {
    try {
      const result = await propertyService.getProperties({ 
        isVerified: true, 
        sold: true, 
        limit: 50 
      });
      
      if (result.success) {
        const properties = result.data?.data?.data || [];
        setSoldProperties(properties);
      } else {
        console.error('Failed to fetch sold properties:', result.error);
        setSoldProperties([]);
      }
    } catch (error) {
      console.error('Error fetching sold properties:', error);
      setSoldProperties([]);
    }
  };

  // Load tasks (pending property verifications)
  useEffect(() => {
    const loadTasks = async () => {
      if (!user?._id) return;
      
      try {
        const result = await propertyService.getProperties({ isVerified: false, limit: 10 });
        if (result.success) {
          const properties = result.data?.data?.data || [];
          const taskList = properties.map(prop => ({
            id: prop._id,
            title: `Review property documentation for ${prop.title}`,
            priority: prop.price > 10000000 ? 'high' : 'medium',
            status: 'pending',
            assignedDate: formatDate(prop.createdAt),
            dueDate: formatDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))
          }));
          setTasks(taskList);
        } else {
          // If API call fails, set empty tasks list
          setTasks([]);
        }
      } catch (err) {
        console.error('Error loading tasks:', err);
        // Set empty tasks list on error
        setTasks([]);
      }
    };

    loadTasks();
  }, [user?._id]);

  // Load reports (property statistics)
  useEffect(() => {
    const loadReports = async () => {
      if (!user?._id) return;
      
      try {
        const result = await propertyService.getPropertyStats();
        if (result.success) {
          const reportList = [
            {
              id: 1,
              title: 'Property Verification Summary',
              type: 'audit',
              status: 'completed',
              createdDate: formatDate(new Date()),
              submittedDate: formatDate(new Date())
            },
            {
              id: 2,
              title: 'Monthly Property Sales Report',
              type: 'sales',
              status: 'completed',
              createdDate: formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
              submittedDate: formatDate(new Date())
            }
          ];
          setReports(reportList);
        } else {
          // If API call fails, still show some default reports
          const defaultReportList = [
            {
              id: 1,
              title: 'Property Verification Summary',
              type: 'audit',
              status: 'completed',
              createdDate: formatDate(new Date()),
              submittedDate: formatDate(new Date())
            },
            {
              id: 2,
              title: 'Monthly Property Sales Report',
              type: 'sales',
              status: 'completed',
              createdDate: formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
              submittedDate: formatDate(new Date())
            }
          ];
          setReports(defaultReportList);
        }
      } catch (err) {
        console.error('Error loading reports:', err);
        // Show default reports even if there's an error
        const defaultReportList = [
          {
            id: 1,
            title: 'Property Verification Summary',
            type: 'audit',
            status: 'completed',
            createdDate: formatDate(new Date()),
            submittedDate: formatDate(new Date())
          },
          {
            id: 2,
            title: 'Monthly Property Sales Report',
            type: 'sales',
            status: 'completed',
            createdDate: formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
            submittedDate: formatDate(new Date())
          }
        ];
        setReports(defaultReportList);
      }
    };

    loadReports();
  }, [user?._id]);

  // Load clients (users with properties)
  useEffect(() => {
    const loadClients = async () => {
      if (!user?._id) return;
      
      try {
        const result = await userService.getUsers({ role: 'seller', limit: 10 });
        if (result.success) {
          const users = result.data?.data?.data || [];
          const clientList = users.map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            status: user.isVerified ? 'active' : 'pending',
            lastContact: formatDate(user.updatedAt),
            assignedProperties: 0
          }));
          setClients(clientList);
        } else {
          // If API call fails, set empty clients list
          setClients([]);
        }
      } catch (err) {
        console.error('Error loading clients:', err);
        // Set empty clients list on error
        setClients([]);
      }
    };

    loadClients();
  }, [user?._id]);

  // Load schedule (upcoming property verifications)
  useEffect(() => {
    const loadSchedule = async () => {
      if (!user?._id) return;
      
      try {
        const result = await propertyService.getProperties({ isVerified: false, limit: 5 });
        if (result.success) {
          const properties = result.data?.data?.data || [];
          const scheduleList = properties.map((prop, index) => ({
            id: prop._id,
            title: `Property inspection at ${prop.title}`,
            type: 'inspection',
            date: formatDate(new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000)),
            time: `${9 + index}:00 AM`,
            location: prop.location || 'Unknown',
            contactName: user?.name || '',
            contactEmail: user?.email || '',
            contactPhone: user?.phone || '',
            status: 'scheduled'
          }));
          setSchedule(scheduleList);
        } else {
          // If API call fails, set empty schedule list
          setSchedule([]);
        }
      } catch (err) {
        console.error('Error loading schedule:', err);
        // Set empty schedule list on error
        setSchedule([]);
      }
    };

    loadSchedule();
  }, [user?._id]);

  // Load verifications (property verification tasks)
  useEffect(() => {
    const loadVerifications = async () => {
      if (!user?._id) return;
      
      try {
        // fetch broad list (recent) and then allow client filtering; server supports isVerified
        const result = await propertyService.getProperties({ limit: 50 });
        if (result.success) {
          const properties = result.data?.data?.data || [];
          // Include both verified and unverified properties
          const verificationList = properties.map((prop) => ({
            id: prop._id,
            title: prop.title,
            type: prop.propertyType || 'House',
            owner: prop.owner?.name || 'Unknown Owner',
            price: prop.price || 0,
            location: prop.location || 'Unknown Location',
            status: (prop.status && ['approved','rejected','pending'].includes(prop.status)) ? prop.status : (prop.isVerified ? 'approved' : 'pending'),
            submittedDate: formatDate(prop.createdAt)
          }));
          setVerifications(verificationList);
        } else {
          // If API call fails, set empty verifications list
          setVerifications([]);
        }
      } catch (err) {
        console.error('Error loading verifications:', err);
        // Set empty verifications list on error
        setVerifications([]);
      }
    };

    loadVerifications();
  }, [user?._id]);

  // Load inspections (property inspection tasks) - commented out
  // useEffect(() => {
  //   const loadInspections = async () => {
  //     if (!user?._id) return;
  //     try {
  //       const result = await propertyService.getProperties({ limit: 8 });
  //       if (result.success) {
  //         const properties = result.data?.data?.data || [];
  //         const inspectionList = properties.map((prop, index) => ({
  //           id: prop._id,
  //           propertyTitle: prop.title,
  //           propertyType: prop.propertyType || 'House',
  //           owner: prop.owner?.name || 'Unknown Owner',
  //           date: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  //           time: `${9 + index}:00 AM`,
  //           location: prop.location || 'Unknown Location',
  //           status: index % 4 === 0 ? 'scheduled' : index % 4 === 1 ? 'completed' : index % 4 === 2 ? 'in-progress' : 'pending',
  //           notes: index % 2 === 0 ? 'Property ready for inspection' : null
  //         }));
  //         setInspections(inspectionList);
  //       }
  //     } catch (err) {
  //       console.error('Error loading inspections:', err);
  //     }
  //   };
  //   loadInspections();
  // }, [user?._id]);

  const handleTaskAction = (taskId, action) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: action }
        : task
    ));
  };

  const handleReportAction = (reportId, action) => {
    setReports(reports.map(report => 
      report.id === reportId 
        ? { ...report, status: action, submittedDate: action === 'completed' ? new Date().toISOString().split('T')[0] : null }
        : report
    ));
  };

  const handleScheduleAction = (scheduleId, action) => {
    setSchedule(schedule.map(item => 
      item.id === scheduleId 
        ? { ...item, status: action }
        : item
    ));
  };

  const openEditSchedule = (item) => {
    setScheduleForm({
      id: item.id,
      title: item.title,
      type: item.type,
      date: item.date,
      time: item.time,
      location: item.location,
      contactName: item.contactName || user?.name || '',
      contactEmail: item.contactEmail || user?.email || '',
      contactPhone: item.contactPhone || user?.phone || ''
    });
    setIsEditingSchedule(true);
  };

  const saveEditSchedule = (e) => {
    if (e) e.preventDefault();
    setSchedule(prev => prev.map(s => s.id === scheduleForm.id ? {
      ...s,
      title: scheduleForm.title,
      type: scheduleForm.type,
      date: scheduleForm.date,
      time: scheduleForm.time,
      location: scheduleForm.location,
      contactName: scheduleForm.contactName,
      contactEmail: scheduleForm.contactEmail,
      contactPhone: scheduleForm.contactPhone
    } : s));
    setIsEditingSchedule(false);
  };

  const handleScheduleFormKeyDown = (e) => {
    const key = e.key || e.code;
    if (key === ' ' || key === 'Space' || key === 'Spacebar') {
      const target = e.target;
      const tag = target && target.tagName ? target.tagName.toUpperCase() : '';
      const isEditable = target && (target.isContentEditable === true);
      const isFormField = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      if (!isFormField && !isEditable) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Verification actions
  const [actionMessage, setActionMessage] = useState('');
  const [processingVerification, setProcessingVerification] = useState(null);

  const handleVerifyAction = async (propertyId, action) => {
    try {
      if (action === 'view') {
        navigate(`/properties/${propertyId}`);
        return;
      }

      // Set loading state for this specific verification
      setProcessingVerification(propertyId);
      setActionMessage(`Processing ${action}...`);
      
      // Use dedicated endpoints
      let res;
      if (action === 'approve') {
        // Requirement: approve must hit PUT /api/v1/properties/:id
        res = await propertyService.verifyPropertyPUT(propertyId);
      } else if (action === 'reject') {
        res = await propertyService.rejectProperty(propertyId);
      } else {
        setActionMessage('Invalid action');
        setProcessingVerification(null);
        setTimeout(() => setActionMessage(''), 3000);
        return;
      }

      if (res?.success) {
        // Reflect change locally: update status in place
        setVerifications(prev => prev.map(v => (
          v.id === propertyId ? { ...v, status: action === 'approve' ? 'approved' : 'rejected' } : v
        )));
        
        setActionMessage(`Property ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
        setTimeout(() => setActionMessage(''), 3000);
        
        // Update stats
        // Recompute pending from current list (approved vs pending)
        setStats(prev => ({
          ...prev,
          pendingVerifications: verifications.filter(v => v.status !== 'approved' && v.status !== 'rejected').length - (action === 'approve' ? 1 : 0)
        }));
        
        // refresh counts with a light refetch to ensure accuracy
        setTimeout(() => {
          propertyService.getProperties({ limit: 20 }).then((r) => {
            if (r?.success) {
              const props = r.data?.data?.data || [];
              const list = props.map((prop) => (
                {
                  id: prop._id,
                  title: prop.title,
                  type: prop.propertyType || 'House',
                  owner: prop.owner?.name || 'Unknown Owner',
                  price: prop.price || 0,
                  location: prop.location || 'Unknown Location',
                  status: (prop.status && ['approved','rejected','pending'].includes(prop.status)) ? prop.status : (prop.isVerified ? 'approved' : 'pending'),
                  submittedDate: formatDate(prop.createdAt)
                }
              ));
              setVerifications(list);
            }
          }).catch((error) => {
            console.error('Error refreshing verifications:', error);
          });
        }, 300);
      } else {
        // Check if it's a backend endpoint issue
        const errorMessage = res?.error || 'Unknown error';
        if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
          setActionMessage(`Backend endpoint not implemented. Please contact administrator to add property verification endpoints.`);
        } else {
          setActionMessage(`Failed to ${action} property: ${errorMessage}`);
        }
        setTimeout(() => setActionMessage(''), 8000);
      }
    } catch (e) {
      console.error('Error in handleVerifyAction:', e);
      // Check if it's a network or endpoint issue
      if (e.message && (e.message.includes('404') || e.message.includes('Not Found'))) {
        setActionMessage(`Backend endpoint not implemented. Please contact administrator to add property verification endpoints.`);
      } else {
        setActionMessage(`Action failed: ${e.message || 'Unknown error'}`);
      }
      setTimeout(() => setActionMessage(''), 8000);
    } finally {
      // Clear loading state
      setProcessingVerification(null);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color = 'primary', onClick }) => (
    <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 cursor-pointer hover:-translate-y-1" onClick={onClick}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</h3>
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-purple-400" />
        </div>
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{Math.abs(change)}% from last month</span>
        </div>
      )}
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const Icon = activity.icon;
    return (
      <div className="flex items-center gap-4 p-4 hover:bg-gray-800/50 rounded-xl transition">
        <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
          <Icon size={20} className="text-purple-400" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-200">{activity.message}</p>
          <p className="text-sm text-gray-500">{activity.time}</p>
        </div>
        <ChevronRight size={16} className="text-gray-600" />
      </div>
    );
  };

  const QuickActionCard = ({ title, description, icon: Icon, onClick, color = 'primary' }) => (
    <div 
      className="flex items-center gap-4 p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl cursor-pointer hover:bg-gray-800 hover:border-purple-500/30 transition-all"
      onClick={onClick}
    >
      <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
        <Icon size={24} className="text-purple-400" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-200 text-sm">{title}</h4>
        <p className="text-gray-500 text-xs mt-0.5">{description}</p>
      </div>
      <ArrowUpRight size={16} className="text-gray-600" />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading employee dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Dark mode background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 60%)', filter: 'blur(100px)' }} />
      </div>

      {/* Mobile Drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <button className="lg:hidden fixed top-20 left-4 z-50 w-12 h-12 rounded-xl bg-gray-900/95 backdrop-blur-xl border border-gray-700 shadow-xl flex items-center justify-center hover:bg-gray-800 transition-all">
            <MenuIcon className="w-5 h-5 text-gray-300" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 bg-gray-900 border-gray-800 p-0">
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                <Building size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Employee Portal</h2>
                <p className="text-xs text-gray-400">{user?.name || 'Employee'}</p>
              </div>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    activeTab === item.id
                      ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className={`hidden lg:flex flex-col bg-gray-900/95 backdrop-blur-xl border-r border-gray-800 min-h-screen sticky top-0 transition-all ${sidebarCollapsed ? 'w-20' : 'w-64'} p-6`}>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                <Building size={24} className="text-white" />
              </div>
              {!sidebarCollapsed && <h2 className="text-xl font-bold text-white">Employee Portal</h2>}
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <UserPlus size={20} className="text-purple-400" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <p className="font-bold text-white">{user?.name || 'Employee'}</p>
                  <p className="text-xs text-gray-400">Employee</p>
                </div>
              )}
            </div>
            <button 
              className="w-full p-2 rounded-lg hover:bg-gray-800 transition-colors"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <ChevronRight size={20} className={`text-gray-400 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
            </button>
          </div>

          <nav className="space-y-1 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id}>
                  <button 
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      activeTab === item.id 
                        ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                    }`}
                    onClick={() => setActiveTab(item.id)}
                    title={sidebarCollapsed ? item.label : ''}
                  >
                    <Icon size={18} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </button>
                </div>
              );
            })}
          </nav>

          <div className="mt-4 pt-4 border-t border-gray-800 space-y-2">
            <button 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all" 
              onClick={() => navigate('/properties/new')}
            >
              <Plus size={16} />
              {!sidebarCollapsed && 'Create Property'}
            </button>
            <button 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all" 
              onClick={logout}
            >
              <LogOut size={16} />
              {!sidebarCollapsed && 'Logout'}
            </button>
          </div>
        </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8" style={{ marginLeft: 0 }}>
        {activeTab === 'overview' && (
          <>
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 rounded-2xl bg-gray-900/80 border border-gray-800">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Employee Dashboard</h1>
                <p className="text-gray-400 mt-1">Manage property verifications, client relationships, and daily tasks</p>
              </div>
              <div className="flex items-center gap-4">
                <button className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white rounded-xl flex items-center gap-2 transition-all" onClick={fetchDashboardData}>
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Pending Verifications"
                value={formatNumber(verifications.filter(v => v.status === 'pending').length)}
                icon={FileCheck}
                color="warning"
                onClick={() => setActiveTab('verifications')}
              />
              {/** Property Inspections stat card commented out **/}
              {false && (
                <StatCard
                  title="Scheduled Inspections"
                  value={0}
                  icon={Target}
                  color="info"
                  onClick={() => setActiveTab('inspections')}
                />
              )}
              <StatCard
                title="Active Clients"
                value={formatNumber(stats.activeClients)}
                icon={UserCheck}
                color="success"
                onClick={() => setActiveTab('clients')}
              />
              <StatCard
                title="Completed Tasks"
                value={formatNumber(stats.completedTasks)}
                icon={CheckCircle}
                color="primary"
                onClick={() => setActiveTab('tasks')}
              />
              <StatCard
                title="Total Messages"
                value={formatNumber(stats.totalMessages)}
                icon={MessageCircle}
                color="secondary"
                onClick={() => setActiveTab('messages')}
              />
              <StatCard
                title="Contact Forms"
                value={formatNumber(stats.totalContacts)}
                icon={Mail}
                color="accent"
                onClick={() => setActiveTab('contacts')}
              />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-gray-900/80 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-gray-800 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                  <button className="px-3 py-1.5 text-xs bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 rounded-lg transition-all">
                    View All
                  </button>
                </div>
                <div className="p-2">
                  {recentActivities.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-900/80 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-gray-800">
                  <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
                </div>
                <div className="p-5">
                  <div className="space-y-3">
                    <QuickActionCard
                      title="Property Verifications"
                      description="Review and approve pending properties"
                      icon={FileCheck}
                      onClick={() => setActiveTab('verifications')}
                    />
                    <QuickActionCard
                      title="Client Management"
                      description="Manage client relationships and information"
                      icon={Users}
                      onClick={() => setActiveTab('clients')}
                    />
                    <QuickActionCard
                      title="Message Center"
                      description="Handle user inquiries and messages"
                      icon={MessageCircle}
                      onClick={() => setActiveTab('messages')}
                    />
                    <QuickActionCard
                      title="Contact Forms"
                      description="Process contact form submissions"
                      icon={Mail}
                      onClick={() => setActiveTab('contacts')}
                    />
                    <QuickActionCard
                      title="Generate Reports"
                      description="Create and submit activity reports"
                      icon={FileText}
                      onClick={() => setActiveTab('reports')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Tasks and Clients (commented out) */}
            {false && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              {/* Recent Tasks */}
              <div className="table-container">
                <div className="p-6 border-b border-neutral-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-neutral-900">Recent Tasks</h3>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => setActiveTab('tasks')}
                    >
                      View All
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTasks.map((task) => (
                        <tr key={task.id}>
                          <td>
                            <div>
                              <p className="font-medium text-neutral-900">{task.title}</p>
                              <p className="text-sm text-neutral-500">Assigned: {task.assignedDate}</p>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${
                              task.priority === 'high' ? 'badge-error' :
                              task.priority === 'medium' ? 'badge-warning' : 'badge-info'
                            }`}>
                              {task.priority}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${
                              task.status === 'completed' ? 'badge-success' :
                              task.status === 'in-progress' ? 'badge-warning' : 'badge-info'
                            }`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="text-sm text-neutral-500">{task.dueDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Clients */}
              <div className="table-container">
                <div className="p-6 border-b border-neutral-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-neutral-900">Recent Clients</h3>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => setActiveTab('clients')}
                    >
                      View All
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Status</th>
                        <th>Last Contact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentClients.map((client) => (
                        <tr key={client.id}>
                          <td>
                            <div>
                              <p className="font-medium text-neutral-900">{client.name}</p>
                              <p className="text-sm text-neutral-500">{client.email}</p>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${
                              client.status === 'active' ? 'badge-success' :
                              client.status === 'pending' ? 'badge-warning' : 'badge-info'
                            }`}>
                              {client.status}
                            </span>
                          </td>
                          <td className="text-sm text-neutral-500">{client.lastContact}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            )}
          </>
        )}

   {/*      {false && activeTab === 'tasks' && (
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">Task Management</h3>
                <div className="flex items-center gap-2">
                  <button className="btn btn-sm btn-secondary" onClick={fetchDashboardData}>
                    <RefreshCw size={16} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="stats-row">
                <div className="stat-item">
                  <span className="stat-number">{tasks.filter(t => t.priority === 'high').length}</span>
                  <span className="stat-label">High Priority</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{tasks.filter(t => t.status === 'pending').length}</span>
                  <span className="stat-label">Pending</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{tasks.filter(t => t.status === 'completed').length}</span>
                  <span className="stat-label">Completed</span>
                </div>
              </div>
              
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Assigned Date</th>
                      <th>Due Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(task => (
                      <tr key={task.id}>
                        <td className="task-title">{task.title}</td>
                        <td>
                          <span className={`badge ${
                            task.priority === 'high' ? 'badge-error' :
                            task.priority === 'medium' ? 'badge-warning' : 'badge-info'
                          }`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            task.status === 'completed' ? 'badge-success' :
                            task.status === 'in-progress' ? 'badge-warning' : 'badge-info'
                          }`}>
                            {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
                          </span>
                        </td>
                        <td>{task.assignedDate}</td>
                        <td>{task.dueDate}</td>
                        <td>
                          <div className="action-buttons">
                            {task.status === 'pending' && (
                              <button 
                                className="btn btn-sm btn-primary"
                                onClick={() => handleTaskAction(task.id, 'in-progress')}
                              >
                                Start
                              </button>
                            )}
                            {task.status === 'in-progress' && (
                              <button 
                                className="btn btn-sm btn-success"
                                onClick={() => handleTaskAction(task.id, 'completed')}
                              >
                                Complete
                              </button>
                            )}
                            <button className="btn btn-sm btn-secondary">View</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )} */}
{/* 
        {activeTab === 'reports' && (
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">Reports & Documentation</h3>
                <div className="flex items-center gap-2">
                  <button className="btn btn-sm btn-secondary" onClick={fetchDashboardData}>
                    <RefreshCw size={16} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="stats-row">
                <div className="stat-item">
                  <span className="stat-number">{reports.filter(r => r.status === 'completed').length}</span>
                  <span className="stat-label">Completed</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{reports.filter(r => r.status === 'pending').length}</span>
                  <span className="stat-label">Pending</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{reports.filter(r => r.status === 'draft').length}</span>
                  <span className="stat-label">Draft</span>
                </div>
              </div>
              
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Report Title</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Created Date</th>
                      <th>Submitted Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(report => (
                      <tr key={report.id}>
                        <td className="report-title">{report.title}</td>
                        <td>
                          <span className={`badge ${
                            report.type === 'audit' ? 'badge-info' :
                            report.type === 'sales' ? 'badge-success' : 'badge-warning'
                          }`}>
                            {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            report.status === 'completed' ? 'badge-success' :
                            report.status === 'pending' ? 'badge-warning' : 'badge-info'
                          }`}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1).replace('-', ' ')}
                          </span>
                        </td>
                        <td>{report.createdDate}</td>
                        <td>{report.submittedDate || 'Not submitted'}</td>
                        <td>
                          <div className="action-buttons">
                            {report.status === 'draft' && (
                              <button 
                                className="btn btn-sm btn-primary"
                                onClick={() => handleReportAction(report.id, 'pending')}
                              >
                                Edit
                              </button>
                            )}
                            {report.status === 'pending' && (
                              <button 
                                className="btn btn-sm btn-success"
                                onClick={() => handleReportAction(report.id, 'completed')}
                              >
                                Submit
                              </button>
                            )}
                            <button className="btn btn-sm btn-secondary">View</button>
                            <button className="btn btn-sm btn-outline">Download</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )} */}
{/* 
        {false && activeTab === 'clients' && (
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">Client Management</h3>
                <div className="flex items-center gap-2">
                  <button className="btn btn-sm btn-secondary" onClick={fetchDashboardData}>
                    <RefreshCw size={16} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="stats-row">
                <div className="stat-item">
                  <span className="stat-number">{clients.filter(c => c.status === 'active').length}</span>
                  <span className="stat-label">Active Clients</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{clients.reduce((sum, c) => sum + c.assignedProperties, 0)}</span>
                  <span className="stat-label">Total Properties</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{clients.filter(c => c.status === 'completed').length}</span>
                  <span className="stat-label">Completed</span>
                </div>
              </div>
              
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Last Contact</th>
                      <th>Properties</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map(client => (
                      <tr key={client.id}>
                        <td>{client.name}</td>
                        <td>{client.email}</td>
                        <td>{client.phone}</td>
                        <td>
                          <span className={`badge ${
                            client.status === 'active' ? 'badge-success' :
                            client.status === 'pending' ? 'badge-warning' : 'badge-info'
                          }`}>
                            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                          </span>
                        </td>
                        <td>{client.lastContact}</td>
                        <td>{client.assignedProperties}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn btn-sm btn-primary">Contact</button>
                            <button className="btn btn-sm btn-secondary">View</button>
                            <button className="btn btn-sm btn-outline" onClick={() => openEditSchedule(item)}>Edit</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )} */}

        {activeTab === 'schedule' && (
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">Schedule & Appointments</h3>
                <div className="flex items-center gap-2">
                  <button className="btn btn-sm btn-secondary" onClick={fetchDashboardData}>
                    <RefreshCw size={16} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              {isEditingSchedule && (
                <div className="mb-6 p-4 border border-neutral-200 rounded-lg">
                  <h4 className="font-semibold mb-3">Edit Appointment</h4>
                  <form onSubmit={saveEditSchedule} onKeyDown={handleScheduleFormKeyDown} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-neutral-600">Title</label>
                      <input className="setting-input" value={scheduleForm.title} onChange={(e)=>setScheduleForm({...scheduleForm,title:e.target.value})} required />
                    </div>
                    <div>
                      <label className="text-sm text-neutral-600">Type</label>
                      <select className="setting-input" value={scheduleForm.type} onChange={(e)=>setScheduleForm({...scheduleForm,type:e.target.value})}>
                        <option value="inspection">Inspection</option>
                        <option value="meeting">Meeting</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-neutral-600">Date</label>
                      <input type="date" className="setting-input" value={scheduleForm.date} onChange={(e)=>setScheduleForm({...scheduleForm,date:e.target.value})} required />
                    </div>
                    <div>
                      <label className="text-sm text-neutral-600">Time</label>
                      <input type="time" className="setting-input" value={scheduleForm.time} onChange={(e)=>setScheduleForm({...scheduleForm,time:e.target.value})} required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm text-neutral-600">Location</label>
                      <input className="setting-input" value={scheduleForm.location} onChange={(e)=>setScheduleForm({...scheduleForm,location:e.target.value})} />
                    </div>
                    <div>
                      <label className="text-sm text-neutral-600">Contact Name</label>
                      <input className="setting-input" value={scheduleForm.contactName} onChange={(e)=>setScheduleForm({...scheduleForm,contactName:e.target.value})} />
                    </div>
                    <div>
                      <label className="text-sm text-neutral-600">Contact Email</label>
                      <input type="email" className="setting-input" value={scheduleForm.contactEmail} onChange={(e)=>setScheduleForm({...scheduleForm,contactEmail:e.target.value})} />
                    </div>
                    <div>
                      <label className="text-sm text-neutral-600">Contact Phone</label>
                      <input type="tel" className="setting-input" value={scheduleForm.contactPhone} onChange={(e)=>setScheduleForm({...scheduleForm,contactPhone:e.target.value})} />
                    </div>
                    <div className="flex gap-2 md:col-span-2">
                      <button type="submit" className="btn btn-primary">Save</button>
                      <button type="button" className="btn btn-secondary" onClick={()=>setIsEditingSchedule(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}
              <div className="stats-row">
                <div className="stat-item">
                  <span className="stat-number">{schedule.filter(s => s.status === 'scheduled').length}</span>
                  <span className="stat-label">Scheduled</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{schedule.filter(s => s.date === '2024-02-01').length}</span>
                  <span className="stat-label">Today</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{schedule.filter(s => s.status === 'pending').length}</span>
                  <span className="stat-label">Pending</span>
                </div>
              </div>
              
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map(item => (
                      <tr key={item.id}>
                        <td className="schedule-title">{item.title}</td>
                        <td>
                          <span className={`badge ${
                            item.type === 'inspection' ? 'badge-info' :
                            item.type === 'meeting' ? 'badge-primary' : 'badge-warning'
                          }`}>
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </span>
                        </td>
                        <td>{item.date}</td>
                        <td>{item.time}</td>
                        <td>{item.location}</td>
                        <td>
                          <span className={`badge ${
                            item.status === 'scheduled' ? 'badge-success' :
                            item.status === 'pending' ? 'badge-warning' : 'badge-info'
                          }`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {item.status === 'pending' && (
                              <button 
                                className="btn btn-sm btn-success"
                                onClick={() => handleScheduleAction(item.id, 'scheduled')}
                              >
                                Confirm
                              </button>
                            )}
                            {item.status === 'scheduled' && (
                              <button 
                                className="btn btn-sm btn-primary"
                                onClick={() => handleScheduleAction(item.id, 'completed')}
                              >
                                Complete
                              </button>
                            )}
                            <button className="btn btn-sm btn-outline" onClick={() => openEditSchedule(item)}>Edit</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">Message Management</h3>
                <p className="text-sm text-neutral-600">Manage and respond to user messages</p>
              </div>
            </div>
            <div className="card-body">
              <MessageManagement userRole="employee" showStats={true} showActions={true} />
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">Review Management</h3>
                <p className="text-sm text-neutral-600">Manage and moderate user reviews</p>
              </div>
            </div>
            <div className="card-body">
              <ReviewManagement userRole="employee" showStats={true} showActions={true} />
            </div>
          </div>
        )}

        {activeTab === 'selling' && (
          <div className="space-y-8">
            {/* Modern Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-2xl p-8 text-white shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <TrendingUp size={24} className="text-white" />
                      </div>
                      <div>
                        <h1 className="text-3xl lg:text-4xl font-bold">All Selling Properties</h1>
                        <p className="text-blue-100 text-lg">Comprehensive analytics and management of sold properties</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>Live Data</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                        <Building size={16} />
                        <span>{soldProperties.length} Properties Sold</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="btn btn-outline bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white hover:text-white transition-all duration-300">
                      <Filter size={18} className="mr-2" />
                      Filter & Search
                    </button>
                    <button className="btn btn-outline bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white hover:text-white transition-all duration-300">
                      <Download size={18} className="mr-2" />
                      Export Data
                    </button>
                    <button 
                      onClick={fetchSoldPropertiesData}
                      className="btn btn-primary bg-white text-blue-900 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105"
                    >
                      <RefreshCw size={18} className="mr-2" />
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
            </div>

            {/* Modern Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Sold Properties */}
              <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <TrendingUp size={24} className="text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 text-sm font-medium">Total Sold</p>
                    <p className="text-3xl font-bold text-gray-900">{soldProperties.length}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000" 
                    style={{width: `${Math.min((soldProperties.length / 50) * 100, 100)}%`}}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Properties sold this year</p>
              </div>

              {/* Total Revenue */}
              <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <DollarSign size={24} className="text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(soldProperties.reduce((sum, property) => sum + (property.price || 0), 0))}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-1000" 
                    style={{width: `${Math.min((soldProperties.reduce((sum, property) => sum + (property.price || 0), 0) / 10000000) * 100, 100)}%`}}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Revenue generated from sales</p>
              </div>

              {/* Average Sale Price */}
              <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <BarChart3 size={24} className="text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 text-sm font-medium">Avg Sale Price</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {soldProperties.length > 0 ? formatCurrency(Math.round(soldProperties.reduce((sum, property) => sum + (property.price || 0), 0) / soldProperties.length)) : formatCurrency(0)}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000" 
                    style={{
                      width: `${Math.min(
                        soldProperties.length > 0 
                          ? (soldProperties.reduce((sum, property) => sum + (property.price || 0), 0) / soldProperties.length) / 1000000 * 100
                          : 0, 
                        100
                      )}%`
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Average property value</p>
              </div>

              {/* This Month Sales */}
              <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <Calendar size={24} className="text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 text-sm font-medium">This Month</p>
                    <p className="text-3xl font-bold text-gray-900">{(() => {
                      const currentMonth = new Date().getMonth();
                      const currentYear = new Date().getFullYear();
                      return soldProperties.filter(property => {
                        const propertyDate = new Date(property.updatedAt || property.createdAt);
                        return propertyDate.getMonth() === currentMonth && 
                               propertyDate.getFullYear() === currentYear;
                      }).length;
                    })()}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-1000" 
                    style={{
                      width: `${(() => {
                        const currentMonth = new Date().getMonth();
                        const currentYear = new Date().getFullYear();
                        const thisMonthCount = soldProperties.filter(property => {
                          const propertyDate = new Date(property.updatedAt || property.createdAt);
                          return propertyDate.getMonth() === currentMonth && 
                                 propertyDate.getFullYear() === currentYear;
                        }).length;
                        return Math.min(thisMonthCount / 20 * 100, 100);
                      })()}%`
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Sales this month</p>
              </div>
            </div>

            {/* Analytics Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Property Type Distribution */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <PieChart size={24} className="mr-3 text-blue-600" />
                    Property Types
                  </h3>
                  <div className="text-sm text-gray-500">
                    {soldProperties.length} total properties
                  </div>
                </div>
                <div className="space-y-3">
                  {(() => {
                    const typeCounts = {};
                    soldProperties.forEach(property => {
                      const type = property.propertyType || property.type || 'Other';
                      typeCounts[type] = (typeCounts[type] || 0) + 1;
                    });
                    
                    const total = Object.values(typeCounts).reduce((sum, count) => sum + count, 0);
                    const colors = [
                      { bg: 'bg-blue-500', text: 'text-blue-600' },
                      { bg: 'bg-green-500', text: 'text-green-600' },
                      { bg: 'bg-purple-500', text: 'text-purple-600' },
                      { bg: 'bg-orange-500', text: 'text-orange-600' },
                      { bg: 'bg-red-500', text: 'text-red-600' }
                    ];
                    
                    return Object.entries(typeCounts).map(([type, count], index) => {
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      const color = colors[index % colors.length];
                      
                      return (
                        <div key={type} className="group p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full ${color.bg} mr-3`}></div>
                              <span className="font-semibold text-gray-900">{type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-900">{count}</span>
                              <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${color.bg} transition-all duration-1000 group-hover:shadow-sm`}
                              style={{width: `${percentage}%`}}
                            ></div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Price Range Analysis */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <BarChart3 size={24} className="mr-3 text-green-600" />
                    Price Ranges
                  </h3>
                  <div className="text-sm text-gray-500">
                    Distribution by value
                  </div>
                </div>
                <div className="space-y-3">
                  {(() => {
                    const priceRanges = [
                      { label: 'Under 1M ETB', min: 0, max: 1000000, color: { bg: 'bg-green-500', text: 'text-green-600' } },
                      { label: '1M - 5M ETB', min: 1000000, max: 5000000, color: { bg: 'bg-blue-500', text: 'text-blue-600' } },
                      { label: '5M - 10M ETB', min: 5000000, max: 10000000, color: { bg: 'bg-purple-500', text: 'text-purple-600' } },
                      { label: 'Over 10M ETB', min: 10000000, max: Infinity, color: { bg: 'bg-orange-500', text: 'text-orange-600' } }
                    ];
                    
                    const rangeCounts = [];
                    priceRanges.forEach(range => {
                      const count = soldProperties.filter(property => 
                        (property.price || 0) >= range.min && (property.price || 0) < range.max
                      ).length;
                      rangeCounts.push({ ...range, count });
                    });
                    
                    const maxCount = Math.max(...rangeCounts.map(r => r.count));
                    
                    return rangeCounts.map((range, index) => (
                      <div key={range.label} className="group p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">{range.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">{range.count}</span>
                            <span className="text-xs text-gray-500">properties</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${range.color.bg} transition-all duration-1000 group-hover:shadow-sm`}
                            style={{width: `${maxCount > 0 ? (range.count / maxCount) * 100 : 0}%`}}
                          ></div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

            {/* Properties Grid Section */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Building size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Sold Properties</h3>
                    <p className="text-sm text-gray-600">Complete list of all sold properties</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {soldProperties.length} Properties
                  </div>
                  <button className="btn btn-outline btn-sm">
                    <Search size={16} className="mr-2" />
                    Search
                  </button>
                </div>
              </div>

              {soldProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {soldProperties.map((property, index) => (
                    <div 
                      key={property._id} 
                      className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-300 overflow-hidden"
                    >
                      {/* Property Image */}
                      <div className="relative h-48 overflow-hidden">
                        {property.images?.[0] ? (
                              <img
                                src={`${SERVER_BASE_URL}${property.images[0]}`}
                            alt={property.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <Building size={48} className="text-gray-400" />
                          </div>
                        )}
                        
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                            Sold
                          </span>
                        </div>
                        
                        {/* Price Badge */}
                        <div className="absolute bottom-3 left-3">
                          <span className="bg-black/80 backdrop-blur-sm text-white text-sm font-bold px-3 py-1 rounded-lg">
                            {formatCurrency(property.price || 0)}
                          </span>
                        </div>
                      </div>

                      {/* Property Details */}
                      <div className="p-4">
                        {/* Title and Location */}
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                          {property.title || 'Property Title'}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 flex items-center">
                          <MapPin size={14} className="mr-1 text-blue-500" />
                          {property.location || 'Location not specified'}
                        </p>
                        
                        {/* Property Features */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                            <Home size={12} className="mr-1 text-blue-500" />
                            <span>{property.features?.bedrooms || 0} beds</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                            <Bath size={12} className="mr-1 text-green-500" />
                            <span>{property.features?.bathrooms || 0} baths</span>
                          </div>
                          {property.features?.area && (
                            <div className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded col-span-2">
                              <Maximize size={12} className="mr-1 text-purple-500" />
                              <span>{property.features.area} m²</span>
                            </div>
                          )}
                        </div>

                        {/* Property Type */}
                        <div className="mb-3">
                          <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                            {property.propertyType || property.type || 'Property'}
                          </span>
                        </div>

                        {/* Owner Info */}
                        <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center mb-1">
                            <Users size={12} className="mr-1 text-gray-500" />
                            <span className="text-xs font-medium text-gray-700">Owner</span>
                          </div>
                          <p className="text-xs text-gray-600 truncate">
                            {property.owner?.name || 'Owner Name'}
                          </p>
                        </div>

                        {/* Date Sold */}
                        <div className="mb-3 flex items-center text-xs text-gray-500">
                          <Calendar size={12} className="mr-1" />
                          <span>Sold: {property.updatedAt ? new Date(property.updatedAt).toLocaleDateString() : 'N/A'}</span>
                        </div>

                        {/* View Button */}
                        <button 
                          onClick={() => navigate(`/property/${property._id}`)}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                        >
                          <Eye size={16} className="mr-2" />
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sold Properties</h3>
                    <p className="text-gray-600 mb-6">There are currently no sold properties to display.</p>
                    <button 
                      onClick={fetchSoldPropertiesData}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center mx-auto"
                    >
                      <RefreshCw size={16} className="mr-2" />
                      Refresh Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'verifications' && (
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">Property Verifications</h3>
                <p className="text-sm text-neutral-600">Review and approve property listings for publication</p>
              </div>
            </div>
            <div className="card-body">
              <div className="stats-row">
                <div className="stat-item">
                  <span className="stat-number">{verifications.filter(v => v.status === 'pending').length}</span>
                  <span className="stat-label">Pending</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{verifications.filter(v => v.status === 'approved').length}</span>
                  <span className="stat-label">Approved</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{verifications.filter(v => v.status === 'rejected').length}</span>
                  <span className="stat-label">Rejected</span>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                <div className="flex flex-wrap gap-2">
                  <button className={`btn btn-sm ${verificationFilter === 'all' ? 'btn-outline' : 'btn-outline'}`} onClick={() => setVerificationFilter('all')}>All</button>
                  <button className={`btn btn-sm ${verificationFilter === 'pending' ? 'btn-warning' : 'btn-outline'}`} onClick={() => setVerificationFilter('pending')}>Pending</button>
                  <button className={`btn btn-sm ${verificationFilter === 'approved' ? 'btn-success' : 'btn-outline'}`} onClick={() => setVerificationFilter('approved')}>Approved</button>
                  {/* <button className={`btn btn-sm ${verificationFilter === 'rejected' ? 'btn-error' : 'btn-outline'}`} onClick={() => setVerificationFilter('rejected')}>Rejected</button> */}
                </div>
                {actionMessage && (
                  <span className="text-sm text-neutral-600">{actionMessage}</span>
                )}
              </div>

              <div className="table-container overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Owner</th>
                      <th>Price</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(verificationFilter === 'all' ? verifications : verifications.filter(v => v.status === verificationFilter)).map(verification => (
                      <tr key={verification.id}>
                        <td>
                          <div>
                            <p className="font-medium text-neutral-900">{verification.title}</p>
                            <p className="text-sm text-neutral-500">{verification.type}</p>
                          </div>
                        </td>
                        <td>{verification.owner}</td>
                        <td>{formatCurrency(verification.price)}</td>
                        <td>{verification.location}</td>
                        <td>
                          <span className={`badge ${
                            verification.status === 'approved' ? 'badge-success' :
                            verification.status === 'rejected' ? 'badge-error' : 'badge-warning'
                          }`}>
                            {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                          </span>
                        </td>
                        <td>{verification.submittedDate}</td>
                        <td>
                          <div className="action-buttons">
                            {verification.status === 'pending' && (
                              <>
                                <button 
                                  className="btn btn-sm btn-success" 
                                  onClick={() => handleVerifyAction(verification.id, 'approve')}
                                  disabled={processingVerification === verification.id}
                                >
                                  {processingVerification === verification.id ? 'Processing...' : 'Approve'}
                                </button>
                               {/*  <button 
                                  className="btn btn-sm btn-error" 
                                  onClick={() => handleVerifyAction(verification.id, 'reject')}
                                  disabled={processingVerification === verification.id}
                                >
                                  {processingVerification === verification.id ? 'Processing...' : 'Reject'}
                                </button> */}
                              </>
                            )}
                            <button 
                              className="btn btn-sm btn-secondary" 
                              onClick={() => handleVerifyAction(verification.id, 'view')}
                              disabled={processingVerification === verification.id}
                            >
                              View Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/** Inspections tab content commented out **/}

        {activeTab === 'settings' && (
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">Settings</h3>
                <p className="text-sm text-neutral-600">Manage your account and preferences</p>
              </div>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="settings-section">
                  <h4 className="text-lg font-medium text-neutral-900 mb-4">Account Settings</h4>
                  <div className="space-y-4">
                    <div className="setting-item">
                      <label className="setting-label">Full Name</label>
                      <input 
                        type="text" 
                        className="setting-input" 
                        defaultValue={user?.name || ''} 
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="setting-item">
                      <label className="setting-label">Email Address</label>
                      <input 
                        type="email" 
                        className="setting-input" 
                        defaultValue={user?.email || ''} 
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="setting-item">
                      <label className="setting-label">Phone Number</label>
                      <input 
                        type="tel" 
                        className="setting-input" 
                        defaultValue={user?.phone || ''} 
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <button className="btn btn-primary">Update Profile</button>
                  </div>
                </div>
                
                <div className="settings-section">
                  <h4 className="text-lg font-medium text-neutral-900 mb-4">Preferences</h4>
                  <div className="space-y-4">
                    <div className="setting-item">
                      <label className="setting-label">Notification Settings</label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" defaultChecked />
                          Email notifications
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" defaultChecked />
                          SMS notifications
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          Push notifications
                        </label>
                      </div>
                    </div>
                    <div className="setting-item">
                      <label className="setting-label">Language</label>
                      <select className="setting-input">
                        <option value="en">English</option>
                        <option value="am">Amharic</option>
                      </select>
                    </div>
                    <button className="btn btn-secondary">Save Preferences</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900">Contact Forms</h3>
                <p className="text-sm text-neutral-600">Answer inquiries and follow up via messages</p>
              </div>
            </div>
            <div className="card-body">
              <ContactManagement userRole="employee" showStats={true} showActions={true} />
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

