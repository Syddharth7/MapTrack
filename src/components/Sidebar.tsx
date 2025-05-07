import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { MapIcon, Users, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import logo from '../assets/PWDlogo.png'


interface ProfileData {
  username: string;
  avatar_url: string | null;
}

interface SidebarProps {
  children?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch profile data
  React.useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data as ProfileData);
    };

    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    // Update status to offline before signing out
    if (user) {
      await supabase
        .from('profiles')
        .update({ status: 'offline' })
        .eq('id', user.id);
    }
    
    await signOut();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive 
        ? 'bg-blue-100 text-blue-700' 
        : 'text-gray-700 hover:bg-gray-100'
    }`;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-md bg-white shadow-md"
        onClick={toggleMobileMenu}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 transform ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 z-20 w-64 bg-white shadow-md transition-transform duration-300 ease-in-out flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-between gap-2">
            <img src={logo} className='w-10 h-10' alt="logo" />
            <div className='flex items-center'>
            <MapIcon className="text-blue-600" size={28} />
            <h1 className="text-xl font-bold text-gray-900">MapConnect</h1>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <NavLink 
            to="/map" 
            className={navLinkClass}
            onClick={() => setMobileMenuOpen(false)}
          >
            <MapIcon size={20} />
            <span>Map</span>
          </NavLink>
          <NavLink 
            to="/users" 
            className={navLinkClass}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Users size={20} />
            <span>Users</span>
          </NavLink>
          <NavLink 
            to="/profile" 
            className={navLinkClass}
            onClick={() => setMobileMenuOpen(false)}
          >
            <User size={20} />
            <span>Profile</span>
          </NavLink>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t mt-auto">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-800 font-medium">
                    {profile?.username.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile?.username || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              aria-label="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
};

export default Sidebar;