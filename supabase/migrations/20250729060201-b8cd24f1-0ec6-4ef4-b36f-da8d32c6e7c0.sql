-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, role, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, 'user_' || NEW.id::text),
    'user',
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email, 'User')
  );
  RETURN NEW;
END;
$$;

-- Create security definer function to get current user role to avoid infinite recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Drop and recreate the problematic policies to avoid infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage checklist templates" ON public.checklist_templates;
DROP POLICY IF EXISTS "Admins can view all checklists" ON public.daily_checklists;
DROP POLICY IF EXISTS "Admins can view all checklist items" ON public.checklist_items;

-- Recreate policies using the security definer function
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage checklist templates" 
ON public.checklist_templates FOR ALL 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can view all checklists" 
ON public.daily_checklists FOR SELECT 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can view all checklist items" 
ON public.checklist_items FOR SELECT 
USING (public.get_current_user_role() = 'admin');