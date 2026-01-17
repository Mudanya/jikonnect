// app/admin/users/[userId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Ban,
  CheckCircle,
  Trash2,
  ShieldPlus,
  User,
  Briefcase,
  Clock,
  DollarSign,
  Star,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { UserStatus } from "@/lib/generated/prisma/enums";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type UserDetail = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: "CLIENT" | "PROFESSIONAL" | "ADMIN" | "SUPER_ADMIN";
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  profile?: {
    bio: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
  };
  professional?: {
    businessName: string | null;
    specializations: string[];
    experience: number | null;
    rating: number | null;
    completedBookings: number;
    earnings: number;
  };
  stats: {
    totalBookings: number;
    activeBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalSpent?: number;
    totalEarned?: number;
  };
};

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: adminUser } = useAuth();
  const userId = params?.userId as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const token = localStorage.getItem("accessToken");

  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    action: "suspend" | "unsuspend" | "delete" | "makeAdmin" | null;
  }>({
    isOpen: false,
    action: null,
  });

  // Fetch user details
  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch user details");

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  // Handle user actions
  const handleUserAction = async () => {
    if (!actionModal.action) return;

    try {
      setProcessing(true);

      if (actionModal.action === "delete") {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to delete user");
        toast.success("User deleted successfully");
        router.push("/admin/users");
        return;
      } else {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: actionModal.action,
          }),
        });

        if (!response.ok) throw new Error("Failed to update user");

        toast.success(
          actionModal.action === "suspend"
            ? "User suspended"
            : actionModal.action === "unsuspend"
            ? "User unsuspended"
            : "User promoted to admin"
        );
        await fetchUserDetails();
      }

      setActionModal({ isOpen: false, action: null });
    } catch (error) {
      console.error("Error performing action:", error);
      toast.error("Failed to perform action");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            User Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The user you're looking for doesn't exist
          </p>
          <button
            onClick={() => router.push("/admin/users")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/admin/users")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Users
          </button>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-jiko-primary to-jiko-secondary flex items-center justify-center text-white text-2xl font-semibold">
                {user.firstName?.charAt(0)?.toUpperCase() || "U"}
                {user.lastName?.charAt(0)?.toUpperCase() || ""}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-gray-600 mt-1">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === "CLIENT"
                        ? "bg-purple-100 text-purple-800"
                        : user.role === "PROFESSIONAL"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {user.role}
                  </span>
                  {user.status === "SUSPENDED" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <Ban className="w-3 h-3" />
                      Suspended
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {adminUser?.role === "SUPER_ADMIN" &&
                user.role !== "ADMIN" &&
                user.role !== "SUPER_ADMIN" && (
                  <button
                    onClick={() =>
                      setActionModal({ isOpen: true, action: "makeAdmin" })
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <ShieldPlus className="w-4 h-4" />
                    Make Admin
                  </button>
                )}
              {user.status === "SUSPENDED" ? (
                <button
                  onClick={() =>
                    setActionModal({ isOpen: true, action: "unsuspend" })
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4" />
                  Unsuspend
                </button>
              ) : (
                <button
                  onClick={() =>
                    setActionModal({ isOpen: true, action: "suspend" })
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  <Ban className="w-4 h-4" />
                  Suspend
                </button>
              )}
              <button
                onClick={() =>
                  setActionModal({ isOpen: true, action: "delete" })
                }
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Contact Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{user.phone}</span>
                  </div>
                )}
                {user.profile?.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">
                      {user.profile.address}
                      {user.profile.city && `, ${user.profile.city}`}
                      {user.profile.state && `, ${user.profile.state}`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Professional Info (if professional) */}
            {user.role === "PROFESSIONAL" && user.professional && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Professional Details
                </h2>
                <div className="space-y-4">
                  {user.professional.businessName && (
                    <div>
                      <label className="text-sm text-gray-600">
                        Business Name
                      </label>
                      <p className="text-gray-900 font-medium">
                        {user.professional.businessName}
                      </p>
                    </div>
                  )}
                  {user.professional.specializations.length > 0 && (
                    <div>
                      <label className="text-sm text-gray-600">
                        Specializations
                      </label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {user.professional.specializations.map((spec, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    {user.professional.experience && (
                      <div>
                        <label className="text-sm text-gray-600">
                          Experience
                        </label>
                        <p className="text-gray-900 font-medium">
                          {user.professional.experience} years
                        </p>
                      </div>
                    )}
                    {user.professional.rating && (
                      <div>
                        <label className="text-sm text-gray-600">Rating</label>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-gray-900 font-medium">
                            {user.professional.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Statistics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Briefcase className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {user.stats.totalBookings}
                  </p>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {user.stats.completedBookings}
                  </p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {user.stats.activeBookings}
                  </p>
                  <p className="text-sm text-gray-600">Active</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <Ban className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {user.stats.cancelledBookings}
                  </p>
                  <p className="text-sm text-gray-600">Cancelled</p>
                </div>
              </div>
              {(user.stats.totalSpent || user.stats.totalEarned) && (
                <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                      <span className="text-sm text-gray-600">
                        {user.role === "PROFESSIONAL"
                          ? "Total Earned"
                          : "Total Spent"}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      KSh{" "}
                      {(
                        user.stats.totalEarned || user.stats.totalSpent || 0
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Account Details
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">User ID</label>
                  <p className="text-sm text-gray-900 font-mono break-all">
                    {user.id}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Joined</label>
                  <p className="text-gray-900">
                    {formatDistanceToNow(new Date(user.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Last Updated</label>
                  <p className="text-gray-900">
                    {formatDistanceToNow(new Date(user.updatedAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Bio */}
            {user.profile?.bio && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Bio
                </h2>
                <p className="text-gray-700 text-sm">{user.profile.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {actionModal.action === "suspend" && "Suspend User"}
              {actionModal.action === "unsuspend" && "Unsuspend User"}
              {actionModal.action === "makeAdmin" && "Make Admin"}
              {actionModal.action === "delete" && "Delete User"}
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              {actionModal.action === "suspend" &&
                `Are you sure you want to suspend ${user.firstName}? They will lose access to the platform.`}
              {actionModal.action === "unsuspend" &&
                `Restore access for ${user.firstName}? They will regain full platform access.`}
              {actionModal.action === "makeAdmin" &&
                `Promote ${user.firstName} to Admin? They will have administrative privileges.`}
              {actionModal.action === "delete" &&
                `Permanently delete ${user.firstName}? This action cannot be undone and will remove all their data.`}
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setActionModal({ isOpen: false, action: null })}
                disabled={processing}
                className="px-4 py-2 border cursor-pointer border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUserAction}
                disabled={processing}
                className={`px-4 py-2 cursor-pointer rounded-lg text-white disabled:opacity-50 ${
                  actionModal.action === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : actionModal.action === "suspend"
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {processing ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}