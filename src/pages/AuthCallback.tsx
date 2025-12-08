import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-account'>('loading');

  useEffect(() => {
    let isMounted = true;
    
    const handleAuthCallback = async () => {
      console.log('[AuthCallback] Starting auth callback handler');
      
      try {
        // Check for OAuth tokens in URL hash or query params
        // Supabase might return tokens in different formats
        const fullUrl = window.location.href;
        const hashIndex = fullUrl.lastIndexOf('#');
        
        // Check if there are OAuth tokens in the URL
        if (fullUrl.includes('access_token=')) {
          // Extract the token part
          let tokenPart = '';
          if (hashIndex !== -1) {
            const afterHash = fullUrl.substring(hashIndex + 1);
            // If there's another # (double hash from HashRouter + OAuth)
            if (afterHash.includes('#')) {
              tokenPart = afterHash.split('#').pop() || '';
            } else if (afterHash.includes('access_token=')) {
              tokenPart = afterHash;
            }
          }
          
          if (tokenPart && tokenPart.includes('access_token=')) {
            // Parse the tokens
            const params = new URLSearchParams(tokenPart);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            
            if (accessToken) {
              // Set the session manually
              const { error: setError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || ''
              });
              
              if (setError) {
                console.error('Error setting session:', setError);
              }
              
              // Clean up the URL
              window.history.replaceState(null, '', window.location.origin + '/#/auth/callback');
            }
          }
        }
        
        // Small delay to ensure session is set
        await new Promise(resolve => setTimeout(resolve, 200));
        
        console.log('[AuthCallback] Getting session...');
        
        // Get session
        const { data, error } = await supabase.auth.getSession();
        
        console.log('[AuthCallback] Session data:', data, 'Error:', error);
        
        if (error) {
          console.error('Auth callback error:', error);
          if (isMounted) {
            setStatus('error');
            toast({
              title: "Erreur de connexion",
              description: error.message,
              variant: "destructive"
            });
            setTimeout(() => navigate('/auth'), 2000);
          }
          return;
        }

        if (!isMounted) return;

        if (data.session) {
          const supabaseUser = data.session.user;
          
          // Check if this is an OAuth login (Google/Facebook)
          const provider = supabaseUser.app_metadata?.provider;
          const isOAuthLogin = provider === 'google' || provider === 'facebook';
          
          if (isOAuthLogin) {
            // Check if user profile already exists in our database
            const { data: clientProfile, error: clientError } = await supabase
              .from('client_profiles')
              .select('*')
              .eq('user_id', supabaseUser.id)
              .single();
            
            const { data: vetProfile, error: vetError } = await supabase
              .from('vet_profiles')
              .select('*')
              .eq('user_id', supabaseUser.id)
              .single();
            
            // Log for debugging
            console.log('OAuth User ID:', supabaseUser.id);
            console.log('Client Profile:', clientProfile, 'Error:', clientError);
            console.log('Vet Profile:', vetProfile, 'Error:', vetError);
            
            // Check if profile exists (ignore "not found" errors)
            const hasClientProfile = clientProfile && !clientError;
            const hasVetProfile = vetProfile && !vetError;
            
            if (!hasClientProfile && !hasVetProfile) {
              // No profile exists - redirect to complete signup
              console.log('No profile found - redirecting to oauth-complete');
              setStatus('success');
              setTimeout(() => {
                window.location.href = '/#/oauth-complete';
              }, 300);
              return;
            }
            
            console.log('Profile found - logging in');
            
            // Existing user - allow login
            setStatus('success');
            toast({
              title: "Connexion réussie",
              description: "Bienvenue sur VetDZ !",
            });
            
            // Redirect based on profile type
            setTimeout(() => {
              if (vetProfile) {
                window.location.href = '/#/vet-home';
              } else {
                window.location.href = '/#/';
              }
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
          // No session found
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
    
    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isMounted && status === 'loading') {
        console.error('[AuthCallback] Timeout - redirecting to auth page');
        setStatus('error');
        toast({
          title: "Délai d'attente dépassé",
          description: "La connexion prend trop de temps. Veuillez réessayer.",
          variant: "destructive"
        });
        setTimeout(() => navigate('/auth'), 2000);
      }
    }, 10000); // 10 second timeout
    
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [navigate, toast, status]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
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
        {status === 'no-account' && (
          <>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Compte non trouvé</h2>
            <p className="text-gray-600 mb-4">
              Aucun compte n'est associé à cette adresse email. Veuillez d'abord créer un compte.
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer un compte
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
