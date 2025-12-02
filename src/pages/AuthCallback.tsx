import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    let isMounted = true;
    
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback: Starting session check...');
        
        // Wait a bit for Supabase to process any tokens
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Try to get session multiple times (Supabase might need time to process)
        let session = null;
        let attempts = 0;
        const maxAttempts = 5;
        
        while (!session && attempts < maxAttempts) {
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Auth callback error:', error);
            break;
          }
          session = data.session;
          if (!session) {
            attempts++;
            console.log(`AuthCallback: No session yet, attempt ${attempts}/${maxAttempts}`);
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        if (!isMounted) return;

        if (session) {
          const supabaseUser = session.user;
          console.log('AuthCallback: Session found for user:', supabaseUser.email);
          
          // Check if this is an OAuth login (Google/Facebook)
          const provider = supabaseUser.app_metadata?.provider;
          const isOAuthLogin = provider === 'google' || provider === 'facebook';
          
          console.log('AuthCallback: Provider:', provider, 'isOAuth:', isOAuthLogin);
          
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
              
              console.log('AuthCallback: Creating profile for OAuth user:', fullName);
              
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
            
            setStatus('success');
            toast({
              title: "Connexion réussie",
              description: "Bienvenue sur VetDZ !",
            });
            
            // Small delay to show success state, then redirect
            setTimeout(() => {
              window.location.href = '/#/';
            }, 500);
            return;
          } else {
            // Regular email confirmation
            setStatus('success');
            toast({
              title: "Email confirmé",
              description: "Votre compte a été confirmé avec succès. Bienvenue !",
            });
            
            // Navigate based on user type from metadata
            const userType = supabaseUser.user_metadata?.user_type;
            setTimeout(() => {
              if (userType === 'vet') {
                window.location.href = '/#/vet-home';
              } else {
                window.location.href = '/#/';
              }
            }, 500);
            return;
          }
        } else {
          console.log('AuthCallback: No session found after all attempts');
          setStatus('error');
          toast({
            title: "Erreur de connexion",
            description: "Session non trouvée. Veuillez réessayer.",
            variant: "destructive"
          });
          setTimeout(() => navigate('/auth'), 2000);
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        if (isMounted) {
          setStatus('error');
          toast({
            title: "Erreur",
            description: "Une erreur est survenue. Veuillez réessayer.",
            variant: "destructive"
          });
          setTimeout(() => navigate('/auth'), 2000);
        }
      }
    };

    handleAuthCallback();
    
    return () => {
      isMounted = false;
    };
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connexion en cours...</h2>
            <p className="text-gray-600">Veuillez patienter pendant que nous confirmons votre compte.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connexion réussie !</h2>
            <p className="text-gray-600">Redirection en cours...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de connexion</h2>
            <p className="text-gray-600">Redirection vers la page de connexion...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
