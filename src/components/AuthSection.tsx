import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, LogIn, User, Building2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import TermsModal from '@/components/TermsModal';
import VerificationWaiting from '@/components/VerificationWaiting';
import LaboratoryLocationForm from '@/components/GeolocationModal';
import { supabase } from '@/lib/supabase';

const AuthSection = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'client' | 'laboratory'>('client');
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [pendingLabData, setPendingLabData] = useState<any>(null);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    match: false
  });
  const { t } = useLanguage();
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

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

  const handleLocationComplete = async (locationData: any) => {
    if (!pendingLabData) return;

    setIsLoading(true);

    try {
      // NOW register the user with all location and lab data included
      const userDataWithLocation = {
        ...pendingLabData,
        ...locationData
      };

      const success = await register(userDataWithLocation, 'laboratory');

      if (success) {
        setShowLocationForm(false);
        setPendingLabData(null);
        setRegisteredEmail(pendingLabData.email);

        // Show verification modal for laboratory too
        setShowVerification(true);
        toast({
          title: "Inscription réussie",
          description: "Vérifiez votre email pour confirmer votre compte.",
        });
      } else {
        toast({
          title: "Erreur d'inscription",
          description: "Une erreur est survenue lors de l'inscription.",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Registration with location error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'inscription.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await login(email, password, userType);
      if (result.success) {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté.",
        });

        // Navigate based on the actual user type from the database
        const actualUserType = result.userType || 'client';
        console.log('Navigating to home page for user type:', actualUserType);
        navigate(actualUserType === 'laboratory' ? '/laboratory-home' : '/');
      } else {
        toast({
          title: "Erreur de connexion",
          description: "Email ou mot de passe incorrect.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la connexion.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const userData = Object.fromEntries(formData.entries());

    // Debug: Log the form data
    console.log('Form data collected:', userData);
    console.log('User type:', userType);

    try {
      // For laboratory users, DON'T register yet - show location form first
      if (userType === 'laboratory') {
        setPendingLabData(userData);
        setShowLocationForm(true);
        // No registration yet, no toast
      } else {
        // For clients, register normally
        const success = await register(userData, userType);
        if (success) {
          setRegisteredEmail(userData.email);
          setShowVerification(true);
          toast({
            title: "Inscription réussie",
            description: "Vérifiez votre email pour confirmer votre compte.",
          });
        } else {
          toast({
            title: "Erreur d'inscription",
            description: "Une erreur est survenue lors de l'inscription.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'inscription.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="login" className="py-16 bg-laboratory-light">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-md mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div className="text-center mb-8" variants={itemVariants}>
            <h2 className="text-3xl font-bold text-laboratory-dark mb-4">
              {isLogin ? t('auth.loginTitle') : t('auth.signupTitle')}
            </h2>
            <p className="text-gray-600">
              {isLogin
                ? t('auth.loginSubtitle')
                : t('auth.signupSubtitle')
              }
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-laboratory-muted">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mb-4">
                  <Button
                    variant={isLogin ? "default" : "outline"}
                    onClick={() => setIsLogin(true)}
                    className={`w-full sm:w-auto ${isLogin ? "bg-laboratory-primary hover:bg-laboratory-accent" : ""}`}
                    size="default"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    {t('auth.login')}
                  </Button>
                  <Button
                    variant={!isLogin ? "default" : "outline"}
                    onClick={() => setIsLogin(false)}
                    className={`w-full sm:w-auto ${!isLogin ? "bg-laboratory-primary hover:bg-laboratory-accent" : ""}`}
                    size="default"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {t('auth.signup')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLogin ? (
                  <form className="space-y-4" onSubmit={handleLogin}>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('auth.email')}</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="votre@email.com"
                        className="border-laboratory-muted focus:border-laboratory-primary"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">{t('auth.password')}</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="border-laboratory-muted focus:border-laboratory-primary"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-laboratory-primary hover:bg-laboratory-accent"
                      disabled={isLoading}
                      size="default"
                    >
                      {isLoading ? 'Connexion...' : t('auth.login')}
                    </Button>
                    <div className="text-center space-y-2">
                      <a href="#" className="text-sm text-laboratory-dark hover:underline">
                        {t('auth.forgotPassword')}
                      </a>

                    </div>
                  </form>
                ) : (
                  <form className="space-y-6" onSubmit={handleRegister}>
                    <Tabs value={userType} onValueChange={(value) => setUserType(value as 'client' | 'laboratory')}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="client" className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          {t('auth.client')}
                        </TabsTrigger>
                        <TabsTrigger value="laboratory" className="flex items-center">
                          <Building2 className="w-4 h-4 mr-2" />
                          {t('auth.laboratory')}
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="client" className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">{t('auth.firstName')}</Label>
                            <Input
                              id="firstName"
                              name="firstName"
                              placeholder="Jean"
                              className="border-laboratory-muted focus:border-laboratory-primary"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">{t('auth.lastName')}</Label>
                            <Input
                              id="lastName"
                              name="lastName"
                              placeholder="Dupont"
                              className="border-laboratory-muted focus:border-laboratory-primary"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="clientEmail">{t('auth.email')}</Label>
                          <Input
                            id="clientEmail"
                            name="email"
                            type="email"
                            placeholder="jean.dupont@email.com"
                            className="border-laboratory-muted focus:border-laboratory-primary"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">{t('auth.phone')}</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+33 6 12 34 56 78"
                            className="border-laboratory-muted focus:border-laboratory-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="birthDate">{t('auth.birthDate')}</Label>
                          <Input
                            id="birthDate"
                            name="dateOfBirth"
                            type="date"
                            className="border-laboratory-muted focus:border-laboratory-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="clientAddress">Adresse</Label>
                          <Input
                            id="clientAddress"
                            name="address"
                            placeholder="123 Rue de la République"
                            className="border-laboratory-muted focus:border-laboratory-primary"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="clientPassword">{t('auth.password')}</Label>
                          <Input
                            id="clientPassword"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            className="border-laboratory-muted focus:border-laboratory-primary"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                            className="border-laboratory-muted focus:border-laboratory-primary"
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
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="terms"
                            name="agreeToTerms"
                            required
                            className="rounded border-laboratory-muted"
                          />
                          <Label htmlFor="terms" className="text-sm">
                            <TermsModal type="client">
                              <span className="text-laboratory-dark hover:underline cursor-pointer">
                                {t('auth.terms')}
                              </span>
                            </TermsModal>
                            <span className="text-red-500 ml-1">*</span>
                          </Label>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="laboratory" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="labName">{t('auth.labName')}</Label>
                          <Input
                            id="labName"
                            name="labName"
                            placeholder="Laboratoire Central"
                            className="border-laboratory-muted focus:border-laboratory-primary"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="labEmail">{t('auth.professionalEmail')}</Label>
                          <Input
                            id="labEmail"
                            name="email"
                            type="email"
                            placeholder="contact@laboratoire.com"
                            className="border-laboratory-muted focus:border-laboratory-primary"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="labPhone">{t('auth.phone')}</Label>
                          <Input
                            id="labPhone"
                            name="phone"
                            type="tel"
                            placeholder="+33 1 23 45 67 89"
                            className="border-laboratory-muted focus:border-laboratory-primary"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address">{t('auth.address')}</Label>
                          <Input
                            id="address"
                            name="address"
                            placeholder="123 Rue de la Santé"
                            className="border-laboratory-muted focus:border-laboratory-primary"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="labPassword">{t('auth.password')}</Label>
                          <Input
                            id="labPassword"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            className="border-laboratory-muted focus:border-laboratory-primary"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="labConfirmPassword">Confirmer le mot de passe</Label>
                          <Input
                            id="labConfirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                            className="border-laboratory-muted focus:border-laboratory-primary"
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
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="labTerms"
                            name="agreeToTerms"
                            required
                            className="rounded border-laboratory-muted"
                          />
                          <Label htmlFor="labTerms" className="text-sm">
                            <TermsModal type="laboratory">
                              <span className="text-laboratory-dark hover:underline cursor-pointer">
                                {t('auth.professionalTerms')}
                              </span>
                            </TermsModal>
                            <span className="text-red-500 ml-1">*</span>
                          </Label>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <Button
                      type="submit"
                      className="w-full bg-laboratory-primary hover:bg-laboratory-accent"
                      disabled={isLoading || (password && !Object.values(passwordValidation).every(Boolean))}
                      size="default"
                    >
                      {isLoading ? 'Création...' : `${t('auth.createAccount')} ${userType === 'client' ? t('auth.client').toLowerCase() : t('auth.laboratory').toLowerCase()}`}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* Verification Modal */}
      {showVerification && (
        <VerificationWaiting
          email={registeredEmail}
          onClose={() => setShowVerification(false)}
          onResendEmail={() => {
            // TODO: Implement resend email functionality
            toast({
              title: "Email renvoyé",
              description: "Un nouvel email de confirmation a été envoyé.",
            });
          }}
        />
      )}

      {/* Location Form for Laboratory Registration */}
      <LaboratoryLocationForm
        isOpen={showLocationForm}
        userData={pendingLabData}
        onComplete={handleLocationComplete}
        onBack={() => {
          setShowLocationForm(false);
          setPendingLabData(null);
        }}
      />
    </section>
  );
};

export default AuthSection;
