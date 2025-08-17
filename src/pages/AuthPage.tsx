import SEO from '@/components/SEO';
import AuthSection from '@/components/AuthSection';

const AuthPage = () => {
  return (
    <>
      <SEO 
        title="Connexion - Laboratoire d'Analyses Médicales" 
        description="Connectez-vous à votre espace client ou laboratoire pour accéder à vos analyses et services."
        keywords={['connexion', 'login', 'espace client', 'espace laboratoire', 'authentification']}
      />
      <div className="min-h-screen bg-gray-50">
        <div className="pt-20">
          <AuthSection />
        </div>
      </div>
    </>
  );
};

export default AuthPage;
