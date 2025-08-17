import { useAuth } from '@/contexts/AuthContext';
import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';
import { motion } from 'framer-motion';
import { FileText, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ResultsHistory from '@/components/ResultsHistory';
import { useNavigate } from 'react-router-dom';

const ResultsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // If user is not authenticated, redirect immediately to auth
  if (!isAuthenticated || !user) {
    navigate('/auth');
    return null;
  }

  // Authenticated: show results history
  return (
    <PageLayout showFooter={false}>
      <SEO
        title="Mes Résultats - Laboratoire d'Analyses Médicales"
        description="Consultez vos résultats d'analyses médicales en ligne. Accès sécurisé à tous vos rapports de laboratoire."
        keywords={['résultats analyses', 'résultats laboratoire', 'analyses médicales', 'rapports médicaux']}
      />
      <ResultsHistory />
    </PageLayout>
  );

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
    <PageLayout>
      <SEO 
        title="Mes Résultats - Laboratoire d'Analyses Médicales" 
        description="Consultez vos résultats d'analyses médicales en ligne. Accès sécurisé à tous vos rapports de laboratoire."
        keywords={['résultats analyses', 'résultats laboratoire', 'analyses médicales', 'rapports médicaux']}
      />
      
      <div className="min-h-screen bg-gray-50 py-16 pt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header */}
            <motion.div className="text-center mb-12" variants={itemVariants}>
              <div className="w-16 h-16 bg-laboratory-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-laboratory-dark mb-4">
                Mes Résultats d'Analyses
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Accédez à tous vos résultats d'analyses médicales de manière sécurisée
              </p>
            </motion.div>

            {/* Authentication Required */}
            <motion.div variants={itemVariants}>
              <Card className="border-laboratory-primary">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-laboratory-light rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-6 h-6 text-laboratory-primary" />
                  </div>
                  <CardTitle className="text-2xl text-laboratory-dark">
                    Connexion Requise
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Pour accéder à vos résultats d'analyses, veuillez vous connecter à votre espace personnel
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-laboratory-dark">Espace Client</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center">
                          <ArrowRight className="w-4 h-4 mr-2 text-laboratory-primary" />
                          Consultez vos résultats
                        </li>
                        <li className="flex items-center">
                          <ArrowRight className="w-4 h-4 mr-2 text-laboratory-primary" />
                          Téléchargez vos rapports
                        </li>
                        <li className="flex items-center">
                          <ArrowRight className="w-4 h-4 mr-2 text-laboratory-primary" />
                          Suivez vos rendez-vous
                        </li>
                        <li className="flex items-center">
                          <ArrowRight className="w-4 h-4 mr-2 text-laboratory-primary" />
                          Recevez des notifications
                        </li>
                      </ul>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold text-laboratory-dark">Espace Laboratoire</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center">
                          <ArrowRight className="w-4 h-4 mr-2 text-laboratory-primary" />
                          Gérez les demandes d'analyses
                        </li>
                        <li className="flex items-center">
                          <ArrowRight className="w-4 h-4 mr-2 text-laboratory-primary" />
                          Envoyez les résultats
                        </li>
                        <li className="flex items-center">
                          <ArrowRight className="w-4 h-4 mr-2 text-laboratory-primary" />
                          Planifiez les rendez-vous
                        </li>
                        <li className="flex items-center">
                          <ArrowRight className="w-4 h-4 mr-2 text-laboratory-primary" />
                          Suivez les statistiques
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                    <Button
                      onClick={() => navigate('/auth')}
                      className="bg-laboratory-primary hover:bg-laboratory-accent w-full sm:w-auto"
                      size="default"
                    >
                      Se Connecter
                    </Button>
                    <Button
                      onClick={() => navigate('/auth')}
                      variant="outline"
                      className="border-laboratory-primary text-laboratory-dark hover:bg-laboratory-light w-full sm:w-auto"
                      size="default"
                    >
                      Créer un Compte
                    </Button>
                  </div>

                  <div className="text-center pt-4 border-t">
                    <p className="text-sm text-gray-500">
                      Besoin d'aide ? Contactez-nous au{' '}
                      <span className="font-semibold text-laboratory-dark">01 23 45 67 89</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ResultsPage;
