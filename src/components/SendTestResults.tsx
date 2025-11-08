import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, Send, FileText, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createTestResult, createNotification } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

import { useLanguage } from '@/contexts/LanguageContext';
interface TestRequest {
  id: string;
  client_id: string;
  test_types: string[];
  collection_date: string;
  client_profiles: {
    first_name: string;
    last_name: string;
    phone: string;
  };
}

interface SendTestResultsProps {
  testRequest: TestRequest;
  onResultSent: () => void;
}

const SendTestResults = ({ testRequest, onResultSent }: SendTestResultsProps) => {
  const [results, setResults] = useState<Array<{
    test_name: string;
    result_value: string;
    result_unit: string;
    reference_range: string;
    status: 'normal' | 'abnormal' | 'critical';
    notes: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resultFile, setResultFile] = useState<File | null>(null);
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  // Initialize results array based on test types
  useState(() => {
    const initialResults = testRequest.test_types.map(testType => ({
      test_name: testType,
      result_value: '',
      result_unit: '',
      reference_range: '',
      status: 'normal' as const,
      notes: ''
    }));
    setResults(initialResults);
  }, [testRequest.test_types]);

  const updateResult = (index: number, field: string, value: string) => {
    const updatedResults = [...results];
    updatedResults[index] = { ...updatedResults[index], [field]: value };
    setResults(updatedResults);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'abnormal':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'abnormal':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type (PDF, images)
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Type de fichier non supporté",
          description: "Veuillez sélectionner un fichier PDF ou une image (JPEG, PNG).",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "La taille du fichier ne doit pas dépasser 10MB.",
          variant: "destructive"
        });
        return;
      }

      setResultFile(file);
    }
  };

  const handleSendResults = async () => {
    if (!user) return;

    // Validate that all required fields are filled
    const incompleteResults = results.filter(result =>
      !result.result_value || !result.reference_range
    );

    if (incompleteResults.length > 0) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires pour chaque analyse.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Upload file if provided (in a real app, you'd upload to Supabase Storage)
      let fileUrl = null;
      if (resultFile) {
        // This is a placeholder - in a real app, you'd upload to Supabase Storage
        fileUrl = `uploads/${Date.now()}_${resultFile.name}`;
      }

      // Send each test result
      for (const result of results) {
        const { error } = await createTestResult({
          test_request_id: testRequest.id,
          vet_id: user.id, // This should be the vet profile ID
          client_id: testRequest.client_id,
          test_name: result.test_name,
          result_value: result.result_value,
          result_unit: result.result_unit,
          reference_range: result.reference_range,
          status: result.status,
          notes: result.notes,
          result_file_url: fileUrl,
          validated_by: user.id,
          validated_at: new Date().toISOString()
        });

        if (error) {
          throw error;
        }
      }

      // Send notification to client
      await createNotification({
        user_id: testRequest.client_id,
        title: t('results.newAvailableTitle'),
        message: t('results.newAvailableMessage', { filename: `${results.length} ${results.length === 1 ? 'test' : 'tests'}` }),
        type: 'success',
        is_read: false,
        related_entity_type: 'test_request',
        related_entity_id: testRequest.id
      });

      toast({
        title: "Résultats envoyés",
        description: "Les résultats ont été envoyés avec succès au client.",
      });

      onResultSent();
    } catch (error) {

      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi des résultats.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center text-vet-dark">
          <FileText className="w-5 h-5 mr-2" />
          Envoyer les Résultats d'Analyse
        </CardTitle>
        <CardDescription>
          Patient: {testRequest.client_profiles.first_name} {testRequest.client_profiles.last_name} |
          Date de prélèvement: {new Date(testRequest.collection_date).toLocaleDateString('fr-FR')}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Test Results Form */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-vet-dark">Résultats des Analyses</h3>

          {results.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 border border-vet-muted rounded-lg space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-vet-dark">{result.test_name}</h4>
                <Badge className={getStatusColor(result.status)}>
                  {getStatusIcon(result.status)}
                  <span className="ml-1 capitalize">{result.status}</span>
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`result-${index}`}>Résultat *</Label>
                  <Input
                    id={`result-${index}`}
                    value={result.result_value}
                    onChange={(e) => updateResult(index, 'result_value', e.target.value)}
                    placeholder="Ex: 4.5"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`unit-${index}`}>Unité</Label>
                  <Input
                    id={`unit-${index}`}
                    value={result.result_unit}
                    onChange={(e) => updateResult(index, 'result_unit', e.target.value)}
                    placeholder="Ex: g/L, mg/dL"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`range-${index}`}>Valeurs de référence *</Label>
                  <Input
                    id={`range-${index}`}
                    value={result.reference_range}
                    onChange={(e) => updateResult(index, 'reference_range', e.target.value)}
                    placeholder="Ex: 3.5-5.0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`status-${index}`}>Statut</Label>
                  <Select
                    value={result.status}
                    onValueChange={(value) => updateResult(index, 'status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="abnormal">Anormal</SelectItem>
                      <SelectItem value="critical">Critique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`notes-${index}`}>Notes</Label>
                  <Textarea
                    id={`notes-${index}`}
                    value={result.notes}
                    onChange={(e) => updateResult(index, 'notes', e.target.value)}
                    placeholder="Commentaires additionnels..."
                    rows={2}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="result-file">Fichier de résultats (optionnel)</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="result-file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="flex-1"
            />
            <Upload className="w-5 h-5 text-gray-400" />
          </div>
          {resultFile && (
            <p className="text-sm text-gray-600">
              Fichier sélectionné: {resultFile.name} ({(resultFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
          <p className="text-xs text-gray-500">
            Formats acceptés: PDF, JPEG, PNG (max 10MB)
          </p>
        </div>

        {/* Send Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSendResults}
            disabled={isLoading}
            className="bg-vet-primary hover:bg-vet-accent w-full sm:w-auto"
            size="default"
          >
            {isLoading ? (
              "Envoi en cours..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Envoyer les Résultats
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SendTestResults;
