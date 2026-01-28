import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

// Types
export interface Society {
  id: string;
  name: string;
  address: string | null;
  city: string;
  state: string;
  pincode: string;
  registration_number: string | null;
  total_buildings: number;
  total_units: number;
  maintenance_amount: number;
  maintenance_due_day: number;
  late_fee_percentage: number;
  contact_email: string | null;
  contact_phone: string | null;
  logo_url: string | null;
  admin_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSocietyInput {
  name: string;
  address?: string;
  city: string;
  state: string;
  pincode: string;
  registration_number?: string;
  maintenance_amount?: number;
  maintenance_due_day?: number;
  late_fee_percentage?: number;
  contact_email?: string;
  contact_phone?: string;
}

// Fetch all societies
export function useSocieties() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['societies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('societies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Society[];
    },
    enabled: !!user,
  });
}

// Create society
export function useCreateSociety() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: CreateSocietyInput) => {
      const { data: society, error } = await supabase
        .from('societies')
        .insert({
          ...data,
          admin_id: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return society;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['societies'] });
      toast({ title: 'Success', description: 'Society created successfully' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
}

// Update society
export function useUpdateSociety() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Society> & { id: string }) => {
      const { error } = await supabase
        .from('societies')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['societies'] });
      toast({ title: 'Success', description: 'Society updated successfully' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
}

// Add building to society
export function useAddBuildingToSociety() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      address?: string;
      total_floors: number;
      society_id: string;
    }) => {
      const { data: building, error } = await supabase
        .from('buildings')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update society's total_buildings count
      const { data: buildings } = await supabase
        .from('buildings')
        .select('id')
        .eq('society_id', data.society_id);
      
      await supabase
        .from('societies')
        .update({ total_buildings: buildings?.length || 0 })
        .eq('id', data.society_id);
      
      return building;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      queryClient.invalidateQueries({ queryKey: ['societies'] });
      toast({ title: 'Success', description: 'Building added successfully' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
}

// Add wing/block to building
export function useAddWingToBuilding() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      building_id: string;
      total_units?: number;
    }) => {
      const { data: wing, error } = await supabase
        .from('wings')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return wing;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wings'] });
      toast({ title: 'Success', description: 'Wing/Block added successfully' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
}

// Add unit/flat
export function useAddUnit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: {
      unit_number: string;
      block: string;
      floor_number: number;
      unit_type?: string;
      area_sqft?: number;
      building_id?: string;
      wing_id?: string;
    }) => {
      const { data: unit, error } = await supabase
        .from('units')
        .insert({
          ...data,
          is_occupied: false,
          occupancy_type: 'vacant',
        })
        .select()
        .single();
      
      if (error) throw error;
      return unit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      queryClient.invalidateQueries({ queryKey: ['societies'] });
      toast({ title: 'Success', description: 'Unit/Flat added successfully' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
}

// Bulk add units for a floor
export function useBulkAddUnits() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: {
      building_id: string;
      wing_id?: string;
      block: string;
      floor_number: number;
      units_per_floor: number;
      unit_type?: string;
      area_sqft?: number;
    }) => {
      const units = [];
      for (let i = 1; i <= data.units_per_floor; i++) {
        units.push({
          unit_number: `${data.floor_number}${String(i).padStart(2, '0')}`,
          block: data.block,
          floor_number: data.floor_number,
          unit_type: data.unit_type || '2BHK',
          area_sqft: data.area_sqft,
          building_id: data.building_id,
          wing_id: data.wing_id,
          is_occupied: false,
          occupancy_type: 'vacant',
        });
      }
      
      const { error } = await supabase
        .from('units')
        .insert(units);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      toast({ title: 'Success', description: 'Floor units created successfully' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
}

// Assign resident to unit
export function useAssignResident() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: {
      unit_id: string;
      resident_id?: string;
      owner_id?: string;
      occupancy_type: 'owner' | 'tenant' | 'vacant';
      move_in_date?: string;
    }) => {
      const updateData: Record<string, unknown> = {
        occupancy_type: data.occupancy_type,
        is_occupied: data.occupancy_type !== 'vacant',
      };
      
      if (data.resident_id) {
        updateData.resident_id = data.resident_id;
      }
      if (data.owner_id) {
        updateData.owner_id = data.owner_id;
      }
      if (data.move_in_date) {
        updateData.move_in_date = data.move_in_date;
      }
      if (data.occupancy_type === 'vacant') {
        updateData.resident_id = null;
        updateData.move_out_date = new Date().toISOString().split('T')[0];
      }
      
      const { error } = await supabase
        .from('units')
        .update(updateData)
        .eq('id', data.unit_id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({ title: 'Success', description: 'Resident assignment updated' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });
}

// Fetch units with extended info
export function useUnitsWithResidents() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['units-with-residents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select(`
          *,
          buildings (id, name),
          wings (id, name)
        `)
        .order('block')
        .order('floor_number')
        .order('unit_number');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

// Fetch all profiles (for resident assignment dropdown)
export function useAllProfiles() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['all-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .order('full_name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
