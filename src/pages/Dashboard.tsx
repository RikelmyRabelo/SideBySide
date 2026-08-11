import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { MatchingModal } from '../components/room/MatchingModal';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [mediaMode, setMediaMode] = useState<'video' | 'audio'>('video');
  const [expandedMatching, setExpandedMatching] = useState(true);
  const [isMatching, setIsMatching] = useState(false);

  // Estado do Menu Dropdown do Usuário
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Estados dos Modais Rápidos
  const [activeModal, setActiveModal] = useState<'goals' | 'reminders' | null>(null);

  // Estado de Lembretes Diários
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('19:00');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Seg', 'Ter', 'Qua', 'Qui', 'Sex']);
  const weekDaysList = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  const toggleDaySelection = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  // Meta Semanal
  const weeklyGoal = {
    target: 5,
    completed: 3,
    days: [
      { day: 'Seg', completed: true },
      { day: 'Ter', completed: true },
      { day: 'Qua', completed: true },
      { day: 'Qui', completed: false },
      { day: 'Sex', completed: false },
      { day: 'Sáb', completed: false },
      { day: 'Dom', completed: false },
    ],
  };
  const goalPercentage = Math.min(100, Math.round((weeklyGoal.completed / weeklyGoal.target) * 100));

  // Fechar o menu ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Métricas Principais
  const userMetrics = {
    currentStreak: 5,
    totalMinutes: 140,
    totalSessions: 12,
  };

  // Tópicos Diários Recomendados
  const dailyTopics = [
    {
      id: 'travel',
      category: 'Viagens & Culturas',
      title: 'Experiências Inesquecíveis',
      icebreaker: 'Qual foi o destino mais marcante que você já visitou e por quê?',
      vocabPreview: ['Destination', 'Wanderlust', 'Unforgettable'],
    },
    {
      id: 'career',
      category: 'Trabalho & Tecnologia',
      title: 'O Futuro da Inteligência Artificial',
      icebreaker: 'Como a tecnologia e a IA têm mudado a sua rotina diária no trabalho?',
      vocabPreview: ['Automation', 'Efficiency', 'Workflow'],
    },
    {
      id: 'hobbies',
      category: 'Estilo de Vida',
      title: 'Passatempos & Hábitos Diários',
      icebreaker: 'O que você mais gosta de fazer para relaxar no final de semana?',
      vocabPreview: ['Leisure', 'Unwind', 'Daily Routine'],
    },
  ];

  const [selectedTopic, setSelectedTopic] = useState(dailyTopics[0]);

  // Histórico de Conexões Recentes
  const [recentConnections] = useState([
    {
      id: '1',
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      level: 'B1',
      date: 'Hoje, 10:30',
      duration: '15 min',
      topic: 'Travel & Cultures',
    },
    {
      id: '2',
      name: 'Mateo Rossi',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      level: 'B2',
      date: 'Ontem, 16:45',
      duration: '20 min',
      topic: 'Career & Tech',
    },
    {
      id: '3',
      name: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      level: 'B1',
      date: '09 de Ago',
      duration: '12 min',
      topic: 'Daily Routine',
    },
  ]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1917] flex flex-col font-sans selection:bg-[#1C1917] selection:text-[#FAF9F6]">
      {/* Header Bar */}
      <header className="bg-[#FFFFFF] border-b border-[#E7E5E4] px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-md bg-[#1C1917] flex items-center justify-center font-black text-[#FAF9F6] text-base">
            S
          </div>
          <span className="text-lg font-black tracking-tight text-[#1C1917] uppercase">SideBySide</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#F5F5F4] border border-[#E7E5E4] rounded-lg text-xs font-bold uppercase tracking-wider text-[#57534E]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Nível: B1 Intermediário
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#F5F5F4] border border-[#E7E5E4] rounded-lg text-xs font-bold uppercase tracking-wider text-[#57534E]">
            <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2 text-[#1C1917]" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.105-2.574-.305-3.8A11.983 11.983 0 0112 2.714z" />
            </svg>
            Reputação: 98/100
          </div>

          {/* Menu do Usuário */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 border-l border-[#E7E5E4] pl-4 cursor-pointer hover:opacity-80 transition-opacity outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-[#E7E5E4] overflow-hidden border border-[#D6D3D1]">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Lucas Silva"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-bold text-[#1C1917] hidden md:inline-block">Lucas Silva</span>
              <svg
                className={`w-4 h-4 stroke-[#78716C] fill-none stroke-2 transition-transform duration-200 ${
                  isUserMenuOpen ? 'rotate-180' : 'rotate-0'
                }`}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {/* Dropdown Menu Vertical */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl shadow-xl py-2 z-50 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-[#E7E5E4] flex flex-col">
                  <span className="text-xs font-black text-[#1C1917]">Lucas Silva</span>
                  <span className="text-[10px] font-bold text-[#78716C] uppercase">lucas.silva@email.com</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setActiveModal('goals');
                  }}
                  className="px-4 py-2.5 hover:bg-[#FAF9F6] text-left flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 stroke-[#57534E] group-hover:stroke-[#1C1917] fill-none stroke-2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                    <span className="text-xs font-bold text-[#57534E] group-hover:text-[#1C1917]">Metas & Gamificação</span>
                  </div>
                  <span className="text-[10px] font-black bg-[#F5F5F4] px-2 py-0.5 rounded text-[#1C1917]">
                    {weeklyGoal.completed}/{weeklyGoal.target}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setActiveModal('reminders');
                  }}
                  className="px-4 py-2.5 hover:bg-[#FAF9F6] text-left flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 stroke-[#57534E] group-hover:stroke-[#1C1917] fill-none stroke-2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.257 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                    <span className="text-xs font-bold text-[#57534E] group-hover:text-[#1C1917]">Lembretes Diários</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#78716C] uppercase">
                    {reminderEnabled ? reminderTime : 'Off'}
                  </span>
                </button>

                <div className="border-t border-[#E7E5E4] mt-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full px-4 py-2.5 hover:bg-[#FAF9F6] text-left flex items-center gap-2.5 transition-colors group"
                  >
                    <svg className="w-4 h-4 stroke-[#57534E] group-hover:stroke-[#1C1917] fill-none stroke-2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    <span className="text-xs font-bold text-[#57534E] group-hover:text-[#1C1917]">Meu Perfil</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 lg:p-8 flex flex-col gap-6">
        {/* Banner Boas-vindas */}
        <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-2">
          <span className="text-[10px] font-bold tracking-widest text-[#78716C] uppercase bg-[#F5F5F4] border border-[#E7E5E4] px-3 py-1 rounded-md w-fit">
            PAINEL DO ESTUDANTE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#1C1917] mt-1">
            Olá, Lucas! Pronto para praticar?
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E] max-w-2xl leading-relaxed font-medium">
            Conecte-se instantaneamente com estudantes de nível B1 de todo o mundo. Suas sessões são moderadas ativamente por IA para garantir um ambiente seguro, respeitoso e focado no aprendizado mútuo.
          </p>
        </section>

        {/* Métricas e Sequência (Streak) */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:border-[#1C1917] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4] text-[#1C1917] flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.283 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-[#1C1917] tracking-tight">{userMetrics.currentStreak} Dias</span>
              <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Sequência Atual</span>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:border-[#1C1917] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4] text-[#1C1917] flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-[#1C1917] tracking-tight">{userMetrics.totalMinutes} Minutos</span>
              <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Praticados no Mês</span>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:border-[#1C1917] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4] text-[#1C1917] flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.75 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-[#1C1917] tracking-tight">{userMetrics.totalSessions} Conexões</span>
              <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Sessões Realizadas</span>
            </div>
          </div>
        </section>

        {/* Tópicos Diários Recomendados */}
        <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4">
            <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
              Tópicos Recomendados para Hoje
            </h2>
            <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
              Atualizado Diariamente
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {dailyTopics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => setSelectedTopic(topic)}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all ${
                  selectedTopic.id === topic.id
                    ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917] shadow-md'
                    : 'bg-[#FAF9F6] text-[#1C1917] border-[#E7E5E4] hover:border-[#1C1917]'
                }`}
              >
                <div className="flex flex-col gap-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md w-fit ${
                      selectedTopic.id === topic.id
                        ? 'bg-[#292524] text-[#A8A29E]'
                        : 'bg-[#E7E5E4] text-[#57534E]'
                    }`}
                  >
                    {topic.category}
                  </span>
                  <h3 className="text-sm font-bold mt-1 leading-snug">{topic.title}</h3>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider">
                  <span>Selecionar tema</span>
                  <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#78716C]">
                Pergunta Quebra-gelo Sugerida
              </span>
              <p className="text-sm font-bold text-[#1C1917] italic">
                "{selectedTopic.icebreaker}"
              </p>
            </div>

            <div className="flex flex-col gap-1.5 pt-3 border-t border-[#E7E5E4]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#78716C]">
                Vocabulário Recomendado
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedTopic.vocabPreview.map((word, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-bold px-2.5 py-1 bg-[#FFFFFF] border border-[#E7E5E4] rounded-md text-[#1C1917]"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Configurações de Conexão & CTA */}
        <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
            Configurações de Conexão
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Modo de Mídia */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
                Modo de Mídia
              </label>
              <div className="grid grid-cols-2 bg-[#F5F5F4] p-1 rounded-xl border border-[#E7E5E4] text-xs font-bold uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setMediaMode('video')}
                  className={`py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    mediaMode === 'video' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-sm' : 'text-[#78716C]'
                  }`}
                >
                  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Vídeo + Áudio
                </button>
                <button
                  type="button"
                  onClick={() => setMediaMode('audio')}
                  className={`py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    mediaMode === 'audio' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-sm' : 'text-[#78716C]'
                  }`}
                >
                  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 003-3V4.5a3 3 0 00-3-3 3 3 0 00-3 3v8.25a3 3 0 003 3z" />
                  </svg>
                  Apenas Áudio
                </button>
              </div>
            </div>

            {/* Pareamento Ampliado */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
                Pareamento Ampliado
              </label>
              <div className="flex items-center justify-between bg-[#F5F5F4] border border-[#E7E5E4] px-4 py-2.5 rounded-xl h-[42px]">
                <span className="text-xs font-bold text-[#57534E]">
                  Permitir conectar com níveis adjacentes (A2 e B2)
                </span>
                <button
                  type="button"
                  onClick={() => setExpandedMatching(!expandedMatching)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    expandedMatching ? 'bg-[#1C1917]' : 'bg-[#E7E5E4]'
                  }`}
                >
                  <div
                    className={`bg-[#FFFFFF] w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      expandedMatching ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={() => setIsMatching(true)}
            className="w-full py-4 text-xs font-bold uppercase tracking-widest bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] rounded-xl shadow-md flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <svg className="w-4 h-4 fill-current text-[#FAF9F6]" viewBox="0 0 24 24">
              <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
            PROCURAR PAR DE CONVERSA
          </Button>
        </section>

        {/* Histórico de Conexões Recentes */}
        <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4">
            <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
              Conexões Recentes
            </h2>
            <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
              {recentConnections.length} sessões registradas
            </span>
          </div>

          {recentConnections.length > 0 ? (
            <div className="flex flex-col gap-3">
              {recentConnections.map((conn) => (
                <div
                  key={conn.id}
                  className="bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#1C1917] transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#D6D3D1] bg-[#E7E5E4] shrink-0">
                      <img src={conn.avatar} alt={conn.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#1C1917]">{conn.name}</span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#E7E5E4] text-[#1C1917] rounded-md">
                          {conn.level}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-[#78716C]">{conn.topic}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E7E5E4]">
                    <div className="flex flex-col text-left sm:text-right">
                      <span className="text-xs font-bold text-[#1C1917]">{conn.date}</span>
                      <span className="text-[11px] font-medium text-[#78716C]">{conn.duration}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsMatching(true)}
                      className="px-3.5 py-2 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-bold text-[11px] uppercase tracking-wider rounded-lg transition-all"
                    >
                      Reconectar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3 bg-[#FAF9F6] border border-dashed border-[#D6D3D1] rounded-xl">
              <div className="w-12 h-12 rounded-full bg-[#E7E5E4] flex items-center justify-center text-[#78716C]">
                <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.75 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-[#1C1917]">Nenhuma conexão recente</span>
                <p className="text-xs text-[#78716C] max-w-sm">
                  Inicie sua primeira prática para visualizar o histórico de parceiros de conversa aqui.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Cards Informativos de Suporte */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 flex items-start gap-4 shadow-sm hover:border-[#1C1917] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4] text-[#1C1917] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.105-2.574-.305-3.8A11.983 11.983 0 0112 2.714z" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold uppercase tracking-tight text-[#1C1917]">
                Moderação Segura SideBySide
              </h3>
              <p className="text-xs text-[#57534E] leading-relaxed font-medium">
                Nossa Inteligência Artificial analisa interações em tempo real para detectar qualquer comportamento impróprio, garantindo respeito e ambiente protegido.
              </p>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 flex items-start gap-4 shadow-sm hover:border-[#1C1917] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4] text-[#1C1917] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold uppercase tracking-tight text-[#1C1917]">
                Dicas para destravar a fala
              </h3>
              <p className="text-xs text-[#57534E] leading-relaxed font-medium">
                Não tenha vergonha de errar! Seu par está no mesmo nível que você. Use frases de transição e respire entre as ideias para manter um fluxo confortável.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Modal de Metas Semanais */}
      {activeModal === 'goals' && (
        <div className="fixed inset-0 bg-[#1C1917]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4">
              <h3 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
                Meta Semanal de Prática
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-[#78716C] hover:text-[#1C1917] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center text-xs font-bold text-[#1C1917]">
                <span>Progresso Atual</span>
                <span>
                  {weeklyGoal.completed} de {weeklyGoal.target} conversas ({goalPercentage}%)
                </span>
              </div>

              <div className="w-full h-3 bg-[#F5F5F4] border border-[#E7E5E4] rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-[#1C1917] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${goalPercentage}%` }}
                />
              </div>

              <div className="grid grid-cols-7 gap-2 pt-2">
                {weeklyGoal.days.map((item, index) => (
                  <div key={index} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs transition-colors ${
                        item.completed
                          ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]'
                          : 'bg-[#FAF9F6] text-[#A8A29E] border-[#E7E5E4]'
                      }`}
                    >
                      {item.completed ? (
                        <svg className="w-4 h-4 fill-none stroke-current stroke-[3]" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : (
                        '•'
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-[#78716C] uppercase">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => setActiveModal(null)}
              className="w-full py-3 text-xs font-bold uppercase tracking-widest bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] rounded-xl"
            >
              Fechar
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Lembretes Diários */}
      {activeModal === 'reminders' && (
        <div className="fixed inset-0 bg-[#1C1917]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4">
              <h3 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
                Configuração de Lembretes
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-[#78716C] hover:text-[#1C1917] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between bg-[#FAF9F6] border border-[#E7E5E4] p-4 rounded-xl">
              <span className="text-xs font-bold text-[#1C1917]">Notificações Diárias</span>
              <button
                type="button"
                onClick={() => setReminderEnabled(!reminderEnabled)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  reminderEnabled ? 'bg-[#1C1917]' : 'bg-[#E7E5E4]'
                }`}
              >
                <div
                  className={`bg-[#FFFFFF] w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    reminderEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {reminderEnabled && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
                    Horário Preferencial
                  </label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="px-4 py-2.5 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] w-full"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
                    Dias Ativos
                  </label>
                  <div className="flex gap-1 justify-between">
                    {weekDaysList.map((day) => {
                      const isSelected = selectedDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDaySelection(day)}
                          className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase border transition-all ${
                            isSelected
                              ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]'
                              : 'bg-[#FAF9F6] text-[#78716C] border-[#E7E5E4]'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <Button
              variant="primary"
              onClick={() => setActiveModal(null)}
              className="w-full py-3 text-xs font-bold uppercase tracking-widest bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] rounded-xl"
            >
              Salvar Preferências
            </Button>
          </div>
        </div>
      )}

      <MatchingModal
        isOpen={isMatching}
        onCancel={() => setIsMatching(false)}
        userLevel="B1"
      />
    </div>
  );
};