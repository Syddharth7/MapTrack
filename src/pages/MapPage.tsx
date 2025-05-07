import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useLocation as useLocationContext } from '../contexts/LocationContext';
import UsersList from '../components/UsersList';
import ChatBox from '../components/ChatBox';
import { MapPin } from 'lucide-react';

// Initial view settings
const INITIAL_VIEW_STATE = {
  center: [37.7749, -122.4194],
  zoom: 12
};

// Custom marker icon
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Component to update map center
const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const MapPage: React.FC = () => {
  const { userLocation, userLocations } = useLocationContext();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [center, setCenter] = useState<[number, number]>(INITIAL_VIEW_STATE.center);

  // Update center when user location is available
  useEffect(() => {
    if (userLocation) {
      setCenter([userLocation.latitude, userLocation.longitude]);
    }
  }, [userLocation]);

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
    // Find the selected user
    const user = userLocations.find(u => u.id === userId);
    if (user?.location) {
      // Center map on selected user
      setCenter([user.location.latitude, user.location.longitude]);
    }
  };

  const handleOpenChat = (userId: string) => {
    setSelectedUser(userId);
    setChatOpen(true);
  };

  const handleCloseChat = () => {
    setChatOpen(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-col md:flex-row h-full">
        {/* User List Sidebar */}
        <div className="w-full md:w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <UsersList 
            users={userLocations} 
            selectedUser={selectedUser}
            onUserSelect={handleUserSelect}
            onChatSelect={handleOpenChat}
          />
        </div>
        
        {/* Map Container */}
        <div className="flex-1 relative">
          <MapContainer
            center={center}
            zoom={INITIAL_VIEW_STATE.zoom}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapUpdater center={center} />
            
            {/* User's location */}
            {userLocation && (
              <Marker
                position={[userLocation.latitude, userLocation.longitude]}
                icon={customIcon}
              >
                <Popup>
                  <div className="text-center">
                    <p className="font-semibold">You are here</p>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Other users' locations */}
            {userLocations.map(user => {
              if (!user.location) return null;
              
              return (
                <Marker
                  key={user.id}
                  position={[user.location.latitude, user.location.longitude]}
                  icon={customIcon}
                  eventHandlers={{
                    click: () => handleUserSelect(user.id)
                  }}
                >
                  <Popup>
                    <div className="text-center">
                      <h3 className="font-semibold">{user.username}</h3>
                      <p className="text-sm text-gray-600">
                        Status: {user.status}
                      </p>
                      <button
                        onClick={() => handleOpenChat(user.id)}
                        className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      >
                        Start Chat
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
          
          {/* Chat Overlay */}
          {chatOpen && selectedUser && (
            <ChatBox
              userId={selectedUser}
              username={userLocations.find(u => u.id === selectedUser)?.username || 'User'}
              onClose={handleCloseChat}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPage;