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

  // Global PAD lock: when you send PAD to any lab, lock ALL OTHER labs for 2 hours
  const [globalPadLock, setGlobalPadLock] = useState<{
    active: boolean;
    until: number; // timestamp in ms when lock expires
    activeLab: string; // the lab you sent PAD to (this one stays unlocked)
    requestId: string;
  } | null>(null);
  // Track time for countdown updates
  const [nowTs, setNowTs] = useState<number>(Date.now());

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

  // Update countdown every minute
  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // On auth changes, check active PAD locks using database view
  useEffect(() => {
    if (!user) {
      setGlobalPadLock(null);
      return;
    }
    const checkGlobalLock = async () => {
      try {
        // First, clean up any expired requests
        await supabase.rpc('expire_old_pad_requests');
        
        // Then check for active locks using the database view
        const { data: activeLocks } = await supabase
          .from('active_pad_locks')
          .select('*')
          .eq('client_id', user.id)
          .limit(1);
        
        if (activeLocks && activeLocks.length > 0) {
          const lock = activeLocks[0] as any;
          setGlobalPadLock({
            active: true,
            until: new Date(lock.expires_at).getTime(),
            activeLab: lock.laboratory_id,
            requestId: lock.request_id
          });
        } else {
          setGlobalPadLock(null);
        }
      } catch (e) {
        // Fallback to original method if database functions not available
        const { data: pending } = await supabase
          .from('PAD_requests')
          .select('id, laboratory_id, status, created_at')
          .eq('client_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (pending && pending.length > 0) {
          const req = pending[0] as any;
          const created = new Date(req.created_at).getTime();
          const twoHoursMs = 2 * 60 * 60 * 1000;
          const until = created + twoHoursMs;
          
          if (Date.now() < until) {
            setGlobalPadLock({
              active: true,
              until,
              activeLab: req.laboratory_id,
              requestId: req.id
            });
          } else {
            setGlobalPadLock(null);
          }
        } else {
          setGlobalPadLock(null);
        }
      }
    };
    checkGlobalLock();
  }, [user]);

  // Subscribe to PAD request updates to unlock when lab responds
  useEffect(() => {
    if (!user || !globalPadLock?.requestId) return;
    const channel = supabase
      .channel(`pad-requests-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'PAD_requests',
          filter: `id=eq.${globalPadLock.requestId}`,
        },
        (payload: any) => {
          const newStatus = payload?.new?.status;
          if (newStatus && newStatus !== 'pending') {
            // Lab responded - unlock all other labs
            setGlobalPadLock(null);
            toast({ title: t('PAD.responseReceived') || 'Réponse reçue', description: t('PAD.responseReceivedDesc') || 'Le laboratoire a répondu à votre demande. Tous les laboratoires sont maintenant disponibles.' });
          }
        }
      )
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [user, globalPadLock?.requestId]);

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
      const { data, error } = await searchLaboratories(searchCity);
      if (error) {
        setLaboratories([]);
      } else {
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

        setLaboratories(labsWithDistance);
      }
    } catch (error) {
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
      // Check if there's a global lock and this lab is not the active one
      if (globalPadLock?.active && laboratory.user_id !== globalPadLock.activeLab) {
        const minutesLeft = Math.ceil((globalPadLock.until - Date.now()) / (60 * 1000));
        toast({ 
          title: 'Demande PAD en cours', 
          description: `Vous avez une demande en cours avec un autre laboratoire. Patientez encore ${minutesLeft} minutes ou attendez leur réponse.`, 
          variant: 'default' 
        });
        return;
      }
      
      // If this is the active lab and already has a pending request
      if (globalPadLock?.active && laboratory.user_id === globalPadLock.activeLab) {
        toast({ 
          title: 'Demande déjà envoyée', 
          description: 'Vous avez déjà une demande en attente pour ce laboratoire.', 
          variant: 'default' 
        });
        return;
      }

      // Get client profile with location data
      const { data: clientProfile, error: profileError } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (profileError) {
        // Error fetching client profile
      }

      const { data: inserted, error } = await supabase
        .from('PAD_requests')
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
        ])
        .select('id,created_at');

      if (error) {
        
        // Since we have the database trigger in place, ANY error on PAD insert 
        // is likely the lock trigger. Show normal waiting message to avoid panic.
        // Only show real errors for very specific non-lock cases.
        
        const isDefinitelyNotLockError = (
          error.message?.includes('permission denied') ||
          error.message?.includes('connection') ||
          error.message?.includes('network') ||
          error.code === '42501' || // insufficient privilege
          error.code === '08000'    // connection exception
        );
        
        if (isDefinitelyNotLockError) {
          // Real technical errors - use custom message to avoid panic
          toast({
            title: "Erreur technique",
            description: "Une erreur technique est survenue. Veuillez réessayer dans quelques instants.",
            variant: "destructive"
          });
        } else {
          // Use simple static translation
          toast({
            title: 'Demande PAD en cours',
            description: t('PAD.sendError'),
            variant: "default"
          });
        }
      } else {
        const createdAt = inserted && inserted.length > 0 ? new Date(inserted[0].created_at).getTime() : Date.now();
        const twoHoursMs = 2 * 60 * 60 * 1000;
        // Set global lock - lock all OTHER labs for 2 hours
        setGlobalPadLock({
          active: true,
          until: createdAt + twoHoursMs,
          activeLab: laboratory.user_id,
          requestId: inserted?.[0]?.id || ''
        });
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
          // Error getting location
        }
      );
    }
  };

  const handleRequestHomeCollection = (labId: number) => {
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
                              {user && user.type === 'client' && (() => {
                                const isActiveLab = globalPadLock?.activeLab === lab.user_id;
                                const isGlobalLocked = globalPadLock?.active && !isActiveLab && Date.now() < globalPadLock.until;
                                const isActivePending = globalPadLock?.active && isActiveLab;
                                
                                const minutesLeft = globalPadLock?.active ? Math.max(0, Math.ceil((globalPadLock.until - nowTs) / (60 * 1000))) : 0;
                                
                                let buttonText = t('map.requestPAD');
                                let buttonClass = "bg-green-600 hover:bg-green-700 text-white";
                                let isDisabled = false;
                                
                                if (isActivePending) {
                                  buttonText = `En attente (${minutesLeft}min)`;
                                  buttonClass = "bg-blue-500 text-white cursor-not-allowed";
                                  isDisabled = true;
                                } else if (isGlobalLocked) {
                                  buttonText = `Verrouillé (${minutesLeft}min)`;
                                  buttonClass = "bg-gray-400 text-gray-600 cursor-not-allowed";
                                  isDisabled = true;
                                }
                                
                                return (
                                  <Button
                                    className={buttonClass}
                                    onClick={() => !isDisabled && sendPADRequest(lab)}
                                    size="sm"
                                    disabled={isDisabled}
                                  >
                                    <Send className="w-4 h-4 mr-2" />
                                    {buttonText}
                                  </Button>
                                );
                              })()}
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
