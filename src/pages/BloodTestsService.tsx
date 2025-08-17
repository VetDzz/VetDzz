import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TestTube, Clock, Shield, FileText, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const BloodTestsService = () => {
  const { t } = useLanguage();

  const bloodTests = [
    {
      name: 'Numération Formule Sanguine (NFS)',
      description: 'Analyse complète des cellules sanguines : globules rouges, blancs et plaquettes',
      duration: '24h',
      fasting: false
    },
    {
      name: 'Bilan Lipidique',
      description: 'Mesure du cholestérol total, HDL, LDL et triglycérides',
      duration: '24h',
      fasting: true
    },
    {
      name: 'Glycémie à Jeun',
      description: 'Dosage du glucose sanguin pour dépister le diabète',
      duration: '2h',
      fasting: true
    },
    {
      name: 'Bilan Hépatique',
      description: 'Évaluation du fonctionnement du foie (ALAT, ASAT, GGT, bilirubine)',
      duration: '24h',
      fasting: false
    },
    {
      name: 'Fonction Rénale',
      description: 'Créatinine, urée, clairance de la créatinine',
      duration: '24h',
      fasting: false
    },
    {
      name: 'Bilan Thyroïdien',
      description: 'TSH, T3, T4 pour évaluer la fonction thyroïdienne',
      duration: '48h',
      fasting: false
    },
    {
      name: 'Marqueurs Cardiaques',
      description: 'Troponines, CK-MB pour diagnostic d\'infarctus',
      duration: '2h',
      fasting: false
    },
    {
      name: 'Sérologies Infectieuses',
      description: 'Hépatites B et C, VIH, syphilis, toxoplasmose',
      duration: '48-72h',
      fasting: false
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
        title="Analyses Sanguines - Laboratoire d'Analyses Médicales" 
        description="Analyses sanguines complètes : NFS, bilan lipidique, glycémie, fonction hépatique et rénale. Résultats rapides et fiables."
        keywords={['analyses sanguines', 'prise de sang', 'bilan sanguin', 'laboratoire', 'NFS', 'glycémie']}
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
                <TestTube className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-laboratory-dark mb-4">
                Analyses Sanguines
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Nos analyses sanguines permettent d'évaluer votre état de santé général, 
                de dépister des maladies et de surveiller l'évolution de traitements médicaux.
              </p>
            </motion.div>

            {/* Key Benefits */}
            <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12" variants={containerVariants}>
              <motion.div variants={itemVariants}>
                <Card className="border-laboratory-muted hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <Clock className="w-8 h-8 text-laboratory-primary mx-auto mb-2" />
                    <CardTitle className="text-laboratory-dark">Résultats Rapides</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center">
                      La plupart des analyses sont disponibles en 24h, 
                      certaines en urgence en 2h.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border-laboratory-muted hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <Shield className="w-8 h-8 text-laboratory-primary mx-auto mb-2" />
                    <CardTitle className="text-laboratory-dark">Fiabilité Garantie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center">
                      Équipements de dernière génération et contrôles qualité 
                      selon les normes ISO 15189.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border-laboratory-muted hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <FileText className="w-8 h-8 text-laboratory-primary mx-auto mb-2" />
                    <CardTitle className="text-laboratory-dark">Interprétation Médicale</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center">
                      Résultats commentés par nos biologistes médicaux 
                      avec valeurs de référence.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Blood Tests List */}
            <motion.div className="mb-12" variants={itemVariants}>
              <h2 className="text-3xl font-bold text-laboratory-dark mb-8 text-center">
                Nos Analyses Sanguines
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bloodTests.map((test, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <Card className="border-laboratory-muted hover:shadow-lg transition-all duration-300 h-full">
                      <CardHeader>
                        <CardTitle className="text-laboratory-dark flex items-center">
                          <CheckCircle className="w-5 h-5 text-laboratory-primary mr-2" />
                          {test.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">{test.description}</p>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-laboratory-accent">
                            Délai: {test.duration}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            test.fasting 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {test.fasting ? 'À jeun requis' : 'Pas de jeûne'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Preparation Instructions */}
            <motion.div className="mb-12" variants={itemVariants}>
              <Card className="border-laboratory-primary bg-laboratory-light">
                <CardHeader>
                  <CardTitle className="text-laboratory-dark">
                    Préparation pour les Analyses Sanguines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-laboratory-dark mb-2">Analyses à jeun :</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Ne pas manger ni boire (sauf eau) pendant 12h avant le prélèvement</li>
                      <li>Éviter l'alcool 24h avant</li>
                      <li>Prendre vos médicaments habituels sauf indication contraire</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-laboratory-dark mb-2">Conseils généraux :</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Bien s'hydrater la veille</li>
                      <li>Éviter l'effort physique intense avant le prélèvement</li>
                      <li>Apporter votre ordonnance et carte vitale</li>
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
                    Prêt pour vos analyses ?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Trouvez le laboratoire le plus proche et prenez rendez-vous en ligne
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button className="bg-laboratory-primary hover:bg-laboratory-accent">
                      Trouver un Laboratoire
                    </Button>
                    <Button variant="outline" className="border-laboratory-primary text-laboratory-dark hover:bg-laboratory-light">
                      Prélèvement à Domicile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
};

export default BloodTestsService;
