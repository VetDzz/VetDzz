import LaboratoryDashboard from '@/components/LaboratoryDashboard';
import SEO from '@/components/SEO';
import PageLayout from '@/components/PageLayout';

const LaboratoryDashboardPage = () => {
  return (
    <PageLayout>
      <SEO
        title="Tableau de Bord Vétérinaire - Gestion des Consultations"
        description="Interface professionnelle pour gérer les demandes de visite, télécharger les résultats et configurer votre clinique."
        keywords={['tableau de bord vétérinaire', 'gestion consultations', 'visite domicile', 'résultats médicaux']}
      />
      <LaboratoryDashboard />
    </PageLayout>
  );
};

export default LaboratoryDashboardPage;
