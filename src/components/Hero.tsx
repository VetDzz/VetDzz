import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { MeshGradient } from "@paper-design/shaders-react";
import PulsingCircle from "@/components/PulsingCircle";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";

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
  
  return (
    <div>
      {/* Hero Section with Image and Shader */}
      <section className="relative w-full h-[66vh] sm:h-[70vh] md:h-[calc(100vh-80px)] flex items-end pb-12 sm:pb-16 md:pb-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/téléchargement.jpg"
            alt="Hero Background"
            className="w-full h-full object-cover object-center scale-110"
          />
        </div>
        
        {/* Shader Animation Overlay - subtle on top of image */}
        <div className="absolute inset-0 z-[1]" style={{ opacity: 0.3, mixBlendMode: 'overlay' }}>
          <MeshGradient
            className="w-full h-full"
            colors={["#1e40af", "#3b82f6", "#60a5fa", "#2563eb", "#1d4ed8"]}
            speed={0.3}
          />
        </div>
        
        {/* Dark gradient for text readability */}
        <div className="absolute inset-0 z-[2] bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
        
        {/* Content */}
        <div className="ml-8 z-[10] max-w-lg relative">
          <div className="text-left">
            <div
              className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 backdrop-blur-sm mb-4 relative"
            >
              <div className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
              <span className="text-white/90 text-xs font-light relative z-10">
                {isAuthenticated ? (
                  user?.type === 'client' ? 'Votre partenaire santé animale' : 'Plateforme professionnelle'
                ) : (
                  'Votre partenaire santé animale'
                )}
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl md:leading-16 tracking-tight font-light text-white mb-4">
              {isAuthenticated ? (
                user?.type === 'client' ? (
                  <>
                    <span className="font-medium italic">VetDz</span> Care
                    <br />
                    <span className="font-light tracking-tight text-white">for Your Pets</span>
                  </>
                ) : (
                  <>
                    <span className="font-medium italic">VetDz</span> Pro
                    <br />
                    <span className="font-light tracking-tight text-white">Gérez vos Clients</span>
                  </>
                )
              ) : (
                <>
                  <span className="font-medium italic">VetDz</span> Care
                  <br />
                  <span className="font-light tracking-tight text-white">for Your Pets</span>
                </>
              )}
            </h1>

            <p className="text-xs font-light text-white/70 mb-4 leading-relaxed">
              {isAuthenticated
                ? (user?.type === 'client'
                    ? t('hero.auth.clientSubtitle')
                    : t('hero.auth.labSubtitle'))
                : t('hero.subtitle')
              }
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              <button 
                onClick={() => {
                  const contactSection = document.getElementById('contact');
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="px-8 py-3 rounded-full bg-transparent border border-white/30 text-white font-normal text-xs transition-all duration-200 hover:bg-white/10 hover:border-white/50 cursor-pointer"
              >
                Nous Contacter
              </button>
              <Button 
                onClick={handleFindvet}
                className="px-8 py-3 rounded-full bg-transparent border border-white/30 text-white font-normal text-xs transition-all duration-200 hover:bg-white/10 hover:border-white/50 cursor-pointer"
              >
                {t('hero.findLab')}
              </Button>
            </div>
          </div>
        </div>

        {/* Pulsing Circle Logo */}
        <PulsingCircle />
      </section>
      
      {/* Contact Form Section - Outside hero, with its own background */}
      <div id="contact" className="bg-gradient-to-b from-blue-600 to-blue-700">
        <ContactForm />
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Hero;
