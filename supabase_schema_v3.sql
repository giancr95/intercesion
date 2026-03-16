-- =============================================================
-- Intercesión — Schema Migration v3
-- Run this in the Supabase SQL Editor
-- Adds: candle_mode to intentions, saints & categories to users
-- =============================================================

-- Add candle_mode column to intentions
ALTER TABLE public.intentions
  ADD COLUMN IF NOT EXISTS candle_mode boolean DEFAULT false;

-- Add custom saints list to users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS saints text[] DEFAULT '{}';

-- Add custom categories list to users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}';
