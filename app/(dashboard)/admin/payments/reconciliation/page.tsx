'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { DollarSign, TrendingUp, CheckCircle, XCircle, Clock, Download, Filter } from 'lucide-react';

export default function PaymentReconciliationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.push('/dashboard');
    } else {
      loadReconciliationData();
    }
  }, [user, dateRange]);

  const loadReconciliationData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `/api/admin/payments/reconciliations?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to load reconciliation:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!data) return;

    const headers = ['Date', 'Booking #', 'Client', 'Provider', 'Service', 'Amount', 'Commission', 'Payout', 'Status', 'M-Pesa Code'];
    const rows = data.payments.map((p: any) => [
      new Date(p.createdAt).toLocaleDateString(),
      p.booking.bookingNumber,
      `${p.booking.client.firstName} ${p.booking.client.lastName}`,
      `${p.booking.provider.firstName} ${p.booking.provider.lastName}`,
      p.booking.service,
      p.amount,
      p.booking.commission,
      p.booking.providerPayout,
      p.status,
      p.mpesaCode || '-'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-reconciliation-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      

      <div className="px-4 py-8">
        {/* Date Range Filter */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Filter size={20} className="text-gray-600" />
              <div>
                <label className="text-sm font-medium text-gray-700 mr-2">From:</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mr-2">To:</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
            >
              <Download size={20} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Revenue</span>
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              KES {data?.summary.totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">{data?.summary.paidPayments} paid transactions</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Platform Commission</span>
              <DollarSign className="text-blue-600" size={20} />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              KES {data?.summary.totalCommission.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">10% of revenue</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Provider Payouts</span>
              <CheckCircle className="text-purple-600" size={20} />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              KES {data?.summary.totalProviderPayouts.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Due to providers</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Pending Payments</span>
              <Clock className="text-yellow-600" size={20} />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {data?.summary.pendingPayments}
            </div>
            <div className="text-sm text-gray-500">{data?.summary.failedPayments} failed</div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">M-Pesa Code</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.payments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.booking.bookingNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.booking.client.firstName} {payment.booking.client.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.booking.provider.firstName} {payment.booking.provider.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      KES {Number(payment.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      KES {Number(payment.booking.commission).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        payment.status === 'PAID' ? 'bg-green-100 text-green-800' :
                        payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                      {payment.mpesaCode || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}