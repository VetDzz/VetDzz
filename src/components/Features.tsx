import { motion } from 'framer-motion';
import { TestTube, Clock, MapPin, Shield, Users, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const Features = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: <TestTube className="w-8 h-8 text-laboratory-primary" />,
      title: t('features.analyses.title'),
      description: t('features.analyses.desc')
    },
    {
      icon: <Clock className="w-8 h-8 text-laboratory-primary" />,
      title: t('features.results.title'),
      description: t('features.results.desc')
    },
    {
      icon: <MapPin className="w-8 h-8 text-laboratory-primary" />,
      title: t('features.home.title'),
      description: t('features.home.desc')
    },
    {
      icon: <Shield className="w-8 h-8 text-laboratory-primary" />,
      title: t('features.security.title'),
      description: t('features.security.desc')
    },
    {
      icon: <Users className="w-8 h-8 text-laboratory-primary" />,
      title: t('features.team.title'),
      description: t('features.team.desc')
    },
    {
      icon: <FileText className="w-8 h-8 text-laboratory-primary" />,
      title: t('features.tracking.title'),
      description: t('features.tracking.desc')
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
    <section id="features" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h2 className="text-3xl font-bold text-laboratory-dark mb-4">
              {t('features.title')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </motion.div>

          <motion.div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3" variants={containerVariants}>
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full border-laboratory-muted hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-laboratory-light rounded-full flex items-center justify-center mx-auto mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-laboratory-dark">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 text-center">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default Features;
