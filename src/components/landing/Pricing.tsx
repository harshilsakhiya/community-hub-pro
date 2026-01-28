import { Check, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  "Unlimited residents & family members",
  "Maintenance billing & tracking",
  "Visitor management system",
  "Complaint management",
  "Notice board & announcements",
  "Vehicle & parking management",
  "Dashboard analytics",
  "Mobile responsive design",
  "Email notifications",
  "24/7 support",
];

interface PricingProps {
  onRequestDemo: () => void;
}

export function Pricing({ onRequestDemo }: PricingProps) {
  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pay only for what you use. No hidden fees, no surprises.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <Card className="relative overflow-hidden border-2 border-primary shadow-xl">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-medium rounded-bl-lg">
              Most Popular
            </div>
            <CardHeader className="text-center pb-2 pt-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Per Unit Pricing</CardTitle>
              <p className="text-muted-foreground mt-2">
                Perfect for societies of all sizes
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-primary">₹10</span>
                  <span className="text-xl text-muted-foreground">/unit</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">per month</p>
                <div className="mt-4 p-3 bg-accent/50 rounded-lg">
                  <p className="text-sm font-medium text-foreground">
                    Example: 100 units = ₹1,000/month
                  </p>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={onRequestDemo}
                className="w-full h-12 text-lg font-semibold"
                size="lg"
              >
                Request Free Demo
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-3">
                No credit card required • 14-day free trial
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
