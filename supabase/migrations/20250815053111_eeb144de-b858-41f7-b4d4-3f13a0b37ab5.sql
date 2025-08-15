-- Create case_reports table for storing disease outbreak reports
CREATE TABLE public.case_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  village TEXT NOT NULL,
  mandal TEXT NOT NULL,
  district TEXT NOT NULL,
  age_group TEXT NOT NULL CHECK (age_group IN ('0-5', '6-18', '19-45', '46-60', '60+')),
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  symptoms TEXT[] NOT NULL,
  notes TEXT,
  reporter_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.case_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for case reports
CREATE POLICY "Anyone can view case reports" 
ON public.case_reports 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create case reports" 
ON public.case_reports 
FOR INSERT 
WITH CHECK (true);

-- Only authenticated users (admins) can update/delete
CREATE POLICY "Authenticated users can update case reports" 
ON public.case_reports 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete case reports" 
ON public.case_reports 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_case_reports_updated_at
BEFORE UPDATE ON public.case_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create admin_users table for simple admin authentication
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for admin users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admin users policies
CREATE POLICY "Admin users can view their own record" 
ON public.admin_users 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admin users can insert their own record" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);