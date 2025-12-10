import { useState } from 'react';
import WorkflowChat from './WorkflowChat';

export default function FloatingChatButton({ workflow }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!workflow) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button - Hidden when chat is open */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 z-40 flex items-center justify-center group"
          aria-label="Open chat"
        >
        <svg 
          className="w-6 h-6 transition-transform group-hover:rotate-12" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
          />
        </svg>

        </button>
      )}

      {/* Chat Panel */}
      <WorkflowChat 
        workflow={workflow} 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}

