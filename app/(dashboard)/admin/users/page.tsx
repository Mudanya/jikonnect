// app/admin/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Ban,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { UserStatus } from "@/lib/generated/prisma/enums";
import { toast } from "sonner";

type User = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatar: string | null;
  role: "CLIENT" | "PROFESSIONAL" | "ADMIN";
  status: UserStatus;
  createdAt: Date;
};

export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams?.get("role") || "CLIENT";

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    role: roleParam as "CLIENT" | "PROFESSIONAL",
    status: "ACTIVE" as "ACTIVE" | "SUSPENDED",
    search: "",
  });

  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    user: User | null;
    action: "suspend" | "unsuspend" | "delete" | null;
  }>({
    isOpen: false,
    user: null,
    action: null,
  });

  const [processing, setProcessing] = useState(false);
  const token = localStorage.getItem("accessToken");

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
        ...{ role: filters.role },
        ...{ status: filters.status },
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters, pagination.page]);

  // Update role filter from URL
  useEffect(() => {
    if (roleParam && (roleParam === "CLIENT" || roleParam === "PROFESSIONAL")) {
      setFilters((prev) => ({
        ...prev,
        role: roleParam as "CLIENT" | "PROFESSIONAL",
      }));
    }
  }, [roleParam]);

  // Handle user action
  const handleUserAction = async () => {
    if (!actionModal.user || !actionModal.action) return;

    try {
      setProcessing(true);

      if (actionModal.action === "delete") {
        const response = await fetch(
          `/api/admin/users/${actionModal.user.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to delete user");
      } else {
        const response = await fetch(
          `/api/admin/users/${actionModal.user.id}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: actionModal.action,
            }),
          }
        );

        if (!response.ok) throw new Error("Failed to update user");
      }

      // Refresh data
      await fetchUsers();
      setActionModal({ isOpen: false, user: null, action: null });
    } catch (error) {
      console.error("Error performing action:", error);

      toast.error("Failed to perform action. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen ">
      <div className=" px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                User Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage platform users, roles, and permissions
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <select
              value={filters.role}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  role: e.target.value as "CLIENT" | "PROFESSIONAL",
                })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="CLIENT">Clients</option>
              <option value="PROFESSIONAL">Providers</option>
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  status: e.target.value as "ACTIVE" | "SUSPENDED",
                })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      {/* User Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-jiko-primary to-jiko-secondary flex items-center justify-center text-white font-semibold">
                            {user.firstName?.charAt(0)?.toUpperCase() || "U"}{" "}
                            {user.lastName?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {user.firstName || "Unknown User"}{" "}
                              {user.lastName || "Unknown User"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.status === "SUSPENDED" ? (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <Ban className="w-3 h-3" />
                              Suspended
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </td>

                      {/* Activity */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-col gap-1">
                          {/* <div>{user._count.messagesSent} messages</div>
                          {user._count.policyViolations > 0 && (
                            <div className="text-red-600 font-medium">
                              {user._count.policyViolations} violations
                            </div>
                          )} */}
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDistanceToNow(new Date(user.createdAt), {
                          addSuffix: true,
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {user.status === "SUSPENDED" ? (
                            <button
                              onClick={() =>
                                setActionModal({
                                  isOpen: true,
                                  user,
                                  action: "unsuspend",
                                })
                              }
                              className="text-green-600 hover:text-green-900"
                              title="Unsuspend user"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                setActionModal({
                                  isOpen: true,
                                  user,
                                  action: "suspend",
                                })
                              }
                              className="text-red-600 hover:text-red-900"
                              title="Suspend user"
                            >
                              <Ban className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() =>
                              setActionModal({
                                isOpen: true,
                                user,
                                action: "delete",
                              })
                            }
                            className="text-red-600 hover:text-red-900"
                            title="Delete user"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        page: pagination.page - 1,
                      })
                    }
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        page: pagination.page + 1,
                      })
                    }
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {actionModal.isOpen && actionModal.user && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {actionModal.action === "suspend" && "Suspend User"}
              {actionModal.action === "unsuspend" && "Unsuspend User"}
              {actionModal.action === "delete" && "Delete User"}
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              {actionModal.action === "suspend" &&
                `Suspend ${actionModal.user.firstName}?`}
              {actionModal.action === "unsuspend" &&
                `Restore access for ${actionModal.user.firstName}?`}
              {actionModal.action === "delete" &&
                `Permanently delete ${actionModal.user.firstName}? This action cannot be undone.`}
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setActionModal({ isOpen: false, user: null, action: null });
                }}
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
