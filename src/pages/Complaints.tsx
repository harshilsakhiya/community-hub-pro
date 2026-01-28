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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const complaints = [
  {
    id: "CMP-001",
    title: "Water leakage in bathroom ceiling",
    description:
      "There is continuous water dripping from the bathroom ceiling. Seems like a leak from the flat above.",
    category: "plumbing",
    unit: "C-301",
    resident: "Vikram Singh",
    status: "in_progress",
    priority: "high",
    createdAt: "Jan 27, 2025",
    updatedAt: "Jan 28, 2025",
  },
  {
    id: "CMP-002",
    title: "Lift not working in Block B",
    description:
      "The lift in Block B has been out of service since yesterday morning. Senior citizens are facing difficulty.",
    category: "electrical",
    unit: "B-102",
    resident: "Sneha Gupta",
    status: "open",
    priority: "urgent",
    createdAt: "Jan 28, 2025",
    updatedAt: "Jan 28, 2025",
  },
  {
    id: "CMP-003",
    title: "Noise complaint - Late night parties",
    description:
      "Flat D-401 has been playing loud music past midnight on weekends. Disturbing peaceful sleep.",
    category: "noise",
    unit: "D-303",
    resident: "Anita Deshmukh",
    status: "resolved",
    priority: "medium",
    createdAt: "Jan 20, 2025",
    updatedAt: "Jan 25, 2025",
  },
  {
    id: "CMP-004",
    title: "Street light not working near parking",
    description:
      "The street light near the visitor parking area has been off for a week. Safety concern at night.",
    category: "electrical",
    unit: "A-201",
    resident: "Rajesh Kumar",
    status: "in_progress",
    priority: "medium",
    createdAt: "Jan 22, 2025",
    updatedAt: "Jan 26, 2025",
  },
];

const stats = [
  {
    title: "Open",
    value: "12",
    icon: AlertCircle,
    color: "bg-destructive/10 text-destructive",
  },
  {
    title: "In Progress",
    value: "8",
    icon: Clock,
    color: "bg-warning/10 text-warning",
  },
  {
    title: "Resolved",
    value: "45",
    icon: CheckCircle2,
    color: "bg-success/10 text-success",
  },
];

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
        <Button variant="default">
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
        {stats.map((stat, index) => (
          <Card key={index} className="card-interactive">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
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
          <Input placeholder="Search complaints..." className="pl-12 h-12" />
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
        {complaints.map((complaint, index) => {
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
                              {complaint.id}
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
                          <span>Unit {complaint.unit}</span>
                          <span>•</span>
                          <span>{complaint.resident}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{complaint.createdAt}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
