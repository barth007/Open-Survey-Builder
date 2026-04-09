import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Auth (static — small, needed immediately)
import PendingApproval from '@/components/PendingApproval';

// Route constants
import {
  LEGACY_PUBLIC_RESPONSE_ROUTE,
  LEGACY_PUBLIC_SURVEY_ROUTE,
  PENDING_APPROVAL_ROUTE,
  PUBLIC_SURVEY_ROUTE,
} from '@/lib/survey-routes';

// Lazy-loaded pages
const Login = lazy(() => import('@/features/auth/pages/Login'));
const ResetPassword = lazy(() => import('@/features/auth/pages/ResetPassword'));
const Dashboard = lazy(() => import('@/features/dashboard/pages/Dashboard'));
const Editor = lazy(() => import('@/features/survey-editor/pages/Editor'));
const PublicSurvey = lazy(() => import('@/features/survey-response/pages/PublicSurvey'));
const Profile = lazy(() => import('@/features/user/pages/Profile'));
const AdminPanel = lazy(() => import('@/features/system/pages/AdminPanel'));
const NotFound = lazy(() => import('@/features/system/pages/NotFound'));
const Landing = lazy(() => import('@/features/marketing/pages/Landing'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path={PENDING_APPROVAL_ROUTE} element={<PendingApproval />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/survey/:id"
          element={
            <ProtectedRoute>
              <Editor />
            </ProtectedRoute>
          }
        />
        <Route path={PUBLIC_SURVEY_ROUTE} element={<PublicSurvey />} />
        <Route path={LEGACY_PUBLIC_SURVEY_ROUTE} element={<PublicSurvey />} />
        <Route path={LEGACY_PUBLIC_RESPONSE_ROUTE} element={<PublicSurvey />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
