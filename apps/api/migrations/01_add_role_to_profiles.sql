-- Migration: Add role field to profiles table
-- Allowed roles: 'user', 'admin'
-- Default role: 'user'

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
        ALTER TABLE public.profiles ADD CONSTRAINT check_profile_role CHECK (role IN ('user', 'admin'));
    END IF;
END $$;

-- Ensure all existing profiles default to 'user' if null
UPDATE public.profiles SET role = 'user' WHERE role IS NULL;
