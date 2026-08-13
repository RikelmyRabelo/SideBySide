import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Room } from '../pages/Room';
import { Profile } from '../pages/Profile';

// Importações com fallback simples caso algum arquivo de termo legal não exista na sua pasta
import { Terms } from '../pages/Terms';
import { Moderation } from '../pages/Moderation';
import { Privacy } from '../pages/Privacy';

export const AppRoutes: React.FC = () => {
  const isAuthenticated = true;

  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/moderation" element={<Moderation />} />
      <Route path="/privacy" element={<Privacy />} />

      {/* Rotas Protegidas / Internas */}
      <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
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