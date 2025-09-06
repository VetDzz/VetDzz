import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Mail } from 'lucide-react';

interface BanInfo {
  banned: boolean;
  banned_until: string;
  reason: string;
  banned_by: string;
}

const BannedPage: React.FC = () => {
  const [banInfo, setBanInfo] = useState<BanInfo | null>(null);

  useEffect(() => {
    // Get ban info from localStorage
    const storedBanInfo = localStorage.getItem('banInfo');
    if (storedBanInfo) {
      try {
        setBanInfo(JSON.parse(storedBanInfo));
      } catch (error) {

      }
    }
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@ sihaaexpress.com?subject=Demande de révision de bannissement';
  };

  const handleReturnHome = () => {
    // Clear all user data to prevent re-login
    localStorage.removeItem('banInfo');
    localStorage.removeItem('user');
    localStorage.removeItem('pendingUserData');
    sessionStorage.clear();

    // Redirect to auth page (login/register selection)
    window.location.href = '/auth';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-200 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-800">
            Compte Suspendu
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center text-gray-700">
            <p className="text-lg font-medium mb-2">
              Votre compte a été temporairement suspendu
            </p>
            <p className="text-sm text-gray-600">
              Vous ne pouvez pas accéder à  sihaaexpress pour le moment
            </p>
          </div>

          {banInfo && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-800">Suspension jusqu'au:</span>
                </div>
                <p className="text-red-700 font-mono text-sm">
                  {formatDate(banInfo.banned_until)}
                </p>
              </div>

              {banInfo.reason && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Raison:</h4>
                  <p className="text-gray-700 text-sm">{banInfo.reason}</p>
                </div>
              )}

              {banInfo.banned_by && (
                <div className="text-center text-xs text-gray-500">
                  Suspendu par: {banInfo.banned_by}
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleContactSupport}
              className="w-full bg-green-400 hover:bg-green-500 text-white"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contacter le Support
            </Button>
            
            <Button 
              onClick={handleReturnHome}
              variant="outline"
              className="w-full"
            >
              Retour à l'Accueil
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>Si vous pensez que cette suspension est une erreur,</p>
            <p>veuillez contacter notre équipe de support.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BannedPage;
