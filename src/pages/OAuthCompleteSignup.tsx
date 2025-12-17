import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Building2, MapPin, Clock, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import TermsModal from '@/components/TermsModal';
import GeolocationModal from '@/components/GeolocationModal';

type Step = 'choose-type' | 'terms' | 'vet-location';

const OAuthCompleteSignup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('choose-type');
  const [userType, setUserType] = useState<'client' | 'vet' | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Check if user is authenticated and get their data
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUserData(user);
    };
    checkUser();
  }, [navigate]);

  const handleTypeSelect = (type: 'client' | 'vet') => {
    setUserType(type);
    setStep('terms');
  };

  const handleTermsAccept = async () => {
    if (!termsAccepted) {
      toast({
        title: "Conditions requises",
        description: "Veuillez accepter les conditions d'utilisation.",
        variant: "destructive"
      });
      return;
    }

    if (userType === 'client') {
      // Create client profile and go to home
      await createClientProfile();
    } else {
      // Go to vet location step
      setStep('vet-location');
    }
  };

  const createClientProfile = async () => {
    setIsLoading(true);
    try {
      const fullName = userData?.user_metadata?.full_name || 
                      userData?.user_metadata?.name || 
                      userData?.email?.split('@')[0] || 
                      'User';

      const { error } = await supabase
        .from('client_profiles')
        .upsert({
          user_id: userData.id,
          full_name: fullName,
          email: userData.email,
          phone: userData.user_metadata?.phone || '',
          is_verified: true
        }, { onConflict: 'user_id' });

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de créer le profil.",
          variant: "destructive"
        });
        return;
      }

      // Clear OAuth signup flag
      localStorage.removeItem('oauthNewUser');

      toast({
        title: "Compte créé",
        description: "Bienvenue sur VetDZ !",
      });

      window.location.href = '/#/';
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleVetLocationComplete = async (locationData: any) => {
    setIsLoading(true);
    try {
      const fullName = userData?.user_metadata?.full_name || 
                      userData?.user_metadata?.name || 
                      userData?.email?.split('@')[0] || 
                      'Clinique';

      const { error } = await supabase
        .from('vet_profiles')
        .upsert({
          user_id: userData.id,
          vet_name: fullName,
          clinic_name: fullName,
          email: userData.email,
          phone: locationData.phone || '',
          address: locationData.address || '',
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          opening_hours: locationData.openingHours || '8h00 - 18h00',
          opening_days: locationData.openingDays || [],
          description: locationData.description || '',
          is_verified: true
        }, { onConflict: 'user_id' });

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de créer le profil.",
          variant: "destructive"
        });
        return;
      }

      // Clear OAuth signup flag
      localStorage.removeItem('oauthNewUser');

      toast({
        title: "Compte créé",
        description: "Bienvenue sur VetDZ !",
      });

      window.location.href = '/#/vet-home';
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {step === 'choose-type' && (
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Bienvenue sur VetDZ !
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Choisissez votre type de compte
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <button
                onClick={() => handleTypeSelect('client')}
                className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <User className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">Client</h3>
                    <p className="text-sm text-gray-500">
                      Je cherche un vétérinaire pour mon animal
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleTypeSelect('vet')}
                className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Building2 className="w-7 h-7 text-green-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">Vétérinaire</h3>
                    <p className="text-sm text-gray-500">
                      Je suis un professionnel vétérinaire
                    </p>
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>
        )}

        {step === 'terms' && (
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Conditions d'utilisation
              </CardTitle>
              <p className="text-gray-600 mt-2">
                {userType === 'client' ? 'Compte Client' : 'Compte Vétérinaire'}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <TermsModal type={userType || 'client'} onAccept={() => setTermsAccepted(true)}>
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    readOnly
                    className="mt-1 w-5 h-5 rounded border-gray-300 cursor-pointer"
                  />
                </TermsModal>
                <div>
                  <TermsModal type={userType || 'client'} onAccept={() => setTermsAccepted(true)}>
                    <span className="text-gray-700 cursor-pointer hover:text-blue-600">
                      J'accepte les <span className="text-blue-600 underline">conditions d'utilisation</span> et la politique de confidentialité
                    </span>
                  </TermsModal>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('choose-type')}
                  className="flex-1"
                >
                  Retour
                </Button>
                <Button
                  onClick={handleTermsAccept}
                  disabled={!termsAccepted || isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isLoading ? 'Création...' : 'Continuer'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'vet-location' && (
          <GeolocationModal
            isOpen={true}
            userData={userData}
            userType="vet"
            onComplete={handleVetLocationComplete}
            onBack={() => setStep('terms')}
          />
        )}
      </motion.div>
    </div>
  );
};

export default OAuthCompleteSignup;
