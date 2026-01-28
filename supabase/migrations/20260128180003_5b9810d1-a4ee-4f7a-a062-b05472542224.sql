-- Create societies table
CREATE TABLE public.societies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    registration_number TEXT UNIQUE,
    total_buildings INTEGER DEFAULT 0,
    total_units INTEGER DEFAULT 0,
    maintenance_amount NUMERIC DEFAULT 0,
    maintenance_due_day INTEGER DEFAULT 10,
    late_fee_percentage NUMERIC DEFAULT 2,
    contact_email TEXT,
    contact_phone TEXT,
    logo_url TEXT,
    admin_id UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add society_id to buildings table
ALTER TABLE public.buildings ADD COLUMN society_id UUID REFERENCES public.societies(id);

-- Add unit_type and better floor tracking to units
ALTER TABLE public.units ADD COLUMN unit_type TEXT DEFAULT '2BHK';
ALTER TABLE public.units ADD COLUMN resident_id UUID REFERENCES auth.users(id);
ALTER TABLE public.units ADD COLUMN occupancy_type TEXT DEFAULT 'vacant' CHECK (occupancy_type IN ('owner', 'tenant', 'vacant'));
ALTER TABLE public.units ADD COLUMN move_in_date DATE;
ALTER TABLE public.units ADD COLUMN move_out_date DATE;

-- Enable RLS on societies
ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
CREATE TRIGGER update_societies_updated_at
    BEFORE UPDATE ON public.societies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for societies - Admin only management
CREATE POLICY "Admins can manage all societies"
    ON public.societies FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "Authenticated users can view societies"
    ON public.societies FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Update buildings policies to include society context
CREATE POLICY "Admins can manage buildings in their society"
    ON public.buildings FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- Update units to allow admin to assign residents
DROP POLICY IF EXISTS "Admins can manage all units" ON public.units;
CREATE POLICY "Admins can fully manage all units"
    ON public.units FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());