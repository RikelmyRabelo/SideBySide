import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] text-[#1C1917] p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-8 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black uppercase tracking-tight text-[#1C1917]">
            Meu Perfil
          </h1>
          <p className="text-xs text-[#78716C]">
            Gerencie suas informações pessoais e configurações de conta do SideBySide.
          </p>
        </div>

        <div className="pt-4 border-t border-[#E7E5E4]">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
          >
            ← Voltar para Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};