import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Building, Eye } from 'lucide-react';

// Ethiopian-inspired luxury color palette
const COLORS = {
  gold: 'hsl(48, 96%, 53%)',
  goldLight: 'hsl(48, 96%, 70%)',
  green: 'hsl(145, 63%, 32%)',
  greenLight: 'hsl(145, 63%, 50%)',
  red: 'hsl(0, 72%, 51%)',
  redLight: 'hsl(0, 72%, 65%)',
  purple: 'hsl(270, 50%, 50%)',
  blue: 'hsl(210, 80%, 55%)',
};

const PIE_COLORS = [COLORS.gold, COLORS.green, COLORS.red, COLORS.purple, COLORS.blue];

// Custom tooltip with glassmorphism
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-xl border border-gold-400/30 rounded-xl p-4 shadow-2xl shadow-gold-400/10">
        <p className="text-sm font-semibold text-gold-400 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-foreground">
            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
            {entry.name}: <span className="font-bold text-gold-400">{entry.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Monthly Revenue Chart
export const RevenueChart = ({ data }) => {
  const [animationComplete, setAnimationComplete] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const chartData = data || [
    { month: 'Jan', revenue: 45000, sales: 12 },
    { month: 'Feb', revenue: 62000, sales: 18 },
    { month: 'Mar', revenue: 55000, sales: 15 },
    { month: 'Apr', revenue: 78000, sales: 22 },
    { month: 'May', revenue: 89000, sales: 28 },
    { month: 'Jun', revenue: 95000, sales: 32 },
    { month: 'Jul', revenue: 112000, sales: 38 },
    { month: 'Aug', revenue: 98000, sales: 30 },
    { month: 'Sep', revenue: 125000, sales: 42 },
    { month: 'Oct', revenue: 138000, sales: 48 },
    { month: 'Nov', revenue: 145000, sales: 52 },
    { month: 'Dec', revenue: 168000, sales: 58 },
  ];

  return (
    <div className="group relative bg-card/90 backdrop-blur-xl border border-border/40 rounded-2xl p-6 hover:border-gold-400/30 transition-all duration-500 overflow-hidden">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold-400/5 via-transparent to-ethiopian-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground font-serif">Revenue Overview</h3>
            <p className="text-sm text-muted-foreground">Monthly revenue & sales trends</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-ethiopian-green/20 border border-ethiopian-green/30">
            <TrendingUp size={14} className="text-green-400" />
            <span className="text-sm font-semibold text-green-400">+24.5%</span>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.gold} stopOpacity={0.4} />
                <stop offset="95%" stopColor={COLORS.gold} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.green} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue (ETB)"
              stroke={COLORS.gold}
              strokeWidth={3}
              fill="url(#revenueGradient)"
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Property Distribution Pie Chart
export const PropertyDistributionChart = ({ data }) => {
  const chartData = data || [
    { name: 'Houses', value: 45, color: COLORS.gold },
    { name: 'Apartments', value: 30, color: COLORS.green },
    { name: 'Commercial', value: 15, color: COLORS.red },
    { name: 'Land', value: 10, color: COLORS.purple },
  ];

  return (
    <div className="group relative bg-card/90 backdrop-blur-xl border border-border/40 rounded-2xl p-6 hover:border-gold-400/30 transition-all duration-500 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gold-400/5 via-transparent to-ethiopian-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground font-serif">Property Types</h3>
            <p className="text-sm text-muted-foreground">Distribution by category</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400/20 to-gold-500/10 flex items-center justify-center">
            <Building size={20} className="text-gold-500" />
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              animationDuration={1500}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {chartData.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color || PIE_COLORS[index % PIE_COLORS.length] }}
              />
              <span className="text-sm text-muted-foreground">{entry.name}</span>
              <span className="text-sm font-semibold text-foreground">{entry.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// User Growth Chart
export const UserGrowthChart = ({ data }) => {
  const chartData = data || [
    { month: 'Jan', buyers: 120, sellers: 45, agents: 12 },
    { month: 'Feb', buyers: 145, sellers: 52, agents: 15 },
    { month: 'Mar', buyers: 168, sellers: 58, agents: 18 },
    { month: 'Apr', buyers: 195, sellers: 65, agents: 22 },
    { month: 'May', buyers: 230, sellers: 78, agents: 28 },
    { month: 'Jun', buyers: 268, sellers: 92, agents: 32 },
    { month: 'Jul', buyers: 310, sellers: 105, agents: 38 },
    { month: 'Aug', buyers: 345, sellers: 118, agents: 42 },
    { month: 'Sep', buyers: 390, sellers: 132, agents: 48 },
    { month: 'Oct', buyers: 440, sellers: 148, agents: 55 },
    { month: 'Nov', buyers: 485, sellers: 165, agents: 62 },
    { month: 'Dec', buyers: 540, sellers: 185, agents: 70 },
  ];

  return (
    <div className="group relative bg-card/90 backdrop-blur-xl border border-border/40 rounded-2xl p-6 hover:border-gold-400/30 transition-all duration-500 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gold-400/5 via-transparent to-ethiopian-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground font-serif">User Growth</h3>
            <p className="text-sm text-muted-foreground">New registrations by type</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-ethiopian-green/20 border border-ethiopian-green/30">
            <Users size={14} className="text-green-400" />
            <span className="text-sm font-semibold text-green-400">+18.3%</span>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: 20 }}
              iconType="circle"
            />
            <Bar dataKey="buyers" name="Buyers" fill={COLORS.gold} radius={[4, 4, 0, 0]} animationDuration={1500} />
            <Bar dataKey="sellers" name="Sellers" fill={COLORS.green} radius={[4, 4, 0, 0]} animationDuration={1500} />
            <Bar dataKey="agents" name="Agents" fill={COLORS.purple} radius={[4, 4, 0, 0]} animationDuration={1500} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Property Views Chart
export const PropertyViewsChart = ({ data }) => {
  const chartData = data || [
    { day: 'Mon', views: 1200, inquiries: 45 },
    { day: 'Tue', views: 1450, inquiries: 52 },
    { day: 'Wed', views: 1380, inquiries: 48 },
    { day: 'Thu', views: 1620, inquiries: 65 },
    { day: 'Fri', views: 1890, inquiries: 78 },
    { day: 'Sat', views: 2100, inquiries: 92 },
    { day: 'Sun', views: 1750, inquiries: 68 },
  ];

  return (
    <div className="group relative bg-card/90 backdrop-blur-xl border border-border/40 rounded-2xl p-6 hover:border-gold-400/30 transition-all duration-500 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gold-400/5 via-transparent to-ethiopian-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground font-serif">Weekly Activity</h3>
            <p className="text-sm text-muted-foreground">Views & inquiries this week</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400/20 to-gold-500/10 flex items-center justify-center">
            <Eye size={20} className="text-gold-500" />
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="views" 
              name="Views"
              stroke={COLORS.gold} 
              strokeWidth={3}
              dot={{ fill: COLORS.gold, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: COLORS.gold }}
              animationDuration={1500}
            />
            <Line 
              type="monotone" 
              dataKey="inquiries" 
              name="Inquiries"
              stroke={COLORS.green} 
              strokeWidth={3}
              dot={{ fill: COLORS.green, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: COLORS.green }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Sales Performance Chart
export const SalesPerformanceChart = ({ data }) => {
  const chartData = data || [
    { month: 'Jan', target: 50000, actual: 45000 },
    { month: 'Feb', target: 55000, actual: 62000 },
    { month: 'Mar', target: 60000, actual: 55000 },
    { month: 'Apr', target: 65000, actual: 78000 },
    { month: 'May', target: 70000, actual: 89000 },
    { month: 'Jun', target: 80000, actual: 95000 },
  ];

  return (
    <div className="group relative bg-card/90 backdrop-blur-xl border border-border/40 rounded-2xl p-6 hover:border-gold-400/30 transition-all duration-500 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gold-400/5 via-transparent to-ethiopian-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground font-serif">Sales Performance</h3>
            <p className="text-sm text-muted-foreground">Target vs actual sales</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-ethiopian-green/20 border border-ethiopian-green/30">
            <DollarSign size={14} className="text-green-400" />
            <span className="text-sm font-semibold text-green-400">+15.2%</span>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 20 }} iconType="circle" />
            <Bar dataKey="target" name="Target" fill={COLORS.gold} opacity={0.5} radius={[4, 4, 0, 0]} animationDuration={1500} />
            <Bar dataKey="actual" name="Actual" fill={COLORS.green} radius={[4, 4, 0, 0]} animationDuration={1500} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Sold Properties Chart for Admin Dashboard
export const SoldPropertiesChart = ({ properties = [] }) => {
  // Group sold properties by month
  const monthlyData = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    const grouped = months.map((month, index) => {
      const monthProperties = properties.filter(p => {
        const soldDate = new Date(p.soldAt || p.updatedAt || p.createdAt);
        return soldDate.getMonth() === index && soldDate.getFullYear() === currentYear;
      });
      
      const totalValue = monthProperties.reduce((sum, p) => sum + (p.price || 0), 0);
      
      return {
        month,
        count: monthProperties.length,
        value: totalValue,
      };
    });
    
    return grouped;
  }, [properties]);

  return (
    <div className="group relative bg-card/90 backdrop-blur-xl border border-border/40 rounded-2xl p-6 hover:border-gold-400/30 transition-all duration-500 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gold-400/5 via-transparent to-ethiopian-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground font-serif">Sold Properties</h3>
            <p className="text-sm text-muted-foreground">Monthly sales & value</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gold-400" />
              <span className="text-muted-foreground">Count</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-ethiopian-green" />
              <span className="text-muted-foreground">Value</span>
            </div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="soldCountGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.gold} stopOpacity={0.4} />
                <stop offset="95%" stopColor={COLORS.gold} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              name="Properties Sold"
              stroke={COLORS.gold}
              strokeWidth={3}
              fill="url(#soldCountGradient)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default {
  RevenueChart,
  PropertyDistributionChart,
  UserGrowthChart,
  PropertyViewsChart,
  SalesPerformanceChart,
  SoldPropertiesChart,
};
