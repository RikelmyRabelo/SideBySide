import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cefrLevel, setCefrLevel] = useState('B1 (Intermediário)');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Animação de Troca de Países Dinâmica no Banner
  const [activePairIndex, setActivePairIndex] = useState(0);
  const pairs = [
    { country1: 'Brasil 🇧🇷', country2: 'Espanha 🇪🇸', level: 'B1' },
    { country1: 'Japão 🇯🇵', country2: 'Alemanha 🇩🇪', level: 'A2' },
    { country1: 'México 🇲🇽', country2: 'França 🇫🇷', level: 'B2' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePairIndex((prev) => (prev + 1) % pairs.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen w-full bg-[#0B1120] flex items-center justify-center p-4 lg:p-8 relative overflow-hidden">
      
      {/* Background Animated Blobs / Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* Coluna Esquerda: Apresentação Interativa e Animada */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-white px-2 lg:px-4">
          
          {/* Logo e Status Online Vivo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center font-extrabold text-slate-900 text-lg shadow-lg shadow-emerald-500/30 animate-bounce">
              S
            </div>
            <span className="text-2xl font-black tracking-tight">SideBySide</span>
            
            <div className="flex items-center gap-2 bg-slate-900/90 border border-emerald-500/30 px-3 py-1 rounded-full text-[11px] font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>1,240 estudantes conversando agora</span>
            </div>
          </div>

          {/* Título Principal */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
            Destrave seu inglês conversando com quem está no <span className="text-emerald-400 underline decoration-emerald-500/40 decoration-wavy">mesmo nível</span> que você.
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Esqueça a ansiedade e o medo de errar. O SideBySide conecta você com pessoas reais para prática mútua em um ambiente moderado por IA.
          </p>

          {/* Widget Animado de Pareamento ao Vivo */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>PAREAMENTO EM TEMPO REAL</span>
              <span className="text-emerald-400">● AO VIVO</span>
            </div>

            <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-xl transition-all duration-500">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs font-bold text-white">{pairs[activePairIndex].country1}</span>
              </div>

              <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs">
                <span className="animate-pulse">⇄</span>
                <span className="bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 text-[10px]">
                  Nível {pairs[activePairIndex].level}
                </span>
                <span className="animate-pulse">⇄</span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-white">{pairs[activePairIndex].country2}</span>
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Passos Animados no Hover */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1 bg-slate-900/40 p-3.5 rounded-2xl border border-slate-800/80 hover:border-emerald-500/50 transition-all hover:-translate-y-1">
              <span className="text-emerald-400 font-extrabold text-xs">01. Nível CEFR</span>
              <p className="text-[11px] text-slate-400">Conexão garantida no mesmo estágio.</p>
            </div>
            <div className="flex flex-col gap-1 bg-slate-900/40 p-3.5 rounded-2xl border border-slate-800/80 hover:border-blue-500/50 transition-all hover:-translate-y-1">
              <span className="text-blue-400 font-extrabold text-xs">02. Moderação IA</span>
              <p className="text-[11px] text-slate-400">Salas seguras contra comportamento impróprio.</p>
            </div>
            <div className="flex flex-col gap-1 bg-slate-900/40 p-3.5 rounded-2xl border border-slate-800/80 hover:border-amber-500/50 transition-all hover:-translate-y-1">
              <span className="text-amber-400 font-extrabold text-xs">03. Guia de Fama</span>
              <p className="text-[11px] text-slate-400">Dicas e vocabulário na tela.</p>
            </div>
          </div>

        </div>

        {/* Coluna Direita: Card de Formulário */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-5 text-slate-900 border border-slate-100 transition-all">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta gratuita'}
            </h2>
            <p className="text-xs text-slate-500">
              {isLogin
                ? 'Acesse sua conta para começar uma nova conversa.'
                : 'Junte-se à comunidade e comece a praticar hoje mesmo.'}
            </p>
          </div>

          <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`py-2.5 rounded-lg transition-all ${isLogin ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`py-2.5 rounded-lg transition-all ${!isLogin ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
            >
              Criar Conta
            </button>
          </div>

          <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
            <Input
              label="Endereço de e-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />

            <Input
              label="Sua Senha"
              type="password"
              placeholder="No mínimo 8 caracteres"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />

            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Qual é o seu nível atual de inglês? (CEFR)
                </label>
                <select
                  value={cefrLevel}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCefrLevel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 text-slate-900 text-xs rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="A1">A1 (Iniciante)</option>
                  <option value="A2">A2 (Básico)</option>
                  <option value="B1 (Intermediário)">B1 (Intermediário)</option>
                  <option value="B2">B2 (Intermediário Avançado)</option>
                  <option value="C1">C1 (Avançado)</option>
                </select>
              </div>
            )}

            {!isLogin && (
              <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  Concordo com os <a href="#" className="text-blue-600 underline font-semibold">Termos de Uso</a> e com a <a href="#" className="text-blue-600 underline font-semibold">Moderação de Vídeo Ativa</a>.
                </span>
              </label>
            )}

            <Button variant="primary" className="w-full py-3.5 mt-1 bg-blue-600 hover:bg-blue-700 font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-transform">
              {isLogin ? 'Entrar na Conta' : 'Criar Minha Conta Grátis'}
            </Button>
          </form>

          <div className="relative flex py-0.5 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              OU ACESSE COM
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              className="flex items-center justify-center gap-1.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Google
            </button>

            <button
              type="button"
              className="flex items-center justify-center gap-1.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all active:scale-95"
            >
              <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>

            <button
              type="button"
              className="flex items-center justify-center gap-1.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all active:scale-95"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              E-mail
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};