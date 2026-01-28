import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

// Dashboard Stats Hook
export function useDashboardStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch units
      const { data: units, error: unitsError } = await supabase
        .from('units')
        .select('id, is_occupied');
      
      if (unitsError) throw unitsError;
      
      const totalUnits = units?.length || 0;
      const occupiedUnits = units?.filter(u => u.is_occupied)?.length || 0;
      const vacantUnits = totalUnits - occupiedUnits;
      
      // Fetch bills
      const { data: bills, error: billsError } = await supabase
        .from('maintenance_bills')
        .select('status, amount, late_fee');
      
      if (billsError) throw billsError;
      
      const pendingBills = bills?.filter(b => b.status === 'pending')?.length || 0;
      const overdueBills = bills?.filter(b => b.status === 'overdue')?.length || 0;
      const totalCollection = bills?.filter(b => b.status === 'paid')
        ?.reduce((sum, b) => sum + Number(b.amount) + Number(b.late_fee || 0), 0) || 0;
      const pendingAmount = bills?.filter(b => b.status !== 'paid')
        ?.reduce((sum, b) => sum + Number(b.amount) + Number(b.late_fee || 0), 0) || 0;
      
      // Fetch complaints
      const { data: complaints, error: complaintsError } = await supabase
        .from('complaints')
        .select('status');
      
      if (complaintsError) throw complaintsError;
      
      const openComplaints = complaints?.filter(c => c.status === 'open')?.length || 0;
      
      // Fetch today's visitors
      const { data: visitors, error: visitorsError } = await supabase
        .from('visitors')
        .select('id, check_in_time, check_out_time')
        .gte('created_at', today);
      
      if (visitorsError) throw visitorsError;
      
      const todayVisitors = visitors?.length || 0;
      const currentlyInside = visitors?.filter(v => v.check_in_time && !v.check_out_time)?.length || 0;
      
      return {
        totalUnits,
        occupiedUnits,
        vacantUnits,
        pendingBills,
        overdueBills,
        totalCollection,
        pendingAmount,
        openComplaints,
        todayVisitors,
        currentlyInside,
      };
    },
    enabled: !!user,
  });
}

// Bills Hook
export function useBills(filters?: { status?: 'pending' | 'paid' | 'overdue'; month?: string }) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['bills', filters],
    queryFn: async () => {
      let query = supabase
        .from('maintenance_bills')
        .select(`
          *,
          units (
            id,
            unit_number,
            block
          )
        `)
        .order('created_at', { ascending: false });
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useBillStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['bill-stats'],
    queryFn: async () => {
      const { data: bills, error } = await supabase
        .from('maintenance_bills')
        .select('status, amount, late_fee');
      
      if (error) throw error;
      
      const totalBilled = bills?.reduce((sum, b) => sum + Number(b.amount) + Number(b.late_fee || 0), 0) || 0;
      const collected = bills?.filter(b => b.status === 'paid' as const)
        ?.reduce((sum, b) => sum + Number(b.amount) + Number(b.late_fee || 0), 0) || 0;
      const pending = bills?.filter(b => b.status === 'pending' as const)
        ?.reduce((sum, b) => sum + Number(b.amount) + Number(b.late_fee || 0), 0) || 0;
      const overdue = bills?.filter(b => b.status === 'overdue' as const)
        ?.reduce((sum, b) => sum + Number(b.amount) + Number(b.late_fee || 0), 0) || 0;
      
      return { totalBilled, collected, pending, overdue };
    },
    enabled: !!user,
  });
}

