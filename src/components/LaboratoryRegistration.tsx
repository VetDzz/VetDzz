import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Building, Phone, Mail, Clock, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet - disable default external images
delete (L.Icon.Default.prototype as any)._getIconUrl;

interface vetData {
  vet_name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  opening_hours: string;
  opening_days: string[]; // Nouveaux jours d'ouverture
  latitude: number | null;
  longitude: number | null;
}

// Custom vet marker (identical to AccurateMapComponent marker)
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

// Map click handler component
const LocationSelector: React.FC<{
  onLocationSelect: (lat: number, lng: number) => void;
  selectedLocation: { lat: number; lng: number } | null;
}> = ({ onLocationSelect, selectedLocation }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });

  return selectedLocation ? (
    <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={labIcon} />
  ) : null;
};

const vetRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [formData, setFormData] = useState<vetData>({
    vet_name: '',
    address: '',
    phone: '',
    email: '',
    description: '',
    opening_hours: '8h00 - 18h00',
    opening_days: [],
    latitude: null,
    longitude: null,
  });

  const allDays = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];

  // Pre-fill form for OAuth users who already have basic profile
  useEffect(() => {
    const loadExistingProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        // Check if there's an existing vet profile (from OAuth signup)
        const { data: existingProfile } = await supabase
          .from('vet_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (existingProfile) {
          setFormData({
            vet_name: existingProfile.vet_name || existingProfile.clinic_name || '',
            address: existingProfile.address || '',
            phone: existingProfile.phone || '',
            email: existingProfile.email || user.email || '',
            description: existingProfile.description || '',
            opening_hours: existingProfile.opening_hours || '8h00 - 18h00',
            opening_days: existingProfile.opening_days || [],
            latitude: existingProfile.latitude,
            longitude: existingProfile.longitude,
          });
          
          if (existingProfile.latitude && existingProfile.longitude) {
            setSelectedLocation({
              lat: existingProfile.latitude,
              lng: existingProfile.longitude
            });
          }
        } else {
          // Pre-fill email from user
          setFormData(prev => ({
            ...prev,
            email: user.email || ''
          }));
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingProfile();
  }, [navigate]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
  };

  const handleInputChange = (field: keyof vetData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLocation) {
      alert('Veuillez sélectionner votre emplacement sur la carte');
      return;
    }

    if (!formData.vet_name || !formData.address || !formData.phone) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        alert('Erreur d\'authentification');
        return;
      }

      // Create or update vet profile (upsert for OAuth users who already have basic profile)
      const { data, error } = await supabase
        .from('vet_profiles')
        .upsert([
          {
            user_id: user.id,
            vet_name: formData.vet_name,
            clinic_name: formData.vet_name,
            address: formData.address,
            phone: formData.phone,
            email: formData.email || user.email,
            description: formData.description,
            opening_hours: formData.opening_hours,
            opening_days: formData.opening_days,
            latitude: selectedLocation.lat,
            longitude: selectedLocation.lng,
            is_verified: true,
            updated_at: new Date().toISOString()
          }
        ], { onConflict: 'user_id' })
        .select();

      if (error) {
        alert('Erreur lors de la création du profil: ' + error.message);
        return;
      }
      
      // Clear OAuth flag if exists
      localStorage.removeItem('newVetOAuth');
      
      alert('Profil créé avec succès!');
      
      // Navigate to vet dashboard
      navigate('/vet-dashboard');

    } catch (error) {
      alert('Erreur lors de la création du profil');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-vet-dark mb-2">
            Créer un Profil de Laboratoire
          </h1>
          <p className="text-gray-600">
            Complétez les informations de votre laboratoire et sélectionnez votre emplacement
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Informations du Laboratoire
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="vet_name">Nom du Laboratoire *</Label>
                  <Input
                    id="vet_name"
                    value={formData.vet_name}
                    onChange={(e) => handleInputChange('vet_name', e.target.value)}
                    placeholder="Ex: Laboratoire Central Batna"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">Adresse *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Ex: 123 Rue de la République"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Ex: 033 12 34 56"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contact@laboratoire.com"
                  />
                </div>

                <div>
                  <Label htmlFor="opening_hours">Horaires d'ouverture</Label>
                  <Input
                    id="opening_hours"
                    value={formData.opening_hours}
                    onChange={(e) => handleInputChange('opening_hours', e.target.value)}
                    placeholder="Ex: 8h00 - 18h00"
                  />
                </div>

                <div>
                  <Label>Jours d'ouverture</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {allDays.map((day) => {
                      const selected = formData.opening_days.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              opening_days: selected
                                ? prev.opening_days.filter(d => d !== day)
                                : [...prev.opening_days, day]
                            }))
                          }}
                          className={`px-3 py-1 rounded-full border ${selected ? 'bg-vet-primary text-white border-vet-primary' : 'bg-white text-vet-dark border-vet-muted'} hover:shadow-sm`}
                        >
                          {day}
                        </button>
                      );
                    })}
                    <Button
                      type="button"
                      variant="outline"
                      className="ml-1 border-gray-300 text-gray-600"
                      onClick={() => setFormData(prev => ({ ...prev, opening_days: prev.opening_days.length === allDays.length ? [] : [...allDays] }))}
                    >
                      Permanences
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="ml-1 border-gray-300 text-gray-600"
                      onClick={() => setFormData(prev => ({ ...prev, opening_days: [] }))}
                    >
                      Non permanances
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Décrivez votre laboratoire et vos services..."
                    rows={3}
                  />
                </div>

                {selectedLocation && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center text-green-700">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="font-medium">Emplacement sélectionné:</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Latitude: {selectedLocation.lat.toFixed(6)}, 
                      Longitude: {selectedLocation.lng.toFixed(6)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Map Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Sélectionner l'Emplacement
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Cliquez sur la carte pour sélectionner l'emplacement exact de votre laboratoire
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-96 rounded-lg overflow-hidden border">
                  <MapContainer
                    center={[35.5559, 6.1743]} // Batna coordinates
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    attributionControl={false}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution=""
                    />
                    <LocationSelector
                      onLocationSelect={handleLocationSelect}
                      selectedLocation={selectedLocation}
                    />
                  </MapContainer>
                </div>
                
                {!selectedLocation && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Cliquez sur la carte pour sélectionner votre emplacement
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Submit Button */}
          <div className="mt-8 text-center">
            <Button
              type="submit"
              disabled={isSubmitting || !selectedLocation}
              className="bg-vet-primary hover:bg-vet-accent px-8 py-3"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Créer le Profil de Laboratoire
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default vetRegistration;
