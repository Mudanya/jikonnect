"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  ResetPasswordFormData,
  resetPasswordSchema,
} from "@/validators/auth.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AuthLayoutContext } from "@/contexts/auth-context.provider";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const {
    handleSubmit,
    register,
    formState: { errors, isValid, isSubmitting },
    setValue,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
    shouldUnregister: true,
  });
  const [error, setError] = useState("");

  const { setHeaderDesc } = useContext(AuthLayoutContext);

  useEffect(() => {
    setHeaderDesc({
      title: "",
      classWidth: "w-xl",
      classFlex: "flex items-center justify-center w-full p-4",
    });
    setValue("token", token, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }, [setHeaderDesc, setValue, token]);

  const submitForm = async ({
    newPassword,
    confirmPassword,
  }: ResetPasswordFormData) => {
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");

      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to reset password");
      }

      toast.success(
        "Password reset successful! You can now login with your new password."
      );
      router.push("/login");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl  border-gray-100 p-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Set new password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your new password below.
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit(submitForm)}>
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>

            <Input
              {...register("newPassword")}
              type="password"
              className={cn(
                "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                errors.newPassword ? "border border-red-500" : ""
              )}
              placeholder="••••••••"
            />
             {errors.newPassword && <p className="text-sm mt-1 text-red-500">{errors.newPassword.message}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Must contain uppercase, lowercase, number, and special character
            </p>
          </div>

          <div>
            <label 
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </label>
            <Input
              {...register("confirmPassword")}
              type="password"
              className={cn(
                "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                errors.confirmPassword ? "border border-red-500" : ""
              )}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="text-sm mt-1 text-red-500">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <div>
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-jiko-primary hover:bg-jiko-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Resetting..." : "Reset password"}
          </Button>
        </div>
      </form>
      s
    </div>
  );
}
