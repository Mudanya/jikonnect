import { z } from 'zod';
export const clientSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().regex(/^(\+254|0)[17]\d{8}$/, 'Invalid kenyan number'),
    avatar: z.string().optional(),
    role: z.enum(["CLIENT", "PROFESSIONAL","ADMIN"]).optional(),

});
export const profileSchema = z.object({
    bio: z.string().min(1, 'Bio is required'),
    services: z.array(z.string()).min(1, 'Services are required'),
    hourlyRate: z.number().min(0, 'Hourly rate must be a positive number'),
    yearsOfExperience: z.number().optional(),
    location: z.string().optional(),
    idNumber: z.string().optional(),
    languages: z.array(z.string()).optional(),
});

export const editProfileSchema = clientSchema.extend(profileSchema.shape);

export type ClientFormData = z.infer<typeof clientSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type EditProfileFormData = z.infer<typeof editProfileSchema>;