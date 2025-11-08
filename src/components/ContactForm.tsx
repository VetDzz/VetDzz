
import { Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const ContactForm = () => {
  const handleGmailContact = () => {
    const email = 'VetDz@gmail.com';
    const subject = 'Contact VetDz';
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}`;
    window.open(gmailUrl, '_blank');
  };

  const handleWhatsAppContact = () => {
    const phoneNumber = '213797495568'; // +213 797 49 55 68 without + and spaces
    const message = 'Bonjour, je souhaite obtenir des informations sur vos services de laboratoire d\'analyses médicales. Merci.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section id="contact" className="bg-vet-light py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block mb-3 px-3 py-1 bg-vet-primary text-white rounded-full text-sm font-medium">
            Service Client
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-vet-dark">
            Nous Contacter
          </h2>
          <p className="text-gray-700 text-lg max-w-2xl mx-auto">
            Vous avez des questions sur nos services d'analyses médicales ? Contactez-nous directement par email ou WhatsApp.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Gmail Contact Card */}
          <div className="bg-white rounded-xl shadow-xl p-8 border border-vet-muted hover:shadow-2xl transition-all duration-300">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <img 
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" 
                  alt="Gmail" 
                  className="w-16 h-16"
                />
              </div>
              <h3 className="text-xl font-bold text-vet-dark mb-2">Contactez-nous par Email</h3>
              <p className="text-gray-600 mb-6">
                Envoyez-nous un email directement via Gmail
              </p>
              <p className="text-gray-800 font-medium mb-6">
                VetDz@gmail.com
              </p>
              <Button 
                onClick={handleGmailContact}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-lg transition-colors flex items-center justify-center border border-gray-300"
              >
                <img 
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" 
                  alt="Gmail" 
                  className="mr-2 h-5 w-5"
                />
                Ouvrir Gmail
              </Button>
            </div>
          </div>

          {/* WhatsApp Contact Card */}
          <div className="bg-white rounded-xl shadow-xl p-8 border border-vet-muted hover:shadow-2xl transition-all duration-300">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.085" fill="#25D366"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-vet-dark mb-2">Contactez-nous sur WhatsApp</h3>
              <p className="text-gray-600 mb-6">
                Discutez directement avec notre équipe
              </p>
              <p className="text-gray-800 font-medium mb-6">
                +213 797 49 55 68
              </p>
              <Button 
                onClick={handleWhatsAppContact}
                className="w-full bg-[#25D366] hover:bg-[#20b858] text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.085" fill="white"/>
                </svg>
                Ouvrir WhatsApp
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <h4 className="text-lg font-semibold text-vet-dark mb-4">Informations de Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center justify-center">
                <Mail className="w-4 h-4 mr-2 text-vet-primary" />
                <span>VetDz@gmail.com</span>
              </div>
              <div className="flex items-center justify-center">
                <MessageSquare className="w-4 h-4 mr-2 text-vet-primary" />
                <span>+213 797 49 55 68</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-vet-primary font-medium">Disponible 7j/7</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactForm;
