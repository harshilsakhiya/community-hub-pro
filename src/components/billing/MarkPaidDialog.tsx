import { useState } from "react";
import { Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMarkBillPaid } from "@/hooks/useSupabaseData";

interface Bill {
  id: string;
  invoice_number: string;
  amount: number;
  late_fee: number | null;
  units?: {
    unit_number: string;
    block: string;
  } | null;
}

interface MarkPaidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: Bill | null;
}

export function MarkPaidDialog({ open, onOpenChange, bill }: MarkPaidDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [transactionId, setTransactionId] = useState("");
  const markPaidMutation = useMarkBillPaid();

  const handleMarkPaid = async () => {
    if (!bill) return;

    markPaidMutation.mutate(
      { billId: bill.id, paymentMethod },
      {
        onSuccess: () => {
          onOpenChange(false);
          setPaymentMethod("cash");
          setTransactionId("");
        },
      }
    );
  };

  if (!bill) return null;

  const totalAmount = Number(bill.amount) + Number(bill.late_fee || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-success" />
            Mark Bill as Paid
          </DialogTitle>
          <DialogDescription>
            Record payment for {bill.invoice_number}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Unit</span>
              <span className="font-medium">
                {bill.units ? `${bill.units.block}-${bill.units.unit_number}` : "-"}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Base Amount</span>
              <span>₹{Number(bill.amount).toLocaleString()}</span>
            </div>
            {Number(bill.late_fee) > 0 && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Late Fee</span>
                <span className="text-destructive">
                  +₹{Number(bill.late_fee).toLocaleString()}
                </span>
              </div>
            )}
            <div className="border-t pt-2 mt-2 flex justify-between items-center">
              <span className="font-medium">Total</span>
              <span className="text-lg font-bold">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="netbanking">Net Banking</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
            <Input
              id="transactionId"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter transaction reference"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleMarkPaid}
            disabled={markPaidMutation.isPending}
            className="bg-success hover:bg-success/90"
          >
            {markPaidMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Confirm Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
