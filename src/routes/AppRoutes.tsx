import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

const Login = lazy(() => import('../pages/Login').then(module => ({ default: module.Login })));
const Dashboard = lazy(() => import('../pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Room = lazy(() => import('../pages/Room').then(module => ({ default: module.Room })));
const Profile = lazy(() => import('../pages/Profile').then(module => ({ default: module.Profile })));
const VerifyCode = lazy(() => import('../pages/VerifyCode').then(module => ({ default: module.VerifyCode })));
const Terms = lazy(() => import('../pages/Terms').then(module => ({ default: module.Terms })));
const Moderation = lazy(() => import('../pages/Moderation').then(module => ({ default: module.Moderation })));
const Privacy = lazy(() => import('../pages/Privacy').then(module => ({ default: module.Privacy })));
const AuthSuccess = lazy(() => import('../pages/AuthSuccess').then(module => ({ default: module.AuthSuccess })));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword').then(module => ({ default: module.ForgotPassword })));
const Onboarding = lazy(() => import('../pages/Onboarding').then(module => ({ default: module.Onboarding })));
const ResetPassword = lazy(() => import('../pages/ResetPassword').then(module => ({ default: module.ResetPassword })));

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Carregando...</div>}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/moderation" element={<Moderation />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/auth-success" element={<AuthSuccess />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/room" element={<Room />} />
          <Route path="/room/:topicId" element={<Room />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};