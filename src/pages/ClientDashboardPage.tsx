import ClientDashboard from '@/components/ClientDashboard';
import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';

const ClientDashboardPage = () => {
  return (
    <PageLayout showFooter={false}>
      <SEO
        title="Espace Client - Laboratoire d'Analyses Médicales"
        description="Gérez vos rendez-vous, consultez vos résultats d'analyses et trouvez des laboratoires près de chez vous."
        keywords={['espace client', 'résultats analyses', 'rendez-vous laboratoire', 'analyses médicales']}
      />
      <ClientDashboard />
    </PageLayout>
  );
};

export default ClientDashboardPage;
