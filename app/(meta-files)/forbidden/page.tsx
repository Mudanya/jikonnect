"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ShieldX,
  AlertTriangle,
  Home,
  ArrowLeft,
  Phone,
  Mail,
} from "lucide-react";
import Image from "next/image";

export default function ForbiddenPage() {
  const searchParams = useSearchParams();
  const requiredRole = searchParams.get("role");

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={"/assets/images/jiko-logo-black-lg.png"}
              alt="Jk"
              width={800}
              height={600}
              className="h-12 w-auto"
            />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="bg-red-100 p-8 rounded-full">
                <ShieldX className="w-24 h-24 text-red-600" />
              </div>
            </div>
          </div>

          {/* Error Code */}
          <h1 className="text-7xl sm:text-8xl font-bold text-gray-900 mb-4">
            403
          </h1>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Access Forbidden
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            You don't have permission to access this page. This area is
            restricted to{" "}
            {requiredRole
              ? `${requiredRole.toLowerCase()} accounts`
              : "authorized users"}{" "}
            only.
          </p>

          {/* Warning Box */}
          <div className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-lg max-w-xl mx-auto">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Why can't I access this page?
                </h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• This page requires specific account permissions</li>
                  <li>• Your current account type doesn't have access</li>
                  <li>• You may need to upgrade or change your account type</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Account Type Info */}
          {requiredRole && (
            <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg max-w-xl mx-auto">
              <p className="text-gray-700">
                <span className="font-semibold">Required access level:</span>{" "}
                <span className="text-primary font-semibold uppercase">
                  {requiredRole}
                </span>
              </p>
            </div>
          )}

          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Link
              href="/"
              className="group p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-primary transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Home className="w-6 h-6 text-primary" />
                </div>
                <span className="font-semibold text-gray-900">Homepage</span>
                <span className="text-sm text-gray-500 text-center">
                  Return to home
                </span>
              </div>
            </Link>

            <Link
              href="/services"
              className="group p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-primary transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <span className="text-2xl">🔧</span>
                </div>
                <span className="font-semibold text-gray-900">Services</span>
                <span className="text-sm text-gray-500 text-center">
                  Browse services
                </span>
              </div>
            </Link>

            <Link
              href="/register?role=pro"
              className="group p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-primary transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <span className="text-2xl">👷</span>
                </div>
                <span className="font-semibold text-gray-900">
                  Become Provider
                </span>
                <span className="text-sm text-gray-500 text-center">
                  Join as professional
                </span>
              </div>
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold shadow-lg shadow-primary/30"
            >
              <Home className="w-5 h-5" />
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
