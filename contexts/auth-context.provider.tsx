"use client";
import { cn } from "@/lib/utils";
import { HeaderDesc } from "@/types/auth";
import Image from "next/image";
import Link from "next/link";
import { createContext, ReactNode, useState } from "react";

export const AuthLayoutContext = createContext({
  headerDesc: {} as HeaderDesc,
  setHeaderDesc: (desc: HeaderDesc) => {},
});

export function AuthLayoutProvider({ children }: { children: ReactNode }) {
  // Your context logic here
  const [headerDesc, setHeaderDesc] = useState<HeaderDesc>({});

  return (
    <AuthLayoutContext.Provider value={{ headerDesc, setHeaderDesc }}>
      <div
        className={cn(
          `min-h-screen bg-linear-to-br from-purple-50 via-blue-50 to-slate-50 `,
          headerDesc.classFlex
        )}
      >
        <div className={cn(`mx-auto `, headerDesc.classWidth)}>
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Link
                className="w-auto h-12  flex items-center justify-center"
                href={"/"}
              >
                <Image
                  src={"/assets/images/jiko-logo-lg.png"}
                  alt="Jikonnect logo"
                  width={800}
                  height={600}
                  className="w-auto h-16"
                />
              </Link>
            </div>
            <p className="text-gray-600">{headerDesc.title}</p>
          </div>
          {children}
        </div>
      </div>
    </AuthLayoutContext.Provider>
  );
}
