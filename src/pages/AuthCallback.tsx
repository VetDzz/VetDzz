import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast({
            title: "Erreur de confirmation",
            description: "Une erreur est survenue lors de la confirmation de votre email.",
            variant: "destructive"
          });
          navigate('/auth');
          return;
        }

        if (data.session) {
          toast({
            title: "Email confirmé",
            description: "Votre compte a été confirmé avec succès. Bienvenue !",
          });
          
          // Navigate based on user type
          if (user?.type === 'client') {
            navigate('/client-dashboard');
          } else if (user?.type === 'laboratory') {
            navigate('/laboratory-dashboard');
          } else {
            navigate('/');
          }
        } else {
          navigate('/auth');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate, user, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-laboratory-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Confirmation en cours...</h2>
        <p className="text-gray-600">Veuillez patienter pendant que nous confirmons votre compte.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
