import { jsx as _jsx } from "react/jsx-runtime";
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
export const App = () => {
    return (_jsx(BrowserRouter, { children: _jsx(AppRoutes, {}) }));
};
export default App;
