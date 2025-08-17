import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';

interface TermsModalProps {
  children: React.ReactNode;
  type?: 'client' | 'laboratory';
}

const TermsModal: React.FC<TermsModalProps> = ({ children, type = 'client' }) => {
  const { t } = useLanguage();
  const [hasReadAll, setHasReadAll] = useState(false);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    if (isAtBottom) {
      setHasReadAll(true);
    }
  };

  const clientTerms = `
CONDITIONS D'UTILISATION - CLIENTS

1. OBJET
Les présentes conditions générales d'utilisation (CGU) régissent l'utilisation de la plateforme de laboratoires d'analyses médicales.

2. INSCRIPTION ET COMPTE UTILISATEUR
- L'inscription est gratuite et réservée aux personnes majeures
- Les informations fournies doivent être exactes et à jour
- Vous êtes responsable de la confidentialité de vos identifiants

3. SERVICES PROPOSÉS
- Recherche de laboratoires d'analyses médicales
- Prise de rendez-vous en ligne
- Accès aux résultats d'analyses
- Service de prélèvement à domicile

4. PROTECTION DES DONNÉES
- Vos données personnelles sont protégées conformément au RGPD
- Les données médicales sont cryptées et sécurisées
- Vous disposez d'un droit d'accès, de rectification et de suppression

5. RESPONSABILITÉS
- La plateforme facilite la mise en relation avec les laboratoires
- Les analyses sont réalisées par des laboratoires agréés
- Nous ne sommes pas responsables des actes médicaux

6. TARIFICATION
- La consultation de la plateforme est gratuite
- Les tarifs des analyses sont fixés par les laboratoires
- Les modalités de paiement sont définies par chaque laboratoire

7. MODIFICATION DES CGU
Ces conditions peuvent être modifiées à tout moment. Les utilisateurs en seront informés.

8. DROIT APPLICABLE
Les présentes CGU sont soumises au droit français.
  `;

  const laboratoryTerms = `
CONDITIONS PROFESSIONNELLES - LABORATOIRES

1. OBJET
Les présentes conditions professionnelles régissent l'utilisation de la plateforme par les laboratoires d'analyses médicales.

2. INSCRIPTION ET VALIDATION
- L'inscription nécessite la fourniture de documents professionnels
- Validation des agréments et certifications
- Vérification de l'identité professionnelle

3. OBLIGATIONS PROFESSIONNELLES
- Respect des normes de qualité en vigueur
- Maintien des agréments et certifications
- Respect des délais de rendu des résultats
- Formation continue du personnel

4. SERVICES DE LA PLATEFORME
- Référencement sur la plateforme
- Gestion des rendez-vous en ligne
- Interface de communication avec les patients
- Outils de gestion des résultats

5. RESPONSABILITÉS
- Qualité des analyses et des résultats
- Respect de la confidentialité médicale
- Conformité aux réglementations sanitaires
- Assurance responsabilité civile professionnelle

6. DONNÉES ET CONFIDENTIALITÉ
- Protection des données patients selon le RGPD
- CryPADge des données médicales
- Traçabilité des accès aux données
- Audit de sécurité régulier

7. TARIFICATION ET FACTURATION
- Commission sur les prestations réalisées
- Facturation mensuelle
- Modalités de paiement définies contractuellement

8. RÉSILIATION
- Possibilité de résiliation à tout moment
- Préavis de 30 jours
- Conservation des données selon obligations légales

9. DROIT APPLICABLE
Ces conditions sont soumises au droit français et aux réglementations sanitaires.
  `;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {type === 'client' ? 'Conditions d\'utilisation' : 'Conditions professionnelles'}
          </DialogTitle>
          <DialogDescription>
            Veuillez lire attentivement les conditions avant d'accepter.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-96 w-full rounded-md border p-4" onScrollCapture={handleScroll}>
          <div className="whitespace-pre-line text-sm">
            {type === 'client' ? clientTerms : laboratoryTerms}
          </div>
        </ScrollArea>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {hasReadAll ? '✓ Vous avez lu toutes les conditions' : 'Faites défiler pour lire toutes les conditions'}
          </p>
          <Button 
            disabled={!hasReadAll}
            className="bg-laboratory-primary hover:bg-laboratory-accent disabled:opacity-50"
          >
            J'ai lu et j'accepte
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsModal;
