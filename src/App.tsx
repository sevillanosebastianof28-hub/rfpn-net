import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Landing from "./pages/Landing";
import FAQ from "./pages/FAQ";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Admin Layout & Pages
import { AdminLayout } from "./components/layout/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Contacts from "./pages/admin/Contacts";
import Users from "./pages/admin/Users";
import Applications from "./pages/admin/Applications";
import AuditLogs from "./pages/admin/AuditLogs";
import Settings from "./pages/admin/Settings";

// Developer Portal
import DeveloperLayout from "./pages/developer/DeveloperLayout";
import DeveloperDashboard from "./pages/developer/DeveloperDashboard";
import DeveloperProfile from "./pages/developer/DeveloperProfile";
import DeveloperApplications from "./pages/developer/DeveloperApplications";
import DevMessages from "./pages/developer/Messages";
import SocialFeed from "./pages/developer/SocialFeed";

// Broker Portal
import BrokerLayout from "./pages/broker/BrokerLayout";
import BrokerDashboard from "./pages/broker/BrokerDashboard";
import BrokerProfile from "./pages/broker/BrokerProfile";
import BrokerApplications from "./pages/broker/BrokerApplications";
import BrokerMessages from "./pages/broker/BrokerMessages";
import BrokerFeed from "./pages/broker/BrokerFeed";

// Components
import { ChatBot } from "./components/ChatBot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="contacts" element={<Contacts />} />
              <Route path="users" element={<Users />} />
              <Route path="applications" element={<Applications />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Developer Routes */}
            <Route path="/developer" element={<DeveloperLayout />}>
              <Route index element={<DeveloperDashboard />} />
              <Route path="profile" element={<DeveloperProfile />} />
              <Route path="applications" element={<DeveloperApplications />} />
              <Route path="messages" element={<DevMessages />} />
              <Route path="feed" element={<SocialFeed />} />
            </Route>

            {/* Broker Routes */}
            <Route path="/broker" element={<BrokerLayout />}>
              <Route index element={<BrokerDashboard />} />
              <Route path="profile" element={<BrokerProfile />} />
              <Route path="applications" element={<BrokerApplications />} />
              <Route path="messages" element={<BrokerMessages />} />
              <Route path="feed" element={<BrokerFeed />} />
            </Route>
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatBot />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