export function useMarkBillPaid() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ billId, paymentMethod }: { billId: string; paymentMethod: string }) => {
      const { error } = await supabase
        .from('maintenance_bills')
        .update({
          status: 'paid',
          paid_date: new Date().toISOString().split('T')[0],
          payment_method: paymentMethod,
        })
        .eq('id', billId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['bill-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({ title: 'Success', description: 'Bill marked as paid' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
}

// Complaints Hook
type ComplaintStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type ComplaintCategory = 'plumbing' | 'electrical' | 'noise' | 'maintenance' | 'security' | 'parking' | 'other';
type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';

export function useComplaints(filters?: { status?: ComplaintStatus; category?: ComplaintCategory }) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['complaints', filters],
    queryFn: async () => {
      let query = supabase
        .from('complaints')
        .select(`
          *,
          units (
            id,
            unit_number,
            block
          )
        `)
        .order('created_at', { ascending: false });
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useComplaintStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['complaint-stats'],
    queryFn: async () => {
      const { data: complaints, error } = await supabase
        .from('complaints')
        .select('status');
      
      if (error) throw error;
      
      const open = complaints?.filter(c => c.status === 'open' as const)?.length || 0;
      const inProgress = complaints?.filter(c => c.status === 'in_progress' as const)?.length || 0;
      const resolved = complaints?.filter(c => c.status === 'resolved' as const || c.status === 'closed' as const)?.length || 0;
      
      return { open, inProgress, resolved };
    },
    enabled: !!user,
  });
}

