import { motion } from "framer-motion";
import {
  CreditCard,
  Download,
  Search,
  Filter,
  ChevronDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const bills = [
  {
    id: "INV-001",
    unit: "A-201",
    resident: "Rajesh Kumar",
    amount: 5500,
    dueDate: "2025-02-05",
    status: "paid",
    paidDate: "2025-01-25",
  },
  {
    id: "INV-002",
    unit: "A-202",
    resident: "Priya Sharma",
    amount: 5500,
    dueDate: "2025-02-05",
    status: "pending",
    paidDate: null,
  },
  {
    id: "INV-003",
    unit: "B-101",
    resident: "Amit Patel",
    amount: 6200,
    dueDate: "2025-02-05",
    status: "overdue",
    paidDate: null,
  },
  {
    id: "INV-004",
    unit: "B-102",
    resident: "Sneha Gupta",
    amount: 6200,
    dueDate: "2025-02-05",
    status: "paid",
    paidDate: "2025-01-20",
  },
  {
    id: "INV-005",
    unit: "C-301",
    resident: "Vikram Singh",
    amount: 7000,
    dueDate: "2025-02-05",
    status: "pending",
    paidDate: null,
  },
];

const stats = [
  {
    title: "Total Billed",
    value: "₹14,20,000",
    icon: CreditCard,
    color: "bg-accent/10 text-accent",
  },
  {
    title: "Collected",
    value: "₹12,45,000",
    icon: CheckCircle2,
    color: "bg-success/10 text-success",
  },
  {
    title: "Pending",
    value: "₹1,75,000",
    icon: Clock,
    color: "bg-warning/10 text-warning",
  },
  {
    title: "Overdue",
    value: "₹62,000",
    icon: AlertCircle,
    color: "bg-destructive/10 text-destructive",
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "paid":
      return <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20">Paid</Badge>;
    case "pending":
      return <Badge className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/20">Pending</Badge>;
    case "overdue":
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">Overdue</Badge>;
    default:
      return null;
  }
};

export default function Billing() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Maintenance Billing</h1>
          <p className="text-muted-foreground">
            Manage bills, payments, and send reminders
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="default">
            <CreditCard className="w-4 h-4 mr-2" />
            Generate Bills
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
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
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Bills Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">January 2025 Bills</CardTitle>
            <div className="flex gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by unit or name..." className="pl-10" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Invoice</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Resident</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.map((bill) => (
                    <TableRow key={bill.id} className="table-row-interactive">
                      <TableCell className="font-medium">{bill.id}</TableCell>
                      <TableCell>{bill.unit}</TableCell>
                      <TableCell>{bill.resident}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{bill.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{new Date(bill.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(bill.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          {bill.status !== "paid" && (
                            <Button variant="ghost" size="sm">
                              <Send className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
