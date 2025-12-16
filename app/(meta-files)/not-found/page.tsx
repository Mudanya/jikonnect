'use client'
import Link from "next/link";
import { Search, Home, Wrench, Phone, ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-br from-jiko-primary/10 via-jiko-primary/10 to-jiko-secondary/10">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src={"/assets/images/jiko-logo-black-lg.png"} alt="Jk" width={800} height={600} className="h-12 w-auto"/>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center">
          {/* 404 Illustration */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="text-[150px] sm:text-[200px] font-bold text-gray-200 leading-none">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-primary/10 p-6 rounded-full">
                  <Search className="w-16 h-16 sm:w-20 sm:h-20 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            We couldn't find the page you're looking for. It might have been moved, 
            deleted, or the link might be incorrect. But don't worry, we're here to help 
            you find what you need!
          </p>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            <Link
              href="/"
              className="group p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-primary transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Home className="w-6 h-6 text-primary" />
                </div>
                <span className="font-semibold text-gray-900">Home</span>
                <span className="text-sm text-gray-500 text-center">
                  Back to homepage
                </span>
              </div>
            </Link>

            <Link
              href="/services"
              className="group p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-primary transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Wrench className="w-6 h-6 text-primary" />
                </div>
                <span className="font-semibold text-gray-900">Services</span>
                <span className="text-sm text-gray-500 text-center">
                  Browse services
                </span>
              </div>
            </Link>

            <Link
              href="/services"
              className="group p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-primary transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <span className="font-semibold text-gray-900">Search</span>
                <span className="text-sm text-gray-500 text-center">
                  Find providers
                </span>
              </div>
            </Link>

          
          </div>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-lg shadow-primary/30"
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