
import PageLayout from '@/components/PageLayout';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import SEO from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to their appropriate home page
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.type === 'laboratory') {
        navigate('/laboratory-home');
      } else {
        // Keep clients on the main page for now, or redirect to client dashboard
        // navigate('/client-dashboard');
      }
    }
    window.scrollTo(0, 0);
  }, [isAuthenticated, user, navigate]);

  return (
    <PageLayout>
      <SEO
        title="Laboratoire d'Analyses Médicales - Plateforme en Ligne"
        description="Trouvez le laboratoire d'analyses médicales le plus proche de chez vous. Analyses sanguines, urinaires et prélèvement à domicile."
        imageUrl="/lovable-uploads/526dc38a-25fa-40d4-b520-425b23ae0464.png"
        keywords={['laboratoire', 'analyses médicales', 'analyses sanguines', 'prélèvement domicile', 'résultats en ligne', 'laboratoire proche']}
      />
      <Hero />
      <Features />
    </PageLayout>
  );
};

export default Index;
