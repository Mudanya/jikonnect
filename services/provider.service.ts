
export const loadUserProfile = async (accessToken: string) => {
    try {
        const response = await fetch("/api/profile", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();

        return data;
    } catch (err) {
       
        return { success: false, message: "Failed to load profile" };
    }
};

export const updateProfile = async (accessToken: string, profileData: any) => {
    try {
        const response = await fetch("/api/profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(profileData),
        });

        const data = await response.json();
        return data;
    } catch (err) {
   
        return { success: false, message: "Failed to update profile" };
    }
}

export const uploadProfessionalDocument = async (accessToken: string, formData: FormData) => {
    try {
        const response = await fetch("/api/profile/documents", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
        });
        const data = await response.json();
        return data;
    } catch (err) {
        
        return { success: false, message: "Failed to upload document" };
    }
};

export const verifyIdDocument = async (accessToken: string, idNumber: string) => {
    try {
        const response = await fetch("/api/profile/id-verification", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                idNumber,
            }),
        });

        const data = await response.json();
        return data;    
    } catch (err) {
        
        return { success: false, message: "Failed to verify ID document" };
    }
};