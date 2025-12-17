import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import SEO from '@/components/SEO';
import PageLayout from '@/components/PageLayout';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if email exists in auth.users table first
      const { data: authUsers, error: authError } = await supabase.rpc('check_user_exists', { 
        user_email: email 
      });

      // If RPC function doesn't exist, fallback to profile tables check
      if (authError) {
        // Check if email exists by looking in profile tables
        const { data: clientProfile } = await supabase
          .from('client_profiles')
          .select('email')
          .eq('email', email)
          .maybeSingle();

        const { data: vetProfile } = await supabase
          .from('vet_profiles')
          .select('email')
          .eq('email', email)
          .maybeSingle();

        // If email doesn't exist in any profile table
        if (!clientProfile && !vetProfile) {
          toast({
            title: "Email introuvable",
            description: "Aucun compte n'est associé à cette adresse email.",
            variant: "destructive"
          });
          return;
        }
      } else if (!authUsers || authUsers.length === 0) {
        toast({
          title: "Email introuvable",
          description: "Aucun compte n'est associé à cette adresse email.",
          variant: "destructive"
        });
        return;
      }

      // If email exists, proceed with password reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        toast({
          title: "Erreur",
          description: error.message || "Une erreur est survenue lors de l'envoi de l'email.",
          variant: "destructive"
        });
      } else {
        setIsEmailSent(true);
        toast({
          title: "Email envoyé",
          description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe.",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
      <SEO 
        title="Mot de passe oublié - Laboratoire d'Analyses Médicales" 
        description="Réinitialisez votre mot de passe pour accéder à votre espace client ou laboratoire."
        keywords={['mot de passe oublié', 'réinitialiser', 'reset password', 'récupération compte']}
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
                    Mot de passe oublié
                  </h2>
                  <p className="text-gray-600">
                    Entrez votre adresse email pour recevoir un lien de réinitialisation
                  </p>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="border-vet-muted">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-vet-primary" />
                        Réinitialisation du mot de passe
                      </CardTitle>
                      <CardDescription>
                        Nous vous enverrons un lien sécurisé pour créer un nouveau mot de passe
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!isEmailSent ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Adresse email</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="votre@email.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="border-vet-muted focus:border-vet-primary"
                              required
                            />
                          </div>
                          
                          <Button
                            type="submit"
                            className="w-full bg-vet-primary hover:bg-vet-accent"
                            disabled={isLoading || !email}
                          >
                            {isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
                          </Button>
                        </form>
                      ) : (
                        <div className="text-center space-y-4">
                          <div className="flex justify-center">
                            <CheckCircle className="w-16 h-16 text-green-500" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-vet-dark mb-2">
                              Email envoyé !
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>
                            </p>
                            <p className="text-sm text-gray-500">
                              Vérifiez votre boîte mail et cliquez sur le lien pour créer un nouveau mot de passe.
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-6 text-center">
                        <Button
                          variant="ghost"
                          onClick={() => navigate('/auth')}
                          className="text-vet-dark hover:text-vet-primary"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Retour à la connexion
                        </Button>
                      </div>
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

export default ForgotPasswordPage;