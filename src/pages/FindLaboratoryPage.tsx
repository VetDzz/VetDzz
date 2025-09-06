import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';
import AccurateMapComponent from '@/components/AccurateMapComponent';
import { useLanguage } from '@/contexts/LanguageContext';

const FindLaboratoryPage = () => {
  const { t } = useLanguage();
  return (
    <PageLayout showFooter={false}>
      <SEO
        title={t('findLab.seoTitle')}
        description={t('findLab.seoDescription')}
        keywords={[t('findLab.keyword1'), t('findLab.keyword2'), t('findLab.keyword3'), t('findLab.keyword4')]}
      />
      <div className="pt-24 pb-24 md:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-laboratory-dark mb-4">
                {t('findLab.title')}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('findLab.subtitle')}
              </p>
            </div>
            <AccurateMapComponent height="600px" />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default FindLaboratoryPage;
