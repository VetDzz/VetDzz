
import React from 'react';
import { Mail, MessageSquare, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const ContactInfo = () => {
  const handleGmailContact = () => {
    const email = 'VetDz@gmail.com';
    const subject = 'Contact VetDz';
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}`;
    window.open(gmailUrl, '_blank');
  };

  const handleWhatsAppContact = () => {
    const phoneNumber = '213549702788';
    const message = 'Bonjour, je souhaite obtenir des informations sur vos services de laboratoire d\'analyses médicales. Merci.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section id="contact-info" className="bg-vet-light py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
            VetDz - Votre Laboratoire de Confiance
          </h2>
          <p className="text-gray-700 text-lg max-w-2xl mx-auto">
            Nous sommes là pour répondre à toutes vos questions concernant nos services d'analyses médicales et de prélèvement à domicile.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Quick Contact Buttons */}
          <motion.div 
            className="bg-white rounded-xl shadow-xl p-6 border border-vet-muted"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <img 
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" 
                  alt="Gmail" 
                  className="w-16 h-16"
                />
              </div>
              <h3 className="text-xl font-bold text-vet-dark mb-2">Email</h3>
              <p className="text-gray-600 text-sm mb-4">VetDz@gmail.com</p>
              <Button 
                onClick={handleGmailContact}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300"
              >
                <img 
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" 
                  alt="Gmail" 
                  className="mr-2 h-4 w-4"
                />
                Envoyer un Email
              </Button>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-xl shadow-xl p-6 border border-vet-muted"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.085" fill="#25D366"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-vet-dark mb-2">WhatsApp</h3>
              <p className="text-gray-600 text-sm mb-4">+213 549 70 27 88</p>
              <Button 
                onClick={handleWhatsAppContact}
                className="w-full bg-[#25D366] hover:bg-[#20b858] text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.085" fill="white"/>
                </svg>
                Contacter WhatsApp
              </Button>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-xl shadow-xl p-6 border border-vet-muted"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-vet-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-vet-dark mb-2">Adresse</h3>
              <p className="text-gray-600 text-sm mb-4">33 El Khroub, Constantine</p>
              <div className="text-gray-500 text-sm">
                <p>Algérie</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Information */}
        <motion.div 
          className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-vet-dark mb-4">Horaires et Services</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-vet-dark mb-3">Nos Services</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Analyses sanguines</li>
                <li>• Analyses d'urine</li>
                <li>• Prélèvement à domicile (PAD)</li>
                <li>• Résultats rapides</li>
                <li>• Suivi personnalisé</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-vet-dark mb-3">Disponibilité</h4>
              <div className="space-y-2 text-gray-600">
                <p><span className="font-medium">Support:</span> 7 jours sur 7</p>
                <p><span className="font-medium">Prélèvement:</span> Sur rendez-vous</p>
                <p><span className="font-medium">Réponse:</span> Sous 24h</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactInfo;
