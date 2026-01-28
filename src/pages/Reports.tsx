import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  IndianRupee,
  Users,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const monthlyData = [
  { month: "Aug", collection: 85 },
  { month: "Sep", collection: 92 },
  { month: "Oct", collection: 78 },
  { month: "Nov", collection: 88 },
  { month: "Dec", collection: 95 },
  { month: "Jan", collection: 87 },
];

const summaryStats = [
  {
    title: "Total Collection YTD",
    value: "₹1.2 Cr",
    change: "+15%",
    trend: "up",
    icon: IndianRupee,
  },
  {
    title: "Avg. Monthly Collection",
    value: "₹12.5L",
    change: "+8%",
    trend: "up",
    icon: BarChart3,
  },
  {
    title: "Active Residents",
    value: "248",
    change: "+12",
    trend: "up",
    icon: Users,
  },
  {
    title: "Complaints Resolved",
    value: "156",
    change: "+23%",
    trend: "up",
    icon: MessageSquare,
  },
];

export default function Reports() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Insights and trends for your society
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            This Month
          </Button>
          <Button variant="default">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {summaryStats.map((stat, index) => (
          <Card key={index} className="card-interactive">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-accent/10 text-accent">
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
        ))}
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collection Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Collection Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {monthlyData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-accent/20 rounded-t-lg transition-all duration-500 hover:bg-accent/30"
                      style={{ height: `${data.collection * 2}px` }}
                    >
                      <div
                        className="w-full bg-accent rounded-t-lg transition-all duration-500"
                        style={{ height: `${data.collection}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{data.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-accent" />
                  <span className="text-sm text-muted-foreground">Collection %</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Monthly Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Maintenance Collected</span>
                  <span className="font-semibold">₹10,85,000</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="w-[87%] h-full bg-success rounded-full" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">87% of target</p>
              </div>

              <div className="p-4 rounded-xl bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Pending Dues</span>
                  <span className="font-semibold">₹1,75,000</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="w-[13%] h-full bg-warning rounded-full" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">13% outstanding</p>
              </div>

              <div className="p-4 rounded-xl bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Overdue Amount</span>
                  <span className="font-semibold">₹62,000</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="w-[5%] h-full bg-destructive rounded-full" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">5% overdue</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-4 rounded-xl bg-success/10">
                  <p className="text-2xl font-bold text-success">45</p>
                  <p className="text-sm text-muted-foreground">Complaints Resolved</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-accent/10">
                  <p className="text-2xl font-bold text-accent">128</p>
                  <p className="text-sm text-muted-foreground">Visitor Entries</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
