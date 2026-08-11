import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReportModal } from '../components/room/ReportModal';

export const Room: React.FC = () => {
  const navigate = useNavigate();
  const [micActive, setMicActive] = useState(true);
  const [camActive, setCamActive] = useState(true);
  const [activeTab, setActiveTab] = useState<'vocab' | 'chat'>('vocab');
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Efeito de cursor do mouse
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
        return {
          x: prev.x + dx * 0.12,
          y: prev.y + dy * 0.12,
        };
      });
      animationFrameId = requestAnimationFrame(updateFollower);
    };

    animationFrameId = requestAnimationFrame(updateFollower);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mousePos]);

  const vocabList = [
    {
      term: 'Wanderlust',
      phonetic: '/ˈwɒndəlʌst/',
      translation: 'Desejo intenso de viajar',
      example: '"Her wanderlust led her to travel to over 30 countries before turning 25."',
    },
    {
      term: 'To hit the road',
      phonetic: '/tʊ hɪt ðə roʊd/',
      translation: 'Pegar a estrada / Partir',
      example: '"We packed our bags and decided to hit the road early in the morning."',
    },
    {
      term: 'Off the beaten path',
      phonetic: '/ɒf ðə ˈbiːtən pɑːθ/',
      translation: 'Fora do comum / Pouco explorado',
      example: '"I always prefer visiting places that are off the beaten path."',
    },
    {
      term: 'Jet lag',
      phonetic: '/ˈdʒɛt læɡ/',
      translation: 'Cansaço de fuso horário',
      example: '"It took me three whole days to recover from the jet lag after flying from Tokyo."',
    },
  ];

  const handleConfirmReport = (reason: string) => {
    console.log('Denúncia enviada:', reason);
    setIsReportOpen(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1917] flex flex-col font-sans h-screen overflow-hidden relative selection:bg-[#1C1917] selection:text-[#FAF9F6]">
      {/* Cursor Solido Neutro */}
      <div
        className="pointer-events-none fixed z-50 w-3.5 h-3.5 rounded-full bg-[#1C1917] transition-opacity duration-300 ease-out -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{
          left: `${followerPos.x}px`,
          top: `${followerPos.y}px`,
          opacity: cursorOpacity,
        }}
      />

      {/* Header Bar */}
      <header className="bg-[#FFFFFF] border-b border-[#E7E5E4] px-6 py-3 flex items-center justify-between shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-8 h-8 rounded-md bg-[#1C1917] flex items-center justify-center font-black text-[#FAF9F6] text-base">
              S
            </div>
            <span className="text-lg font-black tracking-tight text-[#1C1917] uppercase">SideBySide</span>
          </div>

          <div className="flex items-center gap-2 bg-[#FAF9F6] border border-[#E7E5E4] px-3 py-1 rounded-xl text-xs font-black text-[#1C1917] uppercase">
            <span>⏱️</span>
            <span>12:45</span>
          </div>
        </div>

        {/* Tema da Conversa */}
        <div className="bg-[#FAF9F6] border border-[#E7E5E4] px-4 py-1.5 rounded-xl text-xs font-black uppercase text-[#1C1917]">
          <span>Tema: Experiences & Travel ✈️</span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
        >
          Encerrar e Sair
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Area do Vídeo */}
        <div className="flex-1 bg-[#FFFFFF] rounded-2xl border border-[#E7E5E4] relative flex flex-col justify-between overflow-hidden shadow-sm">
          
          {/* Status Conexão Topo Direita */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-[#FFFFFF]/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase text-emerald-700 border border-[#E7E5E4] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Conexão Excelente</span>
          </div>

          {/* Feed de Vídeo Remoto (Parceiro) */}
          <div className="absolute inset-0 bg-[#F5F5F4] flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200&auto=format&fit=crop&q=80"
              alt="Alex (Parceiro de Conversa)"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-6 bg-[#1C1917]/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-black text-[#FAF9F6] uppercase">
              Alex (Espanha)
            </div>
          </div>

          {/* Feed PIP Local (Você) - Canto Inferior Esquerdo */}
          <div className="absolute bottom-20 left-6 z-20 w-44 h-28 rounded-2xl overflow-hidden border-2 border-[#FFFFFF] shadow-xl bg-[#1C1917]">
            {camActive ? (
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
                alt="Você"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#1C1917] flex flex-col items-center justify-center gap-1">
                <svg className="w-6 h-6 stroke-[#FAF9F6] fill-none stroke-2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <span className="text-[9px] font-black uppercase text-[#A8A29E]">Câmera Desativada</span>
              </div>
            )}
            <div className="absolute bottom-1.5 left-2 bg-[#1C1917]/80 px-2 py-0.5 rounded text-[9px] font-black uppercase text-[#FAF9F6]">
              Você {!micActive && '(Mudo)'}
            </div>
          </div>

          {/* Barra de Controles Flutuante Inferior */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-[#FFFFFF] border border-[#E7E5E4] p-2 rounded-2xl flex items-center gap-3 shadow-lg">
            <button
              type="button"
              onClick={() => setMicActive(!micActive)}
              className={`p-3 rounded-xl transition-all border ${
                micActive 
                  ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]' 
                  : 'bg-red-50 text-red-600 border-red-200'
              }`}
              title={micActive ? "Desativar Microfone" : "Ativar Microfone"}
            >
              {micActive ? (
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 003-3V4.5a3 3 0 00-3-3 3 3 0 00-3 3v8.25a3 3 0 003 3z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 003-3V4.5a3 3 0 00-3-3 3 3 0 00-3 3v8.25a3 3 0 003 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={() => setCamActive(!camActive)}
              className={`p-3 rounded-xl transition-all border ${
                camActive 
                  ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]' 
                  : 'bg-red-50 text-red-600 border-red-200'
              }`}
              title={camActive ? "Desativar Câmera" : "Ativar Câmera"}
            >
              {camActive ? (
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                </svg>
              )}
            </button>

            <div className="w-px h-6 bg-[#E7E5E4]" />

            <button
              type="button"
              onClick={() => setIsReportOpen(true)}
              className="p-3 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-xl transition-all text-xs font-bold"
              title="Denunciar Parceiro"
            >
              🚩
            </button>

            <button
              type="button"
              className="px-5 py-2.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
            >
              <span>⏭</span> PRÓXIMO PAR
            </button>
          </div>
        </div>

        {/* Sidebar Direita (Vocabulário / Chat) */}
        <aside className="w-80 bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl flex flex-col overflow-hidden shrink-0 shadow-sm">
          {/* Abas */}
          <div className="grid grid-cols-2 bg-[#F5F5F4] p-1 border-b border-[#E7E5E4] text-xs font-black uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setActiveTab('vocab')}
              className={`py-2.5 rounded-lg transition-all ${
                activeTab === 'vocab' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-sm' : 'text-[#78716C]'
              }`}
            >
              Vocabulário
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`py-2.5 rounded-lg transition-all ${
                activeTab === 'chat' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-sm' : 'text-[#78716C]'
              }`}
            >
              Chat (2)
            </button>
          </div>

          {/* Conteúdo das Abas */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {activeTab === 'vocab' ? (
              vocabList.map((item, index) => (
                <div
                  key={index}
                  className="bg-[#FAF9F6] border border-[#E7E5E4] p-3 rounded-xl flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#1C1917] uppercase">{item.term}</span>
                    <span className="text-[10px] text-[#78716C] italic font-medium">{item.phonetic}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#1C1917] bg-[#E7E5E4] px-2 py-0.5 rounded-md w-fit uppercase">
                    {item.translation}
                  </span>
                  <p className="text-[11px] text-[#57534E] mt-1 leading-relaxed font-medium">
                    {item.example}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex flex-col h-full justify-between gap-3">
                <div className="flex flex-col gap-2">
                  <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E7E5E4] text-xs">
                    <span className="font-black text-[#1C1917] text-[10px] uppercase">Alex: </span>
                    <span className="text-[#57534E] font-medium">Hi! How is it going?</span>
                  </div>
                  <div className="bg-[#1C1917] p-2.5 rounded-xl text-xs self-end text-[#FAF9F6]">
                    <span className="font-black text-[#FAF9F6] text-[10px] uppercase">Você: </span>
                    <span className="font-medium">Hey! All good, ready to practice!</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Digite uma mensagem..."
                    className="flex-1 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl px-3 py-2 text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
                  />
                  <button type="button" className="bg-[#1C1917] hover:bg-[#292524] px-3 py-2 rounded-xl text-xs font-bold text-[#FAF9F6]">
                    ➔
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onConfirm={handleConfirmReport}
      />
    </div>
  );
};