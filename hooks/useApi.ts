import { useAuth } from "@/contexts/AuthContext"
import { useCallback, useState } from "react"

interface ApiOptions extends RequestInit {
    requireAuth?: boolean
}

export const useApi = () => {
    const { refreshToken } = useAuth()
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const fetchWithAuth = useCallback(async (url: string, options: ApiOptions = {}) => {
        setLoading(true);
        setError(null);

        try {
            const { requireAuth = true, ...fetchOptions } = options;

            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                ...fetchOptions.headers,
            };

            if (requireAuth) {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
                }
            }

            let response = await fetch(url, {
                ...fetchOptions,
                headers,
            });

            // If unauthorized and we have a refresh token, try to refresh
            if (response.status === 401 && requireAuth) {
                await refreshToken();
                const newToken = localStorage.getItem('accessToken');

                if (newToken) {
                    (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
                    response = await fetch(url, {
                        ...fetchOptions,
                        headers,
                    });
                }
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (err) {
            if (err instanceof Error)
                setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [refreshToken]);

    return { fetchWithAuth, loading, error };

}