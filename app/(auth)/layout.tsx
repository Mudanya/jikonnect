"use client";
import { cn } from "@/lib/utils";
import { HeaderDesc } from "@/types/auth";
import { createContext, useState } from "react";

export const AuthLayoutContext = createContext({
  headerDesc: {} as HeaderDesc,
  setHeaderDesc: (desc: HeaderDesc) => {},
});
const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const [headerDesc, setHeaderDesc] = useState<HeaderDesc>({});
  return (
    <AuthLayoutContext.Provider value={{ headerDesc, setHeaderDesc }}>
      <div className={cn(`min-h-screen bg-linear-to-br from-purple-50 via-blue-50 to-slate-50 `, headerDesc.classFlex)}>
        <div className={cn(`mx-auto `, headerDesc.classWidth)}>
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-linear-to-br from-purple-700 to-blue-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">Ji</span>
              </div>
              <span className="text-3xl font-bold text-gray-900">
                JiKonnect
              </span>
            </div>
            <p className="text-gray-600">{headerDesc.title}</p>
          </div>
          {children}
        </div>
      </div>
    </AuthLayoutContext.Provider>
  );
};

export default AuthLayout;