export function useCreateComplaint() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      category: ComplaintCategory;
      priority: ComplaintPriority;
      unitId: string;
    }) => {
      const ticketNumber = `CMP-${Date.now().toString().slice(-6)}`;
      
      const { error } = await supabase
        .from('complaints')
        .insert({
          title: data.title,
          description: data.description,
          category: data.category,
          priority: data.priority,
          unit_id: data.unitId,
          ticket_number: ticketNumber,
          submitted_by: user?.id || '',
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaint-stats'] });
      toast({ title: 'Success', description: 'Complaint submitted successfully' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
}

export function useUpdateComplaintStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ complaintId, status, resolutionNotes }: { 
      complaintId: string; 
      status: string;
      resolutionNotes?: string;
    }) => {
      const updateData: Record<string, string | null> = { status };
      if (resolutionNotes) {
        updateData.resolution_notes = resolutionNotes;
      }
      if (status === 'resolved' || status === 'closed') {
        updateData.resolved_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('complaints')
        .update(updateData)
        .eq('id', complaintId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaint-stats'] });
      toast({ title: 'Success', description: 'Complaint status updated' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
}

// Visitors Hook
export function useVisitors(filters?: { date?: string }) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['visitors', filters],
    queryFn: async () => {
      let query = supabase
        .from('visitors')
        .select(`
          *,
          units (
            id,
            unit_number,
            block
          )
        `)
        .order('created_at', { ascending: false });
      
      if (filters?.date) {
        query = query.gte('created_at', filters.date);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useVisitorStats() {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['visitor-stats'],
    queryFn: async () => {
      const { data: visitors, error } = await supabase
        .from('visitors')
        .select('id, check_in_time, check_out_time, pre_approved')
        .gte('created_at', today);
      
      if (error) throw error;
      
      const insideNow = visitors?.filter(v => v.check_in_time && !v.check_out_time)?.length || 0;
      const todayEntries = visitors?.filter(v => v.check_in_time)?.length || 0;
      const todayExits = visitors?.filter(v => v.check_out_time)?.length || 0;
      const preApproved = visitors?.filter(v => v.pre_approved)?.length || 0;
      
      return { insideNow, todayEntries, todayExits, preApproved };
    },
    enabled: !!user,
  });
}

export function useCreateVisitor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      phone?: string;
      purpose: string;
      unitId: string;
      vehicleNumber?: string;
      preApproved?: boolean;
    }) => {
      const { error } = await supabase
        .from('visitors')
        .insert({
          name: data.name,
          phone: data.phone,
          purpose: data.purpose,
          unit_id: data.unitId,
          vehicle_number: data.vehicleNumber,
          pre_approved: data.preApproved || false,
          pre_approved_by: data.preApproved ? user?.id : null,
          logged_by: user?.id,
          check_in_time: new Date().toISOString(),
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
      queryClient.invalidateQueries({ queryKey: ['visitor-stats'] });
      toast({ title: 'Success', description: 'Visitor registered successfully' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
}

export function useCheckOutVisitor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (visitorId: string) => {
      const { error } = await supabase
        .from('visitors')
        .update({ check_out_time: new Date().toISOString() })
        .eq('id', visitorId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitors'] });
      queryClient.invalidateQueries({ queryKey: ['visitor-stats'] });
      toast({ title: 'Success', description: 'Visitor checked out' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
}

// Notices Hook
export function useNotices(filters?: { category?: string; pinned?: boolean }) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['notices', filters],
    queryFn: async () => {
      let query = supabase
        .from('notices')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.pinned !== undefined) {
        query = query.eq('is_pinned', filters.pinned);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateNotice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      category?: string;
      priority?: string;
      expiryDate?: string;
    }) => {
      const { error } = await supabase
        .from('notices')
        .insert({
          title: data.title,
          content: data.content,
          category: data.category || 'general',
          priority: data.priority || 'normal',
          expiry_date: data.expiryDate,
          created_by: user?.id,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      toast({ title: 'Success', description: 'Notice posted successfully' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
}

export function useToggleNoticePin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ noticeId, isPinned }: { noticeId: string; isPinned: boolean }) => {
      const { error } = await supabase
        .from('notices')
        .update({ is_pinned: !isPinned })
        .eq('id', noticeId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      toast({ title: 'Success', description: 'Notice pin status updated' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
}

// Vehicles Hook
export function useVehicles() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          units (
            id,
            unit_number,
            block
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      vehicleNumber: string;
      vehicleType: string;
      make?: string;
      model?: string;
      color?: string;
      unitId: string;
    }) => {
      const { error } = await supabase
        .from('vehicles')
        .insert({
          vehicle_number: data.vehicleNumber,
          vehicle_type: data.vehicleType,
          make: data.make,
          model: data.model,
          color: data.color,
          unit_id: data.unitId,
          owner_id: user?.id,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast({ title: 'Success', description: 'Vehicle registered successfully' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
}

// Units Hook
export function useUnits() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select(`
          *,
          buildings (id, name),
          wings (id, name)
        `)
        .order('block')
        .order('unit_number');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

// Buildings Hook
export function useBuildings() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['buildings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buildings')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateBuilding() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      address?: string;
      totalFloors?: number;
    }) => {
      const { error } = await supabase
        .from('buildings')
        .insert({
          name: data.name,
          address: data.address,
          total_floors: data.totalFloors || 1,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      toast({ title: 'Success', description: 'Building created successfully' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
}

// Wings Hook
export function useWings(buildingId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['wings', buildingId],
    queryFn: async () => {
      let query = supabase
        .from('wings')
        .select('*')
        .order('name');
      
      if (buildingId) {
        query = query.eq('building_id', buildingId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateWing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      buildingId: string;
      totalUnits?: number;
    }) => {
      const { error } = await supabase
        .from('wings')
        .insert({
          name: data.name,
          building_id: data.buildingId,
          total_units: data.totalUnits || 0,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wings'] });
      toast({ title: 'Success', description: 'Wing created successfully' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: {
      unitNumber: string;
      block: string;
      floorNumber?: number;
      areaSqft?: number;
      buildingId?: string;
      wingId?: string;
    }) => {
      const { error } = await supabase
        .from('units')
        .insert({
          unit_number: data.unitNumber,
          block: data.block,
          floor_number: data.floorNumber,
          area_sqft: data.areaSqft,
          building_id: data.buildingId,
          wing_id: data.wingId,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({ title: 'Success', description: 'Unit created successfully' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
}

// Recent Activity Hook
export function useRecentActivity() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const activities: Array<{
        id: string;
        type: string;
        message: string;
        time: string;
      }> = [];
      
      // Get recent bills
      const { data: bills } = await supabase
        .from('maintenance_bills')
        .select('id, status, paid_date, units(unit_number, block)')
        .eq('status', 'paid')
        .order('paid_date', { ascending: false })
        .limit(3);
      
      bills?.forEach(bill => {
        if (bill.units) {
          activities.push({
            id: `bill-${bill.id}`,
            type: 'payment',
            message: `Unit ${bill.units.block}-${bill.units.unit_number} paid maintenance`,
            time: bill.paid_date ? new Date(bill.paid_date).toLocaleDateString() : 'Recently',
          });
        }
      });
      
      // Get recent visitors
      const { data: visitors } = await supabase
        .from('visitors')
        .select('id, name, created_at, units(unit_number, block)')
        .order('created_at', { ascending: false })
        .limit(3);
      
      visitors?.forEach(visitor => {
        if (visitor.units) {
          activities.push({
            id: `visitor-${visitor.id}`,
            type: 'visitor',
            message: `${visitor.name} visited Unit ${visitor.units.block}-${visitor.units.unit_number}`,
            time: new Date(visitor.created_at).toLocaleDateString(),
          });
        }
      });
      
      // Get recent complaints
      const { data: complaints } = await supabase
        .from('complaints')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(3);
      
      complaints?.forEach(complaint => {
        activities.push({
          id: `complaint-${complaint.id}`,
          type: 'complaint',
          message: `New complaint: ${complaint.title.substring(0, 40)}...`,
          time: new Date(complaint.created_at).toLocaleDateString(),
        });
      });
      
      // Sort by time and return top 5
      return activities.slice(0, 5);
    },
    enabled: !!user,
  });
}

// Complaint Details Hook
export function useComplaintDetails(complaintId: string | null) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['complaint-details', complaintId],
    queryFn: async () => {
      if (!complaintId) return null;
      
      const { data: complaint, error } = await supabase
        .from('complaints')
        .select(`
          *,
          units (id, unit_number, block)
        `)
        .eq('id', complaintId)
        .maybeSingle();
      
      if (error) throw error;
      if (!complaint) return null;
      
      // Fetch images separately
      const { data: images } = await supabase
        .from('complaint_images')
        .select('*')
        .eq('complaint_id', complaintId)
        .order('created_at', { ascending: true });
      
      return {
        ...complaint,
        images: images || [],
      };
    },
    enabled: !!user && !!complaintId,
  });
}

// Complaint Comments Hook
export function useComplaintComments(complaintId: string | null) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['complaint-comments', complaintId],
    queryFn: async () => {
      if (!complaintId) return [];
      
      // Fetch comments
      const { data: comments, error } = await supabase
        .from('complaint_comments')
        .select('*')
        .eq('complaint_id', complaintId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      if (!comments || comments.length === 0) return [];
      
      // Fetch user profiles for comments
      const userIds = [...new Set(comments.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return comments.map(comment => ({
        ...comment,
        profiles: profileMap.get(comment.user_id) || null,
      }));
    },
    enabled: !!user && !!complaintId,
  });
}

// Add Complaint Comment Hook
export function useAddComplaintComment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      complaintId: string;
      comment: string;
      isInternal?: boolean;
    }) => {
      const { error } = await supabase
        .from('complaint_comments')
        .insert({
          complaint_id: data.complaintId,
          user_id: user?.id || '',
          comment: data.comment,
          is_internal: data.isInternal || false,
        });
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['complaint-comments', variables.complaintId] });
      toast({ title: 'Success', description: 'Comment added' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
}

// Create Complaint with Images Hook
export function useCreateComplaintWithImages() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      category: 'plumbing' | 'electrical' | 'noise' | 'maintenance' | 'security' | 'parking' | 'other';
      priority: 'low' | 'medium' | 'high' | 'urgent';
      unitId: string;
      images?: File[];
    }) => {
      const ticketNumber = `CMP-${Date.now().toString().slice(-6)}`;
      
      // Create the complaint first
      const { data: complaint, error: complaintError } = await supabase
        .from('complaints')
        .insert({
          title: data.title,
          description: data.description,
          category: data.category,
          priority: data.priority,
          unit_id: data.unitId,
          ticket_number: ticketNumber,
          submitted_by: user?.id || '',
        })
        .select('id')
        .single();
      
      if (complaintError) throw complaintError;
      
      // Upload images if any
      if (data.images && data.images.length > 0) {
        for (const file of data.images) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user?.id}/${complaint.id}/${Date.now()}.${fileExt}`;
          
          // Upload to storage
          const { error: uploadError } = await supabase.storage
            .from('complaint-images')
            .upload(fileName, file);
          
          if (uploadError) {
            console.error('Image upload failed:', uploadError);
            continue;
          }
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('complaint-images')
            .getPublicUrl(fileName);
          
          // Save image record
          await supabase
            .from('complaint_images')
            .insert({
              complaint_id: complaint.id,
              image_url: urlData.publicUrl,
              file_name: file.name,
              uploaded_by: user?.id || '',
            });
        }
      }
      
      return complaint;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaint-stats'] });
      toast({ title: 'Success', description: 'Complaint submitted successfully' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
}
