import { useState, useEffect, useRef } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, Route, Phone, Clock, Star, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';

interface Laboratory {
  id: number;
  laboratory_name: string;
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

interface GoogleMapsComponentProps {
  height?: string;
}

// Google Maps component
interface MapProps {
  center: google.maps.LatLngLiteral;
  zoom: number;
  laboratories: Laboratory[];
  userLocation: google.maps.LatLngLiteral | null;
}

const MapComponent: React.FC<MapProps> = ({ center, zoom, laboratories, userLocation }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeId: 'roadmap',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ]
      });
      setMap(newMap);
    }
  }, [ref, map, center, zoom]);

  // Add user location marker
  useEffect(() => {
    if (map && userLocation) {
      new window.google.maps.Marker({
        position: userLocation,
        map,
        title: 'Votre position',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
              <circle cx="10" cy="10" r="3" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(20, 20),
          anchor: new window.google.maps.Point(10, 10)
        }
      });
    }
  }, [map, userLocation]);

  // Add laboratory markers
  useEffect(() => {
    if (map && laboratories.length > 0) {
      laboratories.forEach((lab) => {
        if (lab.latitude && lab.longitude) {
          const marker = new window.google.maps.Marker({
            position: { lat: lab.latitude, lng: lab.longitude },
            map,
            title: lab.laboratory_name,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 0C9.48 0 5 4.48 5 10c0 7.5 10 20 10 20s10-12.5 10-20c0-5.52-4.48-10-10-10z" fill="#059669"/>
                  <circle cx="15" cy="10" r="4" fill="white"/>
                  <path d="M15 7l1 2h2l-1.5 1.5L17 13l-2-1-2 1 .5-2.5L12 9h2l1-2z" fill="#059669"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(30, 30),
              anchor: new window.google.maps.Point(15, 30)
            }
          });

          // Add info window
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 10px; max-width: 250px;">
                <h3 style="margin: 0 0 8px 0; color: #059669; font-size: 16px; font-weight: bold;">
                  ${lab.laboratory_name}
                </h3>
                <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">
                  📍 ${lab.address}, ${lab.city}
                </p>
                <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">
                  📞 ${lab.phone || 'N/A'}
                </p>
                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                  🕒 ${lab.opening_hours || '8h00 - 18h00'}
                </p>
                <button
                  onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${lab.latitude},${lab.longitude}', '_blank')"
                  style="background: #059669; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px;"
                >
                  🧭 Itinéraire
                </button>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });
        }
      });
    }
  }, [map, laboratories]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
};

// Render function for Google Maps wrapper
const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <Loader2 className="w-8 h-8 animate-spin text-laboratory-primary mr-2" />
          <span>Chargement de Google Maps...</span>
        </div>
      );
    case Status.FAILURE:
      return (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Erreur de chargement de Google Maps</p>
          </div>
        </div>
      );
    default:
      return null;
  }
};

