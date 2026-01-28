import { motion } from "framer-motion";
import {
  CreditCard,
  Users,
  MessageSquare,
  Bell,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Building,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const stats = [
  {
    title: "Total Collection",
    value: "₹12,45,000",
    change: "+12.5%",
    trend: "up",
    icon: IndianRupee,
    color: "text-success",
  },
  {
    title: "Pending Dues",
    value: "₹2,35,000",
    change: "-8.2%",
    trend: "down",
    icon: Clock,
    color: "text-warning",
  },
  {
    title: "Active Residents",
    value: "248",
    change: "+5",
    trend: "up",
    icon: Users,
    color: "text-accent",
  },
  {
    title: "Open Complaints",
    value: "12",
    change: "-3",
    trend: "down",
    icon: MessageSquare,
    color: "text-destructive",
  },
];

const recentActivities = [
  {
    id: 1,
    type: "payment",
    message: "Flat A-201 paid maintenance for January 2025",
    time: "2 hours ago",
    icon: CheckCircle2,
    iconColor: "text-success",
  },
  {
    id: 2,
    type: "visitor",
    message: "New visitor registered for Flat B-102",
    time: "3 hours ago",
    icon: Users,
    iconColor: "text-accent",
  },
  {
    id: 3,
    type: "complaint",
    message: "New complaint: Water leakage in Block C",
    time: "5 hours ago",
    icon: AlertCircle,
    iconColor: "text-warning",
  },
  {
    id: 4,
    type: "notice",
    message: "AGM scheduled for February 15, 2025",
    time: "1 day ago",
    icon: Bell,
    iconColor: "text-primary",
  },
];

const quickActions = [
  { label: "Generate Bills", icon: CreditCard, path: "/dashboard/billing" },
  { label: "Add Visitor", icon: Users, path: "/dashboard/visitors" },
  { label: "Post Notice", icon: Bell, path: "/dashboard/notices" },
  { label: "View Reports", icon: TrendingUp, path: "/dashboard/reports" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Welcome back, Admin 👋</h1>
        <p className="text-muted-foreground">
          Here's what's happening in your society today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {stats.map((stat, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card className="card-interactive">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-muted ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      stat.trend === "up" ? "text-success" : "text-destructive"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  asChild
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                >
                  <Link to={action.path}>
                    <action.icon className="w-5 h-5 text-accent" />
                    {action.label}
                    <ArrowUpRight className="w-4 h-4 ml-auto text-muted-foreground" />
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" className="text-accent">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg bg-muted ${activity.iconColor}`}>
                      <activity.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Society Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="w-5 h-5 text-accent" />
              Society Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-xl bg-muted/50">
                <p className="text-3xl font-bold text-accent">4</p>
                <p className="text-sm text-muted-foreground mt-1">Blocks</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-muted/50">
                <p className="text-3xl font-bold text-accent">256</p>
                <p className="text-sm text-muted-foreground mt-1">Total Units</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-muted/50">
                <p className="text-3xl font-bold text-accent">248</p>
                <p className="text-sm text-muted-foreground mt-1">Occupied</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-muted/50">
                <p className="text-3xl font-bold text-accent">8</p>
                <p className="text-sm text-muted-foreground mt-1">Vacant</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
