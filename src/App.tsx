
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SurveySidebar } from "@/components/survey/SurveySidebar";
import { AuthProvider } from "@/providers/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import PendingApproval from "@/components/PendingApproval";
import { ClickProvider } from "@/contexts/ClickContext";

import Index from "@/pages/Index";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import SurveyResponse from "@/pages/SurveyResponse";
import PublicSurvey from "@/pages/PublicSurvey";
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import AdminPanel from './pages/AdminPanel';

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
          
          <ClickProvider>
            {/* Routes for public surveys and landing pages don't need SidebarProvider */}
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/p/:publicCode" element={<PublicSurvey />} />
              <Route path="/preview/:publicCode" element={<PublicSurvey isPreviewMode={true} />} />
              <Route path="/pending" element={<PendingApproval />} />
              
              {/* All other routes with standard layout */}
              <Route path="*" element={
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <SurveySidebar />
                    <main className="flex-1">
                      <Routes>
                        <Route path="/login" element={<Login />} />
                        {/* Update register route to point to Login component for now */}
                        <Route path="/register" element={<Login />} />
                        <Route
                          path="/dashboard"
                          element={
                            <ProtectedRoute>
                              <Index />
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
                        <Route
                          path="/survey/:id"
                          element={
                            <ProtectedRoute>
                              <Index />
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
                    </main>
                  </div>
                </SidebarProvider>
              } />
            </Routes>
          </ClickProvider>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
