-- Storage Buckets Setup for VetDz
-- Veterinary Medical Platform
-- Run this in Supabase SQL Editor

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('medical-results', 'medical-results', true, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/jpg']),
  ('vet-certificates', 'vet-certificates', true, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('pet-photos', 'pet-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/jpg']),
  ('documents', 'documents', true, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for medical-results bucket
CREATE POLICY "Public read access for medical-results" ON storage.objects
  FOR SELECT USING (bucket_id = 'medical-results');

CREATE POLICY "Authenticated users can upload medical-results" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'medical-results' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own medical-results" ON storage.objects
  FOR UPDATE USING (bucket_id = 'medical-results' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'medical-results' AND owner = auth.uid());

CREATE POLICY "Users can delete their own medical-results" ON storage.objects
  FOR DELETE USING (bucket_id = 'medical-results' AND owner = auth.uid());

-- Storage policies for avatars bucket
CREATE POLICY "Public read access for avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own avatars" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'avatars' AND owner = auth.uid());

CREATE POLICY "Users can delete their own avatars" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND owner = auth.uid());

-- Storage policies for vet-certificates bucket
CREATE POLICY "Public read access for vet-certificates" ON storage.objects
  FOR SELECT USING (bucket_id = 'vet-certificates');

CREATE POLICY "Authenticated users can upload vet-certificates" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'vet-certificates' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own vet-certificates" ON storage.objects
  FOR UPDATE USING (bucket_id = 'vet-certificates' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'vet-certificates' AND owner = auth.uid());

CREATE POLICY "Users can delete their own vet-certificates" ON storage.objects
  FOR DELETE USING (bucket_id = 'vet-certificates' AND owner = auth.uid());

-- Storage policies for pet-photos bucket
CREATE POLICY "Public read access for pet-photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'pet-photos');

CREATE POLICY "Authenticated users can upload pet-photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'pet-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own pet-photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'pet-photos' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'pet-photos' AND owner = auth.uid());

CREATE POLICY "Users can delete their own pet-photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'pet-photos' AND owner = auth.uid());

-- Storage policies for documents bucket
CREATE POLICY "Public read access for documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Authenticated users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own documents" ON storage.objects
  FOR UPDATE USING (bucket_id = 'documents' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'documents' AND owner = auth.uid());

CREATE POLICY "Users can delete their own documents" ON storage.objects
  FOR DELETE USING (bucket_id = 'documents' AND owner = auth.uid());
