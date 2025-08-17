
import { ArrowRight, Linkedin, MapPin, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import emailjs from 'emailjs-com';

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

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
      console.error("Error sending subscription:", error);
      
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
    <footer className="bg-laboratory-light pt-16 pb-8 w-full border-t border-laboratory-muted">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 pb-10 border-b border-laboratory-muted">
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-laboratory-primary rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-laboratory-dark">LabConnect</h3>
                <p className="text-sm text-gray-600">{t('footer.subtitle')}</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              {t('footer.description')}
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-laboratory-primary" />
                <span className="text-sm">33 El khroub Constantine</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-2 text-laboratory-primary" />
                <span className="text-sm">0549702788</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-2 text-laboratory-primary" />
                <span className="text-sm">contact@labconnect.fr</span>
              </div>
            </div>
            <div className="flex space-x-4">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-laboratory-primary flex items-center justify-center text-white transition-colors hover:bg-laboratory-accent"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-laboratory-dark">{t('footer.services')}</h3>
            <ul className="space-y-3">
              <li><Link to="/services/blood-tests" className="text-gray-600 hover:text-laboratory-dark transition-colors">{t('services.bloodTests')}</Link></li>
              <li><Link to="/services/urine-tests" className="text-gray-600 hover:text-laboratory-dark transition-colors">{t('services.urineTests')}</Link></li>
              <li><Link to="/services/home-collection" className="text-gray-600 hover:text-laboratory-dark transition-colors">{t('services.homeCollection')}</Link></li>
              <li><Link to="/services/rapid-results" className="text-gray-600 hover:text-laboratory-dark transition-colors">{t('services.rapidResults')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-laboratory-dark">{t('footer.newsletter')}</h3>
            <p className="text-gray-600 text-sm mb-4">
              {t('footer.stayUpdated')}
            </p>
            <form className="space-y-4" onSubmit={handleSubscribe}>
              <div>
                <input
                  type="email"
                  placeholder={t('footer.emailPlaceholder')}
                  className="w-full px-4 py-2 bg-white border border-laboratory-muted rounded-md focus:outline-none focus:ring-2 focus:ring-laboratory-primary text-laboratory-dark placeholder-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-laboratory-primary text-white rounded-md hover:bg-laboratory-accent transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? t('footer.subscribing') : (
                  <>
                    {t('footer.subscribe')}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} LabConnect. {t('footer.rights')}
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy-policy" className="text-sm text-gray-500 hover:text-laboratory-dark transition-colors">{t('footer.privacy')}</Link>
            <Link to="/terms" className="text-sm text-gray-500 hover:text-laboratory-dark transition-colors">{t('footer.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
