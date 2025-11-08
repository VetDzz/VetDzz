import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getAuthRedirectUrl } from '@/utils/urlConfig';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isCheckingVerification, setIsCheckingVerification] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    checkEmailVerification();
  }, [user]);

  const checkEmailVerification = async () => {
    if (!user || user.email !== 'glowyboy01@gmail.com') {
      setIsCheckingVerification(false);
      return;
    }

    // Check if email is verified
    const emailVerified = (user as any).email_confirmed_at !== null;
    setIsEmailVerified(emailVerified);
    setIsCheckingVerification(false);

    if (!emailVerified) {
      toast({
        title: "Vérification email requise",
        description: "Vérifiez votre email glowyboy01@gmail.com pour accéder au panneau admin.",
        variant: "destructive"
      });
    }
  };

  const resendVerificationEmail = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: 'glowyboy01@gmail.com',
        options: {
          emailRedirectTo: getAuthRedirectUrl('/admin')
        }
      });

      if (error) throw error;

      toast({
        title: "Email envoyé",
        description: "Un nouvel email de vérification a été envoyé à glowyboy01@gmail.com",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer l'email de vérification",
        variant: "destructive"
      });
    }
  };

  const goToLogin = () => {
    window.location.href = '/auth';
  };

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle>Accès Refusé</CardTitle>
            <CardDescription>
              Vous devez être connecté pour accéder au panneau d'administration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={goToLogin} className="w-full">
              Se Connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Wrong email
  if (user?.email !== 'glowyboy01@gmail.com') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle>Accès Refusé</CardTitle>
            <CardDescription>
              Seul le compte admin glowyboy01@gmail.com peut accéder à cette page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 text-center">
              <p>Compte actuel: {user?.email}</p>
              <p>Compte requis: glowyboy01@gmail.com</p>
            </div>
            <Button onClick={goToLogin} className="w-full">
              Se Connecter avec le Bon Compte
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Checking verification
  if (isCheckingVerification) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vet-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification du compte admin...</p>
        </div>
      </div>
    );
  }

  // Email not verified
  if (!isEmailVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-orange-600" />
            </div>
            <CardTitle>Vérification Email Requise</CardTitle>
            <CardDescription>
              Votre email doit être vérifié pour accéder au panneau d'administration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 text-center">
              <p><strong>Email:</strong> glowyboy01@gmail.com</p>
              <p>Vérifiez votre boîte mail et cliquez sur le lien de confirmation.</p>
            </div>
            
            <div className="space-y-2">
              <Button onClick={resendVerificationEmail} variant="outline" className="w-full">
                Renvoyer l'Email de Vérification
              </Button>
              
              <Button onClick={() => window.location.reload()} className="w-full">
                J'ai Vérifié Mon Email
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              <p>Après vérification, rechargez cette page</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // All checks passed - show admin panel
  return (
    <div>
      <div className="bg-vet-light border border-vet-muted rounded-lg p-3 mb-6">
        <div className="flex items-center gap-2 text-vet-dark">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">
            Connecté en tant qu'administrateur: glowyboy01@gmail.com
          </span>
        </div>
      </div>
      {children}
    </div>
  );
};

export default AdminAuthGuard;
