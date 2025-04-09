import  { useState } from 'react';
import { Send, Smile } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3">
      <button 
        type="button"
        className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
        title="Insert emoji (coming soon)"
        disabled={disabled}
      >
        <Smile size={20} />
      </button>
      
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 rounded-full border border-gray-300 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder={disabled ? "Connecting to chat server..." : "Type a message..."}
        disabled={disabled}
      />
      
      <button 
        type="submit" 
        className={`p-2 rounded-full ${disabled || !message.trim() ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
        disabled={!message.trim() || disabled}
      >
        <Send size={20} />
      </button>
    </form>
  );
}
 
