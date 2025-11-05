"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">Ji</span>
            </div>
            <span className="text-2xl font-bold bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              JiKonnect
            </span>
          </div>

          <div className="hidden md:flex space-x-8">
            <a
              href="#services"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Services
            </a>
            <a
              href="#how-it-works"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              How It Works
            </a>
            <a
              href="#about"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              About
            </a>
            <a
              href="#join"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Join as Pro
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href={'/login'} className="cursor-pointer text-gray-700 hover:text-blue-600 transition font-medium">
              Login
            </Link>
            <Link href={'/signup'} className="cursor-pointer bg-linear-to-r from-blue-600 to-cyan-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition transform hover:-translate-y-0.5">
              Sign Up
            </Link>
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-3">
            <a
              href="#services"
              className="block text-gray-700 hover:text-blue-600"
            >
              Services
            </a>
            <a
              href="#how-it-works"
              className="block text-gray-700 hover:text-blue-600"
            >
              How It Works
            </a>
            <a
              href="#about"
              className="block text-gray-700 hover:text-blue-600"
            >
              About
            </a>
            <a href="#join" className="block text-gray-700 hover:text-blue-600">
              Join as Pro
            </a>
            <button className="w-full text-left text-gray-700 hover:text-blue-600 font-medium">
              Login
            </button>
            <button className="w-full bg-linear-to-r from-blue-600 to-cyan-500 text-white px-6 py-2 rounded-lg">
              Sign Up
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
