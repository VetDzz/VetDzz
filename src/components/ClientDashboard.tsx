import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Bell, Download, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const ClientDashboard = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('results');
  const [results, setResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check URL parameters to determine which tab to show
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location]);

  // Fetch real data from backend
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchResults(), fetchNotifications()]);
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      // Fetch medical results for this client (client_id references auth.users.id)
      const { data, error } = await supabase
        .from('medical_results')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {

        setResults([]);
      } else {
        setResults(data || []);
      }
    } catch (error) {

      setResults([]);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data: userNotifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {

        setNotifications([]);
      } else {
        setNotifications(userNotifications || []);
      }
    } catch (error) {

      setNotifications([]);
    }
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

  const handleDownloadResult = (resultId: number) => {

    // Here you would typically trigger a file download
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmé</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'available':
        return <Badge className="bg-blue-100 text-blue-800">Disponible</Badge>;
      case 'processing':
        return <Badge className="bg-orange-100 text-orange-800">En cours</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="mb-8" variants={itemVariants}>
            <h1 className="text-3xl font-bold text-vet-dark mb-2">
              Mon Espace Client
            </h1>
            <p className="text-gray-600">
              Gérez vos rendez-vous, consultez vos résultats et trouvez des laboratoires
            </p>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="results" className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Résultats
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <Badge className="ml-1 bg-red-500 text-white text-xs">
                    {notifications.filter(n => !n.is_read).length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-vet-dark">Mes Résultats</CardTitle>
                    <CardDescription>
                      Consultez et téléchargez vos résultats d'analyses
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vet-primary mx-auto"></div>
                        <p className="text-gray-500 mt-2">Chargement des résultats...</p>
                      </div>
                    ) : results.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Aucun résultat disponible</p>
                        <p className="text-sm text-gray-400">Vos résultats d'analyses apparaîtront ici</p>
                      </div>
                    ) : (
                      results.map((result) => (
                        <div
                          key={result.id}
                          className="p-4 border border-vet-muted rounded-lg space-y-3"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-vet-dark">
                                {result.title || result.file_name || 'Analyse'}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Laboratoire
                              </p>
                              <p className="text-sm text-gray-500">
                                <Clock className="w-3 h-3 inline mr-1" />
                                Analysé le {new Date(result.created_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            {getStatusBadge(result.status || 'pending')}
                          </div>

                          {result.status === 'completed' && (
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button
                                size="sm"
                                className="bg-vet-primary hover:bg-vet-accent w-full sm:w-auto"
                                onClick={() => handleDownloadResult(result.id)}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Télécharger
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-vet-primary text-vet-dark hover:bg-vet-light w-full sm:w-auto"
                              >
                                Voir en ligne
                              </Button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-vet-dark">Notifications</CardTitle>
                    <CardDescription>
                      Restez informé de vos rendez-vous et résultats
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vet-primary mx-auto"></div>
                        <p className="text-gray-500 mt-2">Chargement des notifications...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="text-center py-8">
                        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Aucune notification</p>
                        <p className="text-sm text-gray-400">Vos notifications apparaîtront ici</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border rounded-lg ${
                            notification.is_read
                              ? 'border-gray-200 bg-gray-50'
                              : 'border-vet-primary bg-vet-light'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className={`text-sm font-medium ${notification.is_read ? 'text-gray-700' : 'text-vet-dark'}`}>
                                {notification.title}
                              </h4>
                              <p className={`text-sm ${notification.is_read ? 'text-gray-600' : 'text-vet-dark'}`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.created_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-vet-primary rounded-full flex-shrink-0 mt-2"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default ClientDashboard;
