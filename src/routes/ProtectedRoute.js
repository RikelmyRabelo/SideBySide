import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet } from 'react-router-dom';
export const ProtectedRoute = ({ redirectPath = '/', }) => {
    const isAuthenticated = !!localStorage.getItem('token');
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: redirectPath, replace: true });
    }
    return _jsx(Outlet, {});
};
