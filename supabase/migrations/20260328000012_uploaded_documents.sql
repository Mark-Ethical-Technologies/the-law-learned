-- Migration: uploaded_documents table + Supabase Storage RLS policies
-- Workers upload payslips and rosters; Vision extracts structured data
-- PII (names, TFN, bank) must NEVER be stored in extracted_data

CREATE TABLE IF NOT EXISTS public.uploaded_documents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type  TEXT NOT NULL CHECK (document_type IN ('payslip', 'roster', 'other')),
  storage_path   TEXT NOT NULL,          -- e.g. {userId}/payslip-2024-01-15.jpg
  file_name      TEXT NOT NULL,
  mime_type      TEXT NOT NULL,
  file_size_kb   INTEGER,
  extracted_data JSONB,                  -- PII-scrubbed structured extraction
  extraction_ok  BOOLEAN DEFAULT FALSE,
  error_message  TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast per-user lookups
CREATE INDEX IF NOT EXISTS uploaded_documents_user_id_idx
  ON public.uploaded_documents(user_id, created_at DESC);

-- RLS
ALTER TABLE public.uploaded_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON public.uploaded_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON public.uploaded_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON public.uploaded_documents FOR DELETE
  USING (auth.uid() = user_id);

-- Storage bucket: user-documents
-- Run in Supabase dashboard > Storage > New bucket: "user-documents" (private)
-- Then apply these storage policies:

-- Policy: allow authenticated users to upload to their own folder
-- INSERT: bucket_id = 'user-documents' AND (storage.foldername(name))[1] = auth.uid()::text
-- SELECT: bucket_id = 'user-documents' AND (storage.foldername(name))[1] = auth.uid()::text
-- DELETE: bucket_id = 'user-documents' AND (storage.foldername(name))[1] = auth.uid()::text

-- NOTE: Storage bucket + policies must be created manually in Supabase Dashboard
-- or via supabase CLI: supabase storage create user-documents
