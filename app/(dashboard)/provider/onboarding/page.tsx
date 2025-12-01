'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { CheckCircle, Circle, ArrowRight, ArrowLeft, Upload, Plus, Briefcase, DollarSign, Award, MapPin, FileText, Calendar, Loader } from 'lucide-react';

export default function ProviderOnboardingPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState<any>(null);

  const [formData, setFormData] = useState({
    bio: '',
    services: [] as string[],
    hourlyRate: '',
    yearsExperience: '',
    location: '',
    languages: ['English'],
    idNumber: '',
    availability: {} as any
  });

  const categories = [
    'CLEANING', 'PLUMBING', 'ELECTRICAL', 'CARPENTRY', 'PAINTING',
    'DECOR', 'HOME_CARE', 'BABYSITTING', 'NURSING', 'ELDERLY_CARE',
    'GARDENING', 'SECURITY', 'OTHER'
  ];

  const steps = [
    { number: 1, title: 'Service Details', icon: Briefcase },
    { number: 2, title: 'Portfolio', icon: FileText },
    { number: 3, title: 'Verification', icon: CheckCircle },
    { number: 4, title: 'Availability', icon: Calendar }
  ];

  useEffect(() => {
    setMounted(true);
    if (user?.role !== 'PROFESSIONAL') {
      router.push('/dashboard');
    } else {
      loadOnboardingStatus();
    }
  }, [user]);

  const loadOnboardingStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/provider/onboarding/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setOnboardingStatus(data.data.onboardingStatus);
        if (data.data.user.profile) {
          setFormData({
            bio: data.data.user.profile.bio || '',
            services: data.data.user.profile.services || [],
            hourlyRate: data.data.user.profile.hourlyRate?.toString() || '',
            yearsExperience: data.data.user.profile.yearsExperience?.toString() || '',
            location: data.data.user.profile.location || '',
            languages: data.data.user.profile.languages || ['English'],
            idNumber: data.data.user.profile.idNumber || '',
            availability: data.data.user.profile.availability || {}
          });
        }
      }
    } catch (error) {
      console.error('Failed to load onboarding status:', error);
    }
  };

  const handleServiceToggle = (service: string) => {
    if (formData.services.includes(service)) {
      setFormData({
        ...formData,
        services: formData.services.filter(s => s !== service)
      });
    } else {
      setFormData({
        ...formData,
        services: [...formData.services, service]
      });
    }
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      if (currentStep === 1) {
        await fetch('/api/profile/professional', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            bio: formData.bio,
            services: formData.services,
            hourlyRate: formData.hourlyRate,
            yearsExperience: formData.yearsExperience,
            location: formData.location,
            languages: formData.languages
          })
        });
      }

      if (currentStep === 4) {
        await fetch('/api/provider/availability', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ availability: formData.availability })
        });
      }

      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Failed to save step:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="bg-white border-b rounded-lg mx-4">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Provider Onboarding</h1>
          {onboardingStatus && (
            <div className="mt-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{onboardingStatus.completionPercentage}% Complete</span>
                <div className="flex-1 max-w-md h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-500"
                    style={{ width: `${onboardingStatus.completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-8">
        {/* Step Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    currentStep >= step.number
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircle size={24} />
                    ) : (
                      <step.icon size={24} />
                    )}
                  </div>
                  <span className={`mt-2 text-sm font-medium ${
                    currentStep >= step.number ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl border p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Tell us about your services</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What services do you offer?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map(service => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => handleServiceToggle(service)}
                      className={`px-4 py-3 rounded-xl border-2 transition text-sm font-medium ${
                        formData.services.includes(service)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-blue-300 text-gray-700'
                      }`}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tell clients about yourself
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  rows={4}
                  placeholder="Describe your experience, expertise, and what makes you unique..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Nairobi, Kenya"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
                  <input
                    type="number"
                    value={formData.yearsExperience}
                    onChange={(e) => setFormData({...formData, yearsExperience: e.target.value})}
                    placeholder="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Hourly Rate (KES)</label>
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                    placeholder="800"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-2">Build your portfolio</h2>
              <p className="text-gray-600 mb-6">Showcase your best work to attract more clients</p>

              <button
                onClick={() => router.push('/provider/portfolio/add')}
                className="w-full py-12 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition flex flex-col items-center justify-center"
              >
                <Plus className="text-gray-400 mb-2" size={48} />
                <span className="text-gray-600 font-medium">Add Portfolio Item</span>
              </button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-2">Verify your identity</h2>
              <p className="text-gray-600 mb-6">Upload your ID to gain client trust</p>

              <button
                onClick={() => router.push('/profile/edit#verification')}
                className="w-full py-12 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition flex flex-col items-center justify-center"
              >
                <Upload className="text-gray-400 mb-2" size={48} />
                <span className="text-gray-600 font-medium">Upload ID Document</span>
              </button>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-2">Set your availability</h2>
              <div className="space-y-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <div key={day} className="flex items-center space-x-4 p-4 border rounded-xl">
                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                    <span className="flex-1 font-medium">{day}</span>
                    <input type="time" className="px-3 py-2 border rounded-lg" defaultValue="09:00" />
                    <span>to</span>
                    <input type="time" className="px-3 py-2 border rounded-lg" defaultValue="17:00" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700"
              >
                <ArrowLeft size={20} />
                <span>Previous</span>
              </button>
            )}

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={loading}
                className="ml-auto flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold"
              >
                <span>{loading ? 'Saving...' : 'Next'}</span>
                <ArrowRight size={20} />
              </button>
            ) : (
              <button
                onClick={() => router.push('/provider/dashboard')}
                className="ml-auto flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl font-bold"
              >
                <CheckCircle size={20} />
                <span>Complete Setup</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}