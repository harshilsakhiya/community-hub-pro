-- Create contact form submissions table
CREATE TABLE public.contact_submissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    society_name TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create demo requests table
CREATE TABLE public.demo_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    society_name TEXT NOT NULL,
    total_units INTEGER,
    city TEXT,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public forms)
CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can request demo" ON public.demo_requests FOR INSERT WITH CHECK (true);

-- Only admins can view submissions
CREATE POLICY "Admins can view contact submissions" ON public.contact_submissions FOR SELECT USING (is_admin());
CREATE POLICY "Admins can view demo requests" ON public.demo_requests FOR SELECT USING (is_admin());