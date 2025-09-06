import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FileText, Download, Search, Calendar, User, Building } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface MedicalResult {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  status: string;
  created_at: string;
  client_id: string;
  laboratory_id: string;
  client_profiles?: {
    full_name: string;
    email: string;
  };
  laboratory_profiles?: {
    laboratory_name: string;
    lab_name: string;
  };
}

const ResultsHistory = () => {
  const [results, setResults] = useState<MedicalResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<MedicalResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (user) {
      fetchResults();
    }
  }, [user]);

  useEffect(() => {
    // Filter results based on search term
    if (searchTerm.trim()) {
      const filtered = results.filter(result =>
        result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.client_profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.laboratory_profiles?.laboratory_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredResults(filtered);
    } else {
      setFilteredResults(results);
    }
  }, [searchTerm, results]);

  const fetchResults = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch results only (no joins) to avoid 400 if FKs aren't declared in DB
      let query = supabase
        .from('medical_results')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter based on user type
      if (user.type === 'client') {
        query = query.eq('client_id', user.id);
      } else if (user.type === 'laboratory') {
        query = query.eq('laboratory_id', user.id);
      }

      const { data, error } = await query;

      if (error) {

        toast({
          title: t('common.error'),
          description: t('results.loadError'),
          variant: "destructive"
        });
        setResults([]);
      } else {
        setResults(data || []);
      }
    } catch (error) {

      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadResult = async (result: MedicalResult) => {
    try {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = result.file_url;
      link.download = result.file_name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: t('results.downloadStarted'),
        description: `${t('results.downloading')} ${result.file_name}`,
      });
    } catch (error) {

      toast({
        title: t('results.downloadErrorTitle'),
        description: t('results.downloadErrorDesc'),
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">{t('results.status.completed')}</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">{t('results.status.pending')}</Badge>;
      case 'reviewed':
        return <Badge className="bg-blue-100 text-blue-800">{t('results.status.reviewed')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  return (
    <div className="min-h-screen bg-transparent py-8 pt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="mb-8" variants={itemVariants}>
            <h1 className="text-3xl font-bold text-laboratory-dark mb-2">
              {t('results.title')}
            </h1>
            <p className="text-gray-600">
              {user?.type === 'laboratory'
                ? t('results.labHistory')
                : t('results.clientHistory')
              }
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div className="mb-6" variants={itemVariants}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={t('results.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </motion.div>

          {/* Results List */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  {t('results.results')} ({filteredResults.length})
                </CardTitle>
                <CardDescription>
                  {isLoading ? t('results.loading') : `${filteredResults.length} ${t('results.found')}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="w-8 h-8 border-4 border-laboratory-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-2 text-gray-600">{t('results.loadingResults')}...</span>
                  </div>
                ) : filteredResults.length > 0 ? (
                  <div className="space-y-4">
                    {filteredResults.map((result) => (
                      <div
                        key={result.id}
                        className="p-4 border border-laboratory-muted rounded-lg hover:border-laboratory-primary transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-laboratory-dark mb-1">
                              {result.title}
                            </h4>
                            {result.description && (
                              <p className="text-sm text-gray-600 mb-2">
                                {result.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(result.created_at).toLocaleDateString('fr-FR')}
                              </div>
                              {user?.type === 'laboratory' && result.client_profiles && (
                                <div className="flex items-center">
                                  <User className="w-3 h-3 mr-1" />
                                  {result.client_profiles.full_name}
                                  {result.client_profiles.email ? <span className="ml-2 text-gray-400">({result.client_profiles.email})</span> : null}
                                </div>
                              )}
                              {user?.type === 'client' && result.laboratory_profiles && (
                                <div className="flex items-center">
                                  <Building className="w-3 h-3 mr-1" />
                                  {result.laboratory_profiles.laboratory_name || result.laboratory_profiles.lab_name}
                                </div>
                              )}
                              <span>{formatFileSize(result.file_size)}</span>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            {getStatusBadge(result.status)}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadResult(result)}
                              className="border-laboratory-primary text-laboratory-dark hover:bg-laboratory-light w-full sm:w-auto"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              {t('results.download')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>
                      {searchTerm
                        ? 'Aucun résultat trouvé pour cette recherche'
                        : user?.type === 'laboratory'
                        ? 'Aucun résultat envoyé pour le moment'
                        : 'Aucun résultat disponible pour le moment'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultsHistory;
