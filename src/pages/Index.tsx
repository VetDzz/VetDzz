
import PageLayout from '@/components/PageLayout';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import ContactForm from '@/components/ContactForm';
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
      if (user.type === 'vet') {
        navigate('/vet-home');
      } else {
        // Keep clients on the main page for now, or redirect to client dashboard
        // navigate('/client-dashboard');
      }
    }
    window.scrollTo(0, 0);
  }, [isAuthenticated, user, navigate]);

  return (
    <PageLayout showFooter={false}>
      <SEO
        title="VetDz - Plateforme Vétérinaire en Algérie"
        description="Trouvez le vétérinaire le plus proche de chez vous. Soins pour vos animaux, consultations à domicile et suivi médical."
        imageUrl="/lovable-uploads/526dc38a-25fa-40d4-b520-425b23ae0464.png"
        keywords={['vétérinaire', 'soins animaux', 'clinique vétérinaire', 'consultation domicile', 'vétérinaire proche', 'soins chiens', 'soins chats']}
      />
      <Hero />
    </PageLayout>
  );
};

export default Index;
