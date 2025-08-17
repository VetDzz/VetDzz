import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Building2, Search, Send, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';

const LaboratoryHomePage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const features = [
    {
      icon: Users,
      title: t('labHome.features.findClients.title'),
      description: t('labHome.features.findClients.desc'),
      action: () => navigate('/laboratory-dashboard'),
      buttonText: t('labHome.features.findClients.button')
    },
    {
      icon: FileText,
      title: t('labHome.features.managePAD.title'),
      description: t('labHome.features.managePAD.desc'),
      action: () => navigate('/laboratory-dashboard'),
      buttonText: t('labHome.features.managePAD.button')
    },
    {
      icon: Send,
      title: t('labHome.features.sendResults.title'),
      description: t('labHome.features.sendResults.desc'),
      action: () => navigate('/laboratory-dashboard'),
      buttonText: t('labHome.features.sendResults.button')
    }
  ];

  const stats = [
    { number: '500+', label: t('labHome.stats.clientsActive') },
    { number: '1000+', label: t('labHome.stats.analysesDone') },
    { number: '98%', label: t('labHome.stats.clientSatisfaction') },
    { number: '24h', label: t('labHome.stats.avgDelay') }
  ];

  return (
    <PageLayout>
      <SEO
        title={t('labHome.seoTitle')}
        description={t('labHome.seoDescription')}
        keywords={[t('labHome.keyword1'), t('labHome.keyword2'), t('labHome.keyword3'), t('labHome.keyword4')]}
      />
      
      <div className="min-h-screen">
        {/* Hero Section with Background Image */}
        <section className="relative w-full">
          <div className="banner-container relative overflow-hidden h-[50vh] sm:h-[60vh] md:h-[500px] lg:h-[550px] xl:h-[600px] w-full">
            <div className="absolute inset-0 w-full">
              {/* Background image */}
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url('/src/images/analyse-795x478-1.jpg')`
                }}
              ></div>
              {/* Overlay for better text readability (reduced green tint) */}
              <div className="absolute inset-0 bg-gradient-to-b from-laboratory-primary/70 via-laboratory-primary/50 to-white/90"></div>
            </div>

            <div className="banner-overlay bg-transparent pt-20 sm:pt-24 md:pt-32 w-full">
              <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center h-full">
                <motion.div
                  className="w-full max-w-4xl text-center"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={itemVariants} className="mb-6">
                    <Building2 className="w-16 h-16 text-white mx-auto mb-4 drop-shadow-lg" />
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                      {t('labHome.title')}
                      <span className="block text-white/90">SihaaExpress</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-white mb-8 leading-relaxed drop-shadow-lg max-w-3xl mx-auto">
                      {t('labHome.heroDescription')}
                    </p>
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      size="lg"
                      onClick={() => navigate('/laboratory-dashboard')}
                      className="bg-white text-laboratory-primary hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg w-full sm:w-auto"
                    >
                      <Users className="w-5 h-5 mr-2" />
                      {t('labHome.ctaFindClients')}
                    </Button>
                    <Button
                      size="lg"
                      onClick={() => navigate('/laboratory-dashboard')}
                      className="bg-laboratory-primary text-white hover:bg-laboratory-accent px-8 py-4 text-lg font-semibold shadow-lg w-full sm:w-auto"
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      {t('labHome.ctaManageRequests')}
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-laboratory-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants} className="text-center mb-16">
                <h2 className="text-4xl font-bold text-laboratory-dark mb-4">
                  {t('labHome.features.title')}
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  {t('labHome.features.subtitle')}
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <Card className="h-full hover:shadow-lg transition-shadow border-laboratory-muted">
                      <CardHeader className="text-center">
                        <feature.icon className="w-12 h-12 text-laboratory-primary mx-auto mb-4" />
                        <CardTitle className="text-laboratory-dark">{feature.title}</CardTitle>
                        <CardDescription className="text-gray-600">
                          {feature.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-center">
                        <Button
                          onClick={feature.action}
                          className="bg-laboratory-primary hover:bg-laboratory-accent w-full"
                        >
                          {feature.buttonText}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants} className="text-center mb-16">
                <h2 className="text-4xl font-bold text-laboratory-dark mb-4">
                  {t('labHome.howItWorks.title')}
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  {t('labHome.howItWorks.subtitle')}
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                <motion.div variants={itemVariants} className="text-center">
                  <div className="w-16 h-16 bg-laboratory-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-laboratory-dark mb-2">
                    {t('labHome.howItWorks.step1.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('labHome.howItWorks.step1.desc')}
                  </p>
                </motion.div>

                <motion.div variants={itemVariants} className="text-center">
                  <div className="w-16 h-16 bg-laboratory-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    2
                  </div>
                  <h3 className="text-xl font-semibold text-laboratory-dark mb-2">
                    {t('labHome.howItWorks.step2.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('labHome.howItWorks.step2.desc')}
                  </p>
                </motion.div>

                <motion.div variants={itemVariants} className="text-center">
                  <div className="w-16 h-16 bg-laboratory-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    3
                  </div>
                  <h3 className="text-xl font-semibold text-laboratory-dark mb-2">
                    {t('labHome.howItWorks.step3.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('labHome.howItWorks.step3.desc')}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-laboratory-primary">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants}>
                <h2 className="text-4xl font-bold text-white mb-4">
                  {t('labHome.cta.title')}
                </h2>
                <p className="text-xl text-laboratory-light mb-8 max-w-2xl mx-auto">
                  {t('labHome.cta.subtitle')}
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate('/laboratory-dashboard')}
                  className="bg-white text-laboratory-primary hover:bg-gray-100 px-8 py-4 text-lg w-full sm:w-auto"
                >
                  <Users className="w-5 h-5 mr-2" />
                  {t('labHome.cta.button')}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default LaboratoryHomePage;
