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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const visitors = [
  {
    id: 1,
    name: "Rahul Mehta",
    phone: "+91 98765 11111",
    unit: "A-201",
    purpose: "Guest Visit",
    checkIn: "10:30 AM",
    checkOut: null,
    vehicle: "MH 12 AB 1234",
    status: "inside",
  },
  {
    id: 2,
    name: "Delivery - Amazon",
    phone: "+91 98765 22222",
    unit: "B-102",
    purpose: "Delivery",
    checkIn: "11:15 AM",
    checkOut: "11:25 AM",
    vehicle: null,
    status: "exited",
  },
  {
    id: 3,
    name: "Plumber - Ramesh",
    phone: "+91 98765 33333",
    unit: "C-301",
    purpose: "Maintenance",
    checkIn: "09:00 AM",
    checkOut: null,
    vehicle: null,
    status: "inside",
  },
  {
    id: 4,
    name: "Priya's Parents",
    phone: "+91 98765 44444",
    unit: "A-102",
    purpose: "Family Visit",
    checkIn: "Yesterday",
    checkOut: null,
    vehicle: "MH 01 CD 5678",
    status: "inside",
  },
];

const stats = [
  {
    title: "Inside Now",
    value: "12",
    icon: Users,
    color: "bg-accent/10 text-accent",
  },
  {
    title: "Today's Entries",
    value: "28",
    icon: LogIn,
    color: "bg-success/10 text-success",
  },
  {
    title: "Today's Exits",
    value: "16",
    icon: LogOut,
    color: "bg-warning/10 text-warning",
  },
  {
    title: "Pre-Approved",
    value: "5",
    icon: CheckCircle,
    color: "bg-primary/10 text-primary",
  },
];

export default function Visitors() {
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
          <Button variant="default">
            <Plus className="w-4 h-4 mr-2" />
            Add Visitor
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
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
        className="relative mb-6"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search visitors by name, phone, or unit..."
          className="pl-12 h-12"
        />
      </motion.div>

      {/* Visitors List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {visitors.map((visitor) => (
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
                          visitor.status === "inside"
                            ? "border-success text-success"
                            : "border-muted-foreground text-muted-foreground"
                        }
                      >
                        {visitor.status === "inside" ? "Inside" : "Exited"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {visitor.purpose} • Unit {visitor.unit}
                    </p>
                  </div>
                </div>

                {/* Time and Vehicle */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>
                      In: {visitor.checkIn}
                      {visitor.checkOut && ` • Out: ${visitor.checkOut}`}
                    </span>
                  </div>
                  {visitor.vehicle && (
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-muted-foreground" />
                      <span>{visitor.vehicle}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 sm:ml-4">
                  {visitor.status === "inside" && (
                    <Button variant="outline" size="sm">
                      <LogOut className="w-4 h-4 mr-2" />
                      Check Out
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  );
}
