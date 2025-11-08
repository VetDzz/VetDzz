
import { ArrowRight, Linkedin, MapPin, Phone, Mail, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from '@/components/ui/button';
import emailjs from 'emailjs-com';

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleGmailContact = () => {
    const emailAddress = 'VetDz@gmail.com';
    const subject = 'Contact VetDz';
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailAddress}&su=${encodeURIComponent(subject)}`;
    window.open(gmailUrl, '_blank');
  };

  const handleWhatsAppContact = () => {
    const phoneNumber = '213797495568';
    const message = 'Bonjour, je souhaite obtenir des informations sur vos services de laboratoire d\'analyses médicales. Merci.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // EmailJS configuration
      const EMAILJS_SERVICE_ID = "service_i3h66xg";
      const EMAILJS_TEMPLATE_ID = "template_fgq53nh";
      const EMAILJS_PUBLIC_KEY = "wQmcZvoOqTAhGnRZ3";
      
      const templateParams = {
        from_name: "Website Subscriber",
        from_email: email,
        message: `New subscription request from the website footer.`,
        to_name: 'WRLDS Team',
        reply_to: email
      };
      
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
      
      toast({
        title: "Success!",
        description: "Thank you for subscribing to our newsletter.",
        variant: "default"
      });
      
      setEmail("");
    } catch (error) {

      toast({
        title: "Error",
        description: "There was a problem subscribing. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-vet-light pt-16 pb-8 w-full border-t border-vet-muted">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pb-10 border-b border-vet-muted">
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-vet-primary rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-vet-dark"> VetDz</h3>
                <p className="text-sm text-gray-600">{t('footer.subtitle')}</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              {t('footer.description')}
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-vet-primary" />
                <span className="text-sm">33 El khroub Constantine</span>
              </div>
              <button 
                onClick={handleWhatsAppContact}
                className="flex items-center text-gray-600 hover:text-green-600 transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4 mr-2 text-vet-primary" />
                <span className="text-sm">+213 797 49 55 68</span>
              </button>
              <button 
                onClick={handleGmailContact}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
              >
                <Mail className="w-4 h-4 mr-2 text-vet-primary" />
                <span className="text-sm">VetDz@gmail.com</span>
              </button>
            </div>
            <div className="flex space-x-4">
              <Button
                onClick={handleGmailContact}
                className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-800 transition-colors p-2 border border-gray-300"
                size="icon"
                title="Contactez-nous par Email"
              >
                <img 
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" 
                  alt="Gmail" 
                  className="w-7 h-7"
                />
              </Button>
              <Button
                onClick={handleWhatsAppContact}
                className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20b858] flex items-center justify-center text-white transition-colors p-2"
                size="icon"
                title="Contactez-nous sur WhatsApp"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.085" fill="white"/>
                </svg>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-vet-dark">{t('footer.services')}</h3>
            <ul className="space-y-3">
              <li><Link to="/services/blood-tests" className="text-gray-600 hover:text-vet-dark transition-colors">{t('services.bloodTests')}</Link></li>
              <li><Link to="/services/urine-tests" className="text-gray-600 hover:text-vet-dark transition-colors">{t('services.urineTests')}</Link></li>
              <li><Link to="/services/home-collection" className="text-gray-600 hover:text-vet-dark transition-colors">{t('services.homeCollection')}</Link></li>
              <li><Link to="/services/rapid-results" className="text-gray-600 hover:text-vet-dark transition-colors">{t('services.rapidResults')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()}  VetDz. {t('footer.rights')}
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy-policy" className="text-sm text-gray-500 hover:text-vet-dark transition-colors">{t('footer.privacy')}</Link>
            <Link to="/terms" className="text-sm text-gray-500 hover:text-vet-dark transition-colors">{t('footer.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
