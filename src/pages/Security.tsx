import { motion } from "framer-motion";
import {
  Shield,
  QrCode,
  AlertTriangle,
  Users,
  Car,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useVisitors, useVisitorStats, useVehicles } from "@/hooks/useSupabaseData";

const quickActions = [
  { icon: QrCode, label: "Scan QR Code", color: "bg-accent" },
  { icon: Users, label: "Register Visitor", color: "bg-success" },
  { icon: Car, label: "Log Vehicle", color: "bg-warning" },
  { icon: AlertTriangle, label: "Report Issue", color: "bg-destructive" },
];

export default function Security() {
  const { data: visitors, isLoading: visitorsLoading } = useVisitors();
  const { data: stats, isLoading: statsLoading } = useVisitorStats();
  const { data: vehicles, isLoading: vehiclesLoading } = useVehicles();

  const statCards = [
    { label: "Total Entries", value: stats?.todayEntries?.toString() || "0", icon: Users },
    { label: "Vehicles In", value: vehicles?.length?.toString() || "0", icon: Car },
    { label: "Active Alerts", value: "0", icon: AlertTriangle },
  ];

  // Create security logs from visitors
  const securityLogs = visitors?.slice(0, 5).map(visitor => ({
    id: visitor.id,
    event: visitor.check_out_time ? "Visitor Exit" : "Visitor Entry",
    details: `${visitor.name} ${visitor.check_out_time ? 'exited' : 'entered'}`,
    unit: visitor.units ? `${visitor.units.block}-${visitor.units.unit_number}` : "-",
    time: visitor.check_out_time 
      ? new Date(visitor.check_out_time).toLocaleTimeString()
      : visitor.check_in_time 
        ? new Date(visitor.check_in_time).toLocaleTimeString()
        : "-",
    type: visitor.check_out_time ? "exit" : "entry",
  })) || [];

  const isLoading = visitorsLoading || statsLoading || vehiclesLoading;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Gatekeeper control panel for entry/exit management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium">Gate 1 Active</span>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-24 flex-col gap-3 hover:border-accent"
          >
            <div className={`p-3 rounded-xl ${action.color} text-white`}>
              <action.icon className="w-6 h-6" />
            </div>
            <span className="font-medium">{action.label}</span>
          </Button>
        ))}
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-3 gap-4 mb-8"
      >
        {statCards.map((stat, index) => (
          <Card key={index} className="card-interactive">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-muted">
                <stat.icon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Security Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent" />
              Live Security Log
            </CardTitle>
            <Badge variant="outline" className="animate-pulse">
              <div className="w-2 h-2 rounded-full bg-success mr-2" />
              Live
            </Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : securityLogs.length > 0 ? (
              <div className="space-y-3">
                {securityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        log.type === "alert"
                          ? "bg-destructive/10 text-destructive"
                          : log.type === "entry"
                          ? "bg-success/10 text-success"
                          : log.type === "exit"
                          ? "bg-warning/10 text-warning"
                          : "bg-accent/10 text-accent"
                      }`}
                    >
                      {log.type === "alert" ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : log.type === "vehicle" ? (
                        <Car className="w-4 h-4" />
                      ) : (
                        <Users className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{log.event}</p>
                      <p className="text-sm text-muted-foreground">{log.details}</p>
                    </div>
                    {log.unit !== "-" && (
                      <Badge variant="outline">{log.unit}</Badge>
                    )}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {log.time}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
