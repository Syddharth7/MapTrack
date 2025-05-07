import React, { useState } from 'react';
import { Search, MessageSquare } from 'lucide-react';

interface User {
  id: string;
  username: string;
  avatar_url: string | null;
  status: string;
}

interface UsersListProps {
  users: User[];
  selectedUser: string | null;
  onUserSelect: (userId: string) => void;
  onChatSelect: (userId: string) => void;
}

const UsersList: React.FC<UsersListProps> = ({ 
  users, 
  selectedUser,
  onUserSelect,
  onChatSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort users by online status
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (a.status === 'online' && b.status !== 'online') return -1;
    if (a.status !== 'online' && b.status === 'online') return 1;
    return a.username.localeCompare(b.username);
  });

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Users</h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {sortedUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'No users match your search' : 'No users available'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {sortedUsers.map(user => (
              <li
                key={user.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer ${
                  selectedUser === user.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => onUserSelect(user.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 relative">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span
                      className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                        user.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                      }`}
                    ></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.status === 'online' ? 'Online' : 'Offline'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onChatSelect(user.id);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full"
                    aria-label={`Chat with ${user.username}`}
                  >
                    <MessageSquare size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UsersList;