import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface MatchingModalProps {
  isOpen: boolean;
  onCancel: () => void;
  userLevel?: string;
}

export const MatchingModal: React.FC<MatchingModalProps> = ({
  isOpen,
  onCancel,
  userLevel = 'B1',
}) => {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isOpen) {
      setSeconds(0);
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 max-w-lg w-full flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden">
        
        {/* Animação Radar */}
        <div className="relative flex items-center justify-center my-6">
          <div className="absolute w-44 h-44 rounded-full border border-emerald-500/20 animate-ping" />
          <div className="absolute w-32 h-32 rounded-full border border-emerald-500/40 animate-pulse" />
          <div className="w-20 h-20 rounded-full bg-blue-600/20 border border-blue-500/50 flex items-center justify-center z-10 shadow-lg shadow-blue-500/20">
            <span className="text-3xl">🌐</span>
          </div>
        </div>

        {/* Status de Busca */}
        <div className="flex flex-col items-center gap-1 text-center">
          <h2 className="text-xl font-extrabold text-white">
            Buscando um parceiro de nível {userLevel}...
          </h2>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Tempo decorrido: {formatTime(seconds)}</span>
          </div>
        </div>

        {/* Card Dica de Vocabulário */}
        <div className="w-full bg-white rounded-2xl p-5 text-slate-900 flex flex-col gap-2 shadow-lg">
          <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider">
            <span>💡</span> DICA DE VOCABULÁRIO ENQUANTO ESPERA
          </div>
          <h3 className="text-base font-extrabold text-slate-900">
            "To cut to the chase"
          </h3>
          <span className="text-xs text-slate-500 italic">
            Pronúncia: /kʌt tuː ðə tʃeɪs/
          </span>
          <p className="text-xs text-slate-700 font-medium pt-1 border-t border-slate-100 mt-1">
            <strong>Tradução:</strong> Ir direto ao ponto, direto ao assunto de forma objetiva.
          </p>
        </div>

        {/* Botão de Ação para Teste de Redirecionamento e Cancelar */}
        <div className="w-full flex flex-col gap-3 mt-2">
          <button
            type="button"
            onClick={() => navigate('/room')}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition-all shadow-md"
          >
            Simular Par Encontrado (Ir para Chamada)
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-3 border border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2"
          >
            <span>✕</span> Cancelar Busca
          </button>
        </div>

      </div>
    </div>
  );
};