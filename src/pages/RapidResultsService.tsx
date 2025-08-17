import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Clock, Shield, Smartphone, CheckCircle, Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const RapidResultsService = () => {
  const { t } = useLanguage();

  const rapidTests = [
    {
      name: 'Tests COVID-19',
      description: 'PCR et tests antigéniques rapides',
      duration: '15 min - 24h',
      type: 'Urgence'
    },
    {
      name: 'Glycémie',
      description: 'Dosage rapide du glucose sanguin',
      duration: '5 min',
      type: 'Routine'
    },
    {
      name: 'Test de Grossesse',
      description: 'Dosage bêta-HCG sanguin et urinaire',
      duration: '30 min',
      type: 'Hormonal'
    },
    {
      name: 'Marqueurs Cardiaques',
      description: 'Troponines pour diagnostic d\'infarctus',
      duration: '30 min',
      type: 'Urgence'
    },
    {
      name: 'Bandelette Urinaire',
      description: 'Dépistage infections et anomalies urinaires',
      duration: '5 min',
      type: 'Dépistage'
    },
    {
      name: 'Groupe Sanguin',
      description: 'Détermination ABO et Rhésus',
      duration: '15 min',
      type: 'Identité'
    }
  ];

  const features = [
    {
      icon: <Zap className="w-8 h-8 text-laboratory-primary" />,
      title: 'Résultats Ultra-Rapides',
      description: 'De 5 minutes à 2 heures selon l\'analyse'
    },
    {
      icon: <Smartphone className="w-8 h-8 text-laboratory-primary" />,
      title: 'Accès Digital',
      description: 'Consultation en ligne 24h/24 sur votre espace patient'
    },
    {
      icon: <Shield className="w-8 h-8 text-laboratory-primary" />,
      title: 'Fiabilité Garantie',
      description: 'Même niveau de qualité que les analyses standard'
    },
    {
      icon: <Clock className="w-8 h-8 text-laboratory-primary" />,
      title: 'Service Continu',
      description: 'Disponible 7j/7, même les week-ends et jours fériés'
    }
  ];

  const digitalFeatures = [
    {
      title: 'Notification SMS/Email',
      description: 'Alerte dès que vos résultats sont disponibles'
    },
    {
      title: 'Espace Patient Sécurisé',
      description: 'Accès protégé à tous vos résultats d\'analyses'
    },
    {
      title: 'Téléchargement PDF',
      description: 'Format officiel pour vos médecins et démarches'
    },
    {
      title: 'Historique Complet',
      description: 'Conservation de tous vos résultats pendant 10 ans'
    },
    {
      title: 'Partage Sécurisé',
      description: 'Transmission directe à votre médecin traitant'
    },
    {
      title: 'Application Mobile',
      description: 'Consultez vos résultats depuis votre smartphone'
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Urgence':
        return 'bg-red-100 text-red-800';
      case 'Routine':
        return 'bg-blue-100 text-blue-800';
      case 'Hormonal':
        return 'bg-pink-100 text-pink-800';
      case 'Dépistage':
        return 'bg-green-100 text-green-800';
      case 'Identité':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageLayout>
      <SEO 
        title="Résultats Rapides - Laboratoire d'Analyses Médicales" 
        description="Résultats d'analyses en ligne 24h/24. Accès sécurisé, notifications instantanées et téléchargement PDF. Service digital complet."
        keywords={['résultats rapides', 'résultats en ligne', 'analyses urgentes', 'espace patient', 'laboratoire digital']}
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
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-laboratory-dark mb-4">
                Résultats Rapides
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Accédez à vos résultats d'analyses en temps record. Service digital complet 
                avec notifications instantanées et accès sécurisé 24h/24.
              </p>
            </motion.div>

            {/* Features */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12" variants={containerVariants}>
              {features.map((feature, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="border-laboratory-muted hover:shadow-lg transition-shadow h-full">
                    <CardHeader className="text-center">
                      <div className="w-12 h-12 bg-laboratory-light rounded-full flex items-center justify-center mx-auto mb-2">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-laboratory-dark text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-center text-sm">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Rapid Tests */}
            <motion.div className="mb-12" variants={itemVariants}>
              <h2 className="text-3xl font-bold text-laboratory-dark mb-8 text-center">
                Analyses avec Résultats Rapides
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rapidTests.map((test, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <Card className="border-laboratory-muted hover:shadow-lg transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="text-laboratory-dark flex items-center">
                          <CheckCircle className="w-5 h-5 text-laboratory-primary mr-2" />
                          {test.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">{test.description}</p>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-laboratory-accent font-semibold">
                            {test.duration}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(test.type)}`}>
                            {test.type}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Digital Platform */}
            <motion.div className="mb-12" variants={itemVariants}>
              <h2 className="text-3xl font-bold text-laboratory-dark mb-8 text-center">
                Plateforme Digitale
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {digitalFeatures.map((feature, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <Card className="border-laboratory-muted hover:shadow-lg transition-shadow h-full">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-laboratory-primary mt-1 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-laboratory-dark mb-2">
                              {feature.title}
                            </h4>
                            <p className="text-gray-600 text-sm">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* How it works */}
            <motion.div className="mb-12" variants={itemVariants}>
              <Card className="border-laboratory-primary bg-laboratory-light">
                <CardHeader>
                  <CardTitle className="text-laboratory-dark">
                    Comment accéder à vos résultats ?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-laboratory-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                        1
                      </div>
                      <h4 className="font-semibold text-laboratory-dark mb-2">Création de compte</h4>
                      <p className="text-gray-600 text-sm">
                        Créez votre espace patient lors de votre première visite
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-laboratory-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                        2
                      </div>
                      <h4 className="font-semibold text-laboratory-dark mb-2">Notification</h4>
                      <p className="text-gray-600 text-sm">
                        Recevez un SMS/email dès que vos résultats sont prêts
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-laboratory-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                        3
                      </div>
                      <h4 className="font-semibold text-laboratory-dark mb-2">Consultation</h4>
                      <p className="text-gray-600 text-sm">
                        Consultez et téléchargez vos résultats en toute sécurité
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* CTA */}
            <motion.div className="text-center" variants={itemVariants}>
              <Card className="border-laboratory-primary bg-white">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-laboratory-dark mb-4">
                    Accédez à vos résultats maintenant
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Connectez-vous à votre espace patient ou créez votre compte
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button className="bg-laboratory-primary hover:bg-laboratory-accent">
                      <Smartphone className="w-4 h-4 mr-2" />
                      Mon Espace Patient
                    </Button>
                    <Button variant="outline" className="border-laboratory-primary text-laboratory-dark hover:bg-laboratory-light">
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger l'App
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    Besoin d'aide ? Contactez-nous au <span className="font-semibold text-laboratory-dark">01 23 45 67 89</span>
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

export default RapidResultsService;
