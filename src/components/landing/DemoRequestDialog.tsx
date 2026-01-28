import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Building2 } from "lucide-react";

interface DemoRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DemoRequestDialog({
  open,
  onOpenChange,
}: DemoRequestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    society_name: "",
    total_units: "",
    city: "",
    message: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.society_name
    ) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("demo_requests").insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        society_name: formData.society_name.trim(),
        total_units: formData.total_units
          ? parseInt(formData.total_units)
          : null,
        city: formData.city.trim() || null,
        message: formData.message.trim() || null,
      });

      if (error) throw error;

      toast({
        title: "Demo request submitted!",
        description: "Our team will contact you within 24 hours to schedule your demo.",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        society_name: "",
        total_units: "",
        city: "",
        message: "",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Demo request error:", error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">Request a Free Demo</DialogTitle>
          </div>
          <DialogDescription>
            Fill in your details and our team will schedule a personalized demo
            for your society.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="demo-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="demo-name"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="demo-email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="demo-phone">
                Phone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="demo-phone"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-city">City</Label>
              <Input
                id="demo-city"
                placeholder="Mumbai"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="demo-society">
                Society Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="demo-society"
                placeholder="Your society name"
                value={formData.society_name}
                onChange={(e) =>
                  setFormData({ ...formData, society_name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-units">Total Units</Label>
              <Input
                id="demo-units"
                type="number"
                placeholder="e.g., 100"
                value={formData.total_units}
                onChange={(e) =>
                  setFormData({ ...formData, total_units: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="demo-message">Additional Notes</Label>
            <Textarea
              id="demo-message"
              placeholder="Any specific requirements or questions?"
              rows={3}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Building2 className="w-5 h-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">₹10/unit/month</span>{" "}
              • 14-day free trial • No credit card required
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Request Demo"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
