"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { LoginFormData, loginSchema } from "@/validators/auth.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthLayoutContext } from "../layout";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
   
  });
  const [showPassword, setShowPassword] = useState(false);
  const { setHeaderDesc } = useContext(AuthLayoutContext);
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "";

  useEffect(() => {
    setHeaderDesc({
      title: "Welcome Back! Sign in to your account",
      classWidth: "w-xl",
      classFlex: "flex items-center justify-center w-full p-4",
    });
  }, [setHeaderDesc]);

  const { login } = useAuth();
  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password, callbackUrl);
      toast.success("Logged in successfully!");
    } catch (err) {
      console.error("Login error:", err);
      toast.error((err as Error).message || "Login failed. Please retry!");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Sign In Form */}
      <div className="bg-white rounded-2xl shadow-xl  border-gray-100 p-8">
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
              {...register("email")}
              placeholder="your.email@example.com"
              className={`w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 !focus:ring-red-500 ${
                errors.email ? "border-red-300" : ""
              }`}
            />
          </div>{" "}
          {errors.email && (
            <small className="text-xs text-red-300">
              {errors.email.message}
            </small>
          )}
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
              {...register("password")}
              placeholder="Enter your password"
              className={`w-full pl-12 pr-12 py-3 border  border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? "border-red-300" : ""
              }`}
            />
            <Button
              type="button"
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
          {errors.password && (
            <small className="text-xs text-red-300">
              {errors.password.message}
            </small>
          )}
        </div>

        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center">
            <Input
              {...register('rememberMe')}
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-jiko-primary hover:underline font-semibold cursor-pointer"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="disabled:opacity-50 disabled:cursor-not-allowed w-full cursor-pointer bg-jiko-primary  text-white py-3 rounded-xl font-bold hover:shadow-lg transition transform hover:-translate-y-0.5"
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href={"/register"}
              className="text-jiko-primary font-semibold hover:underline cursor-pointer"
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
    </form>
  );
};

export default Login;
