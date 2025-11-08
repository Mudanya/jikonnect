"use client";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { AuthLayoutContext } from "../layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Login = () => {
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const { setHeaderDesc } = useContext(AuthLayoutContext);
  useEffect(() => {
    setHeaderDesc({
      title: "Welcome Back! Sign in to your account",
      classWidth: "w-xl",
      classFlex: "flex items-center justify-center w-full p-4",
    });
  }, [setHeaderDesc]);
  return (
    <>
      {/* Sign In Form */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <Input
              type="email"
              value={signInData.email}
              onChange={(e) =>
                setSignInData({ ...signInData, email: e.target.value })
              }
              placeholder="your.email@example.com"
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 !focus:ring-red-500"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <Input
              type={showPassword ? "text" : "password"}
              value={signInData.password}
              onChange={(e) =>
                setSignInData({ ...signInData, password: e.target.value })
              }
              placeholder="Enter your password"
              className="w-full pl-12 pr-12 py-3 border  border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform bg-transparent! cursor-pointer -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff size={20} className="hover:bg-transparent" />
              ) : (
                <Eye size={20} className="hover:bg-transparent" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:underline font-semibold cursor-pointer"
          >
            Forgot password?
          </Link>
        </div>

        <button className="w-full cursor-pointer bg-linear-to-r from-purple-700 to-blue-700 text-white py-3 rounded-xl font-bold hover:shadow-lg transition transform hover:-translate-y-0.5">
          Sign In
        </button>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href={"/register"}
              className="text-blue-600 font-semibold hover:underline cursor-pointer"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
      {/* TODo: FUTURE */}
      {/* Social Sign In */}
      {/* <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-linear-to-br from-blue-50 via-cyan-50 to-slate-50 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center space-x-2 bg-white border-2 border-gray-300 py-3 rounded-xl hover:bg-gray-50 transition">
              <span className="text-xl">🔵</span>
              <span className="font-semibold">Google</span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-white border-2 border-gray-300 py-3 rounded-xl hover:bg-gray-50 transition">
              <span className="text-xl">📘</span>
              <span className="font-semibold">Facebook</span>
            </button>
          </div>
        </div> */}
    </>
  );
};

export default Login;
