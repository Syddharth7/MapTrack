import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './AuthContext';

interface Location {
  latitude: number;
  longitude: number;
}

interface UserLocation {
  id: string;
  location: Location | null;
  username: string;
  avatar_url: string | null;
  status: string;
}

interface LocationContextType {
  userLocation: Location | null;
  userLocations: UserLocation[];
  updateUserLocation: (location: Location) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [userLocations, setUserLocations] = useState<UserLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current user's location
  useEffect(() => {
    const getCurrentLocation = () => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser');
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(location);
          setLoading(false);
          
          // If user is logged in, update their location in the database
          if (user) {
            updateUserLocation(location).catch(console.error);
          }
        },
        (error) => {
          setError(`Error getting location: ${error.message}`);
          setLoading(false);
        }
      );
    };

    getCurrentLocation();
    
    // Set up periodic location updates
    const locationInterval = setInterval(getCurrentLocation, 60000); // Update every minute
    
    return () => clearInterval(locationInterval);
  }, [user]);

  // Subscribe to location changes from other users
  useEffect(() => {
    if (!user) return;
    
    const fetchAllUserLocations = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, location, status')
        .neq('id', user.id); // Exclude current user
        
      if (error) {
        console.error('Error fetching user locations:', error);
        return;
      }
      
      setUserLocations(data as UserLocation[]);
    };
    
    fetchAllUserLocations();
    
    // Subscribe to changes in the profiles table
    const subscription = supabase
      .channel('profile-changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles' 
      }, (payload) => {
        // Update the user locations when a profile is updated
        setUserLocations(prevLocations => {
          const index = prevLocations.findIndex(loc => loc.id === payload.new.id);
          if (index === -1) {
            // If the updated profile is not in our list and it's not the current user, add it
            if (payload.new.id !== user.id) {
              return [...prevLocations, payload.new as UserLocation];
            }
            return prevLocations;
          }
          // Update the existing profile
          const updated = [...prevLocations];
          updated[index] = payload.new as UserLocation;
          return updated;
        });
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const updateUserLocation = async (location: Location) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          location, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', user.id);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error updating location:', error);
      setError('Failed to update location');
    }
  };

  const value = {
    userLocation,
    userLocations,
    updateUserLocation,
    loading,
    error
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};