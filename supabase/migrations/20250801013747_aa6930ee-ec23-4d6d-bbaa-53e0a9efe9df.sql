-- Add full_name column to admin_data table
ALTER TABLE public.admin_data 
ADD COLUMN full_name TEXT;

-- Add full_name column to admin_user_data table  
ALTER TABLE public.admin_user_data
ADD COLUMN full_name TEXT;

-- Update existing records with full names from profiles table
UPDATE public.admin_data 
SET full_name = (
  SELECT name 
  FROM public.profiles 
  WHERE profiles.user_id = admin_data.user_id
);

UPDATE public.admin_user_data
SET full_name = (
  SELECT name 
  FROM public.profiles 
  WHERE profiles.user_id = admin_user_data.user_id
);

-- Update the handle_new_user function to include full_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (user_id, username, role, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, 'user_' || NEW.id::text),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'user'),
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email, 'User')
  );
  
  -- Insert into appropriate data table based on role with full_name
  IF COALESCE(NEW.raw_user_meta_data ->> 'role', 'user') = 'admin' THEN
    INSERT INTO public.admin_data (user_id, access_level, permissions, full_name)
    VALUES (
      NEW.id, 
      'full', 
      ARRAY['manage_users', 'manage_templates', 'view_all_checklists'],
      COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email, 'Admin User')
    );
  ELSE
    INSERT INTO public.admin_user_data (user_id, access_level, permissions, full_name)
    VALUES (
      NEW.id, 
      'limited', 
      ARRAY['manage_own_checklists', 'view_templates'],
      COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email, 'User')
    );
  END IF;
  
  RETURN NEW;
END;
$function$;