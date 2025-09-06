import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, FileText, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface UploadResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
}

const UploadResultModal: React.FC<UploadResultModalProps> = ({
  isOpen,
  onClose,
  clientId,
  clientName
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "La taille du fichier ne doit pas dépasser 10MB.",
          variant: "destructive"
        });
        return;
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: "Type de fichier non supporté",
          description: "Seuls les fichiers PDF, JPEG et PNG sont acceptés.",
          variant: "destructive"
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Titre requis",
        description: "Veuillez entrer un titre pour le résultat.",
        variant: "destructive"
      });
      return;
    }

    if (!file) {
      toast({
        title: "Fichier requis",
        description: "Veuillez sélectionner un fichier à télécharger.",
        variant: "destructive"
      });
      return;
    }

    if (!user) return;

    setIsUploading(true);

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `results/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('medical-results')
        .upload(filePath, file);

      if (uploadError) {

        const msg = (uploadError as any)?.message?.toLowerCase?.() || '';
        if (msg.includes('bucket') && msg.includes('not found')) {
          toast({
            title: 'Bucket de stockage manquant',
            description: "Créez le bucket 'medical-results' dans Supabase → Storage (public activé), puis réessayez.",
            variant: 'destructive'
          });
        } else if (msg.includes('row-level security') || msg.includes('rls')) {
          toast({
            title: 'Accès refusé (RLS)',
            description: "Ajoutez les policies Storage: SELECT public (bucket_id = 'medical-results') et INSERT pour authenticated (bucket_id = 'medical-results').",
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Erreur de téléchargement',
            description: "Impossible de télécharger le fichier.",
            variant: 'destructive'
          });
        }
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('medical-results')
        .getPublicUrl(filePath);

      // Create result record in database
      const { error: dbError } = await supabase
        .from('medical_results')
        .insert([
          {
            client_id: clientId,
            laboratory_id: user.id,
            title: title.trim(),
            description: description.trim(),
            file_url: publicUrl,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            status: 'completed',
            created_at: new Date().toISOString()
          }
        ]);

      if (dbError) {

        toast({
          title: "Erreur de base de données",
          description: "Impossible de sauvegarder le résultat.",
          variant: "destructive"
        });
        return;
      }

      // Create notification for client
      await supabase
        .from('notifications')
        .insert([
          {
            user_id: clientId,
            title: t('results.newAvailableTitle'),
            message: t('results.newAvailableMessage', { filename: title || file.name }),
            type: 'success',
            is_read: false,
            related_entity_type: 'medical_result'
          }
        ]);

      toast({
        title: "Résultat envoyé",
        description: `Le résultat a été envoyé à ${clientName}`,
      });

      // Reset form and close modal
      setTitle('');
      setDescription('');
      setFile(null);
      onClose();

    } catch (error) {

      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du résultat.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-laboratory-primary">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-laboratory-dark">
                Envoyer Résultat à {clientName}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre du résultat *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Analyse sanguine complète"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Commentaires ou notes supplémentaires..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="file">Fichier résultat *</Label>
                  <div className="mt-2">
                    <input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                    <label
                      htmlFor="file"
                      className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-laboratory-primary transition-colors"
                    >
                      {file ? (
                        <div className="text-center">
                          <FileText className="w-8 h-8 mx-auto mb-2 text-laboratory-primary" />
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            Cliquez pour sélectionner un fichier
                          </p>
                          <p className="text-xs text-gray-500">
                            PDF, JPEG, PNG (max 10MB)
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 w-full sm:w-auto"
                    disabled={isUploading}
                    size="default"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 w-full sm:w-auto bg-laboratory-primary hover:bg-laboratory-accent"
                    disabled={isUploading}
                    size="default"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Envoi...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Envoyer
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UploadResultModal;
