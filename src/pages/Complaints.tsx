import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Droplets,
  Lightbulb,
  Volume2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useComplaints, useComplaintStats, useCreateComplaint, useUnits } from "@/hooks/useSupabaseData";

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "plumbing":
      return Droplets;
    case "electrical":
      return Lightbulb;
    case "noise":
      return Volume2;
    default:
      return Wrench;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "open":
      return (
        <Badge className="bg-destructive/10 text-destructive border-destructive/20">
          Open
        </Badge>
      );
    case "in_progress":
      return (
        <Badge className="bg-warning/10 text-warning border-warning/20">
          In Progress
        </Badge>
      );
    case "resolved":
    case "closed":
      return (
        <Badge className="bg-success/10 text-success border-success/20">
          Resolved
        </Badge>
      );
    default:
      return null;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "urgent":
      return <Badge variant="destructive">Urgent</Badge>;
    case "high":
      return (
        <Badge className="bg-warning text-warning-foreground">High</Badge>
      );
    case "medium":
      return <Badge variant="secondary">Medium</Badge>;
    default:
      return <Badge variant="outline">Low</Badge>;
  }
};

type ComplaintCategory = 'plumbing' | 'electrical' | 'noise' | 'maintenance' | 'security' | 'parking' | 'other';
type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';

export default function Complaints() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newComplaint, setNewComplaint] = useState<{
    title: string;
    description: string;
    category: ComplaintCategory;
    priority: ComplaintPriority;
    unitId: string;
  }>({
    title: "",
    description: "",
    category: "other",
    priority: "medium",
    unitId: "",
  });

  const { data: complaints, isLoading: complaintsLoading } = useComplaints();
  const { data: stats, isLoading: statsLoading } = useComplaintStats();
  const { data: units } = useUnits();
  const createComplaintMutation = useCreateComplaint();

  const filteredComplaints = complaints?.filter(complaint =>
    complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    complaint.ticket_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statCards = [
    {
      title: "Open",
      value: stats?.open?.toString() || "0",
      icon: AlertCircle,
      color: "bg-destructive/10 text-destructive",
    },
    {
      title: "In Progress",
      value: stats?.inProgress?.toString() || "0",
      icon: Clock,
      color: "bg-warning/10 text-warning",
    },
    {
      title: "Resolved",
      value: stats?.resolved?.toString() || "0",
      icon: CheckCircle2,
      color: "bg-success/10 text-success",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComplaint.title || !newComplaint.description || !newComplaint.unitId) return;
    
    await createComplaintMutation.mutateAsync(newComplaint);
    setIsDialogOpen(false);
    setNewComplaint({
      title: "",
      description: "",
      category: "other",
      priority: "medium",
      unitId: "",
    });
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
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">
            Complaints & Requests
          </h1>
          <p className="text-muted-foreground">
            Track and resolve resident complaints
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default">
              <Plus className="w-4 h-4 mr-2" />
              New Complaint
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit New Complaint</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newComplaint.title}
                  onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newComplaint.description}
                  onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                  placeholder="Detailed description..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={newComplaint.category}
                    onValueChange={(value: ComplaintCategory) => setNewComplaint({ ...newComplaint, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="noise">Noise</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="parking">Parking</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={newComplaint.priority}
                    onValueChange={(value: ComplaintPriority) => setNewComplaint({ ...newComplaint, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select
                  value={newComplaint.unitId}
                  onValueChange={(value) => setNewComplaint({ ...newComplaint, unitId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your unit" />
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
              <Button type="submit" className="w-full" disabled={createComplaintMutation.isPending}>
                {createComplaintMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Submit Complaint
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4 mb-8"
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
        className="flex gap-4 mb-6"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search complaints..." 
            className="pl-12 h-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="h-12 w-12">
          <Filter className="w-5 h-5" />
        </Button>
      </motion.div>

      {/* Complaints List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {complaintsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : filteredComplaints && filteredComplaints.length > 0 ? (
          filteredComplaints.map((complaint, index) => {
            const CategoryIcon = getCategoryIcon(complaint.category);
            return (
              <motion.div
                key={complaint.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="card-interactive">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-muted">
                        <CategoryIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-muted-foreground">
                                {complaint.ticket_number}
                              </span>
                              {getStatusBadge(complaint.status)}
                              {getPriorityBadge(complaint.priority)}
                            </div>
                            <h3 className="font-semibold text-lg">
                              {complaint.title}
                            </h3>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {complaint.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              Unit {complaint.units?.block}-{complaint.units?.unit_number}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No complaints found
          </div>
        )}
      </motion.div>
    </div>
  );
}
