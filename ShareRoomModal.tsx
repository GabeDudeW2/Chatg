import  { useState, useRef } from 'react';
import { Copy, X, Check, Link } from 'lucide-react';

interface ShareRoomModalProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareRoomModal({ roomId, isOpen, onClose }: ShareRoomModalProps) {
  const [copied, setCopied] = useState(false);
  const linkRef = useRef<HTMLInputElement>(null);
  
  if (!isOpen) return null;
  
  const roomUrl = `${window.location.origin}/room/${roomId}`;
  
  const copyToClipboard = () => {
    if (linkRef.current) {
      linkRef.current.select();
      document.execCommand('copy');
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Share This Room</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">
          Share this link with others so they can join this private room:
        </p>
        
        <div className="flex items-center mb-6">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Link size={16} className="text-gray-500" />
            </div>
            <input
              ref={linkRef}
              type="text"
              value={roomUrl}
              readOnly
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
          </div>
          <button
            onClick={copyToClipboard}
            className={`px-4 py-2 rounded-r-md flex items-center ${
              copied 
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {copied ? (
              <>
                <Check size={16} className="mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy size={16} className="mr-1" />
                Copy
              </>
            )}
          </button>
        </div>
        
        <div className="text-center text-gray-600 text-sm">
          <p>
            Anyone with this link can join this room. The room will remain active as long as people are using it.
          </p>
        </div>
      </div>
    </div>
  );
}
 