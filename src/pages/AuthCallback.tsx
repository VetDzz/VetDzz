import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

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
          const supabaseUser = data.session.user;
          
          // Check if this is an OAuth login (Google/Facebook)
          const isOAuthLogin = supabaseUser.app_metadata.provider !== 'email';
          
          if (isOAuthLogin) {
            // Check if user profile already exists
            const { data: existingProfile } = await supabase
              .from('client_profiles')
              .select('*')
              .eq('user_id', supabaseUser.id)
              .single();
            
            if (!existingProfile) {
              // Create client profile for OAuth user
              const fullName = supabaseUser.user_metadata?.full_name || 
                              supabaseUser.user_metadata?.name || 
                              supabaseUser.email?.split('@')[0] || 
                              'User';
              
              const { error: profileError } = await supabase
                .from('client_profiles')
                .insert({
                  user_id: supabaseUser.id,
                  full_name: fullName,
                  email: supabaseUser.email,
                  phone: supabaseUser.user_metadata?.phone || '',
                  is_verified: true
                });
              
              if (profileError) {
                console.error('Error creating OAuth profile:', profileError);
              }
            }
            
            toast({
              title: "Connexion réussie",
              description: "Bienvenue sur VetDZ !",
            });
            
            // OAuth users are always clients, redirect to home
            navigate('/');
          } else {
            // Regular email confirmation
            toast({
              title: "Email confirmé",
              description: "Votre compte a été confirmé avec succès. Bienvenue !",
            });
            
            // Navigate based on user type
            if (user?.type === 'client') {
              navigate('/');
            } else if (user?.type === 'vet') {
              navigate('/vet-home');
            } else {
              navigate('/');
            }
          }
        } else {
          navigate('/auth');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        navigate('/auth');
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [navigate, user, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vet-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Confirmation en cours...</h2>
        <p className="text-gray-600">Veuillez patienter pendant que nous confirmons votre compte.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
