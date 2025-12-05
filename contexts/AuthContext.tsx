"use client";
import { AuthContextType, User } from "@/types/auth";
import { RegisterFormData } from "@/validators/auth.validator";
import { useRouter, useSearchParams } from "next/navigation";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const loadUser = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");
      if (accessToken && storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  //   login
  const login = async (
    email: string,
    password: string,
    callbackUrl?: string
  ) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) throw new Error(data.message || "Login failed");
      const {
        tokens: { accessToken, refreshToken },
        user: reUser,
      } = data.data;

      if (!(reUser?.emailVerified)) {
        throw new Error("Verify your email address to login");
      }

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(reUser));

      setUser(reUser);

      let callback = "/services";
      if (reUser.role === "PROFESSIONAL") {
        callback = "/provider/dashboard";
      }
      if (reUser.role === "ADMIN") {
        callback = "/admin";
      }
      console.log("callback", callback);
      router.push(callbackUrl || callback);
      return;
    } catch (err) {
      if (err instanceof Error) {
        console.error("Login error:", err); // Debugging line
        throw new Error(err.message || "Login failed");
      }
    }
  };
  //   register
  const register = async (data: RegisterFormData) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Registration failed");
      }
      const {
        user: regUser,
        tokens: { accessToken, refreshToken },
      } = result.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", regUser);

      setUser(regUser);
      router.push("/login");
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(err.message || "Registration failed");
      }
    }
  };

  const logout = async () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No Refresh Token");

      const response = await fetch("/api/auth/refresh-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      const result = await response.json();
      if (!result.success) throw new Error("Refresh token failed!");
      const {
        tokens: { accessToken, refreshToken: newRefreshToken },
      } = result.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
    } catch (err) {
      logout();
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshToken,
    isAuthenticated: user ? true : false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
