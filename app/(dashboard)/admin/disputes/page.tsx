'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AlertTriangle, ArrowLeft, MessageSquare, User, 
  CheckCircle, XCircle, Clock, Send, FileText 
} from 'lucide-react';

interface Dispute {
  id: string;
  booking: {
    id: string;
    scheduledFor: string;
    price: number;
  };
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatarUrl: string;
  };
  provider: {
    id: string;
    name: string;
    title: string;
    avatarUrl: string;
  };
  reason: string;
  description: string;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';
  resolution?: string;
  createdAt: string;
  messages: Array<{
    id: string;
    sender: 'CLIENT' | 'PROVIDER' | 'ADMIN';
    senderName: string;
    message: string;
    createdAt: string;
  }>;
}

export default function DisputeResolutionPage() {
  const router = useRouter();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('OPEN');
  const [newMessage, setNewMessage] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadDisputes();
  }, [statusFilter]);

  const loadDisputes = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/disputes?status=${statusFilter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDisputes(data.disputes);
      }
    } catch (error) {
      console.error('Failed to load disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedDispute) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/disputes/${selectedDispute.id}/message`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: newMessage })
      });

      if (response.ok) {
        setNewMessage('');
        // Reload dispute to get updated messages
        const updatedResponse = await fetch(`/api/admin/disputes/${selectedDispute.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await updatedResponse.json();
        setSelectedDispute(data.dispute);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleResolveDispute = async (resolution: 'CLIENT_FAVOR' | 'PROVIDER_FAVOR' | 'MUTUAL') => {
    if (!resolutionNote.trim()) {
      alert('Please provide resolution notes');
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
        alert('Dispute resolved successfully');
      }
    } catch (error) {
      console.error('Failed to resolve dispute:', error);
      alert('Failed to resolve dispute');
    } finally {
      setProcessing(false);
    }
  };

  const handleCloseDispute = async () => {
    if (!confirm('Are you sure you want to close this dispute without resolution?')) return;

    setProcessing(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/disputes/${selectedDispute?.id}/close`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await loadDisputes();
        setSelectedDispute(null);
        alert('Dispute closed');
      }
    } catch (error) {
      console.error('Failed to close dispute:', error);
      alert('Failed to close dispute');
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

  const stats = {
    open: disputes.filter(d => d.status === 'OPEN').length,
    inReview: disputes.filter(d => d.status === 'IN_REVIEW').length,
    resolved: disputes.filter(d => d.status === 'RESOLVED').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b mx-4 rounded-lg shadow-md">
        <div className=" mx-auto px-4 py-4">
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dispute Resolution</h1>
              <p className="text-gray-600 mt-1">{disputes.length} disputes in this view</p>
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
              <div className="bg-white rounded-xl shadow-md  p-12 text-center">
                <AlertTriangle className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No disputes found</h3>
                <p className="text-gray-600">There are no disputes with status: {statusFilter}</p>
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
                        <p className="text-sm text-gray-600">
                          Booking #{dispute.booking.id.substring(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                      {dispute.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <img
                        src={dispute.client.avatarUrl || '/images/avatar-placeholder.png'}
                        alt={dispute.client.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm font-medium">{dispute.client.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">vs</span>
                    <div className="flex items-center space-x-2">
                      <img
                        src={dispute.provider.avatarUrl || '/images/avatar-placeholder.png'}
                        alt={dispute.provider.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm font-medium">{dispute.provider.name}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 line-clamp-2 mb-3">{dispute.description}</p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center">
                      <MessageSquare size={14} className="mr-1" />
                      {dispute.messages.length} messages
                    </span>
                    <span>{new Date(dispute.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Dispute Details & Chat */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            {selectedDispute ? (
              <div className="bg-white rounded-xl shadow-sm border">
                {/* Header */}
                <div className="p-6 border-b">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">{selectedDispute.reason}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDispute.status)}`}>
                      {selectedDispute.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">{selectedDispute.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Booking Date</p>
                      <p className="font-medium">
                        {new Date(selectedDispute.booking.scheduledFor).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Amount</p>
                      <p className="font-medium">KSH {selectedDispute.booking.price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="p-6 border-b max-h-96 overflow-y-auto">
                  <h3 className="font-semibold text-gray-900 mb-4">Conversation</h3>
                  <div className="space-y-4">
                    {selectedDispute.messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] ${
                          msg.sender === 'ADMIN' 
                            ? 'bg-blue-100' 
                            : msg.sender === 'CLIENT'
                            ? 'bg-gray-100'
                            : 'bg-orange-100'
                        } rounded-xl p-4`}>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-semibold text-gray-700">{msg.senderName}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(msg.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900">{msg.message}</p>
                        </div>
                      </div>
                    ))}
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
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                      >
                        <Send size={20} />
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
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 transition mb-2"
                    >
                      <CheckCircle size={18} />
                      <span>Mutual Agreement</span>
                    </button>
                    <button
                      onClick={handleCloseDispute}
                      disabled={processing}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 transition"
                    >
                      <XCircle size={18} />
                      <span>Close Without Resolution</span>
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
                <p className="text-gray-600">Choose a dispute from the list to view details and take action</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}