// services/apis/chat.api.ts

/**
 * Get or create a conversation with a provider/client
 * Returns the conversation ID to navigate to
 */
export async function getOrCreateConversation(
    providerId: string,
    token?: string
): Promise<{ success: boolean; conversationId?: string; message?: string }> {
    try {
        // Check if conversation already exists
        const checkResponse = await fetch('/api/chat/conversations', {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            }
        });
        const checkData = await checkResponse.json();

        if (checkData.success) {
            // Find existing conversation with this provider
            const existingConversation = checkData.data.find(
                (conv: any) =>
                    conv.providerId === providerId || conv.clientId === providerId
            );

            if (existingConversation) {
                return {
                    success: true,
                    conversationId: existingConversation.id,
                };
            }
        }

        // Create new conversation if none exists
        const createResponse = await fetch('/api/chat/conversations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({ providerId }),
        });

        const createData = await createResponse.json();

        if (createData.success) {
            return {
                success: true,
                conversationId: createData.data.id,
            };
        } else {
            return {
                success: false,
                message: createData.error || 'Failed to create conversation',
            };
        }
    } catch (error) {
        console.error('Error getting/creating conversation:', error);
        return {
            success: false,
            message: (error as Error).message,
        };
    }
}

/**
 * Start a conversation and navigate to it
 */
export async function startConversation(
    providerId: string,
    providerName: string,
    router: any,
    token?: string
): Promise<void> {
    try {
        const result = await getOrCreateConversation(providerId,token);

        if (result.success && result.conversationId) {
            // Navigate to the conversation
            router.push(`/chat/${result.conversationId}`);
        } else {
            throw new Error(result.message || 'Failed to start conversation');
        }
    } catch (error) {
        console.error('Error starting conversation:', error);
        throw error;
    }
}