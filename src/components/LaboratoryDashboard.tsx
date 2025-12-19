import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, FileText, Settings, Bell, Upload, Search, Send, User, Clock, Navigation } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import MapComponent from '@/components/MapComponent';
import UploadResultModal from '@/components/UploadResultModal';

interface Client {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  date_of_birth?: string;
  emergency_contact_name?: string;
  created_at: string;
}

interface PADRequest {
  id: string;
  client_id: string;
  vet_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  created_at: string;
  client?: Client;
}

const vetDashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [vetLocation, setvetLocation] = useState<{lat: number, lng: number} | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [PADRequests, setPADRequests] = useState<PADRequest[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Get the default tab from URL parameters
  const urlParams = new URLSearchParams(location.search);
  const defaultTab = urlParams.get('tab') === 'requests' ? 'requests' : 'clients';
  useEffect(() => {
    fetchPADRequests();
    fetchAllClients(); // Load all clients on component mount
    fetchvetLocation();
  }, []);

  const fetchvetLocation = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('vet_profiles')
        .select('latitude, longitude')
        .eq('user_id', user.id)
        .single();

      if (error) {

      } else if (data && data.latitude && data.longitude) {
        setvetLocation({ lat: data.latitude, lng: data.longitude });
      }
    } catch (error) {

    }
  };

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

  const showClientLocation = (request: any) => {
    // Use location from PAD request if available, otherwise from client profile
    const lat = request.client_location_lat || request.client?.latitude;
    const lng = request.client_location_lng || request.client?.longitude;

    if (lat && lng) {
      const distance = vetLocation ?
        calculateDistance(vetLocation.lat, vetLocation.lng, lat, lng) :
        null;

      const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(googleMapsUrl, '_blank');

      if (distance) {
        toast({
          title: "Distance calculée",
          description: `Distance: ${distance.toFixed(1)} km`,
        });
      }
    } else {
      toast({
        title: "Localisation indisponible",
        description: "La localisation de ce client n'est pas disponible.",
        variant: "destructive"
      });
    }
  };

  const fetchPADRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Simple query without complex joins - fixed table name case
      const { data, error } = await supabase
        .from('pad_requests')
        .select('*')
        .eq('vet_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {

      } else {

        setPADRequests(data || []);
      }
    } catch (error) {

    }
  };

  const fetchAllClients = async () => {
    setIsSearching(true);
    try {

      const { data, error } = await supabase
        .from('client_profiles')
        .select('*')
        .limit(20);

      if (error) {

        alert(`Erreur lors de la récupération des clients: ${error.message}`);
      } else {

        setClients(data || []);
      }
    } catch (error) {

      alert(`Erreur: ${error.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  const searchClients = async () => {
    if (!searchTerm.trim()) {
      fetchAllClients(); // Show all clients if search is empty
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('client_profiles')
        .select('*')
        .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .limit(20);

      if (error) {

      } else {
        setClients(data || []);
      }
    } catch (error) {

    } finally {
      setIsSearching(false);
    }
  };

  const openUploadModal = (client: Client) => {
    setSelectedClient(client);
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setSelectedClient(null);
    setShowUploadModal(false);
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

  const handleLocationSelect = (lat: number, lng: number) => {
    setvetLocation({ lat, lng });

  };

  const handleApproveRequest = async (requestId: string) => {
    try {

      // First get the current vet info
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Get vet profile for notification
      const { data: labProfile, error: labError } = await supabase
        .from('vet_profiles')
        .select('clinic_name, email')
        .eq('user_id', currentUser.id)
        .single();
        
      if (labError) {

      }

      // Update request status - fixed table name case
      const { data: updated, error } = await supabase
        .from('pad_requests')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {

        toast({
          title: "Erreur",
          description: "Erreur lors de l'approbation de la demande",
          variant: "destructive"
        });
        return;
      }

      // Send notification to client with lab name
      if (updated?.client_id) {
        const labName = labProfile?.clinic_name || 'Un laboratoire';

        const { error: notifError } = await supabase.from('notifications').insert([
          {
            user_id: updated.client_id,
            title: t('PAD.acceptedTitle'),
            message: `${labName} a accepté votre demande PAD. Restez joignable, ils peuvent vous appeler.`,
            type: 'success',
            is_read: false,
            related_entity_type: 'PAD_request',
            related_entity_id: updated.id
          }
        ]);
        
        if (notifError) {

        } else {

        }
        
        // Send push notification to client
        try {

          // Get client's push token
          const { data: clientProfile } = await supabase
            .from('client_profiles')
            .select('push_token')
            .eq('user_id', updated.client_id)
            .single();
          
          if (clientProfile?.push_token) {

            const { data: notifData, error: pushError } = await supabase.functions.invoke('send-push-notification', {
              body: {
                token: clientProfile.push_token,
                title: 'Demande CVD acceptée',
                body: `${labName} a accepté votre demande de consultation à domicile`,
                data: {
                  type: 'cvd_accepted',
                  request_id: updated.id,
                  vet_id: currentUser?.id
                }
              }
            });
            
            if (pushError) {

            } else {

            }
          } else {

          }
        } catch (pushError) {

        }
      }
      
      toast({
        title: "Succès",
        description: "Demande PAD acceptée avec succès!",
      });
      
      // Refresh requests
      await fetchPADRequests();
      
    } catch (error) {

      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'approbation",
        variant: "destructive"
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {

      // First get the current vet info
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Get vet profile for notification
      const { data: labProfile, error: labError } = await supabase
        .from('vet_profiles')
        .select('clinic_name, email')
        .eq('user_id', currentUser.id)
        .single();
        
      if (labError) {

      }

      // Update request status - fixed table name case
      const { data: updated, error } = await supabase
        .from('pad_requests')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {

        toast({
          title: "Erreur",
          description: "Erreur lors du refus de la demande",
          variant: "destructive"
        });
        return;
      }

      // Send notification to client with lab name
      if (updated?.client_id) {
        const labName = labProfile?.clinic_name || 'Un laboratoire';

        const { error: notifError } = await supabase.from('notifications').insert([
          {
            user_id: updated.client_id,
            title: 'PAD refusée',
            message: `${labName} a refusé votre demande PAD. Vous pouvez contacter d'autres laboratoires.`,
            type: 'error',
            is_read: false,
            related_entity_type: 'PAD_request',
            related_entity_id: updated.id
          }
        ]);
        
        if (notifError) {

        } else {

        }
      }
      
      toast({
        title: "Demande refusée",
        description: "La demande PAD a été refusée et le client a été notifié.",
      });
      
      // Refresh requests
      await fetchPADRequests();
      
    } catch (error) {

      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du refus",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="mb-8" variants={itemVariants}>
            <h1 className="text-2xl sm:text-3xl font-bold text-vet-dark mb-3 leading-tight">
              {t('lab.header')}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              {t('lab.headerSubtitle')}
            </p>

          </motion.div>

          <Tabs defaultValue={defaultTab} className="space-y-6 pt-4 md:pt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="clients" className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                {t('lab.findClient')}
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center">
                <Bell className="w-4 h-4 mr-2" />
                {t('lab.PADRequests')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="clients" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-vet-dark">{t('lab.searchClients')}</CardTitle>
                    <CardDescription>
                      {t('lab.searchClientsDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder={t('lab.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && searchClients()}
                        className="flex-1"
                      />
                      <Button
                        onClick={searchClients}
                        disabled={isSearching}
                        className="bg-vet-primary hover:bg-vet-accent"
                        size="default"
                      >
                        {isSearching ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    {clients.length > 0 && (
                      <div className="grid gap-4">
                        {clients.map((client) => (
                          <div
                            key={client.id}
                            className="p-4 border border-vet-muted rounded-lg hover:border-vet-primary transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                              <div className="flex items-start space-x-3 flex-1">
                                <div className="w-12 h-12 bg-vet-light rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-6 h-6 text-vet-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-vet-dark">{client.full_name}</h4>
                                  <p className="text-sm text-gray-600 break-words">{client.email}</p>
                                  {client.phone && (
                                    <p className="text-sm text-gray-500">📞 {client.phone}</p>
                                  )}
                                  {client.address && (
                                    <p className="text-sm text-gray-500">📍 {client.address}, {client.city}</p>
                                  )}
                                  <p className="text-xs text-gray-400">
                                    Membre depuis: {new Date(client.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => openUploadModal(client)}
                                className="bg-vet-primary hover:bg-vet-accent !text-white hover:!text-white font-semibold w-full sm:w-auto sm:flex-shrink-0"
                              >
                                <Send className="w-4 h-4 mr-2" />
                                {t('lab.sendResult')}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {clients.length === 0 && !isSearching && (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="mb-2">
                          {searchTerm
                            ? t('lab.noClientFor', { term: searchTerm })
                            : t('lab.noClientsYet')
                          }
                        </p>
                        {!searchTerm && (
                          <p className="text-sm text-gray-400">
                            {t('lab.noClientsHint')}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="requests" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-vet-dark">{t('lab.receivedPAD')}</CardTitle>
                    <CardDescription>
                      {t('lab.receivedPADDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {PADRequests.length > 0 ? (
                      PADRequests.map((request) => (
                        <div
                          key={request.id}
                          className="p-4 border border-vet-muted rounded-lg space-y-3"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start space-x-3">
                              <div className="w-10 h-10 bg-vet-light rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-vet-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium text-vet-dark">
                                  {request.client_name || request.client?.full_name || 'Client inconnu'}
                                </h4>
                                <p className="text-sm text-gray-600">{request.client?.email}</p>
                                {(request.client_phone || request.client?.phone) && (
                                  <p className="text-sm text-gray-500">📞 {request.client_phone || request.client.phone}</p>
                                )}
                                {(request.client_address || request.client?.address) && (
                                  <p className="text-sm text-gray-500">📍 {request.client_address || request.client.address}</p>
                                )}
                                <p className="text-xs text-gray-400">
                                  Demande reçue: {new Date(request.created_at).toLocaleDateString()}
                                </p>
                                {request.message && (
                                  <p className="text-sm text-gray-600 mt-2 italic">"{request.message}"</p>
                                )}
                              </div>
                            </div>
                            <Badge
                              variant={request.status === 'pending' ? 'secondary' : 'default'}
                              className={
                                request.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : request.status === 'accepted'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {request.status === 'pending' ? t('lab.status.pending') :
                               request.status === 'accepted' ? t('lab.status.accepted') : t('lab.status.rejected')}
                            </Badge>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blue-300 text-blue-600 hover:bg-blue-50 w-full sm:w-auto"
                              onClick={() => showClientLocation(request)}
                            >
                              <MapPin className="w-4 h-4 mr-1" />
                              {t('lab.viewExactLocation')}
                            </Button>

                            {request.status === 'pending' && (
                              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <Button
                                  size="sm"
                                  className="bg-vet-primary hover:bg-vet-accent w-full sm:w-auto"
                                  onClick={() => handleApproveRequest(request.id)}
                                >
                                  {t('lab.accept')}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 text-red-600 hover:bg-red-50 w-full sm:w-auto"
                                  onClick={() => handleRejectRequest(request.id)}
                                >
                                  {t('lab.reject')}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Aucune demande PAD reçue</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

          </Tabs>
        </motion.div>
      </div>

      {/* Upload Result Modal */}
      {selectedClient && (
        <UploadResultModal
          isOpen={showUploadModal}
          onClose={closeUploadModal}
          clientId={selectedClient.user_id}
          clientName={selectedClient.full_name}
        />
      )}
    </div>
  );
};

export default vetDashboard;
