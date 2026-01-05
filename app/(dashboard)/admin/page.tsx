'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, FileCheck, Calendar, AlertTriangle, DollarSign, 
  TrendingUp, Clock, CheckCircle, XCircle, Eye 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  pendingVerifications: number;
  activeBookings: number;
  openDisputes: number;
  totalRevenue: number;
  monthlyGrowth: number;
  activeProviders: number;
  activeClients: number;
  completedBookings: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    pendingVerifications: 0,
    activeBookings: 0,
    openDisputes: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    activeProviders: 0,
    activeClients: 0,
    completedBookings: 0
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    trend, 
    onClick 
  }: any) => (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border-2 p-6 hover:shadow-md transition cursor-pointer ${
        color === 'red' ? 'border-red-200' : 
        color === 'blue' ? 'border-blue-200' :
        color === 'green' ? 'border-green-200' :
        'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="text-3xl font-bold mt-2 text-gray-900">{value}</h3>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${
              trend > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp size={16} className="mr-1" />
              <span>{Math.abs(trend)}% vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${
          color === 'red' ? 'bg-red-100' : 
          color === 'blue' ? 'bg-blue-100' :
          color === 'green' ? 'bg-green-100' :
          'bg-gray-100'
        }`}>
          <Icon className={
            color === 'red' ? 'text-red-600' : 
            color === 'blue' ? 'text-blue-600' :
            color === 'green' ? 'text-green-600' :
            'text-gray-600'
          } size={24} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className=" border-b">
        <div className="px-4 py-6">
          <div className="flex items-center justify-end">
          
            <div className="flex items-center space-x-4">
             
              {/* <Button className="px-4 py-2 text-sm font-medium bg-jiko-primary text-white rounded-lg hover:bg-jiko-primary/80 transition">
                Generate Report
              </Button> */}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 py-8">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Pending Verifications"
            value={stats.pendingVerifications}
            icon={FileCheck}
            color="red"
            onClick={() => router.push('/admin/verifications')}
          />
          <StatCard
            title="Active Bookings"
            value={stats.activeBookings}
            icon={Calendar}
            color="blue"
            onClick={() => router.push('/admin/bookings')}
          />
          <StatCard
            title="Open Disputes"
            value={stats.openDisputes}
            icon={AlertTriangle}
            color="red"
            onClick={() => router.push('/admin/disputes')}
          />
          <StatCard
            title="Monthly Revenue"
            value={`KSH ${stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="green"
            trend={stats.monthlyGrowth}
            onClick={() => router.push('/admin/revenue')}
          />
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Active Providers"
            value={stats.activeProviders}
            icon={Users}
            color="blue"
            onClick={() => router.push('/admin/users?role=PROFESSIONAL')}
          />
          <StatCard
            title="Active Clients"
            value={stats.activeClients}
            icon={Users}
            color="blue"
            onClick={() => router.push('/admin/users?role=CLIENT')}
          />
          <StatCard
            title="Completed Bookings"
            value={stats.completedBookings}
            icon={CheckCircle}
            color="green"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/admin/verifications')}
              className="cursor-pointer p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition text-center"
            >
              <FileCheck className="mx-auto mb-2 text-gray-600" size={32} />
              <span className="text-sm font-medium text-gray-700">Review Verifications</span>
            </button>
            <button
              onClick={() => router.push('/admin/bookings')}
              className="cursor-pointer p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition text-center"
            >
              <Calendar className="mx-auto mb-2 text-gray-600" size={32} />
              <span className="text-sm font-medium text-gray-700">Monitor Bookings</span>
            </button>
            <button
              onClick={() => router.push('/admin/disputes')}
              className="cursor-pointer p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-red-400 hover:bg-red-50 transition text-center"
            >
              <AlertTriangle className="mx-auto mb-2 text-gray-600" size={32} />
              <span className="text-sm font-medium text-gray-700">Resolve Disputes</span>
            </button>
            <button
              onClick={() => router.push('/admin/audit-logs')}
              className="cursor-pointer p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition text-center"
            >
              <Eye className="mx-auto mb-2 text-gray-600" size={32} />
              <span className="text-sm font-medium text-gray-700">View Audit Logs</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        {/* <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <Button variant={'link'} className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
              View All
            </Button>
          </div>
          <div className="space-y-3">
            <ActivityItem
              icon={<CheckCircle className="text-green-600" size={20} />}
              title="Provider verified"
              description="John Doe's documents approved"
              time="5 minutes ago"
            />
            <ActivityItem
              icon={<Calendar className="text-blue-600" size={20} />}
              title="New booking created"
              description="Cleaning service booked for tomorrow"
              time="12 minutes ago"
            />
            <ActivityItem
              icon={<AlertTriangle className="text-orange-600" size={20} />}
              title="Dispute opened"
              description="Client reported service quality issue"
              time="1 hour ago"
            />
            <ActivityItem
              icon={<XCircle className="text-red-600" size={20} />}
              title="Provider rejected"
              description="Incomplete documentation"
              time="2 hours ago"
            />
          </div>
        </div> */}
      </div>
    </div>
  );
}

function ActivityItem({ icon, title, description, time }: any) {
  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition">
      <div className="flex-shrink-0 mt-1">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <span className="text-xs text-gray-500 whitespace-nowrap">{time}</span>
    </div>
  );
}