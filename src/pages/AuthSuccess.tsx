// src/pages/AuthSuccess.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const AuthSuccess: React.FC = () => {
  const navigate = useNavigate();

  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [followerPos, setFollowerPos] = useState({ x: -100, y: -100 });
  const [cursorOpacity, setCursorOpacity] = useState(1);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      const padding = 40;
      const isNearEdge =
        e.clientX < padding ||
        e.clientY < padding ||
        e.clientX > window.innerWidth - padding ||
        e.clientY > window.innerHeight - padding;
      setCursorOpacity(isNearEdge ? 0 : 1);
    };

    const handleMouseLeave = () => setCursorOpacity(0);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const updateFollower = () => {
      setFollowerPos((prev) => {
        const dx = mousePos.x - prev.x;
        const dy = mousePos.y - prev.y;
        return { x: prev.x + dx * 0.12, y: prev.y + dy * 0.12 };
      });
      animationFrameId = requestAnimationFrame(updateFollower);
    };
    animationFrameId = requestAnimationFrame(updateFollower);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mousePos]);

  const confettiItems = Array.from({ length: 24 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 90 + 5}%`,
    delay: `${Math.random() * 0.8}s`,
    duration: `${2 + Math.random() * 1.5}s`,
    size: Math.random() > 0.5 ? 'w-2 h-2' : 'w-3 h-1.5',
    rotation: `${Math.random() * 360}deg`,
  }));

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1917] flex flex-col font-sans selection:bg-[#1C1917] selection:text-[#FAF9F6] relative overflow-hidden">
      <div
        className="pointer-events-none fixed z-50 w-3.5 h-3.5 rounded-full bg-[#1C1917] transition-opacity duration-300 ease-out -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{
          left: `${followerPos.x}px`,
          top: `${followerPos.y}px`,
          opacity: cursorOpacity,
        }}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {confettiItems.map((item) => (
          <div
            key={item.id}
            className={`absolute bg-[#1C1917] rounded-sm animate-in fade-in slide-in-from-top-full repeat-infinite duration-1000 ${item.size}`}
            style={{
              left: item.left,
              animationDelay: item.delay,
              transform: `rotate(${item.rotation})`,
            }}
          />
        ))}
      </div>

      <header className="bg-[#FFFFFF] border-b border-[#E7E5E4] px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1C1917] flex items-center justify-center font-black text-[#FAF9F6] text-base shadow-sm">
            S
          </div>
          <span className="text-lg font-black tracking-tight text-[#1C1917] uppercase">SideBySide</span>
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto p-6 flex flex-col justify-center my-auto z-20">
        <div className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-8 sm:p-10 shadow-[8px_8px_0px_0px_#1C1917] flex flex-col items-center text-center gap-6 relative animate-in zoom-in-90 fade-in duration-500">
          
          <div className="w-20 h-20 rounded-2xl bg-[#1C1917] text-[#FAF9F6] flex items-center justify-center shadow-lg relative z-10 animate-bounce duration-700 border-2 border-[#1C1917]">
            <svg
              className="w-10 h-10 stroke-current stroke-[3] fill-none"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black tracking-widest text-[#FAF9F6] uppercase bg-[#1C1917] px-3.5 py-1 rounded-md w-fit mx-auto shadow-sm">
              CONTA VERIFICADA COM SUCESSO
            </span>
            <h1 className="text-3xl font-black uppercase tracking-tight text-[#1C1917] mt-2">
              Sua jornada começa agora!
            </h1>
            <p className="text-xs text-[#57534E] font-medium leading-relaxed max-w-xs mx-auto">
              Tudo pronto! Você desbloqueou o acesso completo às salas de conversa ao vivo. Vamos praticar?
            </p>
          </div>

          <div className="w-full bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-2xl p-4 flex justify-around items-center">
            <div className="flex flex-col items-center">
              <span className="text-lg font-black text-[#1C1917]">100%</span>
              <span className="text-[9px] font-bold uppercase text-[#78716C]">Perfil Ativo</span>
            </div>
            <div className="w-px h-8 bg-[#E7E5E4]" />
            <div className="flex flex-col items-center">
              <span className="text-lg font-black text-[#1C1917]">01</span>
              <span className="text-[9px] font-bold uppercase text-[#78716C]">Passo Restante</span>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={() => navigate('/dashboard')}
            className="w-full py-4 bg-[#1C1917] hover:bg-[#292524] active:scale-95 text-[#FAF9F6] font-black text-xs uppercase tracking-widest rounded-xl transition-all border-2 border-[#1C1917] shadow-[4px_4px_0px_0px_#78716C] hover:shadow-none hover:translate-x-1 hover:translate-y-1 mt-2"
          >
            Entrar no Dashboard
          </Button>

        </div>
      </main>
    </div>
  );
};