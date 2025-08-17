-- Storage Buckets Setup for SihaaExpress
-- Run this in Supabase SQL Editor

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('medical-results', 'medical-results', true, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/jpg']),
  ('lab-certificates', 'lab-certificates', true, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
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

-- Storage policies for lab-certificates bucket
CREATE POLICY "Public read access for lab-certificates" ON storage.objects
  FOR SELECT USING (bucket_id = 'lab-certificates');

CREATE POLICY "Authenticated users can upload lab-certificates" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'lab-certificates' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own lab-certificates" ON storage.objects
  FOR UPDATE USING (bucket_id = 'lab-certificates' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'lab-certificates' AND owner = auth.uid());

CREATE POLICY "Users can delete their own lab-certificates" ON storage.objects
  FOR DELETE USING (bucket_id = 'lab-certificates' AND owner = auth.uid());

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
