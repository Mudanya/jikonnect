"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <nav className="bg-jiko-secondary/30 backdrop-blur-md shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-[90vw] xl:max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">
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
              className="cursor-pointer shadow-md shadow-jiko-primary/20 bg-jiko-secondary text-jiko-primary px-6 py-2 rounded-lg hover:shadow-lg transition transform hover:-translate-y-0.5"
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
        <div className="md:hidden bg-white border-t w-full">
          <div className="px-4 py-3 space-y-3 w-full">
            <Link
              href="#services"
              className="block text-jiko-black hover:text-jiko-primary"
            >
              Services
            </Link>
            <Link
              href="#how-it-works"
              className="block text-jiko-black hover:text-jiko-primary"
            >
              How It Works
            </Link>
            <Link
              href="#about"
              className="block text-jiko-black hover:text-jiko-primary"
            >
              About 
            </Link>
            <Link href="#join" className="block text-jiko-black hover:text-jiko-primary">
              Join as Pro
            </Link>
            <Link href={'/login'}  className="w-full inline-block text-left text-jiko-primary hover:underline font-medium">
              Login
            </Link>
            <Link href={'/register'} className="w-full inline-block shadow-md hover:shadow-lg bg-jiko-secondary text-center hover:bg-jiko-secondary/90 text-jiko-black hover:text-jiko-primary px-6 py-2 rounded-lg">
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
