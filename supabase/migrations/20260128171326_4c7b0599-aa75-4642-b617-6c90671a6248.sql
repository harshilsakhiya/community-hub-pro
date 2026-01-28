-- Create vehicles table for vehicle management
CREATE TABLE public.vehicles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL,
    vehicle_number TEXT NOT NULL UNIQUE,
    vehicle_type TEXT NOT NULL DEFAULT 'car',
    make TEXT,
    model TEXT,
    color TEXT,
    parking_slot TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notices table for notice board
CREATE TABLE public.notices (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    priority TEXT NOT NULL DEFAULT 'normal',
    is_pinned BOOLEAN DEFAULT false,
    publish_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expiry_date TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- Vehicles RLS policies
CREATE POLICY "Admins can manage all vehicles"
ON public.vehicles FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Gatekeepers can view all vehicles"
ON public.vehicles FOR SELECT
USING (public.is_gatekeeper());

CREATE POLICY "Residents can view own vehicles"
ON public.vehicles FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Residents can create own vehicles"
ON public.vehicles FOR INSERT
WITH CHECK (owner_id = auth.uid() AND public.is_owner_of_unit(unit_id));

CREATE POLICY "Residents can update own vehicles"
ON public.vehicles FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Residents can delete own vehicles"
ON public.vehicles FOR DELETE
USING (owner_id = auth.uid());

-- Notices RLS policies
CREATE POLICY "Anyone authenticated can view notices"
ON public.notices FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage all notices"
ON public.notices FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Committee members can create notices"
ON public.notices FOR INSERT
WITH CHECK (public.is_committee_member() AND created_by = auth.uid());

CREATE POLICY "Committee members can update own notices"
ON public.notices FOR UPDATE
USING (public.is_committee_member() AND created_by = auth.uid())
WITH CHECK (public.is_committee_member() AND created_by = auth.uid());

-- Create triggers for updated_at
CREATE TRIGGER update_vehicles_updated_at
BEFORE UPDATE ON public.vehicles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notices_updated_at
BEFORE UPDATE ON public.notices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();