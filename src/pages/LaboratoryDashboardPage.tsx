import LaboratoryDashboard from '@/components/LaboratoryDashboard';
import SEO from '@/components/SEO';
import PageLayout from '@/components/PageLayout';

const LaboratoryDashboardPage = () => {
  return (
    <PageLayout>
      <SEO
        title="Tableau de Bord Laboratoire - Gestion des Analyses"
        description="Interface professionnelle pour gérer les demandes de prélèvement, télécharger les résultats et configurer votre laboratoire."
        keywords={['tableau de bord laboratoire', 'gestion analyses', 'prélèvement domicile', 'résultats médicaux']}
      />
      <LaboratoryDashboard />
    </PageLayout>
  );
};

export default LaboratoryDashboardPage;
