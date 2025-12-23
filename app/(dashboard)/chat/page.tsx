'use client';

import { ConversationsList } from '@/components/chat/ConversationsList';

export default function ChatPage() {
  return (
    <div className="min-h-screen ">
      <div className="px-4 py-8">
       

        <ConversationsList />

        {/* Safety Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            🛡️ Stay Protected with JiKonnect
          </h4>
          <p className="text-sm text-blue-700">
            All communication must stay within JiKonnect for your safety and
            payment protection. Sharing contact details or moving off-platform
            may result in account suspension.
          </p>
        </div>
      </div>
    </div>
  );
}