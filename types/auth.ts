import { RegisterFormData } from "@/validators/auth.validator";
import { NextRequest } from "next/server";

export type HeaderDesc =
    {
        title?: string;
        classWidth?: string;
        classFlex?: string;
    }

export type AuthUser = {
    userId: string
    email: string
    role: string
}

export type RegisterUser =
    {
        email: string,
        phone: string
        password: string,
        firstName: string
        lastName: string,
        role?: 'CLIENT' | 'PROFESSIONAL',
    }

export type RegisterData = {
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    role?: 'CLIENT' | 'PROFESSIONAL';
}
export type User = {
    id: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    avatar?: string;
}

export type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string, callbackUrl?: string) => Promise<void>;
    register: (data: RegisterFormData) => Promise<void>;
    logout: () => void;
    refreshToken: () => Promise<void>;
    isAuthenticated: boolean;
}

export interface AuthenticatedRequest extends NextRequest {
    user: {
        userId: string
        role: string
        email: string
    }
}