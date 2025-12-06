"use client";

import { EditProfileFormData } from "@/validators/profile.validator";

export const submitProfile = async (formData: EditProfileFormData) => {
    try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) throw new Error("No access token found");

        const profileRes = await fetch("/api/profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                avatar: formData.avatar,
            }),
        });
        const profileData = await profileRes.json();
        if (!profileData.success) {
            throw new Error(profileData.message || "Failed to update profile");
        }

        // update professional profile if role is PROFESSIONAL
        if (formData.role === "PROFESSIONAL") {
            const professionalRes = await fetch("/api/profile/professional", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    bio: formData.bio,
                    services: formData.services,
                    hourlyRate: formData.hourlyRate,
                    yearsOfExperience: formData.yearsOfExperience,
                    location: formData.location,
                    languages: formData.languages,
                    idNumber: formData.idNumber
                }),
            });
            const professionalData = await professionalRes.json();
            if (!professionalData.success) {
                throw new Error(professionalData.message || "Failed to update professional profile");
            }
        }

        return { success: true };
    }
    catch (err) {
        throw new Error("Failed to submit : " + (err as Error).message);
    }
}

export const submitVerification = async (idNumber: string) => {
    try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) throw new Error("No access token found");

        const res = await fetch("/api/profile/id-verification", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ idNumber }),
        });
        const data = await res.json();
        if (!data.success) {
            throw new Error(data.message || "Failed to submit ID verification");
        }
        return data;//TODO: loadProfile(); after verification
    }
    catch (err) {
        throw new Error("Failed to submit : " + (err as Error).message);
    }
}

export const uploadDocument = async (e: React.ChangeEvent<HTMLInputElement>, documentType: 'certificate' | 'idDocument' | 'avatar') => {
    try {
        const file = e.target.files?.[0];
        if (!file) return;
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) throw new Error("No access token found");

        const formData = new FormData();
        formData.append('documentType', documentType);
        formData.append('file', file);

        const res = await fetch("/api/profile/documents", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
        });
        const data = await res.json();
        if (!data.success) {
            throw new Error(data.message || "Failed to upload document");
        }
        return { success: true, fileUrl: data.data.fileUrl, documentType };
    }
    catch (err) {
        throw new Error("Failed to upload document : " + (err as Error).message);
    }
}

export const getProviderProfile = async (providerId: string, token: string) => {

    const response = await fetch(`/api/services/provider/${providerId}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        }
    });
    return await response.json();
}