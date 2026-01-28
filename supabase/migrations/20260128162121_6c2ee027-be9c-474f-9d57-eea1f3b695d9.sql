-- Fix search_path for generate functions
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT
LANGUAGE sql
STABLE
SET search_path = public
AS $$
    SELECT 'INV-' || TO_CHAR(now(), 'YYYYMM') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')
$$;

CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TEXT
LANGUAGE sql
STABLE
SET search_path = public
AS $$
    SELECT 'CMP-' || TO_CHAR(now(), 'YYYYMM') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')
$$;