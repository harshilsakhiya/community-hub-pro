import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Droplets,
  Lightbulb,
  Volume2,
  Loader2,
  ImageIcon,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useComplaints, useComplaintStats } from "@/hooks/useSupabaseData";
import { CreateComplaintDialog } from "@/components/complaints/CreateComplaintDialog";
import { ComplaintDetailDialog } from "@/components/complaints/ComplaintDetailDialog";
import { ComplaintFilters } from "@/components/complaints/ComplaintFilters";

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

export default function Complaints() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const { data: complaints, isLoading: complaintsLoading } = useComplaints();
  const { data: stats, isLoading: statsLoading } = useComplaintStats();

  const filteredComplaints = complaints?.filter(complaint => {
    const matchesSearch = 
      complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.ticket_number.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || complaint.category === categoryFilter;
    const matchesPriority = priorityFilter === "all" || complaint.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const handleViewDetails = (complaintId: string) => {
    setSelectedComplaintId(complaintId);
    setIsDetailDialogOpen(true);
  };

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
        <Button variant="default" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Complaint
        </Button>
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

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <ComplaintFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
        />
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
                <Card className="card-interactive cursor-pointer hover:border-accent/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-muted">
                        <CategoryIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-sm text-muted-foreground font-mono">
                                {complaint.ticket_number}
                              </span>
                              {getStatusBadge(complaint.status)}
                              {getPriorityBadge(complaint.priority)}
                            </div>
                            <h3 className="font-semibold text-lg">
                              {complaint.title}
                            </h3>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(complaint.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {complaint.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              Unit {complaint.units?.block}-{complaint.units?.unit_number}
                            </span>
                            <Badge variant="outline" className="capitalize">
                              {complaint.category}
                            </Badge>
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
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No complaints found</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              Submit your first complaint
            </Button>
          </div>
        )}
      </motion.div>

      {/* Dialogs */}
      <CreateComplaintDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
      
      <ComplaintDetailDialog
        complaintId={selectedComplaintId}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
      />
    </div>
  );
}
