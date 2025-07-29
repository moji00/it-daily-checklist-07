-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create checklist_templates table for predefined checklist items
CREATE TABLE public.checklist_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('servers', 'network', 'security', 'backup', 'monitoring', 'maintenance')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_checklists table
CREATE TABLE public.daily_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_status TEXT NOT NULL CHECK (overall_status IN ('pending', 'in-progress', 'completed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date, user_id)
);

-- Create checklist_items table
CREATE TABLE public.checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  daily_checklist_id UUID NOT NULL REFERENCES public.daily_checklists(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.checklist_templates(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('servers', 'network', 'security', 'backup', 'monitoring', 'maintenance')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  completed BOOLEAN NOT NULL DEFAULT false,
  remarks TEXT DEFAULT '',
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subtasks table
CREATE TABLE public.subtasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_item_id UUID NOT NULL REFERENCES public.checklist_items(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create RLS policies for checklist_templates
CREATE POLICY "Everyone can view checklist templates" 
ON public.checklist_templates FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage checklist templates" 
ON public.checklist_templates FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create RLS policies for daily_checklists
CREATE POLICY "Users can view their own checklists" 
ON public.daily_checklists FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own checklists" 
ON public.daily_checklists FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checklists" 
ON public.daily_checklists FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all checklists" 
ON public.daily_checklists FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create RLS policies for checklist_items
CREATE POLICY "Users can view their own checklist items" 
ON public.checklist_items FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.daily_checklists 
    WHERE id = daily_checklist_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own checklist items" 
ON public.checklist_items FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.daily_checklists 
    WHERE id = daily_checklist_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all checklist items" 
ON public.checklist_items FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create RLS policies for subtasks
CREATE POLICY "Users can view their own subtasks" 
ON public.subtasks FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.checklist_items ci
    JOIN public.daily_checklists dc ON ci.daily_checklist_id = dc.id
    WHERE ci.id = checklist_item_id AND dc.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own subtasks" 
ON public.subtasks FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.checklist_items ci
    JOIN public.daily_checklists dc ON ci.daily_checklist_id = dc.id
    WHERE ci.id = checklist_item_id AND dc.user_id = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_checklist_templates_updated_at
  BEFORE UPDATE ON public.checklist_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_checklists_updated_at
  BEFORE UPDATE ON public.daily_checklists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_checklist_items_updated_at
  BEFORE UPDATE ON public.checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subtasks_updated_at
  BEFORE UPDATE ON public.subtasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
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

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert default checklist templates
INSERT INTO public.checklist_templates (title, description, category, priority) VALUES
('Check Server Status', 'Verify all critical servers are running and responsive', 'servers', 'critical'),
('Review Server Resources', 'Monitor CPU, memory, and disk usage on all servers', 'servers', 'high'),
('Check System Logs', 'Review server logs for errors, warnings, or anomalies', 'servers', 'medium'),
('Network Connectivity Test', 'Test internet connectivity and internal network performance', 'network', 'high'),
('Router & Switch Status', 'Check status of all network equipment and interfaces', 'network', 'medium'),
('Bandwidth Monitoring', 'Review network traffic and bandwidth utilization', 'network', 'medium'),
('Antivirus Status Check', 'Verify antivirus software is updated and running on all systems', 'security', 'high'),
('Firewall Log Review', 'Check firewall logs for suspicious activities or blocked threats', 'security', 'high'),
('Security Updates', 'Check for and install critical security patches', 'security', 'critical'),
('Backup Verification', 'Verify that all scheduled backups completed successfully', 'backup', 'critical'),
('Backup Storage Check', 'Monitor backup storage capacity and retention policies', 'backup', 'medium'),
('System Monitoring Dashboard', 'Review monitoring dashboards for alerts and anomalies', 'monitoring', 'high'),
('Performance Metrics Review', 'Analyze system performance trends and metrics', 'monitoring', 'medium'),
('Clean Temporary Files', 'Remove temporary files and clear system caches', 'maintenance', 'low'),
('Update Documentation', 'Update system documentation and maintenance logs', 'maintenance', 'low');