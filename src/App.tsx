import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import Layout from "./components/layout/Layout";
import CustomerIntelligence from "./pages/CustomerIntelligence";
import FeatureRequests from "./pages/FeatureRequests";
import BusinessIntelligence from "./pages/BusinessIntelligence";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import GeneralSettings from "./pages/profile/GeneralSettings";
import Integrations from "./pages/profile/Integrations";
import CustomRequests from "./pages/CustomRequests"; // New import

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Layout />}>
              <Route path="/" element={<CustomerIntelligence />} />
              <Route path="/features" element={<FeatureRequests />} />
              <Route path="/custom-requests" element={<CustomRequests />} /> {/* New route */}
              <Route path="/business" element={<BusinessIntelligence />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/profile" element={<Profile />}>
                <Route path="settings" element={<GeneralSettings />} />
                <Route path="integrations" element={<Integrations />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;