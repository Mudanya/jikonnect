"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { AuthLayoutContext } from "../layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import {
  ForgotPasswordFormData,
  forgotPasswordSchema,
} from "@/validators/auth.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { setHeaderDesc } = useContext(AuthLayoutContext);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    setHeaderDesc({
      title: "",
      classWidth: "w-xl",
      classFlex: "flex items-center justify-center w-full p-4",
    });
  }, [setHeaderDesc]);

  const submitForm = async ({email}:ForgotPasswordFormData) => {
      try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to send reset email");
      }

      setSuccess(true);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } 
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl  border-gray-100 p-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit(submitForm)}>
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-700">
              If an account exists with this email, a password reset link has
              been sent. Please check your email.
            </div>
          </div>
        )}

        <div>
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <Input
            type="email"
            {...register("email")}
            
            
            className={cn("appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:z-10 sm:text-sm",`${errors.email ? 'border border-red-500':''}`)}
            placeholder="Email address"
          />
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-jiko-primary hover:bg-jiko-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jiko-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Sending..." : "Send reset link"}
          </Button>
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
}
