import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, Route, Phone, Clock, Star, Loader2, ExternalLink } from 'lucide-react';
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

interface SimpleFreeMapProps {
  height?: string;
}

const SimpleFreeMap: React.FC<SimpleFreeMapProps> = ({ 
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

          setUserLocation(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000
        }
      );
    } else {

      setUserLocation(null);
    }
  };

  const fetchLaboratories = async () => {
    try {

      const { data: labs, error } = await supabase
        .from('laboratory_profiles')
        .select('*');

      if (error) {

        setLaboratories([]);
      } else {

        setLaboratories(labs || []);
      }
    } catch (error) {

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

  const getDirections = (lab: Laboratory) => {
    if (userLocation && lab.latitude && lab.longitude) {
      // Multiple FREE options for directions
      const options = [
        {
          name: "Google Maps",
          url: `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${lab.latitude},${lab.longitude}`
        },
        {
          name: "OpenStreetMap",
          url: `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLocation.lat}%2C${userLocation.lng}%3B${lab.latitude}%2C${lab.longitude}`
        },
        {
          name: "Waze",
          url: `https://waze.com/ul?ll=${lab.latitude}%2C${lab.longitude}&navigate=yes`
        }
      ];

      // Show options to user
      const choice = confirm(
        `🧭 Itinéraire vers ${lab.laboratory_name}\n\n` +
        `Choisir l'application de navigation:\n\n` +
        `OK = Google Maps\n` +
        `Annuler = Voir toutes les options`
      );

      if (choice) {
        window.open(options[0].url, '_blank');
      } else {
        // Show all options
        const optionChoice = prompt(
          `Choisir l'application de navigation:\n\n` +
          `1 = Google Maps\n` +
          `2 = OpenStreetMap (100% gratuit)\n` +
          `3 = Waze\n\n` +
          `Entrez le numéro (1, 2, ou 3):`
        );

        const index = parseInt(optionChoice || '1') - 1;
        if (index >= 0 && index < options.length) {
          window.open(options[index].url, '_blank');
        } else {
          window.open(options[0].url, '_blank');
        }
      }
    } else {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(lab.address + ', ' + lab.city)}`;
      window.open(url, '_blank');
    }
  };

  const openInMap = () => {
    if (userLocation) {
      const options = [
        {
          name: "OpenStreetMap",
          url: `https://www.openstreetmap.org/#map=16/${userLocation.lat}/${userLocation.lng}`
        },
        {
          name: "Google Maps",
          url: `https://www.google.com/maps/@${userLocation.lat},${userLocation.lng},16z`
        }
      ];

      const choice = confirm(
        `Ouvrir la carte dans:\n\n` +
        `OK = OpenStreetMap (100% gratuit)\n` +
        `Annuler = Google Maps`
      );

      window.open(choice ? options[0].url : options[1].url, '_blank');
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

  // Generate OpenStreetMap embed URL
  const getMapEmbedUrl = () => {
    if (!userLocation) return null;
    
    // Create markers for laboratories
    const markers = labsWithDistance
      .slice(0, 5) // Limit to 5 closest labs
      .map((lab, index) => `&marker=${lab.latitude},${lab.longitude},red-${index + 1}`)
      .join('');

    return `https://www.openstreetmap.org/export/embed.html?bbox=${userLocation.lng - 0.01},${userLocation.lat - 0.01},${userLocation.lng + 0.01},${userLocation.lat + 0.01}&layer=mapnik&marker=${userLocation.lat},${userLocation.lng}${markers}`;
  };

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
        <Button
          onClick={openInMap}
          variant="outline"
          className="border-laboratory-primary text-laboratory-dark hover:bg-laboratory-light"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Ouvrir Carte Complète
        </Button>
        {userLocation && (
          <div className="flex items-center text-sm text-gray-600 bg-green-50 border border-green-200 px-3 py-2 rounded-md">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="font-medium">Position:</span>
            <span className="ml-1">{userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FREE OpenStreetMap Embed */}
        <Card>
          <CardHeader>
            <CardTitle className="text-laboratory-dark flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Carte 100% Gratuite (OpenStreetMap)
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
              className="w-full rounded-lg overflow-hidden border"
              style={{ height }}
            >
              {userLocation && getMapEmbedUrl() ? (
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={getMapEmbedUrl()!}
                  style={{ border: 0 }}
                  title="Carte OpenStreetMap"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-gray-100">
                  <MapPin className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2 font-medium">Localisation requise</p>
                  <p className="text-sm text-gray-500 mb-4 text-center max-w-xs">
                    Nous avons besoin de votre position pour afficher la carte
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
            <div className="mt-2 text-xs text-gray-500 text-center">
              🆓 Carte 100% gratuite - Aucune API key requise
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
                      Itinéraire (Gratuit)
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

      <div className="text-center text-sm text-gray-500 bg-green-50 border border-green-200 rounded-lg p-3">
        🆓 <strong>100% Gratuit</strong> - Aucune API key, aucun coût, aucune limite d'utilisation
      </div>
    </div>
  );
};

export default SimpleFreeMap;
