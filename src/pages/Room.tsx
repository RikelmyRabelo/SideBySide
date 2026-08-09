import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Room: React.FC = () => {
  const navigate = useNavigate();
  const [micActive, setMicActive] = useState(true);
  const [camActive, setCamActive] = useState(true);
  const [activeTab, setActiveTab] = useState<'vocab' | 'chat'>('vocab');

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

  return (
    <div className="min-h-screen bg-[#0B1120] text-white flex flex-col font-sans h-screen overflow-hidden">
      {/* Header Bar */}
      <header className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-xs">
              S
            </div>
            <span className="text-lg font-bold tracking-tight">SideBySide</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1 rounded-lg text-xs font-medium text-slate-300">
            <span>⏱️</span>
            <span>12:45</span>
          </div>
        </div>

        {/* Tema da Conversa */}
        <div className="bg-slate-800/80 border border-slate-700/60 px-4 py-1.5 rounded-full text-xs font-semibold text-slate-200 flex items-center gap-2">
          <span>Tema: Experiences & Travel ✈️</span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 px-4 py-1.5 rounded-xl text-xs font-bold transition-all"
        >
          Encerrar e Sair
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Area do Vídeo */}
        <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800/80 relative flex flex-col justify-between overflow-hidden shadow-2xl">
          
          {/* Status Conexão Topo Direita */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-medium text-emerald-400 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Conexão Excelente</span>
          </div>

          {/* Feed de Vídeo Remoto (Parceiro) */}
          <div className="absolute inset-0 bg-slate-900">
            <img
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200&auto=format&fit=crop&q=80"
              alt="Alex (Parceiro de Conversa)"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-6 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-semibold text-white border border-slate-800">
              Alex (Espanha)
            </div>
          </div>

          {/* Feed PIP Local (Você) - Canto Inferior Esquerdo */}
          <div className="absolute bottom-16 left-6 z-20 w-44 h-28 rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-slate-900">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
              alt="Você"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1.5 left-2 bg-slate-950/70 px-2 py-0.5 rounded text-[10px] font-medium text-slate-300">
              Você
            </div>
          </div>

          {/* Barra de Controles Flutuante Inferior */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2 rounded-2xl flex items-center gap-3 shadow-2xl">
            <button
              type="button"
              onClick={() => setMicActive(!micActive)}
              className={`p-3 rounded-xl transition-all ${
                micActive ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500 text-white'
              }`}
            >
              {micActive ? '🎙️' : '🔇'}
            </button>

            <button
              type="button"
              onClick={() => setCamActive(!camActive)}
              className={`p-3 rounded-xl transition-all ${
                camActive ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500 text-white'
              }`}
            >
              {camActive ? '📹' : '📷'}
            </button>

            <div className="w-px h-6 bg-slate-800" />

            <button
              type="button"
              className="p-3 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl transition-all text-xs font-bold"
              title="Denunciar Parceiro"
            >
              🚩
            </button>

            <button
              type="button"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <span>⏭</span> PRÓXIMO PAR
            </button>
          </div>
        </div>

        {/* Sidebar Direita (Vocabulário / Chat) */}
        <aside className="w-80 bg-slate-900/70 border border-slate-800/80 rounded-2xl flex flex-col overflow-hidden shrink-0">
          {/* Abas */}
          <div className="grid grid-cols-2 bg-slate-950/50 p-1 border-b border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('vocab')}
              className={`py-2.5 rounded-lg transition-all ${
                activeTab === 'vocab' ? 'bg-slate-800 text-white' : 'text-slate-400'
              }`}
            >
              Vocabulário do Tema
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`py-2.5 rounded-lg transition-all ${
                activeTab === 'chat' ? 'bg-slate-800 text-white' : 'text-slate-400'
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
                  className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{item.term}</span>
                    <span className="text-[10px] text-slate-400 italic">{item.phonetic}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded w-fit">
                    {item.translation}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {item.example}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex flex-col h-full justify-between gap-3">
                <div className="flex flex-col gap-2">
                  <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50 text-xs">
                    <span className="font-bold text-emerald-400 text-[10px]">Alex: </span>
                    <span className="text-slate-200">Hi! How is it going?</span>
                  </div>
                  <div className="bg-blue-600/20 p-2.5 rounded-xl border border-blue-500/30 text-xs self-end">
                    <span className="font-bold text-blue-400 text-[10px]">Você: </span>
                    <span className="text-slate-200">Hey! All good, ready to practice!</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Digite uma mensagem..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  />
                  <button type="button" className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-xl text-xs font-bold">
                    ➔
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};