
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
              <img 
                src="/images/Logo.jpeg" 
                alt="VetDz Logo" 
                className="w-12 h-12 rounded-full object-cover mr-3"
              />
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
                className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 flex items-center justify-center text-white transition-colors p-2 shadow-lg"
                size="icon"
                title="Contactez-nous par Email"
              >
                <Mail className="w-6 h-6" />
              </Button>
              <Button
                onClick={handleWhatsAppContact}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 flex items-center justify-center text-white transition-colors p-2 shadow-lg"
                size="icon"
                title="Contactez-nous sur WhatsApp"
              >
                <MessageSquare className="w-6 h-6" />
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
