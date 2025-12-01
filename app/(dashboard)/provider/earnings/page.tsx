'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Download, Calendar, TrendingUp, Loader } from 'lucide-react';

interface EarningsData {
  summary: {
    totalEarnings: number;
    totalCommission: number;
    totalAmount: number;
    bookingsCount: number;
  };
  bookings: Array<{
    id: string;
    service: string;
    amount: number;
    providerPayout: number;
    commission: number;
    completedAt: string;
    client: {
      firstName: string;
      lastName: string;
    };
  }>;
}

export default function EarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'all' | 'month' | 'week'>('all');

  useEffect(() => {
    loadEarnings();
  }, [period]);

  const loadEarnings = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/provider/earnings?period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to load earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!data) return;

    const headers = ['Date', 'Client', 'Service', 'Total Amount', 'Commission', 'Your Payout'];
    const rows = data.bookings.map(booking => [
      new Date(booking.completedAt).toLocaleDateString(),
      `${booking.client.firstName} ${booking.client.lastName}`,
      booking.service,
      `KSH ${booking.amount}`,
      `KSH ${booking.commission}`,
      `KSH ${booking.providerPayout}`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen ">
      <div className="px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Earnings Breakdown</h1>
            <p className="text-gray-600 mt-1">Track your income and commissions</p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
          >
            <Download size={20} />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Period Filter */}
        <div className="flex space-x-2 mb-8">
          {['all', 'month', 'week'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as any)}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {p === 'all' ? 'All Time' : p === 'month' ? 'This Month' : 'This Week'}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            title="Total Earnings"
            value={`KSH ${data.summary.totalEarnings.toLocaleString()}`}
            icon={DollarSign}
            color="green"
          />
          <SummaryCard
            title="Platform Commission"
            value={`KSH ${data.summary.totalCommission.toLocaleString()}`}
            icon={TrendingUp}
            color="orange"
          />
          <SummaryCard
            title="Total Revenue"
            value={`KSH ${data.summary.totalAmount.toLocaleString()}`}
            icon={DollarSign}
            color="blue"
          />
          <SummaryCard
            title="Completed Jobs"
            value={data.summary.bookingsCount}
            icon={Calendar}
            color="purple"
          />
        </div>

        {/* Earnings Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
          </div>
          
          {data.bookings.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No earnings yet</h3>
              <p className="text-gray-600">Complete jobs to start earning</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Client</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Service</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Total</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Commission</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Your Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(booking.completedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {booking.client.firstName} {booking.client.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {booking.service}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">
                        KSH {booking.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-orange-600">
                        -KSH {booking.commission.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-bold text-green-600">
                        KSH {booking.providerPayout.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2">
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-sm font-bold text-gray-900">
                      Total ({data.summary.bookingsCount} jobs)
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">
                      KSH {data.summary.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-orange-600">
                      -KSH {data.summary.totalCommission.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-green-600">
                      KSH {data.summary.totalEarnings.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, color }: any) {
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold mt-2 text-gray-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}