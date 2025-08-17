import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shield, UserPlus, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getAuthRedirectUrl } from '@/utils/urlConfig';

const AdminSetup: React.FC = () => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isCreated, setIsCreated] = useState(false);

  const createAdminAccount = async () => {
    setIsCreating(true);

    try {
      // Simple admin account creation with email verification
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'glowyboy01@gmail.com',
        password: 'Mindup2019',
        options: {
          data: {
            type: 'admin',
            full_name: 'SihaaExpress Admin'
          },
          emailRedirectTo: getAuthRedirectUrl('/admin')
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          toast({
            title: "Compte déjà existant",
            description: "Le compte admin existe déjà. Vérifiez votre email pour vous connecter.",
            variant: "default"
          });
          setIsCreated(true);
          return;
        }
        throw authError;
      }

      toast({
        title: "Compte admin créé!",
        description: "Vérifiez votre email glowyboy01@gmail.com pour confirmer votre compte.",
      });

      setIsCreated(true);

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le compte admin",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const loginAsAdmin = () => {
    window.location.href = '/auth';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle>Configuration Admin</CardTitle>
          <CardDescription>
            Créer le compte administrateur SihaaExpress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isCreated ? (
            <>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Email:</strong> glowyboy01@gmail.com</p>
                <p><strong>Mot de passe:</strong> Mindup2019</p>
                <p><strong>Vérification:</strong> Email requis pour connexion</p>
                <p><strong>Permissions:</strong> Bannir et supprimer utilisateurs</p>
              </div>

              <Button 
                onClick={createAdminAccount}
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Création en cours...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Créer le Compte Admin
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="text-center space-y-4">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                <div>
                  <h3 className="font-semibold text-green-800">Compte Admin Créé!</h3>
                  <p className="text-sm text-gray-600">
                    Vérifiez votre email glowyboy01@gmail.com et cliquez sur le lien de confirmation.
                    Ensuite vous pourrez vous connecter.
                  </p>
                </div>
              </div>

              <Button onClick={loginAsAdmin} className="w-full">
                Se Connecter comme Admin
              </Button>
            </>
          )}

          <div className="text-xs text-gray-500 text-center">
            <p>Ce compte aura accès au panneau d'administration complet</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetup;
