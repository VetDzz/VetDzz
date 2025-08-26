import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Clock, Star, Navigation, Loader2, Send, Building2, Stethoscope } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { searchLaboratories, supabase } from '@/lib/supabase';
import AccurateMapComponent from '@/components/AccurateMapComponent';
import { useRef } from 'react';

const FindLaboratory = () => {
  const [location, setLocation] = useState('');
  const [laboratories, setLaboratories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const mapRef = useRef<any>(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Default to Paris coordinates if geolocation fails
          setUserLocation({ lat: 48.8566, lng: 2.3522 });
        }
      );
    } else {
      // Default to Paris coordinates
      setUserLocation({ lat: 48.8566, lng: 2.3522 });
    }
  }, []);

  // Load laboratories when component mounts
  useEffect(() => {
    loadLaboratories();
  }, []);

  // Recalculate distances when user location changes
  useEffect(() => {
    if (userLocation && laboratories.length > 0) {
      const labsWithUpdatedDistance = laboratories.map((lab: any) => {
        let distance = 'N/A';
        if (lab.latitude && lab.longitude) {
          const dist = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            lab.latitude,
            lab.longitude
          );
          distance = `${dist.toFixed(1)} km`;
        }
        return {
          ...lab,
          distance
        };
      });

      // Sort by distance
      labsWithUpdatedDistance.sort((a, b) => {
        if (a.distance === 'N/A' || b.distance === 'N/A') return 0;
        return parseFloat(a.distance) - parseFloat(b.distance);
      });

      setLaboratories(labsWithUpdatedDistance);
    }
  }, [userLocation]);

  const loadLaboratories = async (searchCity?: string) => {
    setIsLoading(true);
    try {
      console.log('Loading laboratories...', { searchCity, userLocation });
      const { data, error } = await searchLaboratories(searchCity);
      if (error) {
        console.error('Error loading laboratories:', error);
        setLaboratories([]);
      } else {
        console.log('Raw laboratory data:', data);
        // Calculate distance if user location is available
        const labsWithDistance = (data || []).map((lab: any) => {
          let distance = 'N/A';
          if (userLocation && lab.latitude && lab.longitude) {
            const dist = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              lab.latitude,
              lab.longitude
            );
            distance = `${dist.toFixed(1)} km`;
          }
          return {
            ...lab,
            distance,
            rating: 4.5 + Math.random() * 0.5, // Mock rating for now
            hours: lab.opening_hours || '8h00 - 18h00',
            opening_days: lab.opening_days || []
          };
        });

        // Sort by distance if available
        labsWithDistance.sort((a, b) => {
          if (a.distance === 'N/A' || b.distance === 'N/A') return 0;
          return parseFloat(a.distance) - parseFloat(b.distance);
        });

        console.log('Processed laboratories with distance:', labsWithDistance);
        setLaboratories(labsWithDistance);
      }
    } catch (error) {
      console.error('Error loading laboratories:', error);
      setLaboratories([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate distance between two coordinates
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const handleLocationSearch = () => {
    if (location.trim()) {
      loadLaboratories(location.trim());
    } else {
      loadLaboratories();
    }
  };

  const sendPADRequest = async (laboratory: any) => {
    if (!user) {
      toast({
        title: t('common.error'),
        description: t('PAD.loginRequired'),
        variant: "destructive"
      });
      return;
    }

    try {
      // Check for existing PAD requests with improved logic
      const { data: existing } = await supabase
        .from('pad_requests')
        .select('id,status,created_at,updated_at')
        .eq('client_id', user.id)
        .eq('laboratory_id', laboratory.user_id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (existing && existing.length > 0) {
        const lastRequest = existing[0];
        
        // Block if there's a pending request
        if (lastRequest.status === 'pending') {
          toast({ 
            title: 'Demande en attente', 
            description: 'Vous avez déjà une demande PAD en attente pour ce laboratoire.', 
            variant: 'default' 
          });
          return;
        }
        
        // Block if accepted and less than 1 hour has passed
        if (lastRequest.status === 'accepted') {
          const acceptedTime = new Date(lastRequest.updated_at || lastRequest.created_at);
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
          
          if (acceptedTime > oneHourAgo) {
            const timeLeft = Math.ceil((acceptedTime.getTime() + 60 * 60 * 1000 - Date.now()) / (1000 * 60));
            toast({ 
              title: 'Demande récemment acceptée', 
              description: `Attendez ${timeLeft} minutes avant de renvoyer une demande à ce laboratoire.`, 
              variant: 'default' 
            });
            return;
          }
        }
        
        // If rejected, allow immediate new request (no waiting period)
      }

      // Get client profile with location data
      const { data: clientProfile, error: profileError } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching client profile:', profileError);
      }

      const { error } = await supabase
        .from('pad_requests')
        .insert([
          {
            client_id: user.id,
            laboratory_id: laboratory.user_id,
            status: 'pending',
            message: t('PAD.defaultMessage'),
            client_location_lat: userLocation?.lat || null,
            client_location_lng: userLocation?.lng || null,
            client_name: clientProfile?.full_name || 'Client',
            client_phone: clientProfile?.phone || '',
            client_address: clientProfile?.address || ''
          }
        ]);

      if (error) {
        toast({
          title: t('common.error'),
          description: t('PAD.sendError'),
          variant: "destructive"
        });
      } else {
        toast({
          title: t('PAD.sendSuccess'),
          description: t('PAD.sendSuccessDesc', { labName: laboratory.lab_name || laboratory.laboratory_name }),
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue.",
        variant: "destructive"
      });
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocation('Position actuelle');
          // Don't reload laboratories, just update location for distance calculation
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handleRequestHomeCollection = (labId: number) => {
    console.log('Requesting home collection from lab:', labId);
    // This would open a modal or navigate to a booking page
  };

  return (
    <section id="find-laboratory" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h2 className="text-3xl font-bold text-laboratory-dark mb-4">
              Trouver des Laboratoires et Cliniques
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Localisez facilement des laboratoires et cliniques près de chez vous pour vos analyses médicales
            </p>
          </motion.div>

          <motion.div className="mb-8" variants={itemVariants}>
            <div className="flex flex-col gap-4 max-w-2xl mx-auto">
              <div className="flex-1">
                <Input
                  placeholder={t('findLab.placeholder')}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="border-laboratory-muted focus:border-laboratory-primary"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleGetCurrentLocation}
                  variant="outline"
                  className="border-laboratory-primary text-laboratory-dark hover:bg-laboratory-light w-full sm:w-auto"
                  size="default"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  {t('findLab.myLocation')}
                </Button>
                <Button
                  onClick={handleLocationSearch}
                  className="bg-laboratory-primary hover:bg-laboratory-accent w-full sm:w-auto"
                  size="default"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {t('findLab.search')}
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <AccurateMapComponent height="500px" />
          </motion.div>

          {/* Laboratory Results */}
          <motion.div className="mt-12" variants={itemVariants}>
            <h3 className="text-2xl font-bold text-laboratory-dark mb-6 text-center">
              {isLoading ? t('findLab.searching') : t('findLab.found', { count: laboratories.length })}
            </h3>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-laboratory-primary" />
                <span className="ml-2 text-gray-600">{t('findLab.loading')}</span>
              </div>
            ) : null}

            {!isLoading && laboratories.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {laboratories.map((lab, index) => (
                  <motion.div key={lab.id || index} variants={itemVariants}>
                    <Card className="border-laboratory-muted hover:shadow-lg transition-shadow h-full">
                      <CardHeader>
                        <CardTitle className="text-laboratory-dark flex items-center justify-between">
                          <span>{lab.lab_name || lab.laboratory_name || t('findLab.defaultName')}</span>
                          <div className="flex items-center text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="ml-1 text-sm text-gray-600">{lab.rating?.toFixed(1)}</span>
                          </div>
                        </CardTitle>
                        <div className="flex items-center justify-between mb-2">
                          <Badge 
                            variant={lab.provider_type === 'clinique' ? 'secondary' : 'default'} 
                            className="flex items-center gap-1"
                          >
                            {lab.provider_type === 'clinique' ? (
                              <>
                                <Stethoscope className="w-3 h-3" />
                                Clinique
                              </>
                            ) : (
                              <>
                                <Building2 className="w-3 h-3" />
                                Laboratoire
                              </>
                            )}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-1" />
                          {lab.address || 'Adresse non disponible'}, {lab.city || 'Ville non disponible'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center text-gray-600">
                            <Phone className="w-4 h-4 mr-2" />
                            <span>{lab.phone || t('findLab.phoneNotAvailable')}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>
                              {lab.hours}
                              {Array.isArray(lab.opening_days) && lab.opening_days.length > 0 && (
                                <>
                                  {' '}• {lab.opening_days.length === 7 ? 'Permanences' : `Jours: ${lab.opening_days.join(', ')}`}
                                </>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center text-laboratory-primary font-semibold">
                            <Navigation className="w-4 h-4 mr-2" />
                            <span>{lab.distance}</span>
                          </div>
                          {lab.services_offered && lab.services_offered.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700 mb-2">Services:</p>
                              <div className="flex flex-wrap gap-1">
                                {lab.services_offered.slice(0, 3).map((service: string, index: number) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-laboratory-light text-laboratory-dark text-xs rounded-full"
                                  >
                                    {service}
                                  </span>
                                ))}
                                {lab.services_offered.length > 3 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    +{lab.services_offered.length - 3} autres
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          <div className="mt-4">
                            <div className="flex flex-wrap gap-2">
                              {user && user.type === 'client' && (
                                <Button
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => sendPADRequest(lab)}
                                  size="sm"
                                >
                                  <Send className="w-4 h-4 mr-2" />
                                  {t('map.requestPAD')}
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                className="border-green-500 text-green-600 hover:bg-green-50"
                                onClick={() => {
                                  // Center the embedded map on this lab (no Google Maps)
                                  mapRef.current?.focusLab(lab.id);
                                  toast({ title: t('findLab.mapCentered'), description: t('findLab.mapCenteredDesc', { labName: lab.lab_name || lab.laboratory_name }) });
                                }}
                                size="sm"
                              >
                                {t('findLab.goLocation')}
                              </Button>
                              <Button
                                variant="outline"
                                className="border-laboratory-primary text-laboratory-dark hover:bg-laboratory-light"
                                onClick={() => { if (lab.phone) window.open(`tel:${lab.phone}`, '_self'); }}
                                size="sm"
                              >
                                {t('findLab.call')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div className="text-center mt-12" variants={itemVariants}>
                <p className="text-gray-600 mb-4">
                  {t('findLab.noResults')}
                </p>
                <Button
                  variant="outline"
                  className="border-laboratory-primary text-laboratory-dark hover:bg-laboratory-light"
                  onClick={() => loadLaboratories()}
                >
                  Actualiser la recherche
                </Button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FindLaboratory;
