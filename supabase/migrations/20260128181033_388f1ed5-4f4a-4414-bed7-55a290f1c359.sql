-- Create storage bucket for complaint images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('complaint-images', 'complaint-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for complaint images
CREATE POLICY "Anyone can view complaint images"
ON storage.objects FOR SELECT
USING (bucket_id = 'complaint-images');

CREATE POLICY "Authenticated users can upload complaint images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'complaint-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own complaint images"
ON storage.objects FOR DELETE
USING (bucket_id = 'complaint-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create complaint_comments table for admin/staff comments
CREATE TABLE public.complaint_comments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create complaint_images table to track uploaded images
CREATE TABLE public.complaint_images (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    uploaded_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.complaint_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for complaint_comments
CREATE POLICY "Admins can manage all comments"
ON public.complaint_comments FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Committee members can add comments"
ON public.complaint_comments FOR INSERT
WITH CHECK (public.is_committee_member() AND user_id = auth.uid());

CREATE POLICY "Committee members can view all comments"
ON public.complaint_comments FOR SELECT
USING (public.is_committee_member());

CREATE POLICY "Residents can view comments on own complaints"
ON public.complaint_comments FOR SELECT
USING (
    NOT is_internal AND 
    EXISTS (
        SELECT 1 FROM public.complaints 
        WHERE complaints.id = complaint_comments.complaint_id 
        AND complaints.submitted_by = auth.uid()
    )
);

CREATE POLICY "Residents can add comments to own complaints"
ON public.complaint_comments FOR INSERT
WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.complaints 
        WHERE complaints.id = complaint_comments.complaint_id 
        AND complaints.submitted_by = auth.uid()
    )
);

-- RLS Policies for complaint_images
CREATE POLICY "Admins can manage all images"
ON public.complaint_images FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Users can upload images to own complaints"
ON public.complaint_images FOR INSERT
WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.complaints 
        WHERE complaints.id = complaint_images.complaint_id 
        AND complaints.submitted_by = auth.uid()
    )
);

CREATE POLICY "Users can view images on accessible complaints"
ON public.complaint_images FOR SELECT
USING (
    public.is_admin() OR 
    public.is_committee_member() OR
    EXISTS (
        SELECT 1 FROM public.complaints 
        WHERE complaints.id = complaint_images.complaint_id 
        AND complaints.submitted_by = auth.uid()
    )
);