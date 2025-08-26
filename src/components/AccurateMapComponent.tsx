import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, Route, Phone, Clock, Loader2, RefreshCw, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '@/contexts/LanguageContext';

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Laboratory {
  id: number;
  laboratory_name?: string;
  clinique_name?: string;
  name: string; // computed field for display
  type: 'laboratory' | 'clinique';
  address: string;
  phone: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  city: string;
  services_offered?: string[];
  specialities?: string[]; // for cliniques
  opening_hours?: string;
  opening_days?: string[];
  rating?: number;
  distance?: number;
  user_id?: string;
}

interface AccurateMapComponentProps {
  height?: string;
}

// Custom user location icon (blue dot)
const userLocationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="white" stroke-width="3"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Custom laboratory icon (green marker)
const labIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C10.48 0 6 4.48 6 10c0 7.5 10 22 10 22s10-14.5 10-22c0-5.52-4.48-10-10-10z" fill="#059669"/>
      <circle cx="16" cy="10" r="5" fill="white"/>
      <path d="M16 6l1.5 3h3l-2.5 2L19 14l-3-1.5L13 14l1-3-2.5-2h3L16 6z" fill="#059669"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Custom clinique icon (green marker to match laboratory theme)
const cliniqueIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64=' + btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C10.48 0 6 4.48 6 10c0 7.5 10 22 10 22s10-14.5 10-22c0-5.52-4.48-10-10-10z" fill="#90EE90"/>
      <circle cx="16" cy="10" r="5" fill="white"/>
      <path d="M16 5v10M11 10h10" stroke="#228B22" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Component to update map center when location changes
const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  const hasInitRef = useRef(false);

  useEffect(() => {
    // Run only once on mount to avoid interfering with manual flyTo/setView
    if (!hasInitRef.current) {
      map.setView(center, 16);
      hasInitRef.current = true;
    }
  }, [center, map]);

  return null;
};

// Component to imperatively navigate when destination changes
const MapNavigator: React.FC<{ dest: [number, number] | null; zoom?: number }> = ({ dest, zoom = 17 }) => {
  const map = useMap();
  const lastKeyRef = useRef<string>('');
  useEffect(() => {
    if (!dest) return;
    const key = dest.join(',') + '|' + zoom;
    if (key !== lastKeyRef.current) {
      map.flyTo(dest, zoom, { animate: true });
      lastKeyRef.current = key;
    }
  }, [dest?.[0], dest?.[1], zoom, map]);
  return null;
};


