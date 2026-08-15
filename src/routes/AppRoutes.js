import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense, lazy } from 'react';
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
export const AppRoutes = () => {
    return (_jsx(Suspense, { fallback: _jsx("div", { className: "flex h-screen w-full items-center justify-center", children: "Carregando..." }), children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Login, {}) }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/terms", element: _jsx(Terms, {}) }), _jsx(Route, { path: "/moderation", element: _jsx(Moderation, {}) }), _jsx(Route, { path: "/privacy", element: _jsx(Privacy, {}) }), _jsx(Route, { path: "/verify-code", element: _jsx(VerifyCode, {}) }), _jsx(Route, { path: "/auth-success", element: _jsx(AuthSuccess, {}) }), _jsx(Route, { path: "/forgot-password", element: _jsx(ForgotPassword, {}) }), _jsx(Route, { path: "/reset-password", element: _jsx(ResetPassword, {}) }), _jsxs(Route, { element: _jsx(ProtectedRoute, {}), children: [_jsx(Route, { path: "/onboarding", element: _jsx(Onboarding, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/room", element: _jsx(Room, {}) }), _jsx(Route, { path: "/room/:topicId", element: _jsx(Room, {}) }), _jsx(Route, { path: "/profile", element: _jsx(Profile, {}) })] }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }));
};
