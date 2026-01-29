import { useState } from 'react';
import {
  Plus,
  Search,
  Car,
  Edit,
  Trash2,
} from 'lucide-react';
import { useVehicles, useUnits } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

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
  FormDescription,
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
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Form Schema
const vehicleFormSchema = z.object({
  vehicleNumber: z.string().min(1, 'Vehicle number is required'),
  vehicleType: z.enum(['car', 'bike', 'scooter', 'other']),
  make: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
  parkingSlot: z.string().optional(),
  unitId: z.string().min(1, 'Unit is required'),
});

type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

export default function Vehicles() {
  const [searchText, setSearchText] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: vehicles, isLoading } = useVehicles();
  const { data: units } = useUnits();

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      vehicleNumber: '',
      vehicleType: 'car',
      make: '',
      model: '',
      color: '',
      parkingSlot: '',
      unitId: '',
    },
  });

  const createVehicleMutation = useMutation({
    mutationFn: async (values: VehicleFormValues) => {
      const { error } = await supabase.from('vehicles').insert({
        vehicle_number: values.vehicleNumber.toUpperCase(),
        vehicle_type: values.vehicleType,
        make: values.make,
        model: values.model,
        color: values.color,
        parking_slot: values.parkingSlot,
        unit_id: values.unitId,
        owner_id: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast({
        title: 'Success',
        description: 'Vehicle registered successfully',
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to register vehicle',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: VehicleFormValues) => {
    createVehicleMutation.mutate(data);
  };

  const columns = [
    {
      header: 'Vehicle',
      cell: ({ row }: any) => {
        const vehicle = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Car className="h-5 w-5 text-[#1e3a5f]" />
            </div>
            <div>
              <p className="font-medium text-sm">{vehicle.vehicle_number}</p>
              <p className="text-xs text-gray-500">
                {vehicle.make} {vehicle.model}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Type',
      accessorKey: 'vehicle_type',
      cell: ({ row }: any) => {
        const type = row.getValue('vehicle_type');
        const typeColors = {
          car: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
          bike: 'bg-green-100 text-green-800 hover:bg-green-100',
          scooter: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
          other: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
        };
        return (
          <Badge className={typeColors[type as keyof typeof typeColors]}>
            {String(type).charAt(0).toUpperCase() + String(type).slice(1)}
          </Badge>
        );
      },
    },
    {
      header: 'Color',
      accessorKey: 'color',
      cell: ({ row }: any) => {
        const color = row.getValue('color');
        return color || <span className="text-gray-400">-</span>;
      },
    },
    {
      header: 'Parking Slot',
      accessorKey: 'parking_slot',
      cell: ({ row }: any) => {
        const slot = row.getValue('parking_slot');
        return slot ? <Badge variant="outline">{slot}</Badge> : <span className="text-gray-400">-</span>;
      },
    },
    {
      header: 'Unit',
      cell: ({ row }: any) => {
        const vehicle = row.original;
        return vehicle.units ? (
          <Badge variant="secondary">
            {vehicle.units.block}-{vehicle.units.unit_number}
          </Badge>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      header: 'Status',
      accessorKey: 'is_active',
      cell: ({ row }: any) => {
        const active = row.getValue('is_active');
        return (
          <Badge variant={active ? 'default' : 'destructive'}>
            {active ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      header: 'Actions',
      cell: () => (
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const stats = {
    total: vehicles?.length || 0,
    cars: vehicles?.filter(v => v.vehicle_type === 'car').length || 0,
    bikes: vehicles?.filter(v => v.vehicle_type === 'bike').length || 0,
    active: vehicles?.filter(v => v.is_active).length || 0,
  };

  const filteredVehicles = vehicles?.filter(v =>
    v.vehicle_number.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Vehicle Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Register and manage resident vehicles
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Register Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Register New Vehicle</DialogTitle>
              <DialogDescription>
                Fill in the vehicle details below
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="vehicleNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Number *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., MH 12 AB 1234"
                          {...field}
                          className="uppercase"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vehicleType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="car">Car</SelectItem>
                            <SelectItem value="bike">Bike</SelectItem>
                            <SelectItem value="scooter">Scooter</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., White" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Honda" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="parkingSlot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parking Slot</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., P-101" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unitId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {units?.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id}>
                                {unit.block}-{unit.unit_number}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createVehicleMutation.isPending}
                  >
                    {createVehicleMutation.isPending ? 'Registering...' : 'Register Vehicle'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.total}</div>
              <Car className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Cars</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.cars}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Bikes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.bikes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicles</CardTitle>
          <CardDescription>
            List of all registered vehicles in the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by vehicle number..."
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
                ) : filteredVehicles?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Car className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No vehicles found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVehicles?.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      {columns.map((column) => (
                        <TableCell key={column.header}>
                          {column.cell ? column.cell({ row: { original: vehicle, getValue: (key: string) => vehicle[key as keyof typeof vehicle] } }) :
                            vehicle[column.accessorKey as keyof typeof vehicle] || '-'}
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
    </div>
  );
}