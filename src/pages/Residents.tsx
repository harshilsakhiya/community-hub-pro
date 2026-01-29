import { useState } from 'react';
import {
  Plus,
  Edit,
  Search,
  User,
  Phone,
  Mail,
  Home,
  UserCircle,
} from 'lucide-react';
import { useUnits } from '@/hooks/useSupabaseData';
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
  DialogTrigger,
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
  };
}

// Form Schema
const assignUnitSchema = z.object({
  unitId: z.string().min(1, 'Please select a unit'),
});

type AssignUnitFormValues = z.infer<typeof assignUnitSchema>;

export default function Residents() {
  const [searchText, setSearchText] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const { toast } = useToast();

  const { data: units } = useUnits();

  const form = useForm<AssignUnitFormValues>({
    resolver: zodResolver(assignUnitSchema),
    defaultValues: {
      unitId: '',
    },
  });

  // Fetch residents with their units
  const { data: residents, isLoading, refetch } = useQuery({
    queryKey: ['residents'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get unit assignments
      const { data: unitData } = await supabase
        .from('units')
        .select('id, owner_id, block, unit_number');

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

  const columns = [
    {
      header: 'Resident',
      cell: ({ row }: any) => {
        const resident = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={resident.avatar_url} />
              <AvatarFallback className="bg-[#2d9676] text-white">
                {resident.full_name?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{resident.full_name || 'Unknown'}</p>
              <p className="text-xs text-gray-500">
                {resident.email}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Phone',
      accessorKey: 'phone',
      cell: ({ row }: any) => {
        const phone = row.getValue('phone');
        return (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-400" />
            <span>{phone || '-'}</span>
          </div>
        );
      },
    },
    {
      header: 'Unit',
      cell: ({ row }: any) => {
        const resident = row.original;
        return resident.unit ? (
          <Badge variant="secondary" className="gap-1">
            <Home className="h-3 w-3" />
            {resident.unit.block}-{resident.unit.unit_number}
          </Badge>
        ) : (
          <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
            Unassigned
          </Badge>
        );
      },
    },
    {
      header: 'Status',
      cell: ({ row }: any) => {
        const resident = row.original;
        return resident.unit ? (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
            Active
          </Badge>
        ) : (
          <Badge variant="outline" className="text-gray-600">
            Pending
          </Badge>
        );
      },
    },
    {
      header: 'Actions',
      cell: ({ row }: any) => {
        const resident = row.original;
        return (
          <div className="flex items-center gap-2">
            {!resident.unit && (
              <Button
                size="sm"
                variant="default"
                onClick={() => {
                  setSelectedResident(resident);
                  form.reset();
                  setIsDialogOpen(true);
                }}
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
        );
      },
    },
  ];

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
          <p className="text-sm text-gray-500 mt-1">
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
              <div className="w-12 h-12 rounded-full bg-[#2d9676]/10 flex items-center justify-center mb-3">
                <User className="h-6 w-6 text-[#2d9676]" />
              </div>
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Residents</p>
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
              <p className="text-sm text-gray-500">With Units</p>
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
              <p className="text-sm text-gray-500">Pending Assignment</p>
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
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
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
                  {columns.map((column) => (
                    <TableHead key={column.header}>
                      {column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      {columns.map((_, colIndex) => (
                        <TableCell key={colIndex}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredResidents?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <User className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No residents found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResidents?.map((resident) => (
                    <TableRow key={resident.id}>
                      {columns.map((column) => (
                        <TableCell key={column.header}>
                          {column.cell ? column.cell({ row: { original: resident, getValue: (key: string) => resident[key as keyof typeof resident] } }) :
                            resident[column.accessorKey as keyof typeof resident] || '-'}
                        </TableCell>
                      ))}
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Unit to Resident</DialogTitle>
            <DialogDescription>
              Select a unit to assign to {selectedResident?.full_name || selectedResident?.email}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAssignUnit)} className="space-y-4">
              <div className="space-y-2">
                <FormLabel>Resident</FormLabel>
                <div className="flex items-center gap-3 p-3 border rounded-md">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedResident?.avatar_url} />
                    <AvatarFallback className="bg-[#2d9676] text-white">
                      {selectedResident?.full_name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{selectedResident?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{selectedResident?.email}</p>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="unitId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Unit *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {units
                          ?.filter(u => !u.owner_id)
                          .map(u => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.block}-{u.unit_number}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">Assign Unit</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}