import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Layout } from '../components/layout/Layout';
import { Spinner } from '../components/ui/Spinner';

// Pages
import { HomePage } from '../features/home/HomePage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { AuthCallbackPage } from '../features/auth/AuthCallbackPage';
import { StudentPortfolioPage } from '../features/student-portfolio/StudentPortfolioPage';
import { CompanyInternshipsPage } from '../features/company-internships/CompanyInternshipsPage';
import { SearchMatchingPage } from '../features/search-matching/SearchMatchingPage';
import { ApplicationsPage } from '../features/applications/ApplicationsPage';
import { VerificationRatingPage } from '../features/verification-rating/VerificationRatingPage';
import { ChatPage } from '../features/chat/ChatPage';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Spinner size="lg" className="h-64" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="auth/callback" element={<AuthCallbackPage />} />
        <Route path="search" element={<SearchMatchingPage />} />

        {/* Protected Student Routes */}
        <Route
          path="student/portfolio"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentPortfolioPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Company Routes */}
        <Route
          path="company/internships"
          element={
            <ProtectedRoute allowedRoles={['company']}>
              <CompanyInternshipsPage />
            </ProtectedRoute>
          }
        />

        {/* Shared Protected Routes */}
        <Route
          path="applications"
          element={
            <ProtectedRoute allowedRoles={['student', 'company']}>
              <ApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="verifications"
          element={
            <ProtectedRoute allowedRoles={['reviewer', 'admin']}>
              <VerificationRatingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
