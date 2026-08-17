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
    const verifySessionAndSyncUser = async () => {
      try {
        // Busca o usuário atualizado do backend usando os cookies seguros
        const response = await fetch('http://localhost:3000/api/user/me', {
          credentials: 'include', 
        });

        if (response.ok) {
          const userData = await response.json();
          
          // A MÁGICA ACONTECE AQUI: Atualiza o cache local com os dados mais recentes!
          // Isso garante que o Dashboard, Header e Profile leiam a foto e o nome corretos.
          localStorage.setItem('user', JSON.stringify(userData));
          
          setIsAuthenticated(true);
        } else {
          // Se a sessão for inválida/expirada, limpa os resquícios locais
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        // Em caso de instabilidade de rede rápida, tenta confiar no token local como fallback
        setIsAuthenticated(!!localStorage.getItem('token'));
      } finally {
        setIsVerifying(false);
      }
    };

    verifySessionAndSyncUser();
  }, []);

  // Tela de loading estilizada enquanto sincroniza as informações
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

  // Se não estiver logado de fato, bloqueia o acesso e joga pro login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // Libera a renderização da rota protegida (Dashboard, Profile, Room, etc)
  return <Outlet />;
};