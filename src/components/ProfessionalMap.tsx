import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, Route, Phone, Clock, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface vet {
  id: number;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  rating: number;
  hours: string;
  services: string[];
  distance?: number;
}

interface ProfessionalMapProps {
  laboratories?: vet[];
  onLocationSelect?: (lat: number, lng: number) => void;
  height?: string;
}

const ProfessionalMap: React.FC<ProfessionalMapProps> = ({ 
  laboratories = [], 
  onLocationSelect, 
  height = '500px' 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedLab, setSelectedLab] = useState<vet | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Sample laboratories for demonstration
  const sampleLabs: vet[] = [
    {
      id: 1,
      name: 'Laboratoire Central Paris',
      address: '123 Rue de Rivoli, 75001 Paris',
      phone: '01 42 60 30 30',
      lat: 48.8606,
      lng: 2.3376,
      rating: 4.5,
      hours: '8h00 - 18h00',
      services: ['Analyses sanguines', 'Biochimie', 'Hématologie']
    },
    {
      id: 2,
      name: 'Bio-Lab Montparnasse',
      address: '45 Boulevard du Montparnasse, 75006 Paris',
      phone: '01 45 48 55 55',
      lat: 48.8448,
      lng: 2.3266,
      rating: 4.2,
      hours: '7h30 - 19h00',
      services: ['Analyses urinaires', 'Microbiologie', 'Immunologie']
    },
    {
      id: 3,
      name: 'Laboratoire Saint-Germain',
      address: '78 Rue de Seine, 75006 Paris',
      phone: '01 43 26 85 85',
      lat: 48.8534,
      lng: 2.3364,
      rating: 4.7,
      hours: '8h00 - 17h30',
      services: ['Biochimie', 'Endocrinologie', 'Génétique']
    }
  ];

  const labsToShow = laboratories.length > 0 ? laboratories : sampleLabs;

  useEffect(() => {
    getCurrentLocation();
    setIsMapLoaded(true);
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
          if (onLocationSelect) {
            onLocationSelect(location.lat, location.lng);
          }
        },
        (error) => {

          // Fallback to Paris center
          const fallbackLocation = { lat: 48.8566, lng: 2.3522 };
          setUserLocation(fallbackLocation);
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
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${lab.lat},${lab.lng}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(lab.address)}`;
      window.open(url, '_blank');
    }
  };

  const labsWithDistance = userLocation 
    ? labsToShow.map(lab => ({
        ...lab,
        distance: calculateDistance(userLocation.lat, userLocation.lng, lab.lat, lab.lng)
      })).sort((a, b) => a.distance - b.distance)
    : labsToShow;

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-4">
        <Button
          onClick={getCurrentLocation}
          variant="outline"
          className="border-vet-primary text-vet-dark hover:bg-vet-light"
        >
          <Navigation className="w-4 h-4 mr-2" />
          Ma Position
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Professional Map */}
        <Card>
          <CardHeader>
            <CardTitle className="text-vet-dark flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Carte Interactive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={mapRef}
              className="w-full rounded-lg overflow-hidden relative"
              style={{ height }}
            >
              {!isMapLoaded ? (
                <div className="flex flex-col items-center justify-center h-full bg-gray-100">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vet-primary"></div>
                  <p className="text-sm text-gray-500 mt-2">Chargement de la carte...</p>
                </div>
              ) : (
                <div className="w-full h-full relative bg-gradient-to-br from-blue-50 to-green-50">
                  {/* Professional street map style */}
                  <div className="absolute inset-0 bg-gray-50">
                    <svg className="w-full h-full opacity-40" viewBox="0 0 500 500">
                      <defs>
                        <pattern id="streets" width="50" height="50" patternUnits="userSpaceOnUse">
                          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#cbd5e1" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#streets)" />
                      {/* Major streets */}
                      <line x1="0" y1="250" x2="500" y2="250" stroke="#64748b" strokeWidth="4"/>
                      <line x1="250" y1="0" x2="250" y2="500" stroke="#64748b" strokeWidth="4"/>
                      <line x1="125" y1="0" x2="125" y2="500" stroke="#94a3b8" strokeWidth="2"/>
                      <line x1="375" y1="0" x2="375" y2="500" stroke="#94a3b8" strokeWidth="2"/>
                      <line x1="0" y1="125" x2="500" y2="125" stroke="#94a3b8" strokeWidth="2"/>
                      <line x1="0" y1="375" x2="500" y2="375" stroke="#94a3b8" strokeWidth="2"/>
                    </svg>
                    
                    {/* Buildings */}
                    <div className="absolute inset-0">
                      <div className="absolute top-6 left-6 w-20 h-16 bg-gray-300 rounded opacity-70 shadow-sm"></div>
                      <div className="absolute top-6 right-6 w-24 h-20 bg-gray-300 rounded opacity-70 shadow-sm"></div>
                      <div className="absolute bottom-6 left-6 w-16 h-24 bg-gray-300 rounded opacity-70 shadow-sm"></div>
                      <div className="absolute bottom-6 right-6 w-28 h-18 bg-gray-300 rounded opacity-70 shadow-sm"></div>
                      <div className="absolute top-1/2 left-1/3 w-18 h-18 bg-green-200 rounded opacity-70 shadow-sm"></div>
                      <div className="absolute top-1/3 right-1/3 w-22 h-14 bg-blue-200 rounded opacity-70 shadow-sm"></div>
                    </div>
                  </div>
                  
                  {/* User location */}
                  {userLocation && (
                    <div 
                      className="absolute z-20"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <div className="relative">
                        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                        <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                      </div>
                    </div>
                  )}
                  
                  {/* vet markers */}
                  {labsWithDistance.slice(0, 5).map((lab, index) => (
                    <div
                      key={lab.id}
                      className="absolute z-10 cursor-pointer hover:scale-110 transition-transform"
                      style={{
                        left: `${20 + (index % 3) * 25}%`,
                        top: `${20 + Math.floor(index / 3) * 30}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      onClick={() => setSelectedLab(lab)}
                    >
                      <div className="relative">
                        <div className="w-10 h-10 bg-vet-primary rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-vet-primary text-white text-xs px-2 py-1 rounded whitespace-nowrap max-w-32 truncate">
                          {lab.name}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Map legend */}
                  <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        <span>Votre position</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-vet-primary rounded-full mr-2"></div>
                        <span>Laboratoires ({labsWithDistance.length})</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* vet List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-vet-dark">Laboratoires Proches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {labsWithDistance.map((lab) => (
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
                  <h4 className="font-medium text-vet-dark">{lab.name}</h4>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-sm text-gray-600">{lab.rating}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{lab.address}</p>
                
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Clock className="w-4 h-4 mr-1" />
                  {lab.hours}
                  {lab.distance && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{lab.distance.toFixed(1)} km</span>
                    </>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {lab.services.slice(0, 2).map((service, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                  {lab.services.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{lab.services.length - 2}
                    </Badge>
                  )}
                </div>
                
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
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfessionalMap;
