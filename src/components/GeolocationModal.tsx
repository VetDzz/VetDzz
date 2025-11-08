import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { MapPin, Building, Save, ArrowLeft } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet - disable default external images
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Use the exact same green star pin as on the "trouver labo" map
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

interface vetLocationFormProps {
  isOpen: boolean;
  userData: any;
  userType?: 'vet' | 'vet';
  onComplete: (data: any) => void;
  onBack: () => void;
}

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

const vetLocationForm: React.FC<vetLocationFormProps> = ({
  isOpen,
  userData,
  userType = 'vet',
  onComplete,
  onBack
}) => {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [labName, setLabName] = useState(userData?.labName || '');
  const [address, setAddress] = useState('');
  const [openingHours, setOpeningHours] = useState('8h00 - 18h00');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [description, setDescription] = useState('');
  // New: opening days selection state (French days)
  const allDays = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
  const [openingDays, setOpeningDays] = useState<string[]>([]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
  };

  const handleSubmit = () => {
    if (!selectedLocation) {
      alert('Veuillez sélectionner votre emplacement sur la carte');
      return;
    }
    if (!labName.trim()) {
      alert(userType === 'vet' ? 'Veuillez entrer le nom de votre vet' : 'Veuillez entrer le nom de votre laboratoire');
      return;
    }

    // Pass all the additional data along with coordinates
    const completeData = {
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lng,
      labName: labName.trim(),
      address: address.trim(),
      openingHours: openingHours.trim(),
      openingDays,
      phone: phone.trim(),
      description: description.trim()
    };

    onComplete(completeData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-50 z-50 overflow-auto"
      >
        <div className="min-h-screen py-8">
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="text-center">
                <h1 className={`text-3xl font-bold mb-2 ${userType === 'vet' ? 'text-vet-dark' : 'text-vet-dark'}`}>
                  {userType === 'vet' ? 'Localisation de votre vet' : 'Localisation de votre Laboratoire'}
                </h1>
                <p className="text-gray-600">
                  {userType === 'vet' 
                    ? 'Sélectionnez l\'emplacement exact de votre vet sur la carte'
                    : 'Sélectionnez l\'emplacement exact de votre laboratoire sur la carte'
                  }
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building className="w-5 h-5 mr-2" />
                      {userType === 'vet' ? 'Informations de la vet' : 'Informations du Laboratoire'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="labName">{userType === 'vet' ? 'Nom de la vet *' : 'Nom du Laboratoire *'}</Label>
                      <Input
                        id="labName"
                        value={labName}
                        onChange={(e) => setLabName(e.target.value)}
                        placeholder={userType === 'vet' ? 'Ex: vet Médicale Centrale' : 'Ex: Laboratoire Central'}
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Adresse</Label>
                      <Input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Ex: 123 Rue de la Santé"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ex: +213 123 456 789"
                      />
                    </div>

                    <div>
                      <Label htmlFor="openingHours">Horaires d'ouverture</Label>
                      <Input
                        id="openingHours"
                        value={openingHours}
                        onChange={(e) => setOpeningHours(e.target.value)}
                        placeholder="Ex: 8h00 - 18h00"
                      />
                    </div>

                    {/* New: Opening days between hours and description */}
                    <div>
                      <Label>Jours d'ouverture</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {allDays.map((day) => {
                          const selected = openingDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() =>
                                setOpeningDays(prev =>
                                  selected ? prev.filter(d => d !== day) : [...prev, day]
                                )
                              }
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
                          onClick={() => setOpeningDays(prev => (prev.length === allDays.length ? [] : [...allDays]))}
                        >
                          Permanences
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="ml-1 border-gray-300 text-gray-600"
                          onClick={() => setOpeningDays([])}
                        >
                          Non permanances
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description (optionnel)</Label>
                      <Input
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ex: Laboratoire spécialisé en analyses médicales"
                      />
                    </div>

                    {selectedLocation && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          Position sélectionnée: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
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
                      {userType === 'vet' 
                        ? 'Cliquez sur la carte pour marquer votre vet'
                        : 'Cliquez sur la carte pour marquer votre laboratoire'
                      }
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 rounded-lg overflow-hidden border">
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
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <Button
                  onClick={onBack}
                  variant="outline"
                  className="flex items-center w-full sm:w-auto"
                  size="default"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>

                <Button
                  onClick={handleSubmit}
                  disabled={!selectedLocation || !labName.trim()}
                  className="bg-vet-primary hover:bg-vet-accent flex items-center w-full sm:w-auto"
                  size="default"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Créer le Compte
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default vetLocationForm;
