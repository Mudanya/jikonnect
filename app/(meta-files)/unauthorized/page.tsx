"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ShieldAlert,
  Clock,
  Home,
  LogIn,
  ArrowLeft,
  Phone,
} from "lucide-react";
import Image from "next/image";

export default function UnauthorizedPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const isSessionExpired = reason === "session-expired";

  return (
    <div className="min-h-screen  bg-linear-to-br from-jiko-primary/10 via-jiko-primary/10 to-jiko-secondary/10">
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
              {isSessionExpired ? (
                <div className="bg-orange-100 p-8 rounded-full">
                  <Clock className="w-24 h-24 text-orange-600" />
                </div>
              ) : (
                <div className="bg-red-100 p-8 rounded-full">
                  <ShieldAlert className="w-24 h-24 text-red-600" />
                </div>
              )}
            </div>
          </div>

          {/* Error Code */}
          <h1 className="text-7xl sm:text-8xl font-bold text-gray-900 mb-4">
            401
          </h1>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {isSessionExpired ? "Session Expired" : "Authentication Required"}
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            {isSessionExpired
              ? "Your session has expired for security reasons. Please log in again to continue accessing your account and bookings."
              : "You need to be logged in to access this page. Please sign in with your JiKonnect account to continue."}
          </p>

          {/* Info Box */}
          <div className="mb-8 p-6 bg-orange-50 border border-orange-200 rounded-lg max-w-xl mx-auto">
            <h3 className="font-semibold text-gray-900 mb-2">
              {isSessionExpired
                ? "Why did this happen?"
                : "Why am I seeing this?"}
            </h3>
            <ul className="text-sm text-gray-700 text-left space-y-2">
              {isSessionExpired ? (
                <>
                  <li>• Sessions expire after a period of inactivity</li>
                  <li>• This is a security measure to protect your account</li>
                  <li>• Simply log in again to continue</li>
                </>
              ) : (
                <>
                  <li>• This page requires you to be logged in</li>
                  <li>• You may have been logged out automatically</li>
                  <li>• Your session may have expired</li>
                </>
              )}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold shadow-lg shadow-primary/30 text-lg"
            >
              <LogIn className="w-5 h-5" />
              {isSessionExpired ? "Log In Again" : "Sign In"}
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              <Home className="w-5 h-5" />
              Go to Homepage
            </Link>
          </div>

          {/* Don't have an account */}
          <p className="text-gray-600 mb-8">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-primary font-semibold hover:underline"
            >
              Create one now
            </Link>
          </p>

          
        </div>
      </div>

      
    </div>
  );
}
