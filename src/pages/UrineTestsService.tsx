import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplets, Clock, Shield, FileText, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const UrineTestsService = () => {
  const { t } = useLanguage();

  const urineTests = [
    {
      name: 'Examen Cytobactériologique des Urines (ECBU)',
      description: 'Recherche d\'infections urinaires, identification des bactéries et antibiogramme',
      duration: '48-72h',
      type: 'Infectieux'
    },
    {
      name: 'Bandelette Urinaire',
      description: 'Dépistage rapide : protéines, glucose, sang, leucocytes, nitrites',
      duration: '30 min',
      type: 'Dépistage'
    },
    {
      name: 'Protéinurie des 24h',
      description: 'Mesure précise de l\'élimination des protéines sur 24 heures',
      duration: '24h',
      type: 'Quantitatif'
    },
    {
      name: 'Microalbuminurie',
      description: 'Dépistage précoce de l\'atteinte rénale chez les diabétiques',
      duration: '24h',
      type: 'Spécialisé'
    },
    {
      name: 'Créatininurie',
      description: 'Évaluation de la fonction rénale et calcul de la clairance',
      duration: '24h',
      type: 'Fonction rénale'
    },
    {
      name: 'Ionogramme Urinaire',
      description: 'Dosage du sodium, potassium, chlore dans les urines',
      duration: '24h',
      type: 'Électrolytes'
    },
    {
      name: 'Recherche de Drogues',
      description: 'Dépistage de substances illicites (cannabis, cocaïne, opiacés)',
      duration: '24h',
      type: 'Toxicologie'
    },
    {
      name: 'Test de Grossesse',
      description: 'Dosage de l\'hormone bêta-HCG dans les urines',
      duration: '2h',
      type: 'Hormonal'
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
      case 'Infectieux':
        return 'bg-red-100 text-red-800';
      case 'Dépistage':
        return 'bg-blue-100 text-blue-800';
      case 'Quantitatif':
        return 'bg-green-100 text-green-800';
      case 'Spécialisé':
        return 'bg-purple-100 text-purple-800';
      case 'Fonction rénale':
        return 'bg-orange-100 text-orange-800';
      case 'Électrolytes':
        return 'bg-teal-100 text-teal-800';
      case 'Toxicologie':
        return 'bg-gray-100 text-gray-800';
      case 'Hormonal':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageLayout>
      <SEO 
        title="Analyses d'Urine - Laboratoire d'Analyses Médicales" 
        description="Analyses d'urine complètes : ECBU, protéinurie, microalbuminurie, dépistage de drogues. Résultats fiables et rapides."
        keywords={['analyses urine', 'ECBU', 'infection urinaire', 'protéinurie', 'laboratoire']}
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
                <Droplets className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-laboratory-dark mb-4">
                Analyses d'Urine
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Les analyses d'urine sont des examens simples et non invasifs qui fournissent 
                des informations précieuses sur votre état de santé, notamment sur le fonctionnement 
                de vos reins et la détection d'infections.
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
                      Bandelette urinaire en 30 minutes, 
                      ECBU complet en 48-72h.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border-laboratory-muted hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <Shield className="w-8 h-8 text-laboratory-primary mx-auto mb-2" />
                    <CardTitle className="text-laboratory-dark">Prélèvement Simple</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center">
                      Prélèvement facile et indolore, 
                      possibilité de réalisation à domicile.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border-laboratory-muted hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <FileText className="w-8 h-8 text-laboratory-primary mx-auto mb-2" />
                    <CardTitle className="text-laboratory-dark">Diagnostic Précis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center">
                      Identification précise des pathogènes 
                      et antibiogramme si nécessaire.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Urine Tests List */}
            <motion.div className="mb-12" variants={itemVariants}>
              <h2 className="text-3xl font-bold text-laboratory-dark mb-8 text-center">
                Nos Analyses d'Urine
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {urineTests.map((test, index) => (
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

            {/* Collection Instructions */}
            <motion.div className="mb-12" variants={itemVariants}>
              <Card className="border-laboratory-primary bg-laboratory-light">
                <CardHeader>
                  <CardTitle className="text-laboratory-dark">
                    Instructions de Prélèvement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-laboratory-dark mb-2">Prélèvement standard (ECBU) :</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Utiliser le flacon stérile fourni par le laboratoire</li>
                      <li>Faire une toilette intime soigneuse</li>
                      <li>Recueillir les urines du milieu de jet</li>
                      <li>Apporter l'échantillon rapidement au laboratoire (max 2h)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-laboratory-dark mb-2">Urines des 24h :</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Commencer le recueil après la première miction du matin</li>
                      <li>Recueillir toutes les urines pendant 24h</li>
                      <li>Terminer par la première miction du lendemain</li>
                      <li>Conserver au réfrigérateur pendant le recueil</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-laboratory-dark mb-2">Conseils généraux :</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Éviter les urines du matin pour certains tests</li>
                      <li>Signaler tout traitement antibiotique en cours</li>
                      <li>Respecter les consignes spécifiques selon l'analyse</li>
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
                    Besoin d'analyses d'urine ?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Nos laboratoires vous accueillent sans rendez-vous pour vos analyses d'urine
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button className="bg-laboratory-primary hover:bg-laboratory-accent">
                      Trouver un Laboratoire
                    </Button>
                    <Button variant="outline" className="border-laboratory-primary text-laboratory-dark hover:bg-laboratory-light">
                      Conseils de Prélèvement
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

export default UrineTestsService;
