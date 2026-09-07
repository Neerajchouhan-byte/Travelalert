-- Add avatar_url column to profiles table
alter table if exists public.profiles
  add column if not exists avatar_url text;

-- Add name column for display name
alter table if exists public.profiles
  add column if not exists display_name text;
