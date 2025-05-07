import React, { ReactNode } from 'react';
import Sidebar from '../components/Sidebar';
import { useLocation } from 'react-router-dom';
import { MapIcon, Users, User } from 'lucide-react';

interface DashboardProps {
  children?: ReactNode;
}

const Dashboard: React.FC<DashboardProps> = ({ children }) => {
  const location = useLocation();
  
  // Get current page title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/map') return { title: 'Map', icon: <MapIcon className="text-blue-600" size={24} /> };
    if (path === '/users') return { title: 'Users', icon: <Users className="text-blue-600" size={24} /> };
    if (path === '/profile') return { title: 'User Profile', icon: <User className="text-blue-600" size={24} /> };
    return { title: 'Dashboard', icon: <MapIcon className="text-blue-600" size={24} /> };
  };
  
  const { title, icon } = getPageTitle();

  return (
    <Sidebar>
      {children ? (
        children
      ) : (
        <div className="p-6">
          <div className="mb-8 flex items-center gap-2">
            {icon}
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Navigation Cards */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <MapIcon className="text-blue-600 mb-4" size={24} />
              <h2 className="text-xl font-semibold mb-2">Interactive Map</h2>
              <p className="text-gray-600 mb-4">View user locations in real-time and connect with them through chat.</p>
              <a href="/map" className="text-blue-600 font-medium hover:underline">Open Map →</a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <Users className="text-blue-600 mb-4" size={24} />
              <h2 className="text-xl font-semibold mb-2">User Management</h2>
              <p className="text-gray-600 mb-4">View, create, update, and manage user accounts in the system.</p>
              <a href="/users" className="text-blue-600 font-medium hover:underline">Manage Users →</a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <User className="text-blue-600 mb-4" size={24} />
              <h2 className="text-xl font-semibold mb-2">Your Profile</h2>
              <p className="text-gray-600 mb-4">Update your personal information, upload a profile picture, and manage settings.</p>
              <a href="/profile" className="text-blue-600 font-medium hover:underline">Edit Profile →</a>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
};

export default Dashboard;