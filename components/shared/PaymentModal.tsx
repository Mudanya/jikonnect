'use client';

import React, { useState, useEffect } from 'react';
import { X, Phone, CreditCard, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface PaymentModalProps {
  booking: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ booking, isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [message, setMessage] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');

  useEffect(() => {
    if (status === 'processing' && checkoutRequestId) {
      const interval = setInterval(() => {
        checkPaymentStatus();
      }, 3000); // Check every 3 seconds

      return () => clearInterval(interval);
    }
  }, [status, checkoutRequestId]);

  const checkPaymentStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/payments/status/${checkoutRequestId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        if (data.data.status === 'PAID') {
          setStatus('success');
          setMessage('Payment successful!');
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 2000);
        } else if (data.data.status === 'FAILED') {
          setStatus('failed');
          setMessage(data.data.failureReason || 'Payment failed');
        }
      }
    } catch (error) {
      console.error('Status check error:', error);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setStatus('processing');
    setMessage('Initiating payment...');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId: booking.id,
          phoneNumber
        })
      });

      const data = await response.json();

      if (data.success) {
        setCheckoutRequestId(data.data.checkoutRequestId);
        setMessage('Check your phone for M-Pesa prompt...');
      } else {
        setStatus('failed');
        setMessage(data.message || 'Payment initiation failed');
      }
    } catch (error) {
      setStatus('failed');
      setMessage('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Make Payment</h3>
          <button
            onClick={onClose}
            disabled={status === 'processing'}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {status === 'idle' && (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4">
                <span className="text-gray-600">Service</span>
                <span className="font-semibold">{booking.service}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4">
                <span className="text-gray-600">Duration</span>
                <span className="font-semibold">{booking.duration}h</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <span className="text-gray-600 font-medium">Total Amount</span>
                <span className="text-2xl font-bold text-blue-600">
                  KES {Number(booking.amount).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                M-Pesa Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="254712345678"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Enter number in format: 254XXXXXXXXX</p>
            </div>

            <button
              onClick={handlePayment}
              disabled={!phoneNumber || loading}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <CreditCard size={20} />
              <span>{loading ? 'Processing...' : 'Pay with M-Pesa'}</span>
            </button>
          </>
        )}

        {status === 'processing' && (
          <div className="text-center py-8">
            <Loader className="animate-spin mx-auto text-blue-600 mb-4" size={48} />
            <p className="text-lg font-semibold text-gray-900 mb-2">{message}</p>
            <p className="text-sm text-gray-600">Please enter your M-Pesa PIN on your phone</p>
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-sm text-yellow-800">
                💡 <strong>Tip:</strong> If you don't receive the prompt, dial *334# to check M-Pesa notifications
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto text-green-600 mb-4" size={64} />
            <h4 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h4>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto text-red-600 mb-4" size={64} />
            <h4 className="text-xl font-bold text-gray-900 mb-2">Payment Failed</h4>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => {
                setStatus('idle');
                setMessage('');
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}