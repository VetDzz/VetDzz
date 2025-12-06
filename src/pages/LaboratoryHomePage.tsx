import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import { MeshGradient } from "@paper-design/shaders-react";
import PulsingCircle from '@/components/PulsingCircle';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';

const VetHomePage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <PageLayout showFooter={false}>
      <SEO
        title={t('labHome.seoTitle')}
        description={t('labHome.seoDescription')}
        keywords={[t('labHome.keyword1'), t('labHome.keyword2'), t('labHome.keyword3'), t('labHome.keyword4')]}
      />
      
      <div>
        {/* Hero Section with Image and Shader */}
        <section className="relative w-full h-[calc(100vh-80px)] flex items-end pb-20 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/WhatsApp Image 2025-12-04 at 3.15.17 PM.jpeg"
              alt="Hero Background"
              className="w-full h-full object-cover"
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
                  Plateforme professionnelle
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl md:leading-16 tracking-tight font-light text-white mb-4">
                <span className="font-medium italic">VetDz</span> Pro
                <br />
                <span className="font-light tracking-tight text-white">Gérez vos Clients</span>
              </h1>

              <p className="text-xs font-light text-white/70 mb-4 leading-relaxed">
                {t('labHome.heroDescription')}
              </p>

              <div className="flex items-center gap-4 flex-wrap">
                <button 
                  onClick={() => navigate('/#contact')}
                  className="px-8 py-3 rounded-full bg-transparent border border-white/30 text-white font-normal text-xs transition-all duration-200 hover:bg-white/10 hover:border-white/50 cursor-pointer"
                >
                  Nous Contacter
                </button>
                <Button 
                  onClick={() => navigate('/vet-dashboard')}
                  className="px-8 py-3 rounded-full bg-white text-black font-normal text-xs transition-all duration-200 hover:bg-white/90 cursor-pointer"
                >
                  <Users className="w-5 h-5 mr-2" />
                  {t('labHome.ctaFindClients')}
                </Button>
              </div>
            </div>
          </div>

          {/* Pulsing Circle Logo */}
          <PulsingCircle />
        </section>
        
        {/* Contact Form Section - Outside hero */}
        <div id="contact" className="bg-gradient-to-b from-blue-600 to-blue-700">
          <ContactForm />
        </div>
      
        {/* Footer */}
        <Footer />
      </div>
    </PageLayout>
  );
};

export default VetHomePage;
