import { motion } from "framer-motion";
import {
  Bell,
  Plus,
  Search,
  Calendar,
  Megaphone,
  AlertTriangle,
  Info,
  Pin,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const notices = [
  {
    id: 1,
    title: "Annual General Meeting - February 2025",
    content:
      "The AGM for the financial year 2024-25 will be held on February 15, 2025 at 6:00 PM in the community hall. All members are requested to attend.",
    type: "meeting",
    date: "Jan 28, 2025",
    author: "Society Secretary",
    pinned: true,
    urgent: false,
  },
  {
    id: 2,
    title: "Water Supply Interruption - Maintenance Work",
    content:
      "Water supply will be interrupted on January 30, 2025 from 10:00 AM to 4:00 PM for tank cleaning. Kindly store sufficient water.",
    type: "maintenance",
    date: "Jan 27, 2025",
    author: "Facility Manager",
    pinned: true,
    urgent: true,
  },
  {
    id: 3,
    title: "Holi Celebration - Save the Date",
    content:
      "Join us for the Holi celebration on March 14, 2025. Activities include music, dance, and organic colors. Registration open at the office.",
    type: "event",
    date: "Jan 25, 2025",
    author: "Cultural Committee",
    pinned: false,
    urgent: false,
  },
  {
    id: 4,
    title: "New Parking Guidelines",
    content:
      "Please note the updated parking guidelines effective from February 1, 2025. Two-wheelers should be parked only in designated areas.",
    type: "announcement",
    date: "Jan 22, 2025",
    author: "Managing Committee",
    pinned: false,
    urgent: false,
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "meeting":
      return Calendar;
    case "maintenance":
      return AlertTriangle;
    case "event":
      return Megaphone;
    default:
      return Info;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "meeting":
      return "bg-accent/10 text-accent";
    case "maintenance":
      return "bg-warning/10 text-warning";
    case "event":
      return "bg-success/10 text-success";
    default:
      return "bg-primary/10 text-primary";
  }
};

export default function Notices() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Notice Board</h1>
          <p className="text-muted-foreground">
            Announcements and updates for all residents
          </p>
        </div>
        <Button variant="default">
          <Plus className="w-4 h-4 mr-2" />
          Post Notice
        </Button>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 mb-8"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input placeholder="Search notices..." className="pl-12 h-12" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="lg">
            All
          </Button>
          <Button variant="ghost" size="lg">
            Meetings
          </Button>
          <Button variant="ghost" size="lg">
            Events
          </Button>
        </div>
      </motion.div>

      {/* Notices Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {notices.map((notice, index) => {
          const TypeIcon = getTypeIcon(notice.type);
          return (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card
                className={`card-interactive ${
                  notice.urgent ? "border-l-4 border-l-destructive" : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${getTypeColor(notice.type)}`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">{notice.title}</h3>
                          {notice.pinned && (
                            <Pin className="w-4 h-4 text-accent" />
                          )}
                          {notice.urgent && (
                            <Badge variant="destructive" className="text-xs">
                              Urgent
                            </Badge>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {notice.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {notice.date}
                        </span>
                        <span>By {notice.author}</span>
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
