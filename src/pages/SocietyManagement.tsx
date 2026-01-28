import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Plus,
  Home,
  Layers,
  Users,
  MapPin,
  Phone,
  Mail,
  Settings2,
  ChevronRight,
  Search,
  Edit,
  Trash2,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useBuildings, useWings, useUnits } from "@/hooks/useSupabaseData";
import {
  useSocieties,
  useCreateSociety,
  useAddBuildingToSociety,
  useAddWingToBuilding,
  useAddUnit,
  useBulkAddUnits,
  useAssignResident,
  useUnitsWithResidents,
  useAllProfiles,
} from "@/hooks/useSocieties";
import RoleGuard from "@/components/auth/RoleGuard";

export default function SocietyManagement() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("societies");
  
  // Dialogs
  const [societyDialogOpen, setSocietyDialogOpen] = useState(false);
  const [buildingDialogOpen, setBuildingDialogOpen] = useState(false);
  const [wingDialogOpen, setWingDialogOpen] = useState(false);
  const [unitDialogOpen, setUnitDialogOpen] = useState(false);
  const [floorDialogOpen, setFloorDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  
  // Selected items
  const [selectedSociety, setSelectedSociety] = useState<string>("");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");
  const [selectedWing, setSelectedWing] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  
  // Hooks
  const { data: societies, isLoading: societiesLoading } = useSocieties();
  const { data: buildings, isLoading: buildingsLoading } = useBuildings();
  const { data: wings, isLoading: wingsLoading } = useWings();
  const { data: unitsWithResidents, isLoading: unitsLoading } = useUnitsWithResidents();
  const { data: profiles } = useAllProfiles();
  
  // Mutations
  const createSociety = useCreateSociety();
  const addBuilding = useAddBuildingToSociety();
  const addWing = useAddWingToBuilding();
  const addUnit = useAddUnit();
  const bulkAddUnits = useBulkAddUnits();
  const assignResident = useAssignResident();
  
  // Form states
  const [societyForm, setSocietyForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    registration_number: "",
    maintenance_amount: "",
    contact_email: "",
    contact_phone: "",
  });
  
  const [buildingForm, setBuildingForm] = useState({
    name: "",
    address: "",
    total_floors: "",
  });
  
  const [wingForm, setWingForm] = useState({
    name: "",
  });
  
  const [unitForm, setUnitForm] = useState({
    unit_number: "",
    block: "",
    floor_number: "",
    unit_type: "2BHK",
    area_sqft: "",
  });
  
  const [floorForm, setFloorForm] = useState({
    floor_number: "",
    units_per_floor: "",
    block: "",
    unit_type: "2BHK",
    area_sqft: "",
  });
  
  const [assignForm, setAssignForm] = useState({
    resident_id: "",
    occupancy_type: "owner" as "owner" | "tenant" | "vacant",
    move_in_date: new Date().toISOString().split("T")[0],
  });
  
  // Handlers
  const handleCreateSociety = async () => {
    await createSociety.mutateAsync({
      name: societyForm.name,
      address: societyForm.address,
      city: societyForm.city,
      state: societyForm.state,
      pincode: societyForm.pincode,
      registration_number: societyForm.registration_number || undefined,
      maintenance_amount: societyForm.maintenance_amount ? Number(societyForm.maintenance_amount) : undefined,
      contact_email: societyForm.contact_email || undefined,
      contact_phone: societyForm.contact_phone || undefined,
    });
    setSocietyDialogOpen(false);
    setSocietyForm({
      name: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      registration_number: "",
      maintenance_amount: "",
      contact_email: "",
      contact_phone: "",
    });
  };
  
  const handleAddBuilding = async () => {
    if (!selectedSociety) return;
    await addBuilding.mutateAsync({
      name: buildingForm.name,
      address: buildingForm.address || undefined,
      total_floors: Number(buildingForm.total_floors),
      society_id: selectedSociety,
    });
    setBuildingDialogOpen(false);
    setBuildingForm({ name: "", address: "", total_floors: "" });
  };
  
  const handleAddWing = async () => {
    if (!selectedBuilding) return;
    await addWing.mutateAsync({
      name: wingForm.name,
      building_id: selectedBuilding,
    });
    setWingDialogOpen(false);
    setWingForm({ name: "" });
  };
  
  const handleAddUnit = async () => {
    await addUnit.mutateAsync({
      unit_number: unitForm.unit_number,
      block: unitForm.block,
      floor_number: Number(unitForm.floor_number),
      unit_type: unitForm.unit_type,
      area_sqft: unitForm.area_sqft ? Number(unitForm.area_sqft) : undefined,
      building_id: selectedBuilding || undefined,
      wing_id: selectedWing || undefined,
    });
    setUnitDialogOpen(false);
    setUnitForm({
      unit_number: "",
      block: "",
      floor_number: "",
      unit_type: "2BHK",
      area_sqft: "",
    });
  };
  
  const handleBulkAddUnits = async () => {
    if (!selectedBuilding) return;
    await bulkAddUnits.mutateAsync({
      building_id: selectedBuilding,
      wing_id: selectedWing || undefined,
      block: floorForm.block,
      floor_number: Number(floorForm.floor_number),
      units_per_floor: Number(floorForm.units_per_floor),
      unit_type: floorForm.unit_type,
      area_sqft: floorForm.area_sqft ? Number(floorForm.area_sqft) : undefined,
    });
    setFloorDialogOpen(false);
    setFloorForm({
      floor_number: "",
      units_per_floor: "",
      block: "",
      unit_type: "2BHK",
      area_sqft: "",
    });
  };
  
  const handleAssignResident = async () => {
    if (!selectedUnit) return;
    await assignResident.mutateAsync({
      unit_id: selectedUnit,
      resident_id: assignForm.resident_id || undefined,
      owner_id: assignForm.occupancy_type === "owner" ? assignForm.resident_id : undefined,
      occupancy_type: assignForm.occupancy_type,
      move_in_date: assignForm.move_in_date,
    });
    setAssignDialogOpen(false);
    setAssignForm({
      resident_id: "",
      occupancy_type: "owner",
      move_in_date: new Date().toISOString().split("T")[0],
    });
  };
  
  // Filter data based on search
  const filteredSocieties = societies?.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.city.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  const filteredBuildings = buildings?.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  const filteredUnits = unitsWithResidents?.filter(u =>
    u.unit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.block.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="p-4 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Society Management
            </h1>
            <p className="text-muted-foreground">
              Manage societies, buildings, floors, and flats
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={societyDialogOpen} onOpenChange={setSocietyDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Society
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Society</DialogTitle>
                  <DialogDescription>
                    Add a new housing society to the system
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Society Name *</Label>
                    <Input
                      value={societyForm.name}
                      onChange={(e) => setSocietyForm({ ...societyForm, name: e.target.value })}
                      placeholder="e.g., Green Valley Apartments"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Address</Label>
                    <Textarea
                      value={societyForm.address}
                      onChange={(e) => setSocietyForm({ ...societyForm, address: e.target.value })}
                      placeholder="Street address"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>City *</Label>
                      <Input
                        value={societyForm.city}
                        onChange={(e) => setSocietyForm({ ...societyForm, city: e.target.value })}
                        placeholder="Mumbai"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>State *</Label>
                      <Input
                        value={societyForm.state}
                        onChange={(e) => setSocietyForm({ ...societyForm, state: e.target.value })}
                        placeholder="Maharashtra"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Pincode *</Label>
                      <Input
                        value={societyForm.pincode}
                        onChange={(e) => setSocietyForm({ ...societyForm, pincode: e.target.value })}
                        placeholder="400001"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Registration No.</Label>
                      <Input
                        value={societyForm.registration_number}
                        onChange={(e) => setSocietyForm({ ...societyForm, registration_number: e.target.value })}
                        placeholder="REG-123456"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Monthly Maintenance (₹)</Label>
                    <Input
                      type="number"
                      value={societyForm.maintenance_amount}
                      onChange={(e) => setSocietyForm({ ...societyForm, maintenance_amount: e.target.value })}
                      placeholder="5000"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Contact Email</Label>
                      <Input
                        type="email"
                        value={societyForm.contact_email}
                        onChange={(e) => setSocietyForm({ ...societyForm, contact_email: e.target.value })}
                        placeholder="admin@society.com"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Contact Phone</Label>
                      <Input
                        value={societyForm.contact_phone}
                        onChange={(e) => setSocietyForm({ ...societyForm, contact_phone: e.target.value })}
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSocietyDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateSociety} 
                    disabled={!societyForm.name || !societyForm.city || !societyForm.state || !societyForm.pincode || createSociety.isPending}
                  >
                    {createSociety.isPending ? "Creating..." : "Create Society"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{societies?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Societies</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Home className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{buildings?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Buildings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Layers className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{wings?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Wings/Blocks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Users className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{unitsWithResidents?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Units</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search societies, buildings, units..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="societies">Societies</TabsTrigger>
            <TabsTrigger value="buildings">Buildings</TabsTrigger>
            <TabsTrigger value="units">Units & Residents</TabsTrigger>
          </TabsList>

          {/* Societies Tab */}
          <TabsContent value="societies" className="space-y-4">
            {societiesLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading societies...</div>
            ) : filteredSocieties.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No Societies Yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first society to get started</p>
                  <Button onClick={() => setSocietyDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Society
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredSocieties.map((society) => (
                  <Card key={society.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className="p-3 rounded-lg bg-primary/10">
                            <Building2 className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{society.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <MapPin className="w-4 h-4" />
                              <span>{society.city}, {society.state} - {society.pincode}</span>
                            </div>
                            <div className="flex gap-4 mt-3">
                              {society.contact_email && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Mail className="w-4 h-4" />
                                  <span>{society.contact_email}</span>
                                </div>
                              )}
                              {society.contact_phone && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="w-4 h-4" />
                                  <span>{society.contact_phone}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Badge variant="outline">{society.total_buildings} Buildings</Badge>
                              <Badge variant="outline">{society.total_units} Units</Badge>
                              {society.maintenance_amount > 0 && (
                                <Badge variant="secondary">₹{society.maintenance_amount}/month</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedSociety(society.id);
                              setBuildingDialogOpen(true);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Building
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Buildings Tab */}
          <TabsContent value="buildings" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={buildingDialogOpen} onOpenChange={setBuildingDialogOpen}>
                <DialogTrigger asChild>
                  <Button disabled={!societies?.length}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Building
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Building</DialogTitle>
                    <DialogDescription>Add a new building to a society</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Select Society *</Label>
                      <Select value={selectedSociety} onValueChange={setSelectedSociety}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a society" />
                        </SelectTrigger>
                        <SelectContent>
                          {societies?.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Building Name *</Label>
                      <Input
                        value={buildingForm.name}
                        onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })}
                        placeholder="e.g., Tower A"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Total Floors *</Label>
                      <Input
                        type="number"
                        value={buildingForm.total_floors}
                        onChange={(e) => setBuildingForm({ ...buildingForm, total_floors: e.target.value })}
                        placeholder="10"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setBuildingDialogOpen(false)}>Cancel</Button>
                    <Button 
                      onClick={handleAddBuilding}
                      disabled={!selectedSociety || !buildingForm.name || !buildingForm.total_floors || addBuilding.isPending}
                    >
                      {addBuilding.isPending ? "Adding..." : "Add Building"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {buildingsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading buildings...</div>
            ) : filteredBuildings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Home className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No Buildings Yet</h3>
                  <p className="text-muted-foreground">Add buildings to your societies</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBuildings.map((building) => (
                  <Card key={building.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            <Home className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{building.name}</CardTitle>
                            <CardDescription>{building.total_floors} Floors</CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedBuilding(building.id);
                            setWingDialogOpen(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Wing
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedBuilding(building.id);
                            setFloorDialogOpen(true);
                          }}
                        >
                          <Layers className="w-4 h-4 mr-1" />
                          Add Floor
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Units Tab */}
          <TabsContent value="units" className="space-y-4">
            <div className="flex justify-end gap-2">
              <Dialog open={unitDialogOpen} onOpenChange={setUnitDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Single Unit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Unit</DialogTitle>
                    <DialogDescription>Add a single unit/flat</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Unit Number *</Label>
                        <Input
                          value={unitForm.unit_number}
                          onChange={(e) => setUnitForm({ ...unitForm, unit_number: e.target.value })}
                          placeholder="101"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Block/Wing *</Label>
                        <Input
                          value={unitForm.block}
                          onChange={(e) => setUnitForm({ ...unitForm, block: e.target.value })}
                          placeholder="A"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Floor Number *</Label>
                        <Input
                          type="number"
                          value={unitForm.floor_number}
                          onChange={(e) => setUnitForm({ ...unitForm, floor_number: e.target.value })}
                          placeholder="1"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Unit Type</Label>
                        <Select value={unitForm.unit_type} onValueChange={(v) => setUnitForm({ ...unitForm, unit_type: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1BHK">1 BHK</SelectItem>
                            <SelectItem value="2BHK">2 BHK</SelectItem>
                            <SelectItem value="3BHK">3 BHK</SelectItem>
                            <SelectItem value="4BHK">4 BHK</SelectItem>
                            <SelectItem value="Studio">Studio</SelectItem>
                            <SelectItem value="Penthouse">Penthouse</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Area (sq.ft)</Label>
                      <Input
                        type="number"
                        value={unitForm.area_sqft}
                        onChange={(e) => setUnitForm({ ...unitForm, area_sqft: e.target.value })}
                        placeholder="1200"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setUnitDialogOpen(false)}>Cancel</Button>
                    <Button 
                      onClick={handleAddUnit}
                      disabled={!unitForm.unit_number || !unitForm.block || !unitForm.floor_number || addUnit.isPending}
                    >
                      {addUnit.isPending ? "Adding..." : "Add Unit"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Floor Dialog */}
            <Dialog open={floorDialogOpen} onOpenChange={setFloorDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Floor with Units</DialogTitle>
                  <DialogDescription>Bulk create units for an entire floor</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Floor Number *</Label>
                      <Input
                        type="number"
                        value={floorForm.floor_number}
                        onChange={(e) => setFloorForm({ ...floorForm, floor_number: e.target.value })}
                        placeholder="1"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Units Per Floor *</Label>
                      <Input
                        type="number"
                        value={floorForm.units_per_floor}
                        onChange={(e) => setFloorForm({ ...floorForm, units_per_floor: e.target.value })}
                        placeholder="4"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Block/Wing *</Label>
                      <Input
                        value={floorForm.block}
                        onChange={(e) => setFloorForm({ ...floorForm, block: e.target.value })}
                        placeholder="A"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Unit Type</Label>
                      <Select value={floorForm.unit_type} onValueChange={(v) => setFloorForm({ ...floorForm, unit_type: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1BHK">1 BHK</SelectItem>
                          <SelectItem value="2BHK">2 BHK</SelectItem>
                          <SelectItem value="3BHK">3 BHK</SelectItem>
                          <SelectItem value="4BHK">4 BHK</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setFloorDialogOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={handleBulkAddUnits}
                    disabled={!floorForm.floor_number || !floorForm.units_per_floor || !floorForm.block || bulkAddUnits.isPending}
                  >
                    {bulkAddUnits.isPending ? "Creating..." : "Create Floor Units"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Assign Resident Dialog */}
            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Resident</DialogTitle>
                  <DialogDescription>Assign a resident to this unit</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Select Resident</Label>
                    <Select value={assignForm.resident_id} onValueChange={(v) => setAssignForm({ ...assignForm, resident_id: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a resident" />
                      </SelectTrigger>
                      <SelectContent>
                        {profiles?.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.full_name || p.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Occupancy Type</Label>
                    <Select 
                      value={assignForm.occupancy_type} 
                      onValueChange={(v: "owner" | "tenant" | "vacant") => setAssignForm({ ...assignForm, occupancy_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="tenant">Tenant</SelectItem>
                        <SelectItem value="vacant">Vacant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Move-in Date</Label>
                    <Input
                      type="date"
                      value={assignForm.move_in_date}
                      onChange={(e) => setAssignForm({ ...assignForm, move_in_date: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={handleAssignResident}
                    disabled={assignResident.isPending}
                  >
                    {assignResident.isPending ? "Saving..." : "Save Assignment"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Units Table */}
            {unitsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading units...</div>
            ) : filteredUnits.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Layers className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No Units Yet</h3>
                  <p className="text-muted-foreground">Add units to your buildings</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Unit</TableHead>
                        <TableHead>Block</TableHead>
                        <TableHead>Floor</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Building</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUnits.map((unit: any) => (
                        <TableRow key={unit.id}>
                          <TableCell className="font-medium">{unit.unit_number}</TableCell>
                          <TableCell>{unit.block}</TableCell>
                          <TableCell>{unit.floor_number || "-"}</TableCell>
                          <TableCell>{unit.unit_type || "2BHK"}</TableCell>
                          <TableCell>
                            <Badge variant={unit.occupancy_type === "vacant" ? "secondary" : unit.occupancy_type === "owner" ? "default" : "outline"}>
                              {unit.occupancy_type || "Vacant"}
                            </Badge>
                          </TableCell>
                          <TableCell>{unit.buildings?.name || "-"}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUnit(unit.id);
                                setAssignDialogOpen(true);
                              }}
                            >
                              <UserPlus className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
}
