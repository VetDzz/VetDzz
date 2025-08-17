import { ArrowRight, Search, MapPin, TestTube, LogIn } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
        duration: 0.8
      }
    }
  };
  const itemVariants = {
    hidden: {
      y: 20,
      opacity: 0
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };
  
  const handleFindLaboratory = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate('/find-laboratory');
    } else {
      navigate('/auth');
    }
  };

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/auth');
  };
  
  return <motion.div className="relative w-full" initial="hidden" animate="visible" variants={containerVariants}>
      <div className="banner-container relative overflow-hidden h-[50vh] sm:h-[60vh] md:h-[500px] lg:h-[550px] xl:h-[600px] w-full">
        <div className="absolute inset-0 w-full">
          {/* Background image */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('/images/analyse-795x478-1.jpg')`
            }}
          ></div>
          {/* Overlay for better text readability (reduced green tint) */}
          <div className="absolute inset-0 bg-gradient-to-b from-laboratory-primary/70 via-laboratory-primary/50 to-white/90"></div>
        </div>
        
        <div className="banner-overlay bg-transparent pt-20 sm:pt-24 md:pt-32 w-full">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center h-full">
            <motion.div className="w-full max-w-4xl text-center" variants={itemVariants}>


              <motion.h1 className="banner-title text-white drop-shadow-lg" variants={itemVariants}>
                {isAuthenticated ? (user?.type === 'client' ? t('hero.auth.clientTitle') : t('hero.auth.labTitle')) : t('hero.title')}
              </motion.h1>
              <motion.p className="banner-subtitle text-white drop-shadow-lg mt-4 sm:mt-6" variants={itemVariants}>
                {isAuthenticated
                  ? (user?.type === 'client'
                      ? t('hero.auth.clientSubtitle')
                      : t('hero.auth.labSubtitle'))
                  : t('hero.subtitle')
                }
              </motion.p>
              <motion.div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 justify-center items-center" variants={itemVariants}>
                {/* Find Laboratory Button */}
                <button
                  className="w-full sm:w-auto min-h-[48px] px-6 sm:px-8 py-3 bg-white text-laboratory-dark rounded-md hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:shadow-gray-300/20 flex items-center justify-center group text-sm sm:text-base font-medium touch-manipulation"
                  onClick={handleFindLaboratory}
                >
                  {t('hero.findLab')}
                  <Search className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Login Button - Only show when not authenticated */}
                {!isAuthenticated && (
                  <button
                    className="w-full sm:w-auto min-h-[48px] px-6 sm:px-8 py-3 bg-laboratory-light text-laboratory-dark rounded-md hover:bg-laboratory-primary hover:text-white transition-all shadow-lg hover:shadow-xl hover:shadow-gray-300/20 flex items-center justify-center group text-sm sm:text-base font-medium touch-manipulation"
                    onClick={handleLogin}
                  >
                    {t('hero.login')}
                    <LogIn className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                  </button>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
      
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 mx-auto">
        <motion.div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4" variants={containerVariants} initial="hidden" animate="visible" transition={{
        delay: 0.6
      }}>
          <motion.div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-laboratory-muted transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md" variants={itemVariants}>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-laboratory-light flex items-center justify-center rounded-lg text-laboratory-dark mb-2 md:mb-3">
              <TestTube className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2 text-laboratory-dark">{t('services.bloodTests')}</h3>
            <p className="text-gray-600 text-xs md:text-sm">{t('services.bloodTests.desc')}</p>
          </motion.div>

          <motion.div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-laboratory-muted transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md" variants={itemVariants}>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-laboratory-light flex items-center justify-center rounded-lg text-laboratory-dark mb-2 md:mb-3">
              <MapPin className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2 text-laboratory-dark">{t('services.homeCollection')}</h3>
            <p className="text-gray-600 text-xs md:text-sm">{t('services.homeCollection.desc')}</p>
          </motion.div>

          <motion.div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-laboratory-muted transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md" variants={itemVariants}>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-laboratory-light flex items-center justify-center rounded-lg text-laboratory-dark mb-2 md:mb-3">
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2 text-laboratory-dark">{t('services.rapidResults')}</h3>
            <p className="text-gray-600 text-xs md:text-sm">{t('services.rapidResults.desc')}</p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>;
};

export default Hero;
