import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-linear-to-br from-purple-700 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">Ji</span>
              </div>
              <span className="text-xl font-bold text-white">JiKonnect</span>
            </div>
            <p className="text-sm">
              Connecting people, skills & solutions across Kenya.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition">
                  Home Services
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Home Care
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Cleaning
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Social Connect
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Join as Pro
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>
            &copy; 2025 JiKonnect. All rights reserved. Made with ❤️ by{" "}
            <Link target="_blank" href="https://nelson-mudanya.me/">
              Nelson Mudanya
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
