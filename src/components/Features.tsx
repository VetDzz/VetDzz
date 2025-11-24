import { motion } from 'framer-motion';
import { TestTube, Clock, MapPin, Shield, Users, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const Features = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: <TestTube className="w-8 h-8 text-vet-primary" />,
      title: t('features.analyses.title'),
      description: t('features.analyses.desc')
    },
    {
      icon: <Clock className="w-8 h-8 text-vet-primary" />,
      title: t('features.results.title'),
      description: t('features.results.desc')
    },
    {
      icon: <MapPin className="w-8 h-8 text-vet-primary" />,
      title: t('features.home.title'),
      description: t('features.home.desc')
    },
    {
      icon: <Shield className="w-8 h-8 text-vet-primary" />,
      title: t('features.security.title'),
      description: t('features.security.desc')
    },
    {
      icon: <Users className="w-8 h-8 text-vet-primary" />,
      title: t('features.team.title'),
      description: t('features.team.desc')
    },
    {
      icon: <FileText className="w-8 h-8 text-vet-primary" />,
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
    <section id="features" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-4">
              Nos Services
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('features.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('features.subtitle')}
            </p>
          </motion.div>

          <motion.div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" variants={containerVariants}>
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <div className="group h-full bg-white rounded-2xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default Features;
