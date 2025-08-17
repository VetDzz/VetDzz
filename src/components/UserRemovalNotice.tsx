import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const UserRemovalNotice = () => {
  useEffect(() => {
    // Clear all local storage and session data
    localStorage.clear();
    sessionStorage.clear();
    
    // Redirect to auth page after a delay
    const timer = setTimeout(() => {
      window.location.href = '/auth';
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="border-red-200 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">
              Compte Supprimé
            </CardTitle>
            <CardDescription className="text-gray-600">
              Votre compte a été supprimé par l'administration
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-red-800 font-medium mb-2">
                Accès Révoqué
              </p>
              <p className="text-sm text-red-700">
                Votre compte a été supprimé de notre système. Vous n'avez plus accès aux services de la plateforme.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 text-center">
                Besoin d'aide ?
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-laboratory-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Email</p>
                    <p className="text-sm text-gray-600">support@labconnect.fr</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-laboratory-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Téléphone</p>
                    <p className="text-sm text-gray-600">01 23 45 67 89</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-500 mb-4">
                Contactez notre équipe d'administration pour plus d'informations sur la suppression de votre compte.
              </p>
              
              <Button
                onClick={() => window.location.href = '/auth'}
                className="bg-laboratory-primary hover:bg-laboratory-accent"
              >
                Retour à l'accueil
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-400">
                Redirection automatique dans 10 secondes...
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default UserRemovalNotice;
