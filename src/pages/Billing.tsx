import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  Loader2,
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
import { useBills, useBillStats, useMarkBillPaid } from "@/hooks/useSupabaseData";

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
  const [searchQuery, setSearchQuery] = useState("");
  const { data: bills, isLoading: billsLoading } = useBills();
  const { data: stats, isLoading: statsLoading } = useBillStats();
  const markPaidMutation = useMarkBillPaid();

  const filteredBills = bills?.filter(bill => 
    bill.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.units?.unit_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.units?.block.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statCards = [
    {
      title: "Total Billed",
      value: `₹${(stats?.totalBilled || 0).toLocaleString()}`,
      icon: CreditCard,
      color: "bg-accent/10 text-accent",
    },
    {
      title: "Collected",
      value: `₹${(stats?.collected || 0).toLocaleString()}`,
      icon: CheckCircle2,
      color: "bg-success/10 text-success",
    },
    {
      title: "Pending",
      value: `₹${(stats?.pending || 0).toLocaleString()}`,
      icon: Clock,
      color: "bg-warning/10 text-warning",
    },
    {
      title: "Overdue",
      value: `₹${(stats?.overdue || 0).toLocaleString()}`,
      icon: AlertCircle,
      color: "bg-destructive/10 text-destructive",
    },
  ];

  const handleMarkPaid = (billId: string) => {
    markPaidMutation.mutate({ billId, paymentMethod: 'cash' });
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
        {statCards.map((stat, index) => (
          <Card key={index} className="card-interactive">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-xl font-bold">
                    {statsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : stat.value}
                  </p>
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
            <CardTitle className="text-lg">Maintenance Bills</CardTitle>
            <div className="flex gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by unit or invoice..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {billsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : filteredBills && filteredBills.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Invoice</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBills.map((bill) => (
                      <TableRow key={bill.id} className="table-row-interactive">
                        <TableCell className="font-medium">{bill.invoice_number}</TableCell>
                        <TableCell>
                          {bill.units ? `${bill.units.block}-${bill.units.unit_number}` : '-'}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ₹{(Number(bill.amount) + Number(bill.late_fee || 0)).toLocaleString()}
                        </TableCell>
                        <TableCell>{new Date(bill.due_date).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(bill.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                            {bill.status !== "paid" && (
                              <>
                                <Button variant="ghost" size="sm">
                                  <Send className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleMarkPaid(bill.id)}
                                  disabled={markPaidMutation.isPending}
                                >
                                  {markPaidMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No bills found
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
