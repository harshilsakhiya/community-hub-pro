import { useState } from 'react';
import { Building, Home, Layers, Plus, Search, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useBuildings, useWings, useUnits, useCreateBuilding, useCreateWing, useCreateUnit } from '@/hooks/useSupabaseData';

type ModalType = 'building' | 'wing' | 'unit';

interface FormData {
  name: string;
  address: string;
  totalFloors: string;
  totalUnits: string;
  block: string;
  unitNumber: string;
  floorNumber: string;
  areaSqft: string;
}

const initialFormData: FormData = {
  name: '',
  address: '',
  totalFloors: '',
  totalUnits: '',
  block: '',
  unitNumber: '',
  floorNumber: '',
  areaSqft: '',
};

export default function Buildings() {
  const [activeTab, setActiveTab] = useState('buildings');
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('building');
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [selectedWing, setSelectedWing] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const { toast } = useToast();

  const { data: buildings, isLoading: buildingsLoading } = useBuildings();
  const { data: wings, isLoading: wingsLoading } = useWings();
  const { data: units, isLoading: unitsLoading } = useUnits();

  const createBuildingMutation = useCreateBuilding();
  const createWingMutation = useCreateWing();
  const createUnitMutation = useCreateUnit();

  const openModal = (type: ModalType, buildingId?: string, wingId?: string) => {
    setModalType(type);
    setSelectedBuilding(buildingId || null);
    setSelectedWing(wingId || null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (modalType === 'building') {
        await createBuildingMutation.mutateAsync({
          name: formData.name,
          address: formData.address,
          totalFloors: formData.totalFloors ? parseInt(formData.totalFloors) : undefined,
        });
        toast({ title: 'Success', description: 'Building created successfully' });
      } else if (modalType === 'wing') {
        if (!selectedBuilding) return;
        await createWingMutation.mutateAsync({
          name: formData.name,
          buildingId: selectedBuilding,
          totalUnits: formData.totalUnits ? parseInt(formData.totalUnits) : undefined,
        });
        toast({ title: 'Success', description: 'Wing created successfully' });
      } else if (modalType === 'unit') {
        if (!selectedBuilding || !selectedWing) return;
        await createUnitMutation.mutateAsync({
          unitNumber: formData.unitNumber,
          block: formData.block,
          floorNumber: formData.floorNumber ? parseInt(formData.floorNumber) : undefined,
          areaSqft: formData.areaSqft ? parseInt(formData.areaSqft) : undefined,
          buildingId: selectedBuilding,
          wingId: selectedWing,
        });
        toast({ title: 'Success', description: 'Unit created successfully' });
      }

      setIsModalOpen(false);
      setFormData(initialFormData);
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: 'Operation failed. Please try again.' 
      });
    }
  };

  const getModalConfig = () => {
    switch (modalType) {
      case 'building':
        return { title: 'Add New Building', description: 'Create a new building in your society' };
      case 'wing':
        return { title: 'Add New Wing', description: 'Add a wing to the selected building' };
      case 'unit':
        return { title: 'Add New Unit', description: 'Add a unit to the selected wing' };
    }
  };

  const isLoading = createBuildingMutation.isPending || createWingMutation.isPending || createUnitMutation.isPending;

  const filteredBuildings = buildings?.filter(b =>
    b.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredWings = wings?.filter(w =>
    w.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredUnits = units?.filter(u =>
    u.unit_number.toLowerCase().includes(searchText.toLowerCase()) ||
    u.block.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Building Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage buildings, wings, and units in your society
          </p>
        </div>
        <Button onClick={() => openModal('building')} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Add Building
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                <Building className="w-6 h-6 text-accent" />
              </div>
              <span className="text-3xl font-bold text-foreground">{buildings?.length || 0}</span>
              <span className="text-sm text-muted-foreground">Buildings</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Layers className="w-6 h-6 text-primary" />
              </div>
              <span className="text-3xl font-bold text-foreground">{wings?.length || 0}</span>
              <span className="text-sm text-muted-foreground">Wings</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mb-3">
                <Home className="w-6 h-6 text-warning" />
              </div>
              <span className="text-3xl font-bold text-foreground">{units?.length || 0}</span>
              <span className="text-sm text-muted-foreground">Units</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="buildings">Buildings</TabsTrigger>
              <TabsTrigger value="wings">Wings</TabsTrigger>
              <TabsTrigger value="units">Units</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Buildings Tab */}
          {activeTab === 'buildings' && (
            buildingsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredBuildings?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Building className="w-12 h-12 mb-4 opacity-50" />
                <p>No buildings found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Building Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Total Floors</TableHead>
                    <TableHead>Wings</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBuildings?.map((building) => {
                    const buildingWings = wings?.filter(w => w.building_id === building.id) || [];
                    return (
                      <TableRow key={building.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-accent" />
                            <span className="font-medium">{building.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {building.address || '-'}
                        </TableCell>
                        <TableCell>{building.total_floors || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{buildingWings.length} Wings</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => openModal('wing', building.id)}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Wing
                            </Button>
                            <Button size="sm" variant="outline">
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Building?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the building and all its wings and units.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )
          )}

          {/* Wings Tab */}
          {activeTab === 'wings' && (
            wingsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredWings?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Layers className="w-12 h-12 mb-4 opacity-50" />
                <p>No wings found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Wing Name</TableHead>
                    <TableHead>Building</TableHead>
                    <TableHead>Total Units</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWings?.map((wing) => {
                    const building = buildings?.find(b => b.id === wing.building_id);
                    return (
                      <TableRow key={wing.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-primary" />
                            <span className="font-medium">{wing.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {building?.name || '-'}
                        </TableCell>
                        <TableCell>{wing.total_units || 0}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => openModal('unit', wing.building_id, wing.id)}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Unit
                            </Button>
                            <Button size="sm" variant="outline">
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Wing?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete this wing and all its units.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )
          )}

          {/* Units Tab */}
          {activeTab === 'units' && (
            unitsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredUnits?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Home className="w-12 h-12 mb-4 opacity-50" />
                <p>No units found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit Number</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>Area (sq.ft)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUnits?.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-accent" />
                          <span className="font-medium">{unit.block}-{unit.unit_number}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {unit.floor_number ? `Floor ${unit.floor_number}` : '-'}
                      </TableCell>
                      <TableCell>
                        {unit.area_sqft ? `${unit.area_sqft} sq.ft` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={unit.is_occupied ? 'default' : 'secondary'}>
                          {unit.is_occupied ? 'Occupied' : 'Vacant'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline">
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Unit?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this unit.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          )}
        </CardContent>
      </Card>

      {/* Add Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getModalConfig().title}</DialogTitle>
            <DialogDescription>{getModalConfig().description}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {modalType === 'building' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Building Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Tower A, Block 1"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Building address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalFloors">Total Floors</Label>
                  <Input
                    id="totalFloors"
                    type="number"
                    min={1}
                    max={100}
                    placeholder="Number of floors"
                    value={formData.totalFloors}
                    onChange={(e) => setFormData({ ...formData, totalFloors: e.target.value })}
                  />
                </div>
              </>
            )}

            {modalType === 'wing' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Wing Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Wing A, West Wing"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalUnits">Total Units</Label>
                  <Input
                    id="totalUnits"
                    type="number"
                    min={1}
                    max={1000}
                    placeholder="Number of units"
                    value={formData.totalUnits}
                    onChange={(e) => setFormData({ ...formData, totalUnits: e.target.value })}
                  />
                </div>
              </>
            )}

            {modalType === 'unit' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="block">Block *</Label>
                    <Input
                      id="block"
                      placeholder="e.g., A"
                      value={formData.block}
                      onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitNumber">Unit Number *</Label>
                    <Input
                      id="unitNumber"
                      placeholder="e.g., 101"
                      value={formData.unitNumber}
                      onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="floorNumber">Floor Number</Label>
                    <Input
                      id="floorNumber"
                      type="number"
                      min={0}
                      max={100}
                      placeholder="Floor"
                      value={formData.floorNumber}
                      onChange={(e) => setFormData({ ...formData, floorNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="areaSqft">Area (sq.ft)</Label>
                    <Input
                      id="areaSqft"
                      type="number"
                      min={100}
                      max={10000}
                      placeholder="Area"
                      value={formData.areaSqft}
                      onChange={(e) => setFormData({ ...formData, areaSqft: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
