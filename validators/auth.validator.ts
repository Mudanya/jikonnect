import { z } from 'zod'

export const registerSchema = z.object({
    email: z.email('Invalid email address'),
    phone: z.string().regex(/^(\+254|0)[17]\d{8}$/, 'Invalid kenyan number'),
    password: z.string()
        .min(8, 'Password must be atleast 8 characters')
        .regex(/[A-Z]/, 'Password must contain atleast one uppercase letter')
        .regex(/[a-z]/, 'Password must contain atleast one lowercase letter')
        .regex(/[0-9]/, 'Password must contain atleast one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain atleast one special character'),
    confirmPassword: z.string(),
    firstName: z.string().min(2, 'First name must be atleast 2 characters'),
    lastName: z.string().min(2, 'Last name must be atleast 2 characters'),
    role: z.enum(['CLIENT', 'PROFESSIONAL']).optional(),
}).refine(data => data.password === data.confirmPassword,
    { message: "Passwords don't match", path: ['confirmPassword'] })


export const loginSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(1, 'Password is required')

});

export const forgotPasswordSchema = z.object({
    email: z.email('Invalid email address')
});


export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]

});