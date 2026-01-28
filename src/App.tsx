import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

// Pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

// Dashboard with shadcn/ui
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Buildings from "./pages/Buildings";
import Residents from "./pages/Residents";
import Billing from "./pages/Billing";
import Visitors from "./pages/Visitors";
import Vehicles from "./pages/Vehicles";
import Complaints from "./pages/Complaints";
import Notices from "./pages/Notices";
import Security from "./pages/Security";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/Settings";
import Profile from "./pages/Profile";
import SocietyManagement from "./pages/SocietyManagement";

// Auth components
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<AdminPanel />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="society" element={<SocietyManagement />} />
              <Route path="buildings" element={<Buildings />} />
              <Route path="residents" element={<Residents />} />
              <Route path="billing" element={<Billing />} />
              <Route path="visitors" element={<Visitors />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="complaints" element={<Complaints />} />
              <Route path="notices" element={<Notices />} />
              <Route path="security" element={<Security />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
