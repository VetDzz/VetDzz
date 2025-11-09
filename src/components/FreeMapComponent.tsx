import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, Route, Phone, Clock, Star, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet - disable default external images
delete (L.Icon.Default.prototype as any)._getIconUrl;

interface vet {
  id: number;
  vet_name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  city: string;
  services_offered?: string[];
  opening_hours?: string;
  rating?: number;
  distance?: number;
}

interface FreeMapComponentProps {
  height?: string;
}

// Custom user location icon (blue dot)
const userLocationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
      <circle cx="10" cy="10" r="3" fill="white"/>
    </svg>
  `),
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Custom vet icon (green marker)
const labIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C9.48 0 5 4.48 5 10c0 7.5 10 20 10 20s10-12.5 10-20c0-5.52-4.48-10-10-10z" fill="#059669"/>
      <circle cx="15" cy="10" r="4" fill="white"/>
      <path d="M15 7l1 2h2l-1.5 1.5L17 13l-2-1-2 1 .5-2.5L12 9h2l1-2z" fill="#059669"/>
    </svg>
  `),
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

// Component to update map center when location changes
const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  
  return null;
};

const FreeMapComponent: React.FC<FreeMapComponentProps> = ({ 
  height = '600px' 
}) => {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [laboratories, setLaboratories] = useState<vet[]>([]);
  const [selectedLab, setSelectedLab] = useState<vet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCurrentLocation();
    fetchLaboratories(); // Load vets immediately
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      // Try multiple times for better accuracy
      let attempts = 0;
      const maxAttempts = 3;

      const tryGetLocation = () => {
        attempts++;
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            // Check if accuracy is good enough (less than 100 meters) or if we've tried enough times
            if (position.coords.accuracy <= 100 || attempts >= maxAttempts) {
              setUserLocation(location);

            } else {

              setTimeout(tryGetLocation, 1000);
            }
          },
          (error) => {

            if (attempts < maxAttempts) {
              setTimeout(tryGetLocation, 1000);
            } else {
              setUserLocation(null);
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0 // Always get fresh location
          }
        );
      };

      tryGetLocation();
    } else {

      setUserLocation(null);
    }
  };

  const fetchLaboratories = async () => {
    try {
      // Load all vets directly from database (working method)
      const { data: labs, error } = await supabase
        .from('vet_profiles')
        .select('*')
        .eq('is_verified', true);

      if (error) {
        console.error('Error loading vets:', error);
        setLaboratories([]);
      } else {
        console.log('✅ Loaded', labs?.length || 0, 'vets');
        setLaboratories(labs || []);
      }
    } catch (error) {
      console.error('Error in fetchLaboratories:', error);
      setLaboratories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getDirections = (lab: vet) => {
    if (!userLocation || !lab.latitude || !lab.longitude) {
      // Fallback to Google Maps search
      const url = `https://www.google.com/maps/search/${encodeURIComponent(lab.address + ', ' + lab.city)}`;
      window.open(url, '_blank');
      return;
    }

    // Direct Google Maps navigation
    const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${lab.latitude},${lab.longitude}`;
    window.open(url, '_blank');
  };

  const refreshLocation = () => {
    getCurrentLocation();
    fetchLaboratories();
  };

  const labsWithDistance = userLocation && laboratories.length > 0
    ? laboratories
        .filter(lab => lab.latitude && lab.longitude)
        .map(lab => ({
          ...lab,
          distance: calculateDistance(userLocation.lat, userLocation.lng, lab.latitude, lab.longitude)
        }))
        .sort((a, b) => a.distance - b.distance)
    : laboratories;

  const mapCenter: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : [48.8566, 2.3522];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-4">
        <Button
          onClick={refreshLocation}
          variant="outline"
          className="border-vet-primary text-vet-dark hover:bg-vet-light"
        >
          <Navigation className="w-4 h-4 mr-2" />
          Actualiser Position
        </Button>
        {userLocation && (
          <div className="flex items-center text-sm text-gray-600 bg-blue-50 border border-blue-200 px-3 py-2 rounded-md">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
            <span className="font-medium">Position actuelle:</span>
            <span className="ml-1">{userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Free OpenStreetMap */}
        <Card>
          <CardHeader>
            <CardTitle className="text-vet-dark flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Carte Interactive
              </div>
              {laboratories.length > 0 && (
                <Badge className="bg-vet-primary">
                  {laboratories.length} laboratoires
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="w-full rounded-lg overflow-hidden"
              style={{ height }}
            >
              {userLocation ? (
                <MapContainer
                  center={mapCenter}
                  zoom={17}
                  style={{ height: '100%', width: '100%', zIndex: 1 }}
                  className="rounded-lg"
                  zoomControl={false}
                >
                  <MapUpdater center={mapCenter} />

                  {/* High-quality tile layer */}
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                  />
                  
                  {/* User location marker */}
                  {userLocation && (
                    <Marker 
                      position={[userLocation.lat, userLocation.lng]} 
                      icon={userLocationIcon}
                    >
                      <Popup>
                        <div className="text-center">
                          <strong>Votre Position</strong><br />
                          📍 {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                        </div>
                      </Popup>
                    </Marker>
                  )}
                  
                  {/* vet markers */}
                  {labsWithDistance.map((lab) => (
                    <Marker
                      key={lab.id}
                      position={[lab.latitude, lab.longitude]}
                      icon={labIcon}
                    >
                      <Popup>
                        <div style={{ minWidth: '200px' }}>
                          <h3 style={{ margin: '0 0 8px 0', color: '#059669', fontSize: '16px', fontWeight: 'bold' }}>
                            {lab.vet_name}
                          </h3>
                          <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
                            📍 {lab.address}, {lab.city}
                          </p>
                          <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
                            📞 {lab.phone || 'N/A'}
                          </p>
                          <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
                            🕒 {lab.opening_hours || '8h00 - 18h00'}
                          </p>
                          {lab.distance && (
                            <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                              📏 {lab.distance.toFixed(1)} km
                            </p>
                          )}
                          <button 
                            onClick={() => getDirections(lab)}
                            style={{ 
                              background: '#059669', 
                              color: 'white', 
                              border: 'none', 
                              padding: '8px 16px', 
                              borderRadius: '4px', 
                              cursor: 'pointer', 
                              fontSize: '14px',
                              width: '100%'
                            }}
                          >
                            🧭 Itinéraire Google Maps
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-gray-100">
                  <MapPin className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2 font-medium">Localisation requise</p>
                  <p className="text-sm text-gray-500 mb-4 text-center max-w-xs">
                    Nous avons besoin de votre position pour afficher les laboratoires proches
                  </p>
                  <Button
                    onClick={getCurrentLocation}
                    className="bg-vet-primary hover:bg-vet-accent"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Autoriser la localisation
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* vet List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-vet-dark">
              Laboratoires Proches
              {laboratories.length > 0 && (
                <Badge className="ml-2 bg-vet-primary">
                  {laboratories.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-vet-primary mr-2" />
                <span className="text-gray-600">Chargement des laboratoires...</span>
              </div>
            ) : laboratories.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Aucun laboratoire dans la base de données</p>
                <p className="text-sm text-gray-400 mb-4">
                  Aucun laboratoire vérifié n'est disponible pour le moment
                </p>
                <Button
                  onClick={fetchLaboratories}
                  variant="outline"
                  className="border-vet-primary text-vet-dark hover:bg-vet-light"
                >
                  Actualiser
                </Button>
              </div>
            ) : (
              labsWithDistance.map((lab) => (
                <div
                  key={lab.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedLab?.id === lab.id
                      ? 'border-vet-primary bg-vet-light'
                      : 'border-gray-200 hover:border-vet-primary'
                  }`}
                  onClick={() => setSelectedLab(lab)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-vet-dark">{lab.vet_name}</h4>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600">{lab.rating || '4.5'}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{lab.address}, {lab.city}</p>

                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Clock className="w-4 h-4 mr-1" />
                    {lab.opening_hours || '8h00 - 18h00'}
                    {lab.distance && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{lab.distance.toFixed(1)} km</span>
                      </>
                    )}
                  </div>

                  {lab.services_offered && lab.services_offered.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {lab.services_offered.slice(0, 2).map((service, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                      {lab.services_offered.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{lab.services_offered.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        getDirections(lab);
                      }}
                      className="bg-vet-primary hover:bg-vet-accent"
                    >
                      <Route className="w-3 h-3 mr-1" />
                      Itinéraire
                    </Button>
                    {lab.phone && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`tel:${lab.phone}`, '_self');
                        }}
                        className="border-vet-primary text-vet-dark hover:bg-vet-light"
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Appeler
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FreeMapComponent;
