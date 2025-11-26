"use client";
import {
  Bell,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  LogOut,
  MapPin,
  Navigation,
  Phone,
  Settings,
  Star,
  User,
  X,
} from "lucide-react";
import { useState } from "react";

export default function ProfessionalDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    {
      label: "Total Earnings",
      value: "KES 145,800",
      icon: DollarSign,
      change: "+12%",
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Active Jobs",
      value: "8",
      icon: Briefcase,
      change: "+3",
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Completed Jobs",
      value: "234",
      icon: CheckCircle,
      change: "+15",
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Rating",
      value: "4.9",
      icon: Star,
      change: "+0.2",
      color: "from-yellow-500 to-orange-500",
    },
  ];

  const upcomingJobs = [
    {
      id: 1,
      client: "Sarah Mwangi",
      service: "Deep House Cleaning",
      date: "2024-11-06",
      time: "09:00 AM",
      duration: "3 hours",
      location: "Westlands, Nairobi",
      amount: 2640,
      status: "confirmed",
      avatar: "👩🏾",
    },
    {
      id: 2,
      client: "John Kamau",
      service: "Plumbing Repair",
      date: "2024-11-06",
      time: "02:00 PM",
      duration: "2 hours",
      location: "Kilimani, Nairobi",
      amount: 3300,
      status: "confirmed",
      avatar: "👨🏿",
    },
    {
      id: 3,
      client: "Mary Wanjiku",
      service: "Home Organization",
      date: "2024-11-07",
      time: "10:00 AM",
      duration: "4 hours",
      location: "Karen, Nairobi",
      amount: 3520,
      status: "pending",
      avatar: "👩🏾",
    },
  ];

  const recentReviews = [
    {
      client: "Grace K.",
      rating: 5,
      comment: "Excellent work! Very thorough and professional.",
      date: "2 hours ago",
      avatar: "👩🏾",
    },
    {
      client: "David M.",
      rating: 5,
      comment: "Great service. Will book again!",
      date: "1 day ago",
      avatar: "👨🏿",
    },
    {
      client: "Susan W.",
      rating: 4,
      comment: "Good job overall. Very friendly.",
      date: "3 days ago",
      avatar: "👩🏾",
    },
  ];

  const earnings = [
    { month: "Jan", amount: 45000 },
    { month: "Feb", amount: 52000 },
    { month: "Mar", amount: 48000 },
    { month: "Apr", amount: 58000 },
    { month: "May", amount: 62000 },
    { month: "Jun", amount: 55000 },
  ];

  const jobHistory = [
    {
      id: "BK-2341",
      client: "Mary Njeri",
      service: "House Cleaning",
      date: "2024-11-02",
      amount: 2640,
      status: "completed",
    },
    {
      id: "BK-2340",
      client: "James Omondi",
      service: "Deep Cleaning",
      date: "2024-11-01",
      amount: 3520,
      status: "completed",
    },
    {
      id: "BK-2339",
      client: "Anne Wambui",
      service: "Office Cleaning",
      date: "2024-10-30",
      amount: 4400,
      status: "completed",
    },
    {
      id: "BK-2338",
      client: "Peter Kariuki",
      service: "House Cleaning",
      date: "2024-10-28",
      amount: 2640,
      status: "completed",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Top Navigation */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Ji</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Professional Dashboard</h1>
                <p className="text-xs text-gray-500">Welcome back, Jane!</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-10 h-10 bg-linear-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-2xl cursor-pointer">
                👩🏾
              </div>
              <div className="w-24 h-24">
                <label
                  htmlFor="avatar-upload"
                  className="w-24 h-24 rounded-full cursor-pointer bg-cover bg-center overflow-hidden border border-gray-200"
                >
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition">
                    <span className="text-xs text-white">Change</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 shrink-0 hidden lg:block">
            <div className="bg-white rounded-2xl shadow-sm border p-4 sticky top-24">
              <nav className="space-y-2">
                {[
                  { id: "overview", label: "Overview", icon: Briefcase },
                  { id: "jobs", label: "My Jobs", icon: Calendar },
                  { id: "earnings", label: "Earnings", icon: DollarSign },
                  { id: "reviews", label: "Reviews", icon: Star },
                  { id: "profile", label: "My Profile", icon: User },
                  { id: "settings", label: "Settings", icon: Settings },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${
                      activeTab === item.id
                        ? "bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
                <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 transition">
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-lg transition"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`w-12 h-12 bg-linear-to-br ${stat.color} rounded-xl flex items-center justify-center`}
                        >
                          <stat.icon className="text-white" size={24} />
                        </div>
                        <span className="text-green-600 text-sm font-semibold bg-green-50 px-3 py-1 rounded-full">
                          {stat.change}
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Upcoming Jobs */}
                <div className="bg-white rounded-2xl shadow-sm border">
                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold">Upcoming Jobs</h2>
                      <button className="text-blue-600 font-semibold text-sm hover:underline">
                        View All
                      </button>
                    </div>
                  </div>
                  <div className="divide-y">
                    {upcomingJobs.map((job) => (
                      <div
                        key={job.id}
                        className="p-6 hover:bg-gray-50 transition"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-linear-to-br from-blue-400 to-purple-400 rounded-xl flex items-center justify-center text-2xl">
                              {job.avatar}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">
                                {job.client}
                              </h3>
                              <p className="text-gray-600">{job.service}</p>
                            </div>
                          </div>
                          <div
                            className={`px-4 py-2 rounded-full text-sm font-semibold ${
                              job.status === "confirmed"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {job.status === "confirmed"
                              ? "✓ Confirmed"
                              : "⏳ Pending"}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar size={16} />
                            <span>{job.date}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock size={16} />
                            <span>{job.time}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock size={16} />
                            <span>{job.duration}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin size={16} />
                            <span>{job.location}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="text-2xl font-bold text-gray-900">
                            KES {job.amount.toLocaleString()}
                          </div>
                          <div className="flex space-x-2">
                            <button className="flex items-center space-x-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition">
                              <Phone size={16} />
                              <span className="font-semibold">Call</span>
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition">
                              <Navigation size={16} />
                              <span className="font-semibold">Navigate</span>
                            </button>
                            {job.status === "pending" && (
                              <button className="bg-linear-to-r from-blue-600 to-cyan-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition">
                                Accept Job
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Reviews */}
                <div className="bg-white rounded-2xl shadow-sm border">
                  <div className="p-6 border-b">
                    <h2 className="text-xl font-bold">Recent Reviews</h2>
                  </div>
                  <div className="divide-y">
                    {recentReviews.map((review, idx) => (
                      <div key={idx} className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-linear-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-xl">
                              {review.avatar}
                            </div>
                            <div>
                              <div className="font-semibold">
                                {review.client}
                              </div>
                              <div className="text-xs text-gray-500">
                                {review.date}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="text-yellow-400 fill-yellow-400"
                                size={16}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Jobs Tab */}
            {activeTab === "jobs" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border">
                  <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold">Job History</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-4 font-semibold text-gray-700">
                            Booking ID
                          </th>
                          <th className="text-left p-4 font-semibold text-gray-700">
                            Client
                          </th>
                          <th className="text-left p-4 font-semibold text-gray-700">
                            Service
                          </th>
                          <th className="text-left p-4 font-semibold text-gray-700">
                            Date
                          </th>
                          <th className="text-left p-4 font-semibold text-gray-700">
                            Amount
                          </th>
                          <th className="text-left p-4 font-semibold text-gray-700">
                            Status
                          </th>
                          <th className="text-left p-4 font-semibold text-gray-700">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {jobHistory.map((job) => (
                          <tr key={job.id} className="hover:bg-gray-50">
                            <td className="p-4 font-mono text-sm text-blue-600">
                              {job.id}
                            </td>
                            <td className="p-4 font-semibold">{job.client}</td>
                            <td className="p-4 text-gray-600">{job.service}</td>
                            <td className="p-4 text-gray-600">{job.date}</td>
                            <td className="p-4 font-bold">
                              KES {job.amount.toLocaleString()}
                            </td>
                            <td className="p-4">
                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                                Completed
                              </span>
                            </td>
                            <td className="p-4">
                              <button className="text-blue-600 hover:underline font-semibold flex items-center space-x-1">
                                <Eye size={16} />
                                <span>View</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Earnings Tab */}
            {activeTab === "earnings" && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm border p-6">
                    <div className="text-sm text-gray-600 mb-2">This Month</div>
                    <div className="text-3xl font-bold text-gray-900">
                      KES 62,000
                    </div>
                    <div className="text-sm text-green-600 font-semibold mt-2">
                      +12% from last month
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border p-6">
                    <div className="text-sm text-gray-600 mb-2">
                      Available Balance
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                      KES 28,400
                    </div>
                    <button className="text-sm text-blue-600 font-semibold mt-2 hover:underline">
                      Withdraw
                    </button>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border p-6">
                    <div className="text-sm text-gray-600 mb-2">
                      Pending Payout
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                      KES 12,600
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      Released after completion
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border p-6">
                  <h3 className="text-xl font-bold mb-6">Earnings Overview</h3>
                  <div className="h-64 flex items-end justify-between space-x-2">
                    {earnings.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center"
                      >
                        <div
                          className="w-full bg-linear-to-t from-blue-600 to-cyan-500 rounded-t-lg hover:opacity-80 transition cursor-pointer"
                          style={{ height: `${(item.amount / 70000) * 100}%` }}
                        ></div>
                        <div className="text-xs font-semibold text-gray-600 mt-2">
                          {item.month}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border p-8">
                  <div className="flex items-start space-x-6 mb-8">
                    <div className="w-32 h-32 bg-linear-to-br from-purple-400 to-pink-400 rounded-3xl flex items-center justify-center text-6xl">
                      👩🏾
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h2 className="text-3xl font-bold">Jane Wanjiru</h2>
                        <CheckCircle className="text-blue-500" size={24} />
                      </div>
                      <p className="text-gray-600 mb-2">Professional Cleaner</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Star
                            className="text-yellow-400 fill-yellow-400"
                            size={16}
                          />
                          <span className="font-bold">4.9</span>
                          <span className="text-gray-500">(156 reviews)</span>
                        </div>
                        <div className="text-gray-500">234 jobs completed</div>
                      </div>
                      <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                        Edit Profile
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder="Tell clients about yourself..."
                        defaultValue="Professional home cleaner with 8 years experience. Specialized in deep cleaning and organization."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Skills
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {[
                          "Deep Cleaning",
                          "Organization",
                          "Laundry",
                          "Kitchen Sanitization",
                        ].map((skill) => (
                          <span
                            key={skill}
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium flex items-center space-x-2"
                          >
                            <span>{skill}</span>
                            <X
                              size={14}
                              className="cursor-pointer hover:text-blue-900"
                            />
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Add a skill..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
