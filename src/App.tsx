
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SurveySidebar } from "@/components/survey/SurveySidebar";
import { AuthProvider } from "@/providers/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import SurveyResponse from "./pages/SurveyResponse";
import { Teams } from "@/components/teams/Teams";
import TeamsCreate from './pages/TeamsCreate';
import TeamDetails from './pages/TeamDetails';
import Profile from './pages/Profile';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Always fetch fresh data
      refetchOnWindowFocus: true
    }
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <SurveySidebar />
              <main className="flex-1">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } />
                  <Route path="/survey/:id" element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } />
                  <Route path="/survey-response/:id" element={<SurveyResponse />} />
                  <Route path="/teams" element={
                    <ProtectedRoute>
                      <Teams />
                    </ProtectedRoute>
                  } />
                  <Route path="/teams/create" element={
                    <ProtectedRoute>
                      <TeamsCreate />
                    </ProtectedRoute>
                  } />
                  <Route path="/teams/:id" element={
                    <ProtectedRoute>
                      <TeamDetails />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </SidebarProvider>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
