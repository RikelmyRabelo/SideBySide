import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Room } from '../pages/Room';
import { Profile } from '../pages/Profile';
import { VerifyCode } from '../pages/VerifyCode';
import { Terms } from '../pages/Terms';
import { Moderation } from '../pages/Moderation';
import { Privacy } from '../pages/Privacy';
import { AuthSuccess } from '../pages/AuthSuccess';
import { ForgotPassword } from '../pages/ForgotPassword';
import { Onboarding } from '../pages/Onboarding';
import { ResetPassword } from '../pages/ResetPassword';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/moderation" element={<Moderation />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/verify-code" element={<VerifyCode />} />
      <Route path="/auth-success" element={<AuthSuccess />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Rotas Protegidas / Internas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/room" element={<Room />} />
        <Route path="/room/:topicId" element={<Room />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Redirecionamento Padrão */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};