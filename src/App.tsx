import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import UsersPage from './pages/UsersPage';
import UserProfile from './pages/UserProfile';
import { useAuth } from './contexts/AuthContext';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Add page title based on route
  useEffect(() => {
    const pathName = location.pathname;
    let title = 'MapConnect';
    
    if (pathName.includes('/map')) {
      title = 'Map | MapConnect';
    } else if (pathName.includes('/users')) {
      title = 'Users | MapConnect';
    } else if (pathName.includes('/profile')) {
      title = 'Profile | MapConnect';
    } else if (pathName.includes('/login')) {
      title = 'Login | MapConnect';
    } else if (pathName.includes('/signup')) {
      title = 'Sign Up | MapConnect';
    } else if (pathName === '/') {
      title = 'Dashboard | MapConnect';
    }
    
    document.title = title;
  }, [location]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/" replace /> : <SignUp />}
      />
      <Route
        path="/"
        element={user ? <Dashboard /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/map"
        element={user ? <Dashboard><MapPage /></Dashboard> : <Navigate to="/login" replace />}
      />
      <Route
        path="/users"
        element={user ? <Dashboard><UsersPage /></Dashboard> : <Navigate to="/login" replace />}
      />
      <Route
        path="/profile"
        element={user ? <Dashboard><UserProfile /></Dashboard> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;