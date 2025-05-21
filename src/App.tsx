
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import PendingApproval from "@/components/PendingApproval";

import Index from "@/pages/Index";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import SurveyResponse from "@/pages/SurveyResponse";
import PublicSurvey from "@/pages/PublicSurvey";
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import AdminPanel from './pages/AdminPanel';
import SurveyLayout from './components/ui/SurveyLayout';
import SidebarProvider from "@/components/ui/sidebar";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnWindowFocus: true,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          {/* Routes for public surveys and landing pages */}
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/p/:publicCode" element={<PublicSurvey />} />
            <Route path="/preview/:publicCode" element={<PublicSurvey isPreviewMode={true} />} />
            <Route path="/pending" element={<PendingApproval />} />

            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Login />} />

            {/* Dashboard and protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <SurveyLayout>
                    <Index />
                  </SurveyLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/survey/:id"
              element={
                <ProtectedRoute>
                  <SurveyLayout>
                    <Index />
                  </SurveyLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route path="/survey-response/:id" element={<SurveyResponse />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