const GoogleMapsComponent: React.FC<GoogleMapsComponentProps> = ({
  height = '600px'
}) => {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [selectedLab, setSelectedLab] = useState<Laboratory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCurrentLocation();
    fetchLaboratories();
  }, []);

  // Auto-center map when user location and labs are loaded
  const mapCenter = userLocation || { lat: 48.8566, lng: 2.3522 };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);

        },
        (error) => {

          // Fallback to Paris center
          const fallbackLocation = { lat: 48.8566, lng: 2.3522 };
          setUserLocation(fallbackLocation);

        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {

      const fallbackLocation = { lat: 48.8566, lng: 2.3522 };
      setUserLocation(fallbackLocation);
    }
  };

  const fetchLaboratories = async () => {
    try {

      const { data: labs, error } = await supabase
        .from('laboratory_profiles')
        .select('*');

      if (error) {

        // Use sample data if database is empty
        setLaboratories(getSampleLaboratories());
      } else {

        if (labs && labs.length > 0) {
          setLaboratories(labs);
        } else {
          // Use sample data if database is empty
          setLaboratories(getSampleLaboratories());
        }
      }
    } catch (error) {

      // Use sample data if there's an error
      setLaboratories(getSampleLaboratories());
    } finally {
      setIsLoading(false);
    }
  };

  // Sample laboratories for testing (near Paris)
  const getSampleLaboratories = (): Laboratory[] => [
    {
      id: 1,
      laboratory_name: 'Laboratoire Central Paris',
      address: '123 Rue de Rivoli',
      city: 'Paris',
      phone: '01 42 60 30 30',
      latitude: 48.8606,
      longitude: 2.3376,
      services_offered: ['Analyses sanguines', 'Biochimie', 'Hématologie'],
      opening_hours: '8h00 - 18h00',
      rating: 4.5
    },
    {
      id: 2,
      laboratory_name: 'Bio-Lab Montparnasse',
      address: '45 Boulevard du Montparnasse',
      city: 'Paris',
      phone: '01 45 48 55 55',
      latitude: 48.8448,
      longitude: 2.3266,
      services_offered: ['Analyses urinaires', 'Microbiologie'],
      opening_hours: '7h30 - 19h00',
      rating: 4.3
    },
    {
      id: 3,
      laboratory_name: 'Laboratoire Saint-Germain',
      address: '78 Rue de Seine',
      city: 'Paris',
      phone: '01 43 26 85 85',
      latitude: 48.8534,
      longitude: 2.3364,
      services_offered: ['Biochimie', 'Endocrinologie'],
      opening_hours: '8h00 - 17h30',
      rating: 4.7
    }
  ];

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

  const getDirections = (lab: Laboratory) => {
    if (userLocation && lab.latitude && lab.longitude) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${lab.latitude},${lab.longitude}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(lab.address + ', ' + lab.city)}`;
      window.open(url, '_blank');
    }
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

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-4">
        <Button
          onClick={refreshLocation}
          variant="outline"
          className="border-laboratory-primary text-laboratory-dark hover:bg-laboratory-light"
        >
          <Navigation className="w-4 h-4 mr-2" />
          Actualiser Position
        </Button>
        {userLocation && (
          <div className="flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-md">
            <MapPin className="w-4 h-4 mr-1" />
            {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real Google Maps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-laboratory-dark flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Carte Google Maps
              </div>
              {laboratories.length > 0 && (
                <Badge className="bg-laboratory-primary">
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
              <Wrapper
                apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}
                render={render}
              >
                <MapComponent
                  center={mapCenter}
                  zoom={14}
                  laboratories={labsWithDistance}
                  userLocation={userLocation}
                />
              </Wrapper>
            </div>
          </CardContent>
        </Card>

        {/* Laboratory List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-laboratory-dark">
              Laboratoires Proches
              {laboratories.length > 0 && (
                <Badge className="ml-2 bg-laboratory-primary">
                  {laboratories.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-laboratory-primary mr-2" />
                <span className="text-gray-600">Chargement des laboratoires...</span>
              </div>
            ) : laboratories.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Aucun laboratoire trouvé</p>
                <p className="text-sm text-gray-400 mb-4">
                  Aucun laboratoire vérifié n'est disponible dans la base de données
                </p>
                <Button
                  onClick={fetchLaboratories}
                  variant="outline"
                  className="border-laboratory-primary text-laboratory-dark hover:bg-laboratory-light"
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
                      ? 'border-laboratory-primary bg-laboratory-light' 
                      : 'border-gray-200 hover:border-laboratory-primary'
                  }`}
                  onClick={() => setSelectedLab(lab)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-laboratory-dark">{lab.laboratory_name}</h4>
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
                      className="bg-laboratory-primary hover:bg-laboratory-accent"
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
                        className="border-laboratory-primary text-laboratory-dark hover:bg-laboratory-light"
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

export default GoogleMapsComponent;
