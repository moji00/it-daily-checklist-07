-- Create separate tables for Admin and Admin User data
CREATE TABLE public.admin_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  department TEXT,
  access_level TEXT DEFAULT 'full',
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT admin_data_user_id_unique UNIQUE (user_id)
);

CREATE TABLE public.admin_user_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  assigned_tasks TEXT[] DEFAULT '{}',
  supervisor_id UUID,
  access_level TEXT DEFAULT 'limited',
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT admin_user_data_user_id_unique UNIQUE (user_id)
);

-- Enable RLS on both tables
ALTER TABLE public.admin_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_user_data ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin_data
CREATE POLICY "Admins can manage their own admin data" 
ON public.admin_data 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all admin data" 
ON public.admin_data 
FOR SELECT 
USING (get_current_user_role() = 'admin');

-- RLS policies for admin_user_data
CREATE POLICY "Admin users can manage their own data" 
ON public.admin_user_data 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all admin user data" 
ON public.admin_user_data 
FOR SELECT 
USING (get_current_user_role() = 'admin');

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_admin_data_updated_at
BEFORE UPDATE ON public.admin_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_user_data_updated_at
BEFORE UPDATE ON public.admin_user_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update the handle_new_user function to create appropriate data records
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
  
  -- Insert into appropriate data table based on role
  IF COALESCE(NEW.raw_user_meta_data ->> 'role', 'user') = 'admin' THEN
    INSERT INTO public.admin_data (user_id, access_level, permissions)
    VALUES (NEW.id, 'full', ARRAY['manage_users', 'manage_templates', 'view_all_checklists']);
  ELSE
    INSERT INTO public.admin_user_data (user_id, access_level, permissions)
    VALUES (NEW.id, 'limited', ARRAY['manage_own_checklists', 'view_templates']);
  END IF;
  
  RETURN NEW;
END;
$function$;