import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface VerificationWaitingProps {
  email: string;
  onResendEmail?: () => void;
  onClose?: () => void;
}

const VerificationWaiting = ({ email, onResendEmail, onClose }: VerificationWaitingProps) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleResend = () => {
    if (onResendEmail) {
      onResendEmail();
      setTimeLeft(60);
      setCanResend(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-md"
      >
        <Card className="border-vet-primary shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-vet-light rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-vet-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-vet-dark">
              Vérification en attente
            </CardTitle>
            <CardDescription className="text-gray-600">
              Nous avons envoyé un email de confirmation à votre adresse
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-vet-light/30 rounded-lg p-4 text-center">
              <p className="font-medium text-vet-dark mb-2">Email envoyé à :</p>
              <p className="text-sm text-gray-700 bg-white rounded px-3 py-2 font-mono">
                {email}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Vérifiez votre boîte de réception</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Vérifiez vos spams/courriers indésirables</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Clock className="w-5 h-5 text-vet-primary flex-shrink-0" />
                <span>Cliquez sur le lien de confirmation</span>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <p className="text-sm text-gray-600 text-center">
                Vous n'avez pas reçu l'email ?
              </p>
              
              <Button
                onClick={handleResend}
                disabled={!canResend}
                variant="outline"
                className="w-full border-vet-primary text-vet-primary hover:bg-vet-light"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${!canResend ? 'animate-spin' : ''}`} />
                {canResend ? 'Renvoyer l\'email' : `Renvoyer dans ${timeLeft}s`}
              </Button>

              <Button
                onClick={onClose}
                variant="ghost"
                className="w-full text-gray-600 hover:text-gray-800"
              >
                Fermer
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default VerificationWaiting;
