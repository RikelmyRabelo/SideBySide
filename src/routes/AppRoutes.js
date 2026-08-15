import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
export const AppRoutes = () => {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Login, {}) }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/terms", element: _jsx(Terms, {}) }), _jsx(Route, { path: "/moderation", element: _jsx(Moderation, {}) }), _jsx(Route, { path: "/privacy", element: _jsx(Privacy, {}) }), _jsx(Route, { path: "/verify-code", element: _jsx(VerifyCode, {}) }), _jsx(Route, { path: "/auth-success", element: _jsx(AuthSuccess, {}) }), _jsx(Route, { path: "/forgot-password", element: _jsx(ForgotPassword, {}) }), _jsx(Route, { path: "/reset-password", element: _jsx(ResetPassword, {}) }), _jsxs(Route, { element: _jsx(ProtectedRoute, {}), children: [_jsx(Route, { path: "/onboarding", element: _jsx(Onboarding, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/room", element: _jsx(Room, {}) }), _jsx(Route, { path: "/room/:topicId", element: _jsx(Room, {}) }), _jsx(Route, { path: "/profile", element: _jsx(Profile, {}) })] }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }));
};
