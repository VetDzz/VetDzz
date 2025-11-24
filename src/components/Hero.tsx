import { Search, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const handleFindvet = (e: React.MouseEvent) => {
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
  
  return (
    <section className="flex flex-col items-center text-center relative mx-auto rounded-2xl overflow-hidden my-6 py-0 px-4 w-full h-[400px] md:w-[1220px] md:h-[600px] lg:h-[810px] md:px-0">
      {/* Background Image with Blue Overlay */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/analyse-795x478-1.jpg')`
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-indigo-700/85 to-purple-800/90"></div>
        {/* Grid overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px'
        }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-4 md:space-y-5 lg:space-y-6 mb-6 md:mb-7 lg:mb-9 max-w-md md:max-w-[500px] lg:max-w-[588px] mt-16 md:mt-[120px] lg:mt-[160px] px-4">
        <h1 className="text-white text-3xl md:text-4xl lg:text-6xl font-semibold leading-tight">
          {isAuthenticated ? (
            user?.type === 'client' ? 
              'Trouvez votre Vétérinaire' : 
              'Gérez vos Clients'
          ) : (
            'Soins pour Vos Animaux'
          )}
        </h1>
        <p className="text-white/80 text-base md:text-base lg:text-lg font-medium leading-relaxed max-w-lg mx-auto">
          {isAuthenticated
            ? (user?.type === 'client'
                ? t('hero.auth.clientSubtitle')
                : t('hero.auth.labSubtitle'))
            : t('hero.subtitle')
          }
        </p>
      </div>

      <Button 
        onClick={handleFindvet}
        variant="secondary" 
        className="relative z-10 px-8 py-3 rounded-full font-medium text-base shadow-lg ring-1 ring-white/10"
      >
        {t('hero.findLab')}
      </Button>
    </section>
  );
};

export default Hero;
