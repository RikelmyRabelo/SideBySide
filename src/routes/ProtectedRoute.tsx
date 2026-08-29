import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  redirectPath = '/',
}) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const verifySessionAndSyncUser = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/user/me', {
          credentials: 'include', 
        });

        if (response.ok) {
          const userData = await response.json();
          const currentLocalUser = localStorage.getItem('user');
          const newLocalUser = JSON.stringify(userData);

          // Só atualiza o localStorage se houver mudanças reais para evitar loops de re-renderização
          if (currentLocalUser !== newLocalUser) {
            localStorage.setItem('user', newLocalUser);
          }
          
          if (isMounted) setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (isMounted) setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        if (isMounted) setIsAuthenticated(!!localStorage.getItem('token'));
      } finally {
        if (isMounted) setIsVerifying(false);
      }
    };

    verifySessionAndSyncUser();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isVerifying) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#FAF9F6] text-[#1C1917]">
        <span className="w-8 h-8 rounded-full border-4 border-[#1C1917] border-t-transparent animate-spin mb-4" />
        <span className="text-[10px] font-black uppercase tracking-widest text-[#78716C]">
          Sincronizando Perfil...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};