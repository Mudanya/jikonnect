'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Settings, DollarSign, Bell, Shield, 
  Mail, Database, Save, AlertCircle, CheckCircle, 
  Map,
  BriefcaseBusiness
} from 'lucide-react';
import AdminServicesPage from '@/components/dashboard/AdminServicesPage';
import AdminLocationsPage from '@/components/locations/AdminLocationsPage';

interface SystemConfig {
  platform: {
    commissionRate: number;
    minBookingAmount: number;
    maxBookingAmount: number;
    platformName: string;
    supportEmail: string;
    supportPhone: string;
  };
  payments: {
    mpesaEnabled: boolean;
    mpesaShortcode: string;
    mpesaEnvironment: 'sandbox' | 'production';
    autoPayoutEnabled: boolean;
    payoutThreshold: number;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    bookingConfirmation: boolean;
    paymentReceipts: boolean;
    reminderHours: number;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    requireEmailVerification: boolean;
    requirePhoneVerification: boolean;
    twoFactorEnabled: boolean;
  };

}

export default function SystemConfigPage() {
  const router = useRouter();
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'platform' | 'payments' | 'notifications' | 'security' | 'services' |'locations'>('platform');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/config', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Configuration saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      setMessage({ type: 'error', text: 'Failed to save configuration' });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (section: keyof SystemConfig, field: string, value: any) => {
    if (!config) return;
    setConfig({
      ...config,
      [section]: {
        ...config[section],
        [field]: value
      }
    });
  };

  if (loading || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jiko-primary/90"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'platform', label: 'Platform', icon: Settings },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'services', label: 'Services', icon: BriefcaseBusiness },
    { id: 'locations', label: 'Locations', icon: Map },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b mt-4 rounded-lg">
        <div className="  px-4 py-4">
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
              <p className="text-gray-600 mt-1">Manage platform settings and preferences</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 bg-jiko-primary/90 text-white rounded-xl font-bold hover:bg-jiko-primary/95 disabled:opacity-50 transition"
            >
              <Save size={20} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className=" mx-auto px-4 py-8">
        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tabs Sidebar */}
          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition ${
                    activeTab === tab.id
                      ? 'bg-jiko-primary/90 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-md border p-6">
            {/* Platform Settings */}
            {activeTab === 'platform' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Platform Settings</h2>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Platform Name
                  </label>
                  <input
                    type="text"
                    value={config.platform.platformName}
                    onChange={(e) => updateConfig('platform', 'platformName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-jiko-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Commission Rate (%)
                    </label>
                    <input
                      type="number"
                      value={config.platform.commissionRate}
                      onChange={(e) => updateConfig('platform', 'commissionRate', parseFloat(e.target.value))}
                      step="0.1"
                      min="0"
                      max="100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-jiko-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Min Booking Amount (KES)
                    </label>
                    <input
                      type="number"
                      value={config.platform.minBookingAmount}
                      onChange={(e) => updateConfig('platform', 'minBookingAmount', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-jiko-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Booking Amount (KES)
                  </label>
                  <input
                    type="number"
                    value={config.platform.maxBookingAmount}
                    onChange={(e) => updateConfig('platform', 'maxBookingAmount', parseFloat(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-jiko-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={config.platform.supportEmail}
                      onChange={(e) => updateConfig('platform', 'supportEmail', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-jiko-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Support Phone
                    </label>
                    <input
                      type="tel"
                      value={config.platform.supportPhone}
                      onChange={(e) => updateConfig('platform', 'supportPhone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-jiko-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Settings */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Settings</h2>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-gray-900">M-Pesa Integration</p>
                    <p className="text-sm text-gray-600">Enable M-Pesa payments</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.payments.mpesaEnabled}
                      onChange={(e) => updateConfig('payments', 'mpesaEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-jiko-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-jiko-primary/90"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    M-Pesa Shortcode
                  </label>
                  <input
                    type="text"
                    value={config.payments.mpesaShortcode}
                    onChange={(e) => updateConfig('payments', 'mpesaShortcode', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-jiko-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Environment
                  </label>
                  <select
                    value={config.payments.mpesaEnvironment}
                    onChange={(e) => updateConfig('payments', 'mpesaEnvironment', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-jiko-primary"
                  >
                    <option value="sandbox">Sandbox (Testing)</option>
                    <option value="production">Production (Live)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-gray-900">Auto Payouts</p>
                    <p className="text-sm text-gray-600">Automatically process provider payouts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.payments.autoPayoutEnabled}
                      onChange={(e) => updateConfig('payments', 'autoPayoutEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-jiko-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-jiko-primary/90"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payout Threshold (KES)
                  </label>
                  <input
                    type="number"
                    value={config.payments.payoutThreshold}
                    onChange={(e) => updateConfig('payments', 'payoutThreshold', parseFloat(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-jiko-primary"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Minimum balance required before automatic payout
                  </p>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-600">Send notifications via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.notifications.emailEnabled}
                        onChange={(e) => updateConfig('notifications', 'emailEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-jiko-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-jiko-primary/90"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-900">SMS Notifications</p>
                      <p className="text-sm text-gray-600">Send notifications via SMS</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.notifications.smsEnabled}
                        onChange={(e) => updateConfig('notifications', 'smsEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-jiko-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-jiko-primary/90"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-900">Push Notifications</p>
                      <p className="text-sm text-gray-600">Send push notifications to mobile apps</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.notifications.pushEnabled}
                        onChange={(e) => updateConfig('notifications', 'pushEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-jiko-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-jiko-primary/90"></div>
                    </label>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Notification Types</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Booking Confirmations</span>
                      <input
                        type="checkbox"
                        checked={config.notifications.bookingConfirmation}
                        onChange={(e) => updateConfig('notifications', 'bookingConfirmation', e.target.checked)}
                        className="w-5 h-5 text-jiko-primary/90 rounded focus:ring-2 focus:ring-jiko-primary"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Payment Receipts</span>
                      <input
                        type="checkbox"
                        checked={config.notifications.paymentReceipts}
                        onChange={(e) => updateConfig('notifications', 'paymentReceipts', e.target.checked)}
                        className="w-5 h-5 text-jiko-primary/90 rounded focus:ring-2 focus:ring-jiko-primary"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reminder Hours Before Booking
                  </label>
                  <input
                    type="number"
                    value={config.notifications.reminderHours}
                    onChange={(e) => updateConfig('notifications', 'reminderHours', parseInt(e.target.value))}
                    min="1"
                    max="48"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-jiko-primary"
                  />
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h2>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={config.security.sessionTimeout}
                    onChange={(e) => updateConfig('security', 'sessionTimeout', parseInt(e.target.value))}
                    min="15"
                    max="1440"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-jiko-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    value={config.security.maxLoginAttempts}
                    onChange={(e) => updateConfig('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    min="3"
                    max="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-jiko-primary"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-900">Email Verification Required</p>
                      <p className="text-sm text-gray-600">Users must verify email to use platform</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.security.requireEmailVerification}
                        onChange={(e) => updateConfig('security', 'requireEmailVerification', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-jiko-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-jiko-primary/90"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-900">Phone Verification Required</p>
                      <p className="text-sm text-gray-600">Users must verify phone to use platform</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.security.requirePhoneVerification}
                        onChange={(e) => updateConfig('security', 'requirePhoneVerification', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-jiko-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-jiko-primary/90"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Enable 2FA for admin accounts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.security.twoFactorEnabled}
                        onChange={(e) => updateConfig('security', 'twoFactorEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-jiko-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-jiko-primary/90"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Verification Settings */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <AdminServicesPage />
              </div>
            )}
            {activeTab === 'locations' && (
              <div className="space-y-6">
                <AdminLocationsPage />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}