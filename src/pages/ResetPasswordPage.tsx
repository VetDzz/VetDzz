import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import SEO from '@/components/SEO';
import PageLayout from '@/components/PageLayout';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  const navigate = useNavigate();
  const { toast } = useToast();

  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    match: false
  });

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Real-time password validation
  const validatePassword = (pwd: string) => {
    const validation = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      match: pwd === confirmPassword && pwd.length > 0
    };
    setPasswordValidation(validation);
    return validation;
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    validatePassword(value);
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setPasswordValidation(prev => ({
      ...prev,
      match: value === password && value.length > 0
    }));
  };

  useEffect(() => {
    // Handle the auth callback from the email link
    const handleAuthCallback = async () => {
      try {
        // Check URL hash parameters (from email link)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        if (type === 'recovery' && accessToken && refreshToken) {
          // This is a password reset from email link
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            setIsValidToken(false);
            toast({
              title: "Lien invalide",
              description: "Le lien de réinitialisation est invalide ou a expiré.",
              variant: "destructive"
            });
          } else {
            setIsValidToken(true);
          }
        } else {
          // Check URL search parameters (alternative format)
          const searchParams = new URLSearchParams(window.location.search);
          const searchAccessToken = searchParams.get('access_token');
          const searchRefreshToken = searchParams.get('refresh_token');
          const searchType = searchParams.get('type');

          if (searchType === 'recovery' && searchAccessToken && searchRefreshToken) {
            const { data, error } = await supabase.auth.setSession({
              access_token: searchAccessToken,
              refresh_token: searchRefreshToken
            });

            if (error) {
              setIsValidToken(false);
              toast({
                title: "Lien invalide",
                description: "Le lien de réinitialisation est invalide ou a expiré.",
                variant: "destructive"
              });
            } else {
              setIsValidToken(true);
            }
          } else {
            // Check if we already have a valid session
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError || !sessionData.session) {
              setIsValidToken(false);
              toast({
                title: "Lien invalide",
                description: "Le lien de réinitialisation est invalide ou a expiré.",
                variant: "destructive"
              });
            } else {
              setIsValidToken(true);
            }
          }
        }
      } catch (error) {
        setIsValidToken(false);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors du traitement du lien.",
          variant: "destructive"
        });
      }
    };

    handleAuthCallback();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!Object.values(passwordValidation).every(Boolean)) {
      toast({
        title: "Mot de passe invalide",
        description: "Veuillez respecter tous les critères du mot de passe.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la réinitialisation du mot de passe.",
          variant: "destructive"
        });
      } else {
        setIsPasswordReset(true);
        toast({
          title: "Mot de passe réinitialisé",
          description: "Votre mot de passe a été mis à jour avec succès.",
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la réinitialisation du mot de passe.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <PageLayout>
        <SEO 
          title="Lien invalide - Laboratoire d'Analyses Médicales" 
          description="Le lien de réinitialisation du mot de passe est invalide ou a expiré."
        />
        <div className="bg-vet-light">
          <section className="py-16">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-md mx-auto">
                  <Card className="border-vet-muted">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                        <h3 className="text-lg font-semibold text-vet-dark">
                          Lien invalide
                        </h3>
                        <p className="text-gray-600">
                          Le lien de réinitialisation est invalide ou a expiré.
                        </p>
                        <Button
                          onClick={() => navigate('/forgot-password')}
                          className="bg-vet-primary hover:bg-vet-accent"
                        >
                          Demander un nouveau lien
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
          </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SEO 
        title="Nouveau mot de passe - Laboratoire d'Analyses Médicales" 
        description="Créez un nouveau mot de passe pour votre compte."
        keywords={['nouveau mot de passe', 'réinitialiser', 'reset password', 'sécurité']}
      />
      <div className="bg-vet-light">
        <section className="py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                className="max-w-md mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div className="text-center mb-8" variants={itemVariants}>
                  <h2 className="text-3xl font-bold text-vet-dark mb-4">
                    Nouveau mot de passe
                  </h2>
                  <p className="text-gray-600">
                    Créez un nouveau mot de passe sécurisé pour votre compte
                  </p>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="border-vet-muted">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-vet-primary" />
                        Réinitialisation du mot de passe
                      </CardTitle>
                      <CardDescription>
                        Votre nouveau mot de passe doit respecter les critères de sécurité
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!isPasswordReset ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="password">Nouveau mot de passe</Label>
                            <Input
                              id="password"
                              type="password"
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => handlePasswordChange(e.target.value)}
                              className="border-vet-muted focus:border-vet-primary"
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              placeholder="••••••••"
                              value={confirmPassword}
                              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                              className="border-vet-muted focus:border-vet-primary"
                              required
                            />
                          </div>

                          {/* Password validation indicators */}
                          {password && (
                            <div className="space-y-2 p-3 bg-gray-50 rounded-md">
                              <p className="text-sm font-medium text-gray-700">Exigences du mot de passe:</p>
                              <div className="space-y-1">
                                <div className={`flex items-center text-xs ${passwordValidation.length ? 'text-green-600' : 'text-red-600'}`}>
                                  {passwordValidation.length ? '✓' : '✗'} Au moins 8 caractères
                                </div>
                                <div className={`flex items-center text-xs ${passwordValidation.uppercase ? 'text-green-600' : 'text-red-600'}`}>
                                  {passwordValidation.uppercase ? '✓' : '✗'} Une lettre majuscule
                                </div>
                                <div className={`flex items-center text-xs ${passwordValidation.lowercase ? 'text-green-600' : 'text-red-600'}`}>
                                  {passwordValidation.lowercase ? '✓' : '✗'} Une lettre minuscule
                                </div>
                                <div className={`flex items-center text-xs ${passwordValidation.number ? 'text-green-600' : 'text-red-600'}`}>
                                  {passwordValidation.number ? '✓' : '✗'} Un chiffre
                                </div>
                                <div className={`flex items-center text-xs ${passwordValidation.match ? 'text-green-600' : 'text-red-600'}`}>
                                  {passwordValidation.match ? '✓' : '✗'} Les mots de passe correspondent
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <Button
                            type="submit"
                            className="w-full bg-vet-primary hover:bg-vet-accent"
                            disabled={isLoading || !Object.values(passwordValidation).every(Boolean)}
                          >
                            {isLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                          </Button>
                        </form>
                      ) : (
                        <div className="text-center space-y-4">
                          <div className="flex justify-center">
                            <CheckCircle className="w-16 h-16 text-green-500" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-vet-dark mb-2">
                              Mot de passe mis à jour !
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Votre mot de passe a été réinitialisé avec succès.
                            </p>
                            <p className="text-sm text-gray-500">
                              Vous allez être redirigé vers la page de connexion...
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </div>
          </section>
        </div>
    </PageLayout>
  );
};

export default ResetPasswordPage;