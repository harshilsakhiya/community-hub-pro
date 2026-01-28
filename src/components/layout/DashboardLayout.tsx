import { useState, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
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
import ProtectedRoute from "@/components/auth/ProtectedRoute";

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
  { icon: CreditCard, label: "Billing", path: "/dashboard/billing" },
  { icon: UserCog, label: "Visitors", path: "/dashboard/visitors" },
  { icon: Car, label: "Vehicles", path: "/dashboard/vehicles" },
  { icon: MessageSquare, label: "Complaints", path: "/dashboard/complaints" },
  { icon: Bell, label: "Notices", path: "/dashboard/notices" },
  { icon: Shield, label: "Security", path: "/dashboard/security", roles: ["admin", "gatekeeper"] },
  { icon: BarChart3, label: "Reports", path: "/dashboard/reports", roles: ["admin", "committee_member"] },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  resident: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  gatekeeper: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  committee_member: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, isAuthenticated, loading } = useAuth();
  const { toast } = useToast();

  const isActive = (path: string) => location.pathname === path;

  // Check for access denied state
  useEffect(() => {
    if (location.state?.accessDenied) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to access that page.",
      });
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, toast, navigate, location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to logout. Please try again.",
      });
    }
  };

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true; // No role restriction
    if (!user?.role) return false;
    return item.roles.includes(user.role as any);
  });

  const userRole = user?.role || "resident";
  const roleLabel = userRole.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex w-full bg-background">
        {/* Mobile Header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <Building2 className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="font-semibold">SocietyHub</span>
            </div>
          </div>
          <Badge variant="secondary" className={cn("text-xs", roleColors[userRole])}>
            {roleLabel}
          </Badge>
        </header>

        {/* Sidebar Overlay */}
        {mobileOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-foreground/50 z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col bg-sidebar transition-all duration-300",
            collapsed ? "w-20" : "w-64",
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          {/* Logo */}
          <div className="h-16 lg:h-20 flex items-center gap-3 px-4 border-b border-sidebar-border">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-lg text-sidebar-foreground"
              >
                SocietyHub
              </motion.span>
            )}
          </div>

          {/* User Info */}
          {!collapsed && (
            <div className="px-4 py-4 border-b border-sidebar-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                  <User className="w-5 h-5 text-sidebar-accent-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user?.fullName || user?.email || "User"}
                  </p>
                  <Badge 
                    variant="secondary" 
                    className={cn("text-xs mt-1", roleColors[userRole])}
                  >
                    {roleLabel}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Nav Items */}
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                  isActive(item.path)
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5 flex-shrink-0", collapsed && "mx-auto")} />
                {!collapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="p-3 border-t border-sidebar-border space-y-1">
            {/* Profile Link */}
            <Link
              to="/dashboard/profile"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-3 rounded-lg transition-colors",
                isActive("/dashboard/profile")
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <User className={cn("w-5 h-5 flex-shrink-0", collapsed && "mx-auto")} />
              {!collapsed && <span className="font-medium">My Profile</span>}
            </Link>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-3 rounded-lg transition-colors",
                "text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive"
              )}
            >
              <LogOut className={cn("w-5 h-5 flex-shrink-0", collapsed && "mx-auto")} />
              {!collapsed && <span className="font-medium">Logout</span>}
            </button>
          </div>

          {/* Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex absolute -right-3 top-24 w-6 h-6 rounded-full bg-card border border-border items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:pt-0 pt-16">
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
}
