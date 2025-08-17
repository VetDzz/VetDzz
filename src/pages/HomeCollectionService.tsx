import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Clock, Shield, Users, CheckCircle, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const HomeCollectionService = () => {
  const { t } = useLanguage();

  const services = [
    {
      name: 'Prélèvement Sanguin',
      description: 'Prise de sang à domicile par infirmier diplômé',
      duration: '15-20 min',
      availability: '7j/7'
    },
    {
      name: 'Prélèvement Urinaire',
      description: 'Fourniture du matériel et conseils pour le prélèvement',
      duration: '10 min',
      availability: '7j/7'
    },
    {
      name: 'Prélèvement Pédiatrique',
      description: 'Prélèvement adapté aux enfants dans un environnement familier',
      duration: '20-30 min',
      availability: 'Sur RDV'
    },
    {
      name: 'Prélèvement Gériatrique',
      description: 'Service spécialisé pour les personnes âgées ou à mobilité réduite',
      duration: '20-30 min',
      availability: '7j/7'
    }
  ];

  const advantages = [
    {
      icon: <Home className="w-8 h-8 text-laboratory-primary" />,
      title: 'Confort de votre domicile',
      description: 'Évitez les déplacements et les files d\'attente'
    },
    {
      icon: <Shield className="w-8 h-8 text-laboratory-primary" />,
      title: 'Sécurité sanitaire',
      description: 'Respect strict des protocoles d\'hygiène et de sécurité'
    },
    {
      icon: <Users className="w-8 h-8 text-laboratory-primary" />,
      title: 'Personnel qualifié',
      description: 'Infirmiers diplômés et préleveurs expérimentés'
    },
    {
      icon: <Clock className="w-8 h-8 text-laboratory-primary" />,
      title: 'Horaires flexibles',
      description: 'Service disponible 7j/7, même le week-end'
    }
  ];

  const process = [
    {
      step: 1,
      title: 'Prise de rendez-vous',
      description: 'Réservez en ligne ou par téléphone, 24h à l\'avance minimum'
    },
    {
      step: 2,
      title: 'Confirmation',
      description: 'Nous confirmons votre rendez-vous et les modalités'
    },
    {
      step: 3,
      title: 'Intervention à domicile',
      description: 'Notre préleveur se rend chez vous à l\'heure convenue'
    },
    {
      step: 4,
      title: 'Résultats',
      description: 'Récupérez vos résultats en ligne ou par courrier'
    }
  ];

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

  return (
    <PageLayout>
      <SEO 
        title="Prélèvement à Domicile - Laboratoire d'Analyses Médicales" 
        description="Service de prélèvement à domicile 7j/7. Analyses sanguines et urinaires dans le confort de votre foyer par des professionnels qualifiés."
        keywords={['prélèvement domicile', 'prise de sang domicile', 'infirmier domicile', 'analyses domicile']}
      />
      
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header */}
            <motion.div className="text-center mb-12" variants={itemVariants}>
              <div className="w-16 h-16 bg-laboratory-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Home className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-laboratory-dark mb-4">
                Prélèvement à Domicile
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Bénéficiez de nos services de prélèvement directement chez vous. 
                Confort, sécurité et professionnalisme pour vos analyses médicales.
              </p>
            </motion.div>

            {/* Advantages */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12" variants={containerVariants}>
              {advantages.map((advantage, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="border-laboratory-muted hover:shadow-lg transition-shadow h-full">
                    <CardHeader className="text-center">
                      <div className="w-12 h-12 bg-laboratory-light rounded-full flex items-center justify-center mx-auto mb-2">
                        {advantage.icon}
                      </div>
                      <CardTitle className="text-laboratory-dark text-lg">{advantage.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-center text-sm">
                        {advantage.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Services */}
            <motion.div className="mb-12" variants={itemVariants}>
              <h2 className="text-3xl font-bold text-laboratory-dark mb-8 text-center">
                Nos Services à Domicile
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((service, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <Card className="border-laboratory-muted hover:shadow-lg transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="text-laboratory-dark flex items-center">
                          <CheckCircle className="w-5 h-5 text-laboratory-primary mr-2" />
                          {service.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">{service.description}</p>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-laboratory-accent">
                            Durée: {service.duration}
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {service.availability}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Process */}
            <motion.div className="mb-12" variants={itemVariants}>
              <h2 className="text-3xl font-bold text-laboratory-dark mb-8 text-center">
                Comment ça marche ?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {process.map((step, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <Card className="border-laboratory-muted hover:shadow-lg transition-shadow h-full">
                      <CardHeader className="text-center">
                        <div className="w-12 h-12 bg-laboratory-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                          {step.step}
                        </div>
                        <CardTitle className="text-laboratory-dark text-lg">{step.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-center text-sm">
                          {step.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Pricing and Coverage */}
            <motion.div className="mb-12" variants={itemVariants}>
              <Card className="border-laboratory-primary bg-laboratory-light">
                <CardHeader>
                  <CardTitle className="text-laboratory-dark">
                    Tarifs et Prise en Charge
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-laboratory-dark mb-2">Tarification :</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Frais de déplacement : 25€ (pris en charge par la Sécurité Sociale sur prescription)</li>
                      <li>Analyses : selon nomenclature en vigueur</li>
                      <li>Gratuit pour les patients en ALD (Affection Longue Durée)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-laboratory-dark mb-2">Zone de couverture :</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Paris et petite couronne (92, 93, 94)</li>
                      <li>Rayon de 30 km autour de nos laboratoires</li>
                      <li>Possibilité d'extension sur demande</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-laboratory-dark mb-2">Conditions :</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Prescription médicale obligatoire</li>
                      <li>Prise de rendez-vous 24h à l'avance minimum</li>
                      <li>Présence obligatoire du patient ou de son représentant légal</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* CTA */}
            <motion.div className="text-center" variants={itemVariants}>
              <Card className="border-laboratory-primary bg-white">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-laboratory-dark mb-4">
                    Réservez votre prélèvement à domicile
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Service disponible 7j/7, même le week-end et les jours fériés
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button className="bg-laboratory-primary hover:bg-laboratory-accent">
                      <MapPin className="w-4 h-4 mr-2" />
                      Prendre Rendez-vous
                    </Button>
                    <Button variant="outline" className="border-laboratory-primary text-laboratory-dark hover:bg-laboratory-light">
                      Vérifier la Zone de Couverture
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    Ou appelez-nous au <span className="font-semibold text-laboratory-dark">01 23 45 67 89</span>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
};

export default HomeCollectionService;
