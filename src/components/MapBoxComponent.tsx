import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, Route, Phone, Clock, Star, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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

interface MapBoxComponentProps {
  height?: string;
}

const MapBoxComponent: React.FC<MapBoxComponentProps> = ({
  height = '600px'
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [selectedLab, setSelectedLab] = useState<Laboratory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCurrentLocation();
    fetchLaboratories();
  }, []);

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Initialize map only once

    // Set MapBox access token
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12', // Google Maps-like style
        center: [2.3522, 48.8566], // Paris default
        zoom: 14,
        attributionControl: false
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add geolocate control
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        }),
        'top-right'
      );
    }
  }, []);

  // Update map when user location changes
  useEffect(() => {
    if (map.current && userLocation) {
      map.current.setCenter([userLocation.lng, userLocation.lat]);
      map.current.setZoom(16);

      // Add user location marker
      const userMarker = new mapboxgl.Marker({
        color: '#3B82F6'
      })
        .setLngLat([userLocation.lng, userLocation.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <div style="padding: 10px;">
            <strong>Votre Position</strong><br/>
            📍 ${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}
          </div>
        `))
        .addTo(map.current);
    }
  }, [userLocation]);

  // Add laboratory markers
  useEffect(() => {
    if (map.current && laboratories.length > 0) {
      laboratories.forEach((lab) => {
        if (lab.latitude && lab.longitude) {
          // Create custom marker element
          const el = document.createElement('div');
          el.className = 'lab-marker';
          el.style.backgroundImage = `url('data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 0C9.48 0 5 4.48 5 10c0 7.5 10 20 10 20s10-12.5 10-20c0-5.52-4.48-10-10-10z" fill="#059669"/>
              <circle cx="15" cy="10" r="4" fill="white"/>
              <path d="M15 7l1 2h2l-1.5 1.5L17 13l-2-1-2 1 .5-2.5L12 9h2l1-2z" fill="#059669"/>
            </svg>
          `)}')`;
          el.style.width = '30px';
          el.style.height = '30px';
          el.style.backgroundSize = '100%';
          el.style.cursor = 'pointer';

          const distance = userLocation
            ? calculateDistance(userLocation.lat, userLocation.lng, lab.latitude, lab.longitude)
            : 0;

          // Create popup
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 15px; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; color: #059669; font-size: 16px; font-weight: bold;">
                ${lab.laboratory_name}
              </h3>
              <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">
                📍 ${lab.address}, ${lab.city}
              </p>
              <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">
                📞 ${lab.phone || 'N/A'}
              </p>
              <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">
                🕒 ${lab.opening_hours || '8h00 - 18h00'}
              </p>
              ${distance > 0 ? `<p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">📏 ${distance.toFixed(1)} km</p>` : ''}
              <button
                onclick="window.getDirectionsToLab(${lab.latitude}, ${lab.longitude}, '${lab.laboratory_name}')"
                style="background: #059669; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px; width: 100%;"
              >
                🧭 Itinéraire
              </button>
            </div>
          `);

          // Add marker to map
          new mapboxgl.Marker(el)
            .setLngLat([lab.longitude, lab.latitude])
            .setPopup(popup)
            .addTo(map.current!);
        }
      });
    }
  }, [laboratories, userLocation]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setViewState({
            longitude: location.lng,
            latitude: location.lat,
            zoom: 16
          });
          console.log('High accuracy location:', location, 'Accuracy:', position.coords.accuracy, 'meters');
        },
        (error) => {
          console.error('Error getting location:', error);
          setUserLocation(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser');
      setUserLocation(null);
    }
  };

  const fetchLaboratories = async () => {
    try {
      console.log('Fetching laboratories from database...');
      const { data: labs, error } = await supabase
        .from('laboratory_profiles')
        .select('*');

      if (error) {
        console.error('Error fetching laboratories:', error);
        setLaboratories([]);
      } else {
        console.log('Fetched laboratories:', labs);
        setLaboratories(labs || []);
      }
    } catch (error) {
      console.error('Error fetching laboratories:', error);
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

  const getDirections = async (lab: Laboratory) => {
    if (!userLocation) return;

    // Use MapBox Directions API (free tier: 100,000 requests/month)
    const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation.lng},${userLocation.lat};${lab.longitude},${lab.latitude}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

    try {
      const response = await fetch(directionsUrl);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const duration = Math.round(route.duration / 60); // minutes
        const distance = (route.distance / 1000).toFixed(1); // km

        // Show route info and open in Google Maps as fallback
        const confirmed = confirm(
          `Itinéraire vers ${lab.laboratory_name}:\n` +
          `Distance: ${distance} km\n` +
          `Durée: ${duration} minutes\n\n` +
          `Ouvrir dans Google Maps pour la navigation?`
        );

        if (confirmed) {
          const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${lab.latitude},${lab.longitude}`;
          window.open(url, '_blank');
        }
      }
    } catch (error) {
      console.error('Error getting directions:', error);
      // Fallback to Google Maps
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${lab.latitude},${lab.longitude}`;
      window.open(url, '_blank');
    }
  };

  // Global function for popup buttons
  useEffect(() => {
    (window as any).getDirectionsToLab = async (lat: number, lng: number, name: string) => {
      if (!userLocation) return;

      const lab = { latitude: lat, longitude: lng, laboratory_name: name };
      await getDirections(lab);
    };
  }, [userLocation]);

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
          <div className="flex items-center text-sm text-gray-600 bg-green-50 border border-green-200 px-3 py-2 rounded-md">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="font-medium">Position détectée:</span>
            <span className="ml-1">{userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MapBox Map */}
        <Card>
          <CardHeader>
            <CardTitle className="text-laboratory-dark flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Carte Interactive (Gratuite)
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
              ref={mapContainer}
              className="w-full rounded-lg overflow-hidden"
              style={{ height }}
            >
              {!userLocation && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
                  <MapPin className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2 font-medium">Localisation requise</p>
                  <p className="text-sm text-gray-500 mb-4 text-center max-w-xs">
                    Nous avons besoin de votre position pour afficher les laboratoires proches
                  </p>
                  <Button
                    onClick={getCurrentLocation}
                    className="bg-laboratory-primary hover:bg-laboratory-accent"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Autoriser la localisation
                  </Button>
                </div>
              )}
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
                <p className="text-gray-500 mb-2">Aucun laboratoire dans la base de données</p>
                <p className="text-sm text-gray-400 mb-4">
                  Aucun laboratoire vérifié n'est disponible pour le moment
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

export default MapBoxComponent;
