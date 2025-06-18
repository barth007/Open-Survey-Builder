// src/app/routes.tsx
import { Routes, Route } from 'react-router-dom';

// Auth
import Login from '@/features/auth/pages/Login';

// Dashboard
import Dashboard from '@/features/dashboard/pages/Dashboard';

// Survey Editor
import Editor from '@/features/survey-editor/pages/Editor';

// Public Survey
import PublicSurvey from '@/features/survey-response/pages/PublicSurvey';
import SurveyResponse from '@/features/survey-response/pages/SurveyResponse'; // opzionale

// User
import Profile from '@/features/user/pages/Profile';

// System
import AdminPanel from '@/features/system/pages/AdminPanel';
import NotFound from '@/features/system/pages/NotFound';

// Landing
import Landing from '@/features/marketing/pages/Landing';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/survey/:id" element={<Editor />} />
      <Route path="/public/:code" element={<PublicSurvey />} />
      <Route path="/public-response/:code" element={<SurveyResponse />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
