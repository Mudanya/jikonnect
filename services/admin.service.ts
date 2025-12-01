'use client'
export const loadVerifications = async () => {

    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/admin/verifications', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (data.success) {
            return { data:data.data, success: true };
        }
    } catch (err) {

        return { success: false, message: (err as Error).message }
    }
};

export const submitVerification = async (action: 'reject' | 'approve', profileId: string, rejectionReason?: string) => {
    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`/api/admin/verifications/${profileId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action,
                rejectionReason: action === 'reject' ? rejectionReason : null
            })
        });

        return await response.json();
    }
    catch (err) {
        return { success: false, message: (err as Error).message }
    }
}