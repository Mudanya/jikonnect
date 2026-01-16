"use client";
import { AuthLayoutProvider } from "@/contexts/auth-context.provider";


const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AuthLayoutProvider>{children}</AuthLayoutProvider>
    </>
  );
};

export default AuthLayout;
