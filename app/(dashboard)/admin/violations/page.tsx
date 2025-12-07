"use client";

import { formatDistanceToNow } from "date-fns";
import { Download, Loader2, Search, Shield } from "lucide-react";
import { useEffect, useState } from "react";

interface Violation {
  id: string;
  userId: string;
  user: {
    name: string;
    email: string;
  };
  violationType: string;
  severity: string;
  description: string;
  evidence: any;
  resolved: boolean;
  createdAt: string;
}

export default function ViolationsPage() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [resolvedFilter, setResolvedFilter] = useState<string>("");

  useEffect(() => {
    fetchViolations();
  }, [severityFilter, resolvedFilter]);

  const fetchViolations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (severityFilter) params.append("severity", severityFilter);
      if (resolvedFilter) params.append("resolved", resolvedFilter);

      const response = await fetch(`/api/admin/violations?${params}`);
      const data = await response.json();
      setViolations(data.violations);
    } catch (error) {
      console.error("Error fetching violations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredViolations = violations.filter(
    (v) =>
      v.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "STRIKE_1":
        return "bg-yellow-100 text-yellow-800";
      case "STRIKE_2":
        return "bg-orange-100 text-orange-800";
      case "STRIKE_3":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-7 h-7 text-red-600" />
                Policy Violations Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor and manage platform violations
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-sm text-yellow-600 font-medium">
                Strike 1
              </div>
              <div className="text-2xl font-bold text-yellow-900 mt-1">
                {violations.filter((v) => v.severity === "STRIKE_1").length}
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-sm text-orange-600 font-medium">
                Strike 2
              </div>
              <div className="text-2xl font-bold text-orange-900 mt-1">
                {violations.filter((v) => v.severity === "STRIKE_2").length}
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-sm text-red-600 font-medium">Strike 3</div>
              <div className="text-2xl font-bold text-red-900 mt-1">
                {violations.filter((v) => v.severity === "STRIKE_3").length}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium">Resolved</div>
              <div className="text-2xl font-bold text-green-900 mt-1">
                {violations.filter((v) => v.resolved).length}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Severities</option>
              <option value="STRIKE_1">Strike 1</option>
              <option value="STRIKE_2">Strike 2</option>
              <option value="STRIKE_3">Strike 3</option>
            </select>
            <select
              value={resolvedFilter}
              onChange={(e) => setResolvedFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="false">Pending</option>
              <option value="true">Resolved</option>
            </select>
          </div>
        </div>

        {/* Violations List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredViolations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Shield className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No violations found
              </h3>
              <p className="text-sm text-gray-600">
                All users are following platform guidelines
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Violation Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredViolations.map((violation) => (
                    <tr key={violation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {violation.user.name || "Unknown"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {violation.user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {violation.violationType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(
                            violation.severity
                          )}`}
                        >
                          {violation.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md">
                          {violation.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDistanceToNow(new Date(violation.createdAt), {
                          addSuffix: true,
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {violation.resolved ? (
                          <span className="text-sm text-green-600 font-medium">
                            Resolved
                          </span>
                        ) : (
                          <span className="text-sm text-orange-600 font-medium">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
