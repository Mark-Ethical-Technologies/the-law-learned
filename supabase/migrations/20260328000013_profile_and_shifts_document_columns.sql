-- Migration: add document-derived columns to profiles and shifts

-- profiles additions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS employer_name               TEXT,
  ADD COLUMN IF NOT EXISTS employer_abn                TEXT,
  ADD COLUMN IF NOT EXISTS classification_level        TEXT,
  ADD COLUMN IF NOT EXISTS award_identified            TEXT,
  ADD COLUMN IF NOT EXISTS documents_uploaded          INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS profile_completed_from_document BOOLEAN DEFAULT FALSE;

-- shifts additions
ALTER TABLE public.shifts
  ADD COLUMN IF NOT EXISTS document_id     UUID REFERENCES public.uploaded_documents(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS hours_worked    NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS hours_paid      NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS hourly_rate     NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS gross_pay       NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS gap_amount      NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS source          TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'document'));

-- Index for joining shifts to documents
CREATE INDEX IF NOT EXISTS shifts_document_id_idx
  ON public.shifts(document_id)
  WHERE document_id IS NOT NULL;
