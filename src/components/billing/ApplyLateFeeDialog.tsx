import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface ApplyLateFeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplyLateFeeDialog({ open, onOpenChange }: ApplyLateFeeDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleApplyLateFee = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("mark-overdue-bills");

      if (error) throw error;

      toast({
        title: "Late Fees Applied",
        description: data.message || `Updated ${data.updatedCount} bills`,
      });

      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["bill-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      onOpenChange(false);
    } catch (error) {
      console.error("Error applying late fees:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to apply late fees",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Apply Late Fees
          </DialogTitle>
          <DialogDescription>
            This will mark all pending bills past their due date as overdue and apply a
            10% late fee. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg bg-warning/10 p-4 text-sm">
            <p className="font-medium text-warning">What will happen:</p>
            <ul className="mt-2 list-disc list-inside text-muted-foreground space-y-1">
              <li>All pending bills past due date will be marked as "Overdue"</li>
              <li>10% late fee will be added to overdue bills</li>
              <li>Residents will see the updated amounts</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleApplyLateFee} 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Apply Late Fees
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
