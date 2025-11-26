"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <nav className="bg-jiko-secondary/30 backdrop-blur-md shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-auto relative flex items-center justify-center">
              <Image
                src={"/assets/images/jiko-logo-lg.png"}
                alt="Jikonnect logo"
                width={800}
                height={600}
                className="w-auto h-16"
              />
            </div>
          </div>

          <div className="hidden md:flex space-x-8">
            <a
              href="#services"
              className="text-jiko-primary hover:underline hover:decoration-jiko-secondary hover:underline-offset-4 transition"
            >
              Services
            </a>
            <a
              href="#how-it-works"
              className="text-jiko-primary hover:underline hover:decoration-jiko-secondary hover:underline-offset-4 transition"
            >
              How It Works
            </a>
            <a
              href="#about"
              className="text-jiko-primary hover:underline hover:decoration-jiko-secondary hover:underline-offset-4 transition"
            >
              About
            </a>
            <a
              href="#join"
              className="text-jiko-primary hover:underline hover:decoration-jiko-secondary hover:underline-offset-4 transition"
            >
              Join as Pro
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link
              href={"/login"}
              className="cursor-pointer text-jiko-primary hover:text-blue-600 transition font-medium"
            >
              Login
            </Link>
            <Link
              href={"/register"}
              className="cursor-pointer bg-jiko-secondary text-jiko-primary px-6 py-2 rounded-lg hover:shadow-lg transition transform hover:-translate-y-0.5"
            >
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
            <button className="w-full bg-linear-to-r from-jiko-primary to-jiko-secondary text-white px-6 py-2 rounded-lg">
              Sign Up
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
