import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLocation as useLocationContext } from '../contexts/LocationContext';
import { User, Upload, MapPin, CheckCircle, XCircle } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { userLocation } = useLocationContext();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    username: string;
    avatar_url: string | null;
  }>({
    username: '',
    avatar_url: null
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setUserProfile({
          username: data.username || '',
          avatar_url: data.avatar_url
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserProfile({ ...userProfile, username: e.target.value });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setAvatarFile(null);
      setAvatarPreview(null);
      return;
    }

    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;

    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile);

      if (uploadError) throw uploadError;

      return `${supabaseUrl}/storage/v1/object/public/avatars/${filePath}`;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setUpdating(true);

    if (!userProfile.username.trim()) {
      setError('Username is required');
      setUpdating(false);
      return;
    }

    try {
      let avatar_url = userProfile.avatar_url;

      // Upload new avatar if selected
      if (avatarFile) {
        avatar_url = await uploadAvatar();
      }

      // Update profile
      const { error } = await updateProfile({
        username: userProfile.username,
        avatar_url
      });

      if (error) throw error;

      setSuccess('Profile updated successfully');
      setAvatarFile(null);
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  // Get Supabase URL from client for avatar storage URL
  const supabaseUrl = supabase.supabaseUrl;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-2">
        <User className="text-blue-600" size={24} />
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center gap-2">
          <XCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex items-center gap-2">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
              {avatarPreview || userProfile.avatar_url ? (
                <img
                  src={avatarPreview || userProfile.avatar_url!}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600">
                  <span className="text-4xl font-bold">
                    {userProfile.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="avatar"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
              >
                <Upload size={18} className="mr-2" />
                Change Avatar
              </label>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="sr-only"
              />
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG, or GIF. Max size 5MB.
              </p>
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={userProfile.username}
                onChange={handleUsernameChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={user?.email || ''}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Location information */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 flex items-center">
                <MapPin size={18} className="mr-2 text-blue-600" />
                Current Location
              </h3>
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                {userLocation ? (
                  <div className="text-sm text-gray-800">
                    <div className="flex justify-between">
                      <span>Latitude:</span>
                      <span className="font-mono">{userLocation.latitude.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Longitude:</span>
                      <span className="font-mono">{userLocation.longitude.toFixed(6)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Location data unavailable</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Your location is automatically updated when you use the map
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={updating}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;