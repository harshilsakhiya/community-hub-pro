"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2,
  LayoutDashboard,
  CreditCard,
  Users,
  MessageSquare,
  Bell,
  Shield,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  User,
  Home,
  Car,
  UserCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

type NavItem = {
  icon: any;
  label: string;
  path: string;
  roles?: ("admin" | "resident" | "gatekeeper" | "committee_member")[];
};

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Building2, label: "Society", path: "/dashboard/society", roles: ["admin"] },
  { icon: Home, label: "Buildings", path: "/dashboard/buildings", roles: ["admin", "committee_member"] },
  { icon: Users, label: "Residents", path: "/dashboard/residents", roles: ["admin", "committee_member"] },
  { icon: UserCog, label: "Users", path: "/dashboard/users", roles: ["admin"] },
  { icon: CreditCard, label: "Billing", path: "/dashboard/billing" },
  { icon: Users, label: "Visitors", path: "/dashboard/visitors" },
  { icon: Car, label: "Vehicles", path: "/dashboard/vehicles" },
  { icon: MessageSquare, label: "Complaints", path: "/dashboard/complaints" },
  { icon: Bell, label: "Notices", path: "/dashboard/notices" },
  { icon: Shield, label: "Security", path: "/dashboard/security", roles: ["admin", "gatekeeper"] },
  { icon: BarChart3, label: "Reports", path: "/dashboard/reports", roles: ["admin", "committee_member"] },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  { icon: User, label: "Profile", path: "/dashboard/profile" },
];

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default function NextDashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isAdmin, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Success",
        description: "You have been logged out",
      });
      router.push("/auth");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  const getVisibleNavItems = (): NavItem[] => {
    return navItems.filter((item) => {
      if (!item.roles) return true;
      return hasRole(item.roles as any);
    });
  };

  const isActive = (path: string): boolean => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <motion.div
        className={cn(
          "bg-card border-r border-border fixed left-0 top-0 h-screen z-40 transition-all duration-300 overflow-y-auto",
          sidebarOpen ? "w-64" : "w-20"
        )}
        initial={false}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {sidebarOpen && (
            <h1 className="text-lg font-bold text-foreground">Hub Pro</h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden sm:flex"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Nav Items */}
        <nav className="p-4 space-y-2">
          {getVisibleNavItems().map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link key={item.path} href={item.path}>
                <motion.button
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent text-muted-foreground"
                  )}
                  whileHover={{ x: 4 }}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm">{item.label}</span>}
                </motion.button>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
          {user && (
            <div className="space-y-2">
              {sidebarOpen && (
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-foreground truncate">
                    {user.fullName || user.email}
                  </p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {user.role}
                  </Badge>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                {sidebarOpen && <span className="text-xs ml-2">Logout</span>}
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={cn("flex-1 flex flex-col", sidebarOpen ? "ml-64" : "ml-20")}>
        {/* Top Header */}
        <header className="bg-card border-b border-border sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>

            <div className="flex-1" />

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.fullName || "User"}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background">
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
