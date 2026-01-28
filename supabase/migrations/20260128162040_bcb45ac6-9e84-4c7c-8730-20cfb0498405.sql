-- =============================================
-- SOCIETY MANAGEMENT DATABASE SCHEMA
-- =============================================

-- 1. Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'resident', 'gatekeeper', 'committee_member');

-- 2. Create enum for bill status
CREATE TYPE public.bill_status AS ENUM ('pending', 'paid', 'overdue');

-- 3. Create enum for complaint status
CREATE TYPE public.complaint_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- 4. Create enum for complaint priority
CREATE TYPE public.complaint_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- 5. Create enum for complaint category
CREATE TYPE public.complaint_category AS ENUM ('plumbing', 'electrical', 'noise', 'maintenance', 'security', 'parking', 'other');

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- USER ROLES TABLE (SEPARATE FROM PROFILES!)
-- =============================================
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'resident',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- UNITS TABLE
-- =============================================
CREATE TABLE public.units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    block TEXT NOT NULL,
    unit_number TEXT NOT NULL,
    floor_number INTEGER,
    area_sqft NUMERIC,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_occupied BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (block, unit_number)
);

ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

-- =============================================
-- MAINTENANCE BILLS TABLE
-- =============================================
CREATE TABLE public.maintenance_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
    invoice_number TEXT NOT NULL UNIQUE,
    amount NUMERIC NOT NULL,
    billing_month DATE NOT NULL,
    due_date DATE NOT NULL,
    status bill_status NOT NULL DEFAULT 'pending',
    paid_date DATE,
    payment_method TEXT,
    late_fee NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.maintenance_bills ENABLE ROW LEVEL SECURITY;

-- =============================================
-- VISITORS TABLE
-- =============================================
CREATE TABLE public.visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    purpose TEXT NOT NULL,
    unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
    vehicle_number TEXT,
    check_in_time TIMESTAMPTZ DEFAULT now(),
    check_out_time TIMESTAMPTZ,
    pre_approved BOOLEAN DEFAULT false,
    pre_approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    logged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- =============================================
-- COMPLAINTS TABLE
-- =============================================
CREATE TABLE public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category complaint_category NOT NULL DEFAULT 'other',
    priority complaint_priority NOT NULL DEFAULT 'medium',
    status complaint_status NOT NULL DEFAULT 'open',
    unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
    submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTIONS (SECURITY DEFINER)
-- =============================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Check if current user is gatekeeper
CREATE OR REPLACE FUNCTION public.is_gatekeeper()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(auth.uid(), 'gatekeeper')
$$;

-- Check if current user is committee member
CREATE OR REPLACE FUNCTION public.is_committee_member()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(auth.uid(), 'committee_member')
$$;

-- Check if current user owns a unit
CREATE OR REPLACE FUNCTION public.is_owner_of_unit(_unit_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.units
        WHERE id = _unit_id
          AND owner_id = auth.uid()
    )
$$;

-- =============================================
-- RLS POLICIES: PROFILES
-- =============================================
CREATE POLICY "Users can view all profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

-- =============================================
-- RLS POLICIES: USER ROLES
-- =============================================
CREATE POLICY "Admins can view all roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Users can view own roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admins can manage roles"
    ON public.user_roles FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- =============================================
-- RLS POLICIES: UNITS
-- =============================================
CREATE POLICY "Admins can manage all units"
    ON public.units FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Committee members can view all units"
    ON public.units FOR SELECT
    TO authenticated
    USING (public.is_committee_member());

CREATE POLICY "Residents can view own unit"
    ON public.units FOR SELECT
    TO authenticated
    USING (owner_id = auth.uid());

CREATE POLICY "Residents can update own unit"
    ON public.units FOR UPDATE
    TO authenticated
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- =============================================
-- RLS POLICIES: MAINTENANCE BILLS
-- =============================================
CREATE POLICY "Admins can manage all bills"
    ON public.maintenance_bills FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Committee members can view all bills"
    ON public.maintenance_bills FOR SELECT
    TO authenticated
    USING (public.is_committee_member());

CREATE POLICY "Residents can view own unit bills"
    ON public.maintenance_bills FOR SELECT
    TO authenticated
    USING (public.is_owner_of_unit(unit_id));

CREATE POLICY "Residents can update own bills status"
    ON public.maintenance_bills FOR UPDATE
    TO authenticated
    USING (public.is_owner_of_unit(unit_id))
    WITH CHECK (public.is_owner_of_unit(unit_id));

-- =============================================
-- RLS POLICIES: VISITORS
-- =============================================
CREATE POLICY "Admins can manage all visitors"
    ON public.visitors FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Gatekeepers can view all visitors"
    ON public.visitors FOR SELECT
    TO authenticated
    USING (public.is_gatekeeper());

CREATE POLICY "Gatekeepers can create visitors"
    ON public.visitors FOR INSERT
    TO authenticated
    WITH CHECK (public.is_gatekeeper());

CREATE POLICY "Gatekeepers can update visitors"
    ON public.visitors FOR UPDATE
    TO authenticated
    USING (public.is_gatekeeper())
    WITH CHECK (public.is_gatekeeper());

CREATE POLICY "Residents can view visitors for own unit"
    ON public.visitors FOR SELECT
    TO authenticated
    USING (public.is_owner_of_unit(unit_id) OR pre_approved_by = auth.uid());

CREATE POLICY "Residents can pre-approve visitors for own unit"
    ON public.visitors FOR INSERT
    TO authenticated
    WITH CHECK (public.is_owner_of_unit(unit_id) AND pre_approved_by = auth.uid());

CREATE POLICY "Residents can update pre-approved visitors"
    ON public.visitors FOR UPDATE
    TO authenticated
    USING (pre_approved_by = auth.uid())
    WITH CHECK (pre_approved_by = auth.uid());

-- =============================================
-- RLS POLICIES: COMPLAINTS
-- =============================================
CREATE POLICY "Admins can manage all complaints"
    ON public.complaints FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Committee members can view all complaints"
    ON public.complaints FOR SELECT
    TO authenticated
    USING (public.is_committee_member());

CREATE POLICY "Committee members can update complaint status"
    ON public.complaints FOR UPDATE
    TO authenticated
    USING (public.is_committee_member())
    WITH CHECK (public.is_committee_member());

CREATE POLICY "Residents can view own complaints"
    ON public.complaints FOR SELECT
    TO authenticated
    USING (submitted_by = auth.uid() OR public.is_owner_of_unit(unit_id));

CREATE POLICY "Residents can create complaints for own unit"
    ON public.complaints FOR INSERT
    TO authenticated
    WITH CHECK (submitted_by = auth.uid() AND public.is_owner_of_unit(unit_id));

CREATE POLICY "Residents can update own complaints"
    ON public.complaints FOR UPDATE
    TO authenticated
    USING (submitted_by = auth.uid())
    WITH CHECK (submitted_by = auth.uid());

-- =============================================
-- TRIGGERS: Auto-update timestamps
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_units_updated_at
    BEFORE UPDATE ON public.units
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_maintenance_bills_updated_at
    BEFORE UPDATE ON public.maintenance_bills
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at
    BEFORE UPDATE ON public.complaints
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- TRIGGER: Auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    
    -- Assign default 'resident' role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'resident');
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- GENERATE INVOICE NUMBER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT
LANGUAGE sql
AS $$
    SELECT 'INV-' || TO_CHAR(now(), 'YYYYMM') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')
$$;

-- =============================================
-- GENERATE TICKET NUMBER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TEXT
LANGUAGE sql
AS $$
    SELECT 'CMP-' || TO_CHAR(now(), 'YYYYMM') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')
$$;