const AccurateMapComponent: React.FC<AccurateMapComponentProps> = ({
  height = '600px'
}) => {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [selectedLab, setSelectedLab] = useState<Laboratory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'laboratory' | 'clinique'>('all');
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [leafletMap, setLeafletMap] = useState<L.Map | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [navDest, setNavDest] = useState<[number, number] | null>(null);
  const { t } = useLanguage();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Clear any cached location data on component mount
    setUserLocation(null);
    setLocationAccuracy(null);

    // Always request fresh location when component loads
    getCurrentLocation();
    fetchLaboratories();
  }, []);

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);

    try {
      // Use the EXACT method that was working before - direct browser geolocation with high precision
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'));
          return;
        }

        const options: PositionOptions = {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log('🎯 EXACT LOCATION FOUND:');
            console.log(`   Latitude: ${pos.coords.latitude.toFixed(10)}`);
            console.log(`   Longitude: ${pos.coords.longitude.toFixed(10)}`);
            console.log(`   Accuracy: ±${Math.round(pos.coords.accuracy)}m`);
            console.log(`   Altitude: ${pos.coords.altitude}m`);
            console.log(`   Speed: ${pos.coords.speed} m/s`);
            console.log(`   Heading: ${pos.coords.heading}°`);
            console.log(`   Timestamp: ${new Date(pos.timestamp).toLocaleString()}`);
            resolve(pos);
          },
          (error) => {
            console.error('Geolocation error:', error);
            reject(error);
          },
          options
        );
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const accuracy = position.coords.accuracy;

      setUserLocation({ lat, lng });
      setLocationAccuracy(accuracy);

      // Show the EXACT coordinates like before
      const preciseCoords = `${lat.toFixed(8)}, ${lng.toFixed(8)}`;
      const accuracyText = accuracy <= 10 ? '🔥 EXTRÊME' :
                         accuracy <= 50 ? '🎯 TRÈS PRÉCISE' :
                         accuracy <= 200 ? '📍 PRÉCISE' : '📌 BONNE';

      toast({
        title: `${accuracyText} Position trouvée!`,
        description: `${preciseCoords} - Précision: ±${Math.round(accuracy)}m`,
      });

      // Log the exact location details like before
      console.log('✅ LOCATION DETAILS:');
      console.log(`   Exact coordinates: ${preciseCoords}`);
      console.log(`   Accuracy: ±${Math.round(accuracy)}m`);
      console.log(`   Method: Direct Browser Geolocation`);

    } catch (error) {
      console.error('Location failed:', error);

      // Fallback to default location
      setUserLocation({ lat: 35.5559, lng: 6.1743 });
      setLocationAccuracy(50000);

      toast({
        title: "📍 Position par défaut",
        description: "Impossible d'obtenir votre position exacte.",
        variant: "destructive"
      });
    }

    setIsGettingLocation(false);
  };

  const getUltraPreciseLocation = async () => {
    try {
      // Force fresh permission request by checking permissions first
      if ('permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });

          if (permission.state === 'denied') {
            throw new Error('Location permission denied');
          }
        } catch (permError) {
          // Permission API not available, proceeding with direct request
        }
      }

      // Ultra-precise location with maximum accuracy settings
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        let attempts = 0;
        let bestPosition: GeolocationPosition | null = null;

        const tryGetPosition = () => {
          attempts++;
          console.log(`🎯 Ultra-precise attempt ${attempts}/3...`);

          const timeoutId = setTimeout(() => {
            if (bestPosition && bestPosition.coords.accuracy <= 100) {
              console.log('⏰ Using best position due to timeout');
              resolve(bestPosition);
            } else {
              reject(new Error(`Ultra-precise timeout on attempt ${attempts}`));
            }
          }, 30000); // 30 seconds for maximum accuracy

          navigator.geolocation.getCurrentPosition(
            (pos) => {
              clearTimeout(timeoutId);
              console.log(`📍 Attempt ${attempts} accuracy: ${Math.round(pos.coords.accuracy)}m`);

              if (!bestPosition || pos.coords.accuracy < bestPosition.coords.accuracy) {
                bestPosition = pos;
              }

              // If we get house-level accuracy (≤10m), use it immediately
              if (pos.coords.accuracy <= 10) {
                console.log('🏠 House-level accuracy achieved!');
                resolve(pos);
              }
              // If we get street-level accuracy (≤20m), use it
              else if (pos.coords.accuracy <= 20) {
                console.log('🛣️ Street-level accuracy achieved!');
                resolve(pos);
              }
              // If this is our last attempt, use the best we have
              else if (attempts >= 3) {
                console.log('🎯 Using best accuracy from all attempts');
                resolve(bestPosition || pos);
              }
              // Otherwise, try again for better accuracy
              else {
                console.log('🔄 Trying again for better accuracy...');
                setTimeout(tryGetPosition, 2000); // Wait 2 seconds between attempts
              }
            },
            (err) => {
              clearTimeout(timeoutId);
              console.log(`❌ Attempt ${attempts} failed:`, err.message);

              if (attempts >= 3) {
                if (bestPosition) {
                  resolve(bestPosition);
                } else {
                  reject(err);
                }
              } else {
                setTimeout(tryGetPosition, 1000); // Retry after 1 second
              }
            },
            {
              enableHighAccuracy: true,
              timeout: 25000,
              maximumAge: 0 // Always get fresh location
            }
          );
        };

        tryGetPosition();
      });

      // Validate that we got a reasonable location
      if (Math.abs(position.coords.latitude) < 0.001 || Math.abs(position.coords.longitude) < 0.001) {
        throw new Error('Invalid coordinates received');
      }

      return {
        coords: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        },
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };

    } catch (error) {
      console.error('❌ Ultra-precise location failed:', error);
      return null;
    }
  };

  const tryAccurateGPS = async (): Promise<boolean> => {
    try {
      if (!navigator.geolocation) {
        console.log('❌ Geolocation not supported');
        return false;
      }

      console.log('📍 Trying multiple location methods for maximum accuracy...');

      // Try multiple approaches in parallel for best accuracy
      const locationPromises = [
        // Method 1: High accuracy GPS with long timeout
        new Promise<GeolocationPosition>((resolve, reject) => {
          const timeoutId = setTimeout(() => reject(new Error('High accuracy timeout')), 20000);
          navigator.geolocation.getCurrentPosition(
            (pos) => { clearTimeout(timeoutId); resolve(pos); },
            (err) => { clearTimeout(timeoutId); reject(err); },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
          );
        }),

        // Method 2: Network-based location (faster, less accurate)
        new Promise<GeolocationPosition>((resolve, reject) => {
          const timeoutId = setTimeout(() => reject(new Error('Network timeout')), 10000);
          navigator.geolocation.getCurrentPosition(
            (pos) => { clearTimeout(timeoutId); resolve(pos); },
            (err) => { clearTimeout(timeoutId); reject(err); },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
          );
        }),

        // Method 3: Continuous watching for better accuracy
        new Promise<GeolocationPosition>((resolve, reject) => {
          let bestPosition: GeolocationPosition | null = null;
          let watchId: number;
          let positionCount = 0;

          const timeoutId = setTimeout(() => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
            if (bestPosition) resolve(bestPosition);
            else reject(new Error('Watch timeout'));
          }, 25000); // Longer timeout for continuous watching

          watchId = navigator.geolocation.watchPosition(
            (pos) => {
              positionCount++;
              console.log(`📍 Watch position ${positionCount}:`, pos.coords.accuracy, 'meters');

              if (!bestPosition || pos.coords.accuracy < bestPosition.coords.accuracy) {
                bestPosition = pos;
                console.log(`🎯 New best accuracy: ${Math.round(pos.coords.accuracy)}m`);

                // If we get very accurate position, resolve immediately
                if (pos.coords.accuracy <= 15) {
                  clearTimeout(timeoutId);
                  navigator.geolocation.clearWatch(watchId);
                  console.log('✅ Excellent accuracy achieved, stopping watch');
                  resolve(pos);
                }
              }

              // After getting several positions, use the best one
              if (positionCount >= 3 && bestPosition && bestPosition.coords.accuracy <= 50) {
                clearTimeout(timeoutId);
                navigator.geolocation.clearWatch(watchId);
                console.log('✅ Good accuracy after multiple readings');
                resolve(bestPosition);
              }
            },
            (err) => {
              clearTimeout(timeoutId);
              navigator.geolocation.clearWatch(watchId);
              console.log('❌ Watch position error:', err.message);
              reject(err);
            },
            {
              enableHighAccuracy: true,
              timeout: 8000,
              maximumAge: 0
            }
          );
        }),

        // Method 4: Alternative high-accuracy approach
        new Promise<GeolocationPosition>((resolve, reject) => {
          const timeoutId = setTimeout(() => reject(new Error('Alternative timeout')), 12000);
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              clearTimeout(timeoutId);
              console.log('📍 Alternative method accuracy:', Math.round(pos.coords.accuracy), 'meters');
              resolve(pos);
            },
            (err) => {
              clearTimeout(timeoutId);
              reject(err);
            },
            {
              enableHighAccuracy: true,
              timeout: 12000,
              maximumAge: 5000 // Allow slightly cached for speed
            }
          );
        })
      ];

      // Wait for the first successful result or the most accurate one
      const results = await Promise.allSettled(locationPromises);
      let bestPosition: GeolocationPosition | null = null;

      for (const result of results) {
        if (result.status === 'fulfilled') {
          const position = result.value;
          if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) {
            bestPosition = position;
          }
        }
      }

      if (!bestPosition) {
        console.log('❌ All location methods failed');
        return false;
      }

      const location = {
        lat: bestPosition.coords.latitude,
        lng: bestPosition.coords.longitude
      };

      // Validate coordinates are reasonable
      if (Math.abs(location.lat) > 90 || Math.abs(location.lng) > 180) {
        console.log('❌ Invalid GPS coordinates:', location);
        return false;
      }

      setUserLocation(location);
      setLocationAccuracy(bestPosition.coords.accuracy);
      console.log('✅ Best location found:', location, 'Accuracy:', Math.round(bestPosition.coords.accuracy), 'meters');
      return true;

    } catch (error) {
      console.log('❌ All GPS methods failed:', error);
      return false;
    }
  };

  const getFastLocation = async () => {
    try {
      console.log('🌐 Using enhanced location services with cross-validation...');

      // Enhanced location services with better accuracy
      const locationServices = [
        {
          url: 'https://ipapi.co/json/',
          name: 'ipapi.co',
          parser: (data: any) => ({
            lat: data.latitude,
            lng: data.longitude,
            city: data.city,
            country: data.country_name,
            accuracy: data.accuracy || 1000,
            isp: data.org
          })
        },
        {
          url: 'https://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query',
          name: 'ip-api.com',
          parser: (data: any) => ({
            lat: data.lat,
            lng: data.lon,
            city: data.city,
            country: data.country,
            accuracy: 800, // Generally more accurate
            isp: data.isp
          })
        },
        {
          url: 'https://ipinfo.io/json?token=',
          name: 'ipinfo.io',
          parser: (data: any) => {
            const [lat, lng] = (data.loc || '0,0').split(',').map(Number);
            return {
              lat,
              lng,
              city: data.city,
              country: data.country,
              accuracy: 1200,
              isp: data.org
            };
          }
        },
        // Add more precise location service
        {
          url: 'https://api.ipgeolocation.io/ipgeo?apiKey=',
          name: 'ipgeolocation.io',
          parser: (data: any) => ({
            lat: parseFloat(data.latitude),
            lng: parseFloat(data.longitude),
            city: data.city,
            country: data.country_name,
            accuracy: 600, // Often more precise
            isp: data.isp
          })
        }
      ];

      // Try services in parallel and collect all results for cross-validation
      const promises = locationServices.map(async (service) => {
        try {
          console.log(`📡 Trying ${service.name}...`);
          const response = await fetch(service.url, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(8000) // Longer timeout for better accuracy
          });

          if (!response.ok) throw new Error(`HTTP ${response.status}`);

          const data = await response.json();
          const location = service.parser(data);

          if (location.lat && location.lng && !isNaN(location.lat) && !isNaN(location.lng)) {
            if (Math.abs(location.lat) > 0.1 && Math.abs(location.lng) > 0.1) {
              console.log(`✅ ${service.name} success:`, location);
              return location;
            }
          }
          throw new Error('Invalid coordinates');

        } catch (error) {
          console.log(`❌ ${service.name} failed:`, error);
          return null;
        }
      });

      // Wait for all services to complete and cross-validate results
      const results = await Promise.allSettled(promises);
      const validLocations = results
        .filter(result => result.status === 'fulfilled' && result.value !== null)
        .map(result => (result as PromiseFulfilledResult<any>).value);

      if (validLocations.length === 0) {
        throw new Error('No location services succeeded');
      }

      // Cross-validate and pick the most accurate location
      let bestLocation = validLocations[0];

      if (validLocations.length > 1) {
        console.log('🔍 Cross-validating locations:', validLocations);

        // If we have multiple results, pick the one with best accuracy
        // or the one that's most consistent with others
        bestLocation = validLocations.reduce((best, current) => {
          if (current.accuracy < best.accuracy) {
            return current;
          }
          return best;
        });

        // Additional validation: check if locations are reasonably close
        const distances = validLocations.map(loc => {
          const distance = Math.sqrt(
            Math.pow(loc.lat - bestLocation.lat, 2) +
            Math.pow(loc.lng - bestLocation.lng, 2)
          );
          return distance;
        });

        const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
        console.log('📏 Average distance between locations:', avgDistance);

        if (avgDistance > 0.1) { // If locations are very different
          console.log('⚠️ Location services disagree significantly, using most accurate');
        }
      }

      setUserLocation({ lat: bestLocation.lat, lng: bestLocation.lng });
      setLocationAccuracy(bestLocation.accuracy);
      console.log('🎯 Final location selected:', bestLocation);

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          const location = result.value;
          setUserLocation({ lat: location.lat, lng: location.lng });
          setLocationAccuracy(location.accuracy);
          console.log('🎯 Fast location found:', location);
          return;
        }
      }

      // If all IP services fail, use Batna as fallback
      console.log('📍 IP services failed, using Batna fallback...');
      setUserLocation({ lat: 35.5559, lng: 6.1743 });
      setLocationAccuracy(null);
      console.log('🏠 Using Batna coordinates as fallback');

    } catch (error) {
      console.error('❌ Fast location failed:', error);
      // Final fallback to Batna
      setUserLocation({ lat: 35.5559, lng: 6.1743 });
      setLocationAccuracy(null);
      console.log('🏠 Using Batna coordinates as final fallback');
    }
  };


  const fetchLaboratories = async () => {
    try {
      console.log('Fetching laboratories and cliniques from database...');
      
      // Fetch both laboratories and cliniques in parallel
      const [labResponse, cliniqueResponse] = await Promise.all([
        supabase.from('laboratory_profiles').select('*'),
        supabase.from('clinique_profiles').select('*')
      ]);

      let allLocations: Laboratory[] = [];

      // Process laboratories
      if (labResponse.data && !labResponse.error) {
        const laboratories = labResponse.data.map((lab: any) => ({
          ...lab,
          name: lab.laboratory_name,
          type: 'laboratory' as const,
          city: lab.address?.split(',').pop()?.trim() || 'Batna' // Extract city from address or default
        }));
        allLocations = [...allLocations, ...laboratories];
        console.log('Fetched laboratories:', laboratories.length);
      } else if (labResponse.error) {
        console.error('Error fetching laboratories:', labResponse.error);
      }

      // Process cliniques
      if (cliniqueResponse.data && !cliniqueResponse.error) {
        const cliniques = cliniqueResponse.data.map((clinique: any) => ({
          ...clinique,
          name: clinique.clinique_name,
          type: 'clinique' as const,
          laboratory_name: clinique.clinique_name, // For compatibility
          city: clinique.address?.split(',').pop()?.trim() || 'Batna' // Extract city from address or default
        }));
        allLocations = [...allLocations, ...cliniques];
        console.log('Fetched cliniques:', cliniques.length);
      } else if (cliniqueResponse.error) {
        console.error('Error fetching cliniques:', cliniqueResponse.error);
      }

      console.log('Total locations fetched:', allLocations.length);
      setLaboratories(allLocations);
      
    } catch (error) {
      console.error('Error fetching locations:', error);
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
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${lab.latitude},${lab.longitude}`;
      window.open(url, '_blank');
    } else {
      const search = [lab.address, lab.city].filter(Boolean).join(', ');
      const url = `https://www.google.com/maps/search/${encodeURIComponent(search || lab.laboratory_name)}`;
      window.open(url, '_blank');
    }
  };

  const sendPADRequest = async (lab: Laboratory) => {
    if (!user) {
      toast({
        title: t('common.error'),
        description: t('PAD.loginRequired'),
        variant: 'destructive'
      });
      return;
    }

    try {
      // Check for existing PAD requests with improved logic
      const { data: existing } = await supabase
        .from('pad_requests')
        .select('id,status,created_at,updated_at')
        .eq('client_id', user.id)
        .eq('laboratory_id', (lab as any).user_id)
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

      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: inserted, error } = await supabase
        .from('pad_requests')
        .insert([
          {
            client_id: user.id,
            laboratory_id: (lab as any).user_id,
            status: 'pending',
            message: t('PAD.requestMessage'),
            client_location_lat: userLocation?.lat || null,
            client_location_lng: userLocation?.lng || null,
            client_name: clientProfile?.full_name || 'Client',
            client_phone: clientProfile?.phone || '',
            client_address: clientProfile?.address || ''
          }
        ])
        .select()
        .single();

      if (error) {
        toast({ title: t('common.error'), description: t('PAD.sendError'), variant: 'destructive' });
      } else {
        // Notify laboratory
        await supabase.from('notifications').insert([
          {
            user_id: (lab as any).user_id,
            title: t('PAD.newRequest.title'),
            message: `${clientProfile?.full_name || t('common.aClient')} ${t('PAD.newRequest.message')}`,
            type: 'info',
            is_read: false,
            related_entity_type: 'PAD_request',
            related_entity_id: inserted.id
          }
        ]);
        toast({ title: t('PAD.sentTitle'), description: `${t('PAD.sentDesc')} ${lab.laboratory_name}` });
      }
    } catch (err) {
      toast({ title: 'Erreur', description: 'Une erreur est survenue.', variant: 'destructive' });
    }
  };

  const refreshLocation = async () => {
    // Clear any cached location data
    setUserLocation(null);
    setLocationAccuracy(null);

    // Force fresh location request
    await getCurrentLocation();
    fetchLaboratories();
  };

  const goToMyPlace = () => {
    if (!userLocation) {
      toast({ title: t('map.positionUnknown'), description: t('map.enableLocation'), variant: 'destructive' });
      return;
    }
    setNavDest([userLocation.lat, userLocation.lng]);
  };

  const goToLabLocation = (lab: Laboratory) => {
    const lat = typeof lab.latitude === 'string' ? parseFloat(lab.latitude) : lab.latitude;
    const lng = typeof lab.longitude === 'string' ? parseFloat(lab.longitude) : lab.longitude;
    if (typeof lat === 'number' && !isNaN(lat) && typeof lng === 'number' && !isNaN(lng)) {
      setNavDest([lat, lng]);
    }
  };



  // Filter laboratories based on selected filter type
  const filteredLaboratories = laboratories.filter(lab => {
    if (filterType === 'all') return true;
    return lab.type === filterType;
  });

  const labsWithDistance = userLocation && filteredLaboratories.length > 0
    ? filteredLaboratories
        .map(lab => {
          const lat = typeof lab.latitude === 'string' ? parseFloat(lab.latitude) : lab.latitude;
          const lng = typeof lab.longitude === 'string' ? parseFloat(lab.longitude) : lab.longitude;
          if (typeof lat === 'number' && !isNaN(lat) && typeof lng === 'number' && !isNaN(lng)) {
            return {
              ...lab,
              latitude: lat,
              longitude: lng,
              distance: calculateDistance(userLocation.lat, userLocation.lng, lat, lng)
            };
          }
          // Keep labs without coordinates; no distance value
          return { ...lab } as Laboratory;
        })
        .sort((a: any, b: any) => {
          const da = typeof a.distance === 'number' ? a.distance : Number.POSITIVE_INFINITY;
          const db = typeof b.distance === 'number' ? b.distance : Number.POSITIVE_INFINITY;
          return da - db;
        })
    : filteredLaboratories;

  const mapCenter: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [35.5559, 6.1743]; // Batna coordinates

  const getAccuracyText = () => {
    if (!locationAccuracy) return t('map.accuracyApproximate');
    if (locationAccuracy <= 10) return t('map.accuracyVeryPrecise');
    if (locationAccuracy <= 50) return t('map.accuracyPrecise');
    if (locationAccuracy <= 100) return t('map.accuracyGood');
    if (locationAccuracy <= 500) return t('map.accuracyApproximate');
    return t('map.accuracyIP');
  };

  // Ensure map is ready before actions
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => mapRef.current?.invalidateSize(), 0);
    }
  }, []);

  const getAccuracyColor = () => {
    if (!locationAccuracy) return "bg-gray-50 border-gray-200";
    if (locationAccuracy <= 50) return "bg-green-50 border-green-200";
    if (locationAccuracy <= 100) return "bg-laboratory-light border-laboratory-muted";
    if (locationAccuracy <= 500) return "bg-yellow-50 border-yellow-200";
    return "bg-orange-50 border-orange-200";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          onClick={refreshLocation}
          disabled={isGettingLocation}
          variant="outline"
          className="border-laboratory-primary text-laboratory-dark hover:bg-laboratory-light"
        >
          {isGettingLocation ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          {isGettingLocation ? 'Localisation ultra-précise...' : t('map.refreshPosition')}
        </Button>

        <Button
          onClick={goToMyPlace}
          variant="outline"
          className="border-laboratory-primary text-laboratory-dark hover:bg-laboratory-light"
        >
          <Navigation className="w-4 h-4 mr-2" />
          {t('map.goToMyPlace')}
        </Button>

        {/* Filter Controls */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-md">
          <Button
            onClick={() => setFilterType('all')}
            variant={filterType === 'all' ? 'default' : 'ghost'}
            size="sm"
            className={`h-8 px-3 text-xs ${
              filterType === 'all'
                ? 'bg-laboratory-primary text-white hover:bg-laboratory-accent'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tous ({laboratories.length})
          </Button>
          <Button
            onClick={() => setFilterType('laboratory')}
            variant={filterType === 'laboratory' ? 'default' : 'ghost'}
            size="sm"
            className={`h-8 px-3 text-xs ${
              filterType === 'laboratory'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Laboratoires ({laboratories.filter(l => l.type === 'laboratory').length})
          </Button>
          <Button
            onClick={() => setFilterType('clinique')}
            variant={filterType === 'clinique' ? 'default' : 'ghost'}
            size="sm"
            className={`h-8 px-3 text-xs ${
              filterType === 'clinique'
                ? 'bg-laboratory-primary text-laboratory-dark hover:bg-laboratory-accent'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Cliniques ({laboratories.filter(l => l.type === 'clinique').length})
          </Button>
        </div>

        {userLocation && (
          <div className={`flex items-center text-sm text-gray-600 px-3 py-2 rounded-md ${getAccuracyColor()}`}>
            <div className="w-2 h-2 bg-laboratory-primary rounded-full mr-2 animate-pulse"></div>
            <span className="font-medium">{getAccuracyText()}:</span>
            <span className="ml-1">{userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}</span>
            {locationAccuracy && (
              <span className="ml-2 text-xs">±{Math.round(locationAccuracy)}m</span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accurate Map */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-laboratory-dark flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                {t('map.interactiveMap')}
              </div>
              {laboratories.length > 0 && (
                <Badge className="bg-laboratory-primary">
                  {laboratories.length} {t('map.laboratories')}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={mapContainerRef}
              className="w-full rounded-lg overflow-hidden"
              style={{ height, zIndex: 1 }}
            >
              {userLocation ? (
                <MapContainer
                  center={mapCenter}
                  zoom={16}
                  style={{ height: '100%', width: '100%', zIndex: 1 }}
                  className="rounded-lg"
                  zoomControl={true}
                  attributionControl={false}
                  whenCreated={(map) => { setLeafletMap(map); mapRef.current = map; }}
                >
                  <MapUpdater center={mapCenter} />
                  <MapNavigator dest={navDest} zoom={17} />

                  {/* High-quality tile layer */}
                  <TileLayer
                    attribution=''
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
                          <strong>{t('map.yourPosition')}</strong><br />
                          📍 {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}<br />
                          {locationAccuracy && (
                            <span className="text-xs text-gray-500">
                              {t('map.accuracy', { meters: Math.round(locationAccuracy) })}
                            </span>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Laboratory and Clinique markers (only render when coordinates are valid) */}
                  {labsWithDistance
                    .filter(lab => typeof lab.latitude === 'number' && !isNaN(lab.latitude as any) && typeof lab.longitude === 'number' && !isNaN(lab.longitude as any))
                    .map((lab) => (
                      <Marker
                        key={lab.id}
                        position={[lab.latitude as number, lab.longitude as number]}
                        icon={lab.type === 'laboratory' ? labIcon : cliniqueIcon}
                      >
                        <Popup>
                          <div style={{ minWidth: '200px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                              <h3 style={{ margin: '0', color: lab.type === 'laboratory' ? '#059669' : '#2563EB', fontSize: '16px', fontWeight: 'bold' }}>
                                {lab.name}
                              </h3>
                              <span style={{
                                marginLeft: '8px',
                                padding: '2px 6px',
                                backgroundColor: lab.type === 'laboratory' ? '#059669' : '#2563EB',
                                color: 'white',
                                fontSize: '10px',
                                borderRadius: '4px',
                                textTransform: 'uppercase'
                              }}>
                                {lab.type === 'laboratory' ? 'Laboratoire' : 'Clinique'}
                              </span>
                            </div>
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
                                background: lab.type === 'laboratory' ? '#059669' : '#2563EB',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                width: '100%'
                              }}
                            >
                              🧭 Itinéraire
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                  ))}
                </MapContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-gray-100">
                  <MapPin className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2 font-medium">{t('map.locationRequired')}</p>
                  <p className="text-sm text-gray-500 mb-4 text-center max-w-xs">
                    {t('map.needLocation')}
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                      className="bg-laboratory-primary hover:bg-laboratory-accent"
                    >
                      {isGettingLocation ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Navigation className="w-4 h-4 mr-2" />
                      )}
                      {isGettingLocation ? 'Localisation EXTRÊME...' : '🔥 Position EXTRÊME'}
                    </Button>

                    <Button
                      onClick={async () => {
                        try {
                          const { requestLocationPermission } = await import('@/utils/reliableLocation');
                          const hasPermission = await requestLocationPermission();

                          if (hasPermission) {
                            toast({
                              title: "✅ Permission accordée!",
                              description: "Vous pouvez maintenant obtenir votre position exacte.",
                            });
                          } else {
                            toast({
                              title: "❌ Permission refusée",
                              description: "Utilisation de la géolocalisation IP comme alternative.",
                              variant: "default"
                            });
                          }
                        } catch (error) {
                          toast({
                            title: "❌ Erreur",
                            description: "Impossible de demander la permission de géolocalisation.",
                            variant: "destructive"
                          });
                        }
                      }}
                      variant="outline"
                      className="border-laboratory-primary text-laboratory-primary hover:bg-laboratory-primary hover:text-white"
                    >
                      🔐 Autoriser la géolocalisation
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Laboratory List */}
        <Card className="h-full">
          <CardHeader className="sticky top-0 z-10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
            <CardTitle className="text-laboratory-dark">
              <div className="flex items-center justify-between">
                <span>{t('map.nearbyLabs')}</span>
                <div className="flex items-center gap-2">
                  {laboratories.length > 0 && (
                    <Badge className="bg-laboratory-primary">{laboratories.length}</Badge>
                  )}
                  <span className="text-xs text-gray-500">{t('map.scrollHint')}</span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 overflow-y-auto" style={{ height }}>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-laboratory-primary mr-2" />
                <span className="text-gray-600">{t('map.loadingLabs')}</span>
              </div>
            ) : laboratories.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">{t('map.noLabsInDB')}</p>
                <p className="text-sm text-gray-400 mb-4">
                  {t('map.noLabsAvailable')}
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
                  onClick={() => {
                    setSelectedLab(lab);
                    const map = mapRef.current || leafletMap;
                    const lat = typeof lab.latitude === 'string' ? parseFloat(lab.latitude) : lab.latitude;
                    const lng = typeof lab.longitude === 'string' ? parseFloat(lab.longitude) : lab.longitude;
                    if (map && typeof lat === 'number' && !isNaN(lat) && typeof lng === 'number' && !isNaN(lng)) {
                      map.flyTo([lat, lng], 17, { animate: true });
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-laboratory-dark">{lab.name}</h4>
                      <Badge 
                        className={`text-xs ${
                          lab.type === 'laboratory'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-laboratory-light text-laboratory-dark border-laboratory-muted'
                        }`}
                        variant="outline"
                      >
                        {lab.type === 'laboratory' ? 'Laboratoire' : 'Clinique'}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{lab.address}, {lab.city}</p>

                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Clock className="w-4 h-4 mr-1" />
                    {lab.opening_hours || '8h00 - 18h00'}
                    {Array.isArray(lab.opening_days) && lab.opening_days.length > 0 && (
                      <>
                        <span className="mx-2">•</span>
                        <button
                          className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded hover:bg-green-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLab(selectedLab?.id === lab.id ? null : lab);
                          }}
                        >
                          {t('map.openDays')}
                        </button>
                      </>
                    )}
                    {lab.distance && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{lab.distance.toFixed(1)} km</span>
                      </>
                    )}
                  </div>

                  {selectedLab?.id === lab.id && Array.isArray(lab.opening_days) && lab.opening_days.length > 0 && (
                    <div className="mb-3 text-sm text-gray-700">
                      <div className="grid grid-cols-2 gap-1">
                        {lab.opening_days.map((d, i) => (
                          <span key={i} className="bg-green-50 border border-green-200 rounded px-2 py-1">{d}</span>
                        ))}
                      </div>
                    </div>
                  )}

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

                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        getDirections(lab);
                      }}
                      className="bg-laboratory-primary hover:bg-laboratory-accent text-xs px-2 py-1"
                    >
                      <Route className="w-3 h-3 mr-1" />
                      {t('map.directions')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToLabLocation(lab);
                      }}
                      className="border-laboratory-primary text-laboratory-dark hover:bg-laboratory-light text-xs px-2 py-1"
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      {t('map.goToLocation')}
                    </Button>
                    {user && user.type === 'client' && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          sendPADRequest(lab);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        {t('map.requestPAD')}
                      </Button>
                    )}
                    {lab.phone && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`tel:${lab.phone}`, '_self');
                        }}
                        className="border-laboratory-primary text-laboratory-dark hover:bg-laboratory-light text-xs px-2 py-1"
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        {t('map.call')}
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

export default AccurateMapComponent;
