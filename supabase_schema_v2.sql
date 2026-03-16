-- =============================================================
-- Intercesión — Schema Migration v2
-- Run this in the Supabase SQL Editor
-- Adds: category, intercesor columns to intentions
-- =============================================================

-- Add category column
ALTER TABLE public.intentions
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'General';

-- Add intercesor column
ALTER TABLE public.intentions
  ADD COLUMN IF NOT EXISTS intercesor text;
