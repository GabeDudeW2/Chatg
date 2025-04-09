import  { Message } from '../types';

interface ChatMessageProps {
  message: Message & { renderKey?: string };
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Handle system messages differently
  if (message.sender === 'System') {
    return (
      <div className="flex justify-center my-2 fade-in">
        <div className="system-message">
          <p>{message.text}</p>
          <span className="message-time text-gray-500">{formattedTime}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`message-container ${message.isMine ? 'items-end' : 'items-start'} fade-in`}>
      {!message.isMine && (
        <span className="text-xs font-medium text-gray-600">{message.sender}</span>
      )}
      <div className={`message-bubble ${message.isMine ? 'my-message' : 'other-message'}`}>
        <p>{message.text}</p>
        <span className={`message-time ${message.isMine ? 'text-indigo-200' : 'text-gray-500'}`}>
          {formattedTime}
        </span>
      </div>
    </div>
  );
}
 
