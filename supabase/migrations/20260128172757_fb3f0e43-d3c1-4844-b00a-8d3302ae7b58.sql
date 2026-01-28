-- Create buildings table for society buildings
CREATE TABLE public.buildings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    total_floors INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wings table for building wings
CREATE TABLE public.wings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    building_id UUID REFERENCES public.buildings(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    total_units INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(building_id, name)
);

-- Add building_id and wing_id to units table
ALTER TABLE public.units 
ADD COLUMN IF NOT EXISTS building_id UUID REFERENCES public.buildings(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS wing_id UUID REFERENCES public.wings(id) ON DELETE SET NULL;

-- Enable RLS on new tables
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wings ENABLE ROW LEVEL SECURITY;

-- Buildings RLS policies
CREATE POLICY "Admins can manage all buildings" 
ON public.buildings FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

CREATE POLICY "Authenticated users can view buildings" 
ON public.buildings FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Wings RLS policies
CREATE POLICY "Admins can manage all wings" 
ON public.wings FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

CREATE POLICY "Authenticated users can view wings" 
ON public.wings FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Add phone_verified column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;

-- Create triggers for updated_at
CREATE TRIGGER update_buildings_updated_at
BEFORE UPDATE ON public.buildings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wings_updated_at
BEFORE UPDATE ON public.wings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();