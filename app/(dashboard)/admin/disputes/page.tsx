// app/admin/disputes/page.tsx - UPDATED FOR NEW MESSAGE SYSTEM
'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, MessageSquare, Send, 
  CheckCircle, XCircle, Loader
} from 'lucide-react';
import { toast } from 'sonner';

interface DisputeMessage {
  id: string;
  senderType: 'CLIENT' | 'PROVIDER' | 'ADMIN' | 'SUPER_ADMIN';
  content: string;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    role: string;
  };
}

interface Dispute {
  id: string;
  reason: string;
  resolution: string | null;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  booking: {
    id: string;
    bookingNumber: string;
    service: string;
    amount: number;
    scheduledDate: string;
    client: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      avatar: string | null;
    };
    provider: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      avatar: string | null;
    };
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  messages: DisputeMessage[];
}

export default function DisputeResolutionPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [disputesStats, setDisputesStats] = useState<Dispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('OPEN');
  const [newMessage, setNewMessage] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDisputes();
  }, [statusFilter]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedDispute?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const responseStats = await fetch(`/api/admin/disputes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (responseStats.ok) {
        const dataStats = await responseStats.json();
        setDisputesStats(dataStats.disputes);
      }
      const response = await fetch(`/api/admin/disputes?status=${statusFilter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDisputes(data.disputes);
        
        // Update selected dispute if it's in the new data
        if (selectedDispute) {
          const updated = data.disputes.find((d: Dispute) => d.id === selectedDispute.id);
          if (updated) setSelectedDispute(updated);
        }
      }
    } catch (error) {
      console.error('Failed to load disputes:', error);
      toast.error('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedDispute || sending) return;
    
    setSending(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/disputes/${selectedDispute.id}/message`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: newMessage })
      });
      
      if (response.ok) {
        setNewMessage('');
        await loadDisputes(); // Reload to get updated messages
        toast.success('Message sent');
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleResolveDispute = async (resolution: 'CLIENT_FAVOR' | 'PROVIDER_FAVOR' | 'MUTUAL') => {
    if (!resolutionNote.trim()) {
      toast.warning('Please provide resolution notes');
      return;
    }
    
    if (!confirm('Are you sure you want to resolve this dispute?')) return;
    
    setProcessing(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/disputes/${selectedDispute?.id}/resolve`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          resolution,
          notes: resolutionNote 
        })
      });
      
      if (response.ok) {
        await loadDisputes();
        setSelectedDispute(null);
        setResolutionNote('');
        toast.success('Dispute resolved successfully');
      } else {
        toast.error('Failed to resolve dispute');
      }
    } catch (error) {
      console.error('Failed to resolve dispute:', error);
      toast.error('Failed to resolve dispute');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-100 text-red-700';
      case 'IN_REVIEW': return 'bg-orange-100 text-orange-700';
      case 'RESOLVED': return 'bg-green-100 text-green-700';
      case 'CLOSED': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSenderName = (message: DisputeMessage, dispute: Dispute) => {
    return `${message.sender.firstName} ${message.sender.lastName}`;
  };

  const getSenderBadge = (senderType: 'CLIENT' | 'PROVIDER' | 'ADMIN' | 'SUPER_ADMIN') => {
    const badges = {
      CLIENT: 'bg-blue-100 text-blue-800',
      PROVIDER: 'bg-purple-100 text-purple-800',
      ADMIN: 'bg-green-100 text-green-800',
      SUPER_ADMIN: 'bg-yellow-100 text-yellow-800'
    };
    return badges[senderType];
  };

  const stats = {
    open: disputesStats.filter(d => d.status === 'OPEN').length,
    inReview: disputesStats.filter(d => d.status === 'IN_REVIEW').length,
    resolved: disputesStats.filter(d => d.status === 'RESOLVED').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dispute Resolution</h1>
              <p className="text-gray-600 mt-1">{disputes.length} disputes</p>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="OPEN">Open</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-2">Open Disputes</p>
            <p className="text-3xl font-bold text-red-600">{stats.open}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-2">In Review</p>
            <p className="text-3xl font-bold text-orange-600">{stats.inReview}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-2">Resolved</p>
            <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Disputes List */}
          <div className="space-y-4">
            {disputes.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <AlertTriangle className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No disputes found</h3>
                <p className="text-gray-600">No disputes with status: {statusFilter}</p>
              </div>
            ) : (
              disputes.map((dispute) => (
                <div
                  key={dispute.id}
                  onClick={() => setSelectedDispute(dispute)}
                  className={`bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition ${
                    selectedDispute?.id === dispute.id
                      ? 'border-red-500 ring-2 ring-red-200'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="text-red-600" size={24} />
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{dispute.reason}</h3>
                        <p className="text-sm text-gray-600">#{dispute.booking.bookingNumber}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                      {dispute.status}
                    </span>
                  </div>

                  {/* Parties */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <img
                        src={dispute.booking.client.avatar || '/avatar-placeholder.png'}
                        alt={dispute.booking.client.firstName}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm font-medium">
                        {dispute.booking.client.firstName}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">vs</span>
                    <div className="flex items-center space-x-2">
                      <img
                        src={dispute.booking.provider.avatar || '/avatar-placeholder.png'}
                        alt={dispute.booking.provider.firstName}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm font-medium">
                        {dispute.booking.provider.firstName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center">
                      <MessageSquare size={14} className="mr-1" />
                      {dispute?.messages?.length} messages
                    </span>
                    <span>{new Date(dispute.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Dispute Details & Chat */}
          <div className="lg:sticky lg:top-8">
            {selectedDispute ? (
              <div className="bg-white rounded-xl shadow-sm border">
                {/* Header */}
                <div className="p-6 border-b">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedDispute.reason}</h2>
                      <p className="text-sm text-gray-600">
                        Booking #{selectedDispute.booking.bookingNumber}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDispute.status)}`}>
                      {selectedDispute.status}
                    </span>
                  </div>

                  {/* Raised By */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Raised by:</p>
                    <p className="font-medium">
                      {selectedDispute.user.firstName} {selectedDispute.user.lastName}
                      <span className="ml-2 text-xs text-gray-500">
                        ({selectedDispute.user.id === selectedDispute.booking.client.id ? 'Client' : 'Provider'})
                      </span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Service</p>
                      <p className="font-medium">{selectedDispute.booking.service}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Amount</p>
                      <p className="font-medium">KES {selectedDispute.booking.amount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="p-6 border-b max-h-96 overflow-y-auto">
                  <h3 className="font-semibold text-gray-900 mb-4">Conversation</h3>
                  <div className="space-y-4">
                    {selectedDispute?.messages?.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex ${msg.senderType === 'ADMIN' || msg.senderType === 'SUPER_ADMIN' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${
                          msg.senderType === 'ADMIN' || msg.senderType === 'SUPER_ADMIN'
                            ? 'bg-green-50 border-green-200' 
                            : msg.senderType === 'CLIENT'
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-purple-50 border-purple-200'
                        } border rounded-xl p-4`}>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getSenderBadge(msg.senderType)}`}>
                              {msg.senderType}
                            </span>
                            <span className="text-xs font-medium text-gray-700">
                              {getSenderName(msg, selectedDispute)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900">{msg.content}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(msg.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message Input */}
                {(selectedDispute.status === 'OPEN' || selectedDispute.status === 'IN_REVIEW') && (
                  <div className="p-6 border-b">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !sending && handleSendMessage()}
                        placeholder="Type your message as admin..."
                        disabled={sending}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition flex items-center space-x-2"
                      >
                        {sending ? (
                          <Loader size={20} className="animate-spin" />
                        ) : (
                          <Send size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Resolution Section */}
                {(selectedDispute.status === 'OPEN' || selectedDispute.status === 'IN_REVIEW') && (
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Resolve Dispute</h3>
                    <textarea
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      rows={3}
                      placeholder="Enter resolution notes..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    />
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <button
                        onClick={() => handleResolveDispute('CLIENT_FAVOR')}
                        disabled={processing}
                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                      >
                        <CheckCircle size={18} />
                        <span>Client Favor</span>
                      </button>
                      <button
                        onClick={() => handleResolveDispute('PROVIDER_FAVOR')}
                        disabled={processing}
                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition"
                      >
                        <CheckCircle size={18} />
                        <span>Provider Favor</span>
                      </button>
                    </div>
                    <button
                      onClick={() => handleResolveDispute('MUTUAL')}
                      disabled={processing}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 transition"
                    >
                      <CheckCircle size={18} />
                      <span>Mutual Agreement</span>
                    </button>
                  </div>
                )}

                {/* Resolution Display */}
                {selectedDispute.resolution && (
                  <div className="p-6 bg-green-50 border-t border-green-200">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="text-green-600 mt-1" size={20} />
                      <div>
                        <h4 className="font-semibold text-green-900 mb-1">Resolved</h4>
                        <p className="text-sm text-green-800">{selectedDispute.resolution}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <AlertTriangle className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a dispute</h3>
                <p className="text-gray-600">Choose a dispute to view details and messages</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}