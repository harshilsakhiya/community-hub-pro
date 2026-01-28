import { motion } from "framer-motion";
import {
  Settings,
  Building2,
  Users,
  Bell,
  CreditCard,
  Shield,
  Palette,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const settingsSections = [
  {
    icon: Building2,
    title: "Society Details",
    description: "Manage society name, address, and basic information",
  },
  {
    icon: Users,
    title: "User Management",
    description: "Add admins, assign roles, and manage permissions",
  },
  {
    icon: CreditCard,
    title: "Billing Settings",
    description: "Configure maintenance rates, due dates, and late fees",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Set up email, SMS, and push notification preferences",
  },
  {
    icon: Shield,
    title: "Security",
    description: "Configure gate settings, visitor rules, and security protocols",
  },
  {
    icon: Palette,
    title: "Appearance",
    description: "Customize colors, logo, and branding for your society",
  },
];

export default function SettingsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your society configuration and preferences
        </p>
      </motion.div>

      {/* Settings Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 mb-8"
      >
        {settingsSections.map((section, index) => (
          <Card key={index} className="card-interactive cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent/10 text-accent">
                  <section.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{section.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Quick Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Settings</CardTitle>
            <CardDescription>
              Toggle common settings on and off
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email updates for new complaints and payments
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Auto-generate Monthly Bills</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically create bills on the 1st of each month
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Visitor Pre-approval Required</Label>
                <p className="text-sm text-muted-foreground">
                  Residents must pre-approve visitors before entry
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Late Fee on Overdue Bills</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically apply late fees after due date
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
