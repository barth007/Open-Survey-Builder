
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";

import Index from "@/pages/Index";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import SurveyResponse from "@/pages/SurveyResponse";
import PublicSurvey from "@/pages/PublicSurvey";
import PublicSurveyPreview from '@/pages/preview/PublicSurveyPreview';
import { useLocation } from "react-router-dom";

const RedirectSurveyResponse = () => {
  const location = useLocation();
  const id = location.pathname.split("/").pop();
  return <Navigate to={`/survey/${id}`} replace />;
};

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
          <main className="flex-1">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route path="/survey/:id" element={<SurveyResponse />} />
              <Route path="/preview/:publicCode" element={<PublicSurveyPreview />} />
              <Route path="/survey-response/:id" element={<RedirectSurveyResponse />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
