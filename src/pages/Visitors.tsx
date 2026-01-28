import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Plus,
  QrCode,
  Car,
  Clock,
  CheckCircle,
  LogIn,
  LogOut,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVisitors, useVisitorStats, useCreateVisitor, useCheckOutVisitor, useUnits } from "@/hooks/useSupabaseData";

export default function Visitors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newVisitor, setNewVisitor] = useState({
    name: "",
    phone: "",
    purpose: "",
    unitId: "",
    vehicleNumber: "",
  });

  const { data: visitors, isLoading: visitorsLoading } = useVisitors();
  const { data: stats, isLoading: statsLoading } = useVisitorStats();
  const { data: units } = useUnits();
  const createVisitorMutation = useCreateVisitor();
  const checkOutMutation = useCheckOutVisitor();

  const filteredVisitors = visitors?.filter(visitor =>
    visitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    visitor.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    visitor.units?.unit_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statCards = [
    {
      title: "Inside Now",
      value: stats?.insideNow?.toString() || "0",
      icon: Users,
      color: "bg-accent/10 text-accent",
    },
    {
      title: "Today's Entries",
      value: stats?.todayEntries?.toString() || "0",
      icon: LogIn,
      color: "bg-success/10 text-success",
    },
    {
      title: "Today's Exits",
      value: stats?.todayExits?.toString() || "0",
      icon: LogOut,
      color: "bg-warning/10 text-warning",
    },
    {
      title: "Pre-Approved",
      value: stats?.preApproved?.toString() || "0",
      icon: CheckCircle,
      color: "bg-primary/10 text-primary",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisitor.name || !newVisitor.purpose || !newVisitor.unitId) return;
    
    await createVisitorMutation.mutateAsync(newVisitor);
    setIsDialogOpen(false);
    setNewVisitor({
      name: "",
      phone: "",
      purpose: "",
      unitId: "",
      vehicleNumber: "",
    });
  };

  const handleCheckOut = (visitorId: string) => {
    checkOutMutation.mutate(visitorId);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Visitor Management</h1>
          <p className="text-muted-foreground">
            Track and manage visitor entries and exits
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <QrCode className="w-4 h-4 mr-2" />
            Scan QR
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default">
                <Plus className="w-4 h-4 mr-2" />
                Add Visitor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register New Visitor</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Visitor Name</Label>
                  <Input
                    id="name"
                    value={newVisitor.name}
                    onChange={(e) => setNewVisitor({ ...newVisitor, name: e.target.value })}
                    placeholder="Full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={newVisitor.phone}
                    onChange={(e) => setNewVisitor({ ...newVisitor, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose of Visit</Label>
                  <Input
                    id="purpose"
                    value={newVisitor.purpose}
                    onChange={(e) => setNewVisitor({ ...newVisitor, purpose: e.target.value })}
                    placeholder="e.g., Guest Visit, Delivery"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Visiting Unit</Label>
                  <Select
                    value={newVisitor.unitId}
                    onValueChange={(value) => setNewVisitor({ ...newVisitor, unitId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units?.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.block}-{unit.unit_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Vehicle Number (Optional)</Label>
                  <Input
                    id="vehicle"
                    value={newVisitor.vehicleNumber}
                    onChange={(e) => setNewVisitor({ ...newVisitor, vehicleNumber: e.target.value })}
                    placeholder="MH 12 AB 1234"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createVisitorMutation.isPending}>
                  {createVisitorMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Register Visitor
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {statCards.map((stat, index) => (
          <Card key={index} className="card-interactive">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">
                    {statsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : stat.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="relative mb-6"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search visitors by name, phone, or unit..."
          className="pl-12 h-12"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </motion.div>

      {/* Visitors List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {visitorsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : filteredVisitors && filteredVisitors.length > 0 ? (
          filteredVisitors.map((visitor) => {
            const isInside = visitor.check_in_time && !visitor.check_out_time;
            return (
              <Card key={visitor.id} className="card-interactive">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Avatar and Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-accent/10 text-accent font-semibold">
                          {visitor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{visitor.name}</h3>
                          <Badge
                            variant="outline"
                            className={
                              isInside
                                ? "border-success text-success"
                                : "border-muted-foreground text-muted-foreground"
                            }
                          >
                            {isInside ? "Inside" : "Exited"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {visitor.purpose} • Unit {visitor.units?.block}-{visitor.units?.unit_number}
                        </p>
                      </div>
                    </div>

                    {/* Time and Vehicle */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>
                          In: {visitor.check_in_time ? new Date(visitor.check_in_time).toLocaleTimeString() : '-'}
                          {visitor.check_out_time && ` • Out: ${new Date(visitor.check_out_time).toLocaleTimeString()}`}
                        </span>
                      </div>
                      {visitor.vehicle_number && (
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-muted-foreground" />
                          <span>{visitor.vehicle_number}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 sm:ml-4">
                      {isInside && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCheckOut(visitor.id)}
                          disabled={checkOutMutation.isPending}
                        >
                          {checkOutMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <LogOut className="w-4 h-4 mr-2" />
                          )}
                          Check Out
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No visitors found
          </div>
        )}
      </motion.div>
    </div>
  );
}
