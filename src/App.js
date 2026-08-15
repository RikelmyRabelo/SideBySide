import { jsx as _jsx } from "react/jsx-runtime";
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/ui/ToastContext';
export const App = () => {
    return (_jsx(ErrorBoundary, { children: _jsx(ToastProvider, { children: _jsx(BrowserRouter, { children: _jsx(AppRoutes, {}) }) }) }));
};
export default App;
