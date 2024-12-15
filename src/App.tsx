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
              <Route path="/features/freshdesk" element={<FeatureRequests />} />
              <Route path="/features/zoho" element={<FeatureRequests />} />
              <Route path="/features/zendesk" element={<FeatureRequests />} />
              <Route path="/features/gmail" element={<FeatureRequests />} />
              <Route path="/business" element={<BusinessIntelligence />} />
            </Route>
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;