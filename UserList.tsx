import  { X, User, Users } from 'lucide-react';

interface UserListProps {
  users: string[];
  count: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserList({ users, count, isOpen, onClose }: UserListProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Users size={20} className="text-indigo-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">Active Users</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-2 text-sm text-gray-600 flex items-center">
          <Users size={14} className="mr-1" />
          <span>{count} users online</span>
        </div>
        
        <div className="border rounded-lg divide-y">
          {users.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <User size={32} className="mx-auto mb-2 opacity-30" />
              <p>No active users detected</p>
              <p className="text-xs mt-1">Users will appear here once they send a message</p>
            </div>
          ) : (
            users.map((user, index) => (
              <div key={index} className="flex items-center p-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold mr-3">
                  {user.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-800 font-medium">{user}</span>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>User list is updated when people send messages</p>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
 