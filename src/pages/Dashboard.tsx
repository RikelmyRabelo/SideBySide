import React, { useState } from 'react';
<<<<<<< Updated upstream
=======
import { useNavigate } from 'react-router-dom';
>>>>>>> Stashed changes
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const Dashboard: React.FC = () => {
  const [mediaMode, setMediaMode] = useState<'video' | 'audio'>('video');
  const [expandedMatching, setExpandedMatching] = useState(true);
<<<<<<< Updated upstream
=======
  const [isMatching, setIsMatching] = useState(false);

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
>>>>>>> Stashed changes

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">SideBySide</span>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="blue">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5 inline-block"></span>
            Seu Nível: B1 Intermediário
          </Badge>

          <Badge variant="emerald">
            <span className="mr-1">🛡️</span>
            Reputação: 98/100
          </Badge>

          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Lucas Silva" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-semibold text-slate-700">Lucas Silva</span>
            <button type="button" className="text-slate-400 hover:text-slate-600 text-sm ml-1">
              ➔
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 flex flex-col gap-6">
        {/* Banner Boas-vindas */}
        <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <span className="text-[10px] font-bold tracking-wider text-blue-600 uppercase bg-blue-50 px-2.5 py-1 rounded-md">
            Painel do Estudante
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2">
            Olá, Lucas! Pronto para praticar?
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Conecte-se instantaneamente com estudantes de nível B1 de todo o mundo. Suas sessões são monitoradas por nossa IA para garantir um ambiente seguro, acolhedor e focado no aprendizado mútuo.
          </p>
        </section>

<<<<<<< Updated upstream
        {/* Configurações de Conexão */}
        <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
          <h2 className="text-base font-bold text-slate-900">
=======
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
>>>>>>> Stashed changes
            Configurações de Conexão
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Modo de Mídia */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-500">
                Modo de Mídia
              </label>
              <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setMediaMode('video')}
                  className={`py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    mediaMode === 'video' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
                  }`}
                >
                  📹 Vídeo + Áudio
                </button>
                <button
                  type="button"
                  onClick={() => setMediaMode('audio')}
                  className={`py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    mediaMode === 'audio' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
                  }`}
                >
                  🎙️ Apenas Áudio
                </button>
              </div>
            </div>

            {/* Pareamento Ampliado */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-slate-500">
                Pareamento Ampliado
              </label>
              <div className="flex items-center justify-between bg-slate-100 px-4 py-2.5 rounded-xl">
                <span className="text-xs font-semibold text-slate-700">
                  Permitir conectar com níveis adjacentes (Ex: A2 e B2)
                </span>
                <button
                  type="button"
                  onClick={() => setExpandedMatching(!expandedMatching)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    expandedMatching ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      expandedMatching ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            className="w-full py-4 text-base font-bold tracking-wide bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <span className="text-lg">▶</span> PROCURAR PAR DE CONVERSA
          </Button>
        </section>

<<<<<<< Updated upstream
        {/* Cards de Segurança */}
=======
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
>>>>>>> Stashed changes
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 text-xl">
              🛡️
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold text-slate-900">
                Moderação Segura SideBySide
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Nossa Inteligência Artificial analisa interações em tempo real para detectar qualquer comportamento impróprio, garantindo respeito e exclusão de fraudes de forma imediata.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 text-xl">
              💬
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold text-slate-900">
                Dicas para destravar a fala
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Não tenha vergonha de errar! Seu par está no mesmo nível que você. Use frases de transição e respire entre as ideias para manter um fluxo confortável.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};