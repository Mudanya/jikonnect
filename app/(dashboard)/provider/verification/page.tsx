'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, CheckCircle, XCircle, Clock, AlertCircle, 
  Upload, FileText, Award, Loader 
} from 'lucide-react';

interface VerificationData {
  verificationStatus: string;
  verifiedAt: string | null;
  rejectionReason: string | null;
  requirements: {
    idNumber: boolean;
    idDocument: boolean;
    certificates: boolean;
    profileComplete: boolean;
  };
  canSubmit: boolean;
  documents: {
    idDocument: string | null;
    certificates: string[];
  };
}

export default function VerificationStatusPage() {
  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVerificationStatus();
  }, []);

  const loadVerificationStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/provider/verification/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to load verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  if (!data) return null;

  const getStatusInfo = () => {
    switch (data.verificationStatus) {
      case 'VERIFIED':
        return {
          icon: <CheckCircle className="text-green-600" size={64} />,
          title: 'Verified Provider',
          description: 'Your account has been verified and you can start accepting bookings',
          color: 'green'
        };
      case 'PENDING':
        return {
          icon: <Clock className="text-orange-600" size={64} />,
          title: 'Verification Pending',
          description: 'Your documents are under review. This usually takes 24-48 hours',
          color: 'orange'
        };
      case 'REJECTED':
        return {
          icon: <XCircle className="text-red-600" size={64} />,
          title: 'Verification Rejected',
          description: data.rejectionReason || 'Your verification was rejected',
          color: 'red'
        };
      default:
        return {
          icon: <Shield className="text-gray-400" size={64} />,
          title: 'Not Verified',
          description: 'Complete the requirements below to submit for verification',
          color: 'gray'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen ">
      <div className="px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Verification Status</h1>

        {/* Status Card */}
        <div className={`bg-white rounded-2xl shadow-lg-2 p-8 mb-8 ${
          statusInfo.color === 'green' ? 'border-green-200' :
          statusInfo.color === 'orange' ? 'border-orange-200' :
          statusInfo.color === 'red' ? 'border-red-200' :
          'border-gray-200'
        }`}>
          <div className="text-center">
            <div className="mb-4">{statusInfo.icon}</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{statusInfo.title}</h2>
            <p className="text-gray-600">{statusInfo.description}</p>
            {data.verifiedAt && (
              <p className="text-sm text-gray-500 mt-2">
                Verified on {new Date(data.verifiedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Requirements Checklist */}
        {data.verificationStatus !== 'VERIFIED' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Verification Requirements</h3>
            <div className="space-y-4">
              <RequirementItem
                title="Profile Complete"
                description="Add bio, services, and hourly rate"
                completed={data.requirements.profileComplete}
              />
              <RequirementItem
                title="ID Number"
                description="Provide your national ID number"
                completed={data.requirements.idNumber}
              />
              <RequirementItem
                title="ID Document"
                description="Upload a clear photo of your ID"
                completed={data.requirements.idDocument}
              />
              <RequirementItem
                title="Certificates (Optional)"
                description="Upload relevant certifications"
                completed={data.requirements.certificates}
                optional
              />
            </div>
          </div>
        )}

        {/* Uploaded Documents */}
        {(data.documents.idDocument || data.documents.certificates.length > 0) && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Uploaded Documents</h3>
            <div className="space-y-4">
              {data.documents.idDocument && (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="text-blue-600" size={24} />
                    <div>
                      <p className="font-medium text-gray-900">ID Document</p>
                      <p className="text-sm text-gray-600">National ID / Passport</p>
                    </div>
                  </div>
                  <a
                    href={data.documents.idDocument}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View
                  </a>
                </div>
              )}

              {data.documents.certificates.map((cert, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Award className="text-purple-600" size={24} />
                    <div>
                      <p className="font-medium text-gray-900">Certificate {index + 1}</p>
                      <p className="text-sm text-gray-600">Professional certification</p>
                    </div>
                  </div>
                  <a
                    href={cert}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {data.verificationStatus === 'NOT_SUBMITTED' && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <h4 className="font-bold text-blue-900 mb-2">Ready to get verified?</h4>
                <p className="text-sm text-blue-800 mb-4">
                  Complete all requirements and submit your profile for verification to start accepting bookings.
                </p>
                <button
                  disabled={!data.canSubmit}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {data.canSubmit ? 'Submit for Verification' : 'Complete Requirements First'}
                </button>
              </div>
            </div>
          </div>
        )}

        {data.verificationStatus === 'REJECTED' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <XCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <h4 className="font-bold text-red-900 mb-2">Verification Rejected</h4>
                {data.rejectionReason && (
                  <p className="text-sm text-red-800 mb-4">
                    <strong>Reason:</strong> {data.rejectionReason}
                  </p>
                )}
                <p className="text-sm text-red-800 mb-4">
                  Please address the issues mentioned and resubmit your application.
                </p>
                <button className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition">
                  Resubmit Application
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• Verification usually takes 24-48 hours</p>
            <p>• Make sure your ID document is clear and readable</p>
            <p>• Certificates are optional but increase trust</p>
            <p>• Contact support if you have questions: support@jikonnect.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RequirementItem({ 
  title, 
  description, 
  completed, 
  optional = false 
}: { 
  title: string; 
  description: string; 
  completed: boolean; 
  optional?: boolean;
}) {
  return (
    <div className="flex items-start space-x-4 p-4 border rounded-lg">
      <div className="flex-shrink-0 mt-1">
        {completed ? (
          <CheckCircle className="text-green-600" size={24} />
        ) : (
          <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <h4 className="font-medium text-gray-900">{title}</h4>
          {optional && (
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
              Optional
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      {completed && (
        <span className="text-xs font-medium text-green-600">Completed</span>
      )}
    </div>
  );
}