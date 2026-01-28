import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AntdProvider } from "@/config/antd";

// Pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

// Dashboard with Ant Design
import DashboardLayoutAntd from "./components/layout/DashboardLayoutAntd";
import DashboardAntd from "./pages/DashboardAntd";
import Buildings from "./pages/Buildings";
import Residents from "./pages/Residents";
import BillingAntd from "./pages/BillingAntd";
import VisitorsAntd from "./pages/VisitorsAntd";
import Vehicles from "./pages/Vehicles";
import ComplaintsAntd from "./pages/ComplaintsAntd";
import NoticesAntd from "./pages/NoticesAntd";
import Security from "./pages/Security";
import ReportsAntd from "./pages/ReportsAntd";
import SettingsPage from "./pages/Settings";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AntdProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<AdminPanel />} />
              
              {/* Dashboard Routes - Ant Design */}
              <Route path="/dashboard" element={<DashboardLayoutAntd />}>
                <Route index element={<DashboardAntd />} />
                <Route path="buildings" element={<Buildings />} />
                <Route path="residents" element={<Residents />} />
                <Route path="billing" element={<BillingAntd />} />
                <Route path="visitors" element={<VisitorsAntd />} />
                <Route path="vehicles" element={<Vehicles />} />
                <Route path="complaints" element={<ComplaintsAntd />} />
                <Route path="notices" element={<NoticesAntd />} />
                <Route path="security" element={<Security />} />
                <Route path="reports" element={<ReportsAntd />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AntdProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
