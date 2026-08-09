import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const Dashboard: React.FC = () => {
  const [mediaMode, setMediaMode] = useState<'video' | 'audio'>('video');
  const [expandedMatching, setExpandedMatching] = useState(true);

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

        {/* Configurações de Conexão */}
        <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
          <h2 className="text-base font-bold text-slate-900">
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

          {/* CTA Principal */}
          <Button
            variant="primary"
            className="w-full py-4 text-base font-bold tracking-wide bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <span className="text-lg">▶</span> PROCURAR PAR DE CONVERSA
          </Button>
        </section>

        {/* Cards de Segurança */}
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