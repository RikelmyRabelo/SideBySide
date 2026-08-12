import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Terms } from './pages/Terms';
import { Moderation } from './pages/Moderation';
import { Privacy } from './pages/Privacy';
import { Dashboard } from './pages/Dashboard';
import { Room } from './pages/Room';
import { Profile } from './pages/Profile';
import { VerifyCode } from './pages/VerifyCode';
import { Onboarding } from './pages/Onboarding';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/moderation" element={<Moderation />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Rotas Privadas / Internas */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/room" element={<Room />} />
        <Route path="/profile" element={<Profile />} />

        {/* Redirecionamento para Rota Padrão */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;