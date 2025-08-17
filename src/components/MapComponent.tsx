import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, Search, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export interface Laboratory {
  id: number;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  services: string[];
}

export interface MapComponentHandles {
  focusLab: (id: number) => void;
}

interface MapComponentProps {
  laboratories?: Laboratory[];
  onLocationSelect?: (lat: number, lng: number) => void;
  mode?: 'view' | 'select';
  height?: string;
}

const MapComponent = forwardRef<MapComponentHandles, MapComponentProps>(({
  laboratories = [],
  onLocationSelect,
  mode = 'view',
  height = '400px'
}, ref) => {
  const { t } = useLanguage();
  const mapRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedLab, setSelectedLab] = useState<Laboratory | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Expose imperative handle to allow parent to focus a lab on the map
  useImperativeHandle(ref, () => ({
    focusLab: (id: number) => {
      const lab = labsToShow.find(l => l.id === id);
      if (lab) {
        setSelectedLab(lab);
        // Smoothly scroll the map into view to direct the user to the left map
        mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }));

  // Use only real laboratories data - no mock data
  const labsToShow = laboratories || [];

  // Recenter logic for the mock map when a lab is selected
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !selectedLab) return;
    // For this simplified map, we could visually highlight via selection only.
    // If a real map is used, we would center to selectedLab.lat/lng here.
  }, [isMapLoaded, selectedLab]);

  useEffect(() => {
    // Get user location
    getCurrentLocation();

    // Simulate map loading
    const timer = setTimeout(() => {
      setIsMapLoaded(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          console.log('User location found:', location);
          if (onLocationSelect) {
            onLocationSelect(location.lat, location.lng);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to Paris center
          const fallbackLocation = { lat: 48.8566, lng: 2.3522 };
          setUserLocation(fallbackLocation);
          console.log('Using fallback location (Paris):', fallbackLocation);
          if (onLocationSelect) {
            onLocationSelect(fallbackLocation.lat, fallbackLocation.lng);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser');
      // Fallback to Paris center
      const fallbackLocation = { lat: 48.8566, lng: 2.3522 };
      setUserLocation(fallbackLocation);
      if (onLocationSelect) {
        onLocationSelect(fallbackLocation.lat, fallbackLocation.lng);
      }
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

  const getNearestLaboratories = () => {
    if (!userLocation) return labsToShow;

    return labsToShow
      .map(lab => ({
        ...lab,
        distance: calculateDistance(userLocation.lat, userLocation.lng, lab.lat, lab.lng)
      }))
      .sort((a, b) => a.distance - b.distance);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <Button
          onClick={getCurrentLocation}
          variant="outline"
          className="border-laboratory-primary text-laboratory-dark hover:bg-laboratory-light"
        >
          <Navigation className="w-4 h-4 mr-2" />
          {t('findLab.myLocation')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map Area */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-laboratory-dark">Carte Interactive</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                ref={mapRef}
                className="w-full bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden"
                style={{ height }}
              >
                {!isMapLoaded ? (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-laboratory-primary"></div>
                    <p className="text-sm text-gray-500">Chargement de la carte...</p>
                  </div>
                ) : (
                  <div className="w-full h-full relative overflow-hidden rounded-lg">
                    {/* Street map style background */}
                    <div className="absolute inset-0 bg-gray-100">
                      {/* Grid pattern to simulate streets */}
                      <svg className="w-full h-full opacity-30" viewBox="0 0 400 400">
                        <defs>
                          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="1"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                        {/* Main roads */}
                        <line x1="0" y1="200" x2="400" y2="200" stroke="#64748b" strokeWidth="3"/>
                        <line x1="200" y1="0" x2="200" y2="400" stroke="#64748b" strokeWidth="3"/>
                        <line x1="100" y1="0" x2="100" y2="400" stroke="#94a3b8" strokeWidth="2"/>
                        <line x1="300" y1="0" x2="300" y2="400" stroke="#94a3b8" strokeWidth="2"/>
                        <line x1="0" y1="100" x2="400" y2="100" stroke="#94a3b8" strokeWidth="2"/>
                        <line x1="0" y1="300" x2="400" y2="300" stroke="#94a3b8" strokeWidth="2"/>
                      </svg>

                      {/* Buildings/blocks */}
                      <div className="absolute inset-0">
                        <div className="absolute top-4 left-4 w-16 h-12 bg-gray-300 rounded opacity-60"></div>
                        <div className="absolute top-4 right-4 w-20 h-16 bg-gray-300 rounded opacity-60"></div>
                        <div className="absolute bottom-4 left-4 w-12 h-20 bg-gray-300 rounded opacity-60"></div>
                        <div className="absolute bottom-4 right-4 w-24 h-14 bg-gray-300 rounded opacity-60"></div>
                        <div className="absolute top-1/2 left-1/4 w-14 h-14 bg-green-200 rounded opacity-60"></div>
                        <div className="absolute top-1/3 right-1/3 w-18 h-10 bg-blue-200 rounded opacity-60"></div>
                      </div>
                    </div>

                    {/* Map content */}
                    <div className="absolute inset-0">
                      {/* User location marker */}
                      {userLocation && (
                        <div
                          className="absolute z-20"
                          style={{
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)'
                          }}
                          title="Votre position"
                        >
                          <div className="relative">
                            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                              Votre position
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Laboratory markers */}
                      {labsToShow.map((lab, index) => (
                        <div
                          key={lab.id}
                          className="absolute z-10 cursor-pointer hover:scale-110 transition-transform"
                          style={{
                            left: `${30 + (index % 3) * 20}%`,
                            top: `${25 + Math.floor(index / 3) * 25}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                          onClick={() => setSelectedLab(lab)}
                          title={lab.name}
                        >
                          <div className="relative">
                            <div className="w-8 h-8 bg-laboratory-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                              <MapPin className="w-5 h-5 text-white" />
                            </div>
                            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-laboratory-primary text-white text-xs px-2 py-1 rounded whitespace-nowrap max-w-32 truncate">
                              {lab.name}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Map controls */}
                      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 space-y-2">
                        <button className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-lg font-bold">+</button>
                        <button className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-lg font-bold">-</button>
                      </div>

                      {/* Map info overlay */}
                      <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg">
                        <div className="text-xs space-y-1">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            <span>Votre position</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-laboratory-primary rounded-full mr-2"></div>
                            <span>Laboratoires ({labsToShow.length})</span>
                          </div>
                          {userLocation && (
                            <div className="text-gray-500 mt-2">
                              <div>Lat: {userLocation.lat.toFixed(4)}</div>
                              <div>Lng: {userLocation.lng.toFixed(4)}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Laboratory markers */}
                    {labsToShow.map((lab, index) => (
                      <div
                        key={lab.id}
                        className="absolute w-6 h-6 bg-laboratory-primary rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
                        style={{
                          left: `${20 + index * 15}%`,
                          top: `${30 + index * 10}%`
                        }}
                        onClick={() => setSelectedLab(lab)}
                        title={lab.name}
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                    ))}

                    {/* User location marker */}
                    {userLocation && (
                      <div
                        className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)'
                        }}
                        title="Votre position"
                      />
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Laboratory List */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-laboratory-dark">
                Laboratoires à proximité
                {userLocation && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    (triés par distance)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {getNearestLaboratories().map((lab) => (
                <div
                  key={lab.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedLab?.id === lab.id
                      ? 'border-laboratory-primary bg-laboratory-light'
                      : 'border-gray-200 hover:border-laboratory-muted'
                  }`}
                  onClick={() => setSelectedLab(lab)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-laboratory-dark">{lab.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{lab.address}</p>
                      <p className="text-sm text-gray-500">{lab.phone}</p>
                      {userLocation && 'distance' in lab && (
                        <p className="text-xs text-laboratory-accent mt-1">
                          À {(lab as any).distance.toFixed(1)} km
                        </p>
                      )}
                    </div>
                    <MapPin className="w-5 h-5 text-laboratory-primary flex-shrink-0" />
                  </div>

                  <div className="mt-2">
                    <div className="flex flex-wrap gap-1">
                      {lab.services.slice(0, 2).map((service, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-laboratory-muted text-laboratory-dark text-xs rounded-full"
                        >
                          {service}
                        </span>
                      ))}
                      {lab.services.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{lab.services.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedLab && (
        <Card className="border-laboratory-primary">
          <CardHeader>
            <CardTitle className="text-laboratory-dark">{selectedLab.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {selectedLab.address}
                </p>
                <p className="text-sm text-gray-600">
                  📞 {selectedLab.phone}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-laboratory-primary hover:bg-laboratory-accent"
                  onClick={() => window.open(`tel:${selectedLab.phone}`, '_self')}
                >
                  Appeler
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-laboratory-primary text-laboratory-dark hover:bg-laboratory-light"
                >
                  Prélèvement à domicile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MapComponent;
