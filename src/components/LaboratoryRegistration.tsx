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

interface LaboratoryData {
  laboratory_name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  opening_hours: string;
  opening_days: string[]; // Nouveaux jours d'ouverture
  latitude: number | null;
  longitude: number | null;
}

// Custom laboratory marker
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

const LaboratoryRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [formData, setFormData] = useState<LaboratoryData>({
    laboratory_name: '',
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

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
    console.log('Location selected:', { lat, lng });
  };

  const handleInputChange = (field: keyof LaboratoryData, value: string) => {
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

    if (!formData.laboratory_name || !formData.address || !formData.phone) {
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

      // Create laboratory profile
      const { data, error } = await supabase
        .from('laboratory_profiles')
        .insert([
          {
            user_id: user.id,
            laboratory_name: formData.laboratory_name,
            address: formData.address,
            phone: formData.phone,
            email: formData.email || user.email,
            description: formData.description,
            opening_hours: formData.opening_hours,
            opening_days: formData.opening_days,
            latitude: selectedLocation.lat,
            longitude: selectedLocation.lng,
            is_verified: true, // Auto-verified for professional use
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        console.error('Error creating laboratory profile:', error);
        alert('Erreur lors de la création du profil');
        return;
      }

      console.log('Laboratory profile created:', data);
      alert('Profil de laboratoire créé avec succès! En attente de vérification.');
      
      // Navigate to laboratory dashboard
      navigate('/laboratory-dashboard');

    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de la création du profil');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-laboratory-dark mb-2">
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
                  <Label htmlFor="laboratory_name">Nom du Laboratoire *</Label>
                  <Input
                    id="laboratory_name"
                    value={formData.laboratory_name}
                    onChange={(e) => handleInputChange('laboratory_name', e.target.value)}
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
                          className={`px-3 py-1 rounded-full border ${selected ? 'bg-laboratory-primary text-white border-laboratory-primary' : 'bg-white text-laboratory-dark border-laboratory-muted'} hover:shadow-sm`}
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
              className="bg-laboratory-primary hover:bg-laboratory-accent px-8 py-3"
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

export default LaboratoryRegistration;
