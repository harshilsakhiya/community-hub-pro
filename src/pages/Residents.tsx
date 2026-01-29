import { useState, useEffect } from 'react';
import {
  Edit,
  Search,
  User,
  Phone,
  Home,
  UserCircle,
  Building2,
} from 'lucide-react';
import { useUnits, useBuildings, useWings } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Shadcn/ui Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

interface Resident {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  unit?: {
    id: string;
    block: string;
    unit_number: string;
    building_id: string;
    wing_id: string;
  };
}

// Form Schema - All fields mandatory
const assignUnitSchema = z.object({
  buildingId: z.string().min(1, 'Please select a building'),
  wingId: z.string().min(1, 'Please select a wing'),
  unitId: z.string().min(1, 'Please select a unit'),
});

type AssignUnitFormValues = z.infer<typeof assignUnitSchema>;

export default function Residents() {
  const [searchText, setSearchText] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [selectedWingId, setSelectedWingId] = useState<string>('');
  const { toast } = useToast();

  const { data: units } = useUnits();
  const { data: buildings } = useBuildings();
  const { data: wings } = useWings();

  const form = useForm<AssignUnitFormValues>({
    resolver: zodResolver(assignUnitSchema),
    defaultValues: {
      buildingId: '',
      wingId: '',
      unitId: '',
    },
  });

  // Watch form values for cascading selection
  const watchBuildingId = form.watch('buildingId');
  const watchWingId = form.watch('wingId');

  // Reset wing and unit when building changes
  useEffect(() => {
    if (watchBuildingId !== selectedBuildingId) {
      setSelectedBuildingId(watchBuildingId);
      form.setValue('wingId', '');
      form.setValue('unitId', '');
      setSelectedWingId('');
    }
  }, [watchBuildingId, selectedBuildingId, form]);

  // Reset unit when wing changes
  useEffect(() => {
    if (watchWingId !== selectedWingId) {
      setSelectedWingId(watchWingId);
      form.setValue('unitId', '');
    }
  }, [watchWingId, selectedWingId, form]);

  // Filter wings by selected building
  const filteredWings = wings?.filter(w => w.building_id === selectedBuildingId) || [];

  // Filter units by selected wing (and unassigned)
  const filteredUnits = units?.filter(u => 
    u.wing_id === selectedWingId && !u.owner_id
  ) || [];

  // Fetch residents with their units
  const { data: residents, isLoading, refetch } = useQuery({
    queryKey: ['residents'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get unit assignments with building and wing info
      const { data: unitData } = await supabase
        .from('units')
        .select('id, owner_id, block, unit_number, building_id, wing_id');

      return profiles.map(profile => ({
        ...profile,
        unit: unitData?.find(u => u.owner_id === profile.id),
      }));
    },
  });

  const handleAssignUnit = async (data: AssignUnitFormValues) => {
    try {
      if (selectedResident && data.unitId) {
        const { error } = await supabase
          .from('units')
          .update({ owner_id: selectedResident.id })
          .eq('id', data.unitId);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Unit assigned successfully',
        });
        setIsDialogOpen(false);
        form.reset();
        setSelectedBuildingId('');
        setSelectedWingId('');
        refetch();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign unit',
        variant: 'destructive',
      });
    }
  };

  const openAssignDialog = (resident: Resident) => {
    setSelectedResident(resident);
    form.reset({
      buildingId: '',
      wingId: '',
      unitId: '',
    });
    setSelectedBuildingId('');
    setSelectedWingId('');
    setIsDialogOpen(true);
  };

  // Get building and wing names for display
  const getBuildingName = (buildingId: string | undefined) => {
    if (!buildingId) return '';
    return buildings?.find(b => b.id === buildingId)?.name || '';
  };

  const getWingName = (wingId: string | undefined) => {
    if (!wingId) return '';
    return wings?.find(w => w.id === wingId)?.name || '';
  };

  const stats = {
    total: residents?.length || 0,
    assigned: residents?.filter(r => r.unit).length || 0,
    pending: residents?.filter(r => !r.unit).length || 0,
  };

  const filteredResidents = residents?.filter(r =>
    r.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
    r.email?.toLowerCase().includes(searchText.toLowerCase()) ||
    r.phone?.includes(searchText)
  );

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Resident Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage all residents in your society
          </p>
        </div>
      </div>

      <Separator />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <User className="h-6 w-6 text-primary" />
              </div>
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Residents</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <Home className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-3xl font-bold">{stats.assigned}</p>
              <p className="text-sm text-muted-foreground">With Units</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                <UserCircle className="h-6 w-6 text-amber-600" />
              </div>
              <p className="text-3xl font-bold">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending Assignment</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle>Residents</CardTitle>
          <CardDescription>
            List of all residents in your community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search residents by name, email, or phone..."
                className="pl-9"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resident</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Building</TableHead>
                  <TableHead>Wing</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      {Array.from({ length: 7 }).map((_, colIndex) => (
                        <TableCell key={colIndex}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredResidents?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <User className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No residents found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResidents?.map((resident) => (
                    <TableRow key={resident.id}>
                      {/* Resident Info */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={resident.avatar_url} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {resident.full_name?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{resident.full_name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{resident.email}</p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Phone */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{resident.phone || '-'}</span>
                        </div>
                      </TableCell>

                      {/* Building */}
                      <TableCell>
                        {resident.unit?.building_id ? (
                          <Badge variant="outline" className="gap-1">
                            <Building2 className="h-3 w-3" />
                            {getBuildingName(resident.unit.building_id)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>

                      {/* Wing */}
                      <TableCell>
                        {resident.unit?.wing_id ? (
                          <Badge variant="outline">
                            {getWingName(resident.unit.wing_id)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>

                      {/* Unit */}
                      <TableCell>
                        {resident.unit ? (
                          <Badge variant="secondary" className="gap-1">
                            <Home className="h-3 w-3" />
                            {resident.unit.block}-{resident.unit.unit_number}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                            Unassigned
                          </Badge>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {resident.unit ? (
                          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Pending
                          </Badge>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {!resident.unit && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => openAssignDialog(resident)}
                            >
                              <Home className="mr-2 h-3 w-3" />
                              Assign Unit
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Edit className="mr-2 h-3 w-3" />
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Assign Unit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Unit to Resident</DialogTitle>
            <DialogDescription>
              Select building, wing, and unit to assign to {selectedResident?.full_name || selectedResident?.email}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAssignUnit)} className="space-y-4">
              {/* Resident Info */}
              <div className="space-y-2">
                <FormLabel>Resident</FormLabel>
                <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedResident?.avatar_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {selectedResident?.full_name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{selectedResident?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{selectedResident?.email}</p>
                  </div>
                </div>
              </div>

              {/* Building Selection */}
              <FormField
                control={form.control}
                name="buildingId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Building *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a building" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {buildings?.map(building => (
                          <SelectItem key={building.id} value={building.id}>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              {building.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Wing Selection */}
              <FormField
                control={form.control}
                name="wingId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wing *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={!selectedBuildingId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={selectedBuildingId ? "Select a wing" : "Select a building first"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredWings.length === 0 ? (
                          <SelectItem value="no-wings" disabled>
                            No wings available
                          </SelectItem>
                        ) : (
                          filteredWings.map(wing => (
                            <SelectItem key={wing.id} value={wing.id}>
                              {wing.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Unit Selection */}
              <FormField
                control={form.control}
                name="unitId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={!selectedWingId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={selectedWingId ? "Select a unit" : "Select a wing first"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredUnits.length === 0 ? (
                          <SelectItem value="no-units" disabled>
                            No available units
                          </SelectItem>
                        ) : (
                          filteredUnits.map(unit => (
                            <SelectItem key={unit.id} value={unit.id}>
                              <div className="flex items-center gap-2">
                                <Home className="h-4 w-4" />
                                {unit.block}-{unit.unit_number}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Assign Unit</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
