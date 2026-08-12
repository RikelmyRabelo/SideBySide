import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Room } from '../pages/Room';
import { Profile } from '../pages/Profile';
import { VerifyCode } from '../pages/VerifyCode';
import { Terms } from '../pages/Terms';
import { Privacy } from '../pages/Privacy';
import { Moderation } from '../pages/Moderation';

export const AppRoutes: React.FC = () => {
  const isAuthenticated = true;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/moderation" element={<Moderation />} />
      <Route path="/verify-code" element={<VerifyCode />} />

      <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/room/:topicId?" element={<Room />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};