import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cefrLevel, setCefrLevel] = useState('B1');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [isEnglish, setIsEnglish] = useState(false);
  const [fadeState, setFadeState] = useState(true);

  // Filtro de Salas em Destaque
  const [activeCategory, setActiveCategory] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeState(false);
      setTimeout(() => {
        setIsEnglish((prev) => !prev);
        setFadeState(true);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Efeito do Cursor com Smooth Delay e Fade-out nas Bordas
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [followerPos, setFollowerPos] = useState({ x: -100, y: -100 });
  const [cursorOpacity, setCursorOpacity] = useState(1);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      const padding = 50;
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
          x: prev.x + dx * 0.15,
          y: prev.y + dy * 0.15,
        };
      });
      animationFrameId = requestAnimationFrame(updateFollower);
    };

    animationFrameId = requestAnimationFrame(updateFollower);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mousePos]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const rooms = [
    {
      id: 1,
      title: 'Travel & World Cultures',
      desc: 'Compartilhe experiências inesquecíveis e vocabulário útil para aeroportos e viagens.',
      level: 'B1',
      category: 'intermediate',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      duration: '20 MIN',
      usersOnline: 14,
    },
    {
      id: 2,
      title: 'Hobbies & Daily Routine',
      desc: 'Treine pronúncia básica falando sobre seus gostos, filmes e hábitos do dia a dia.',
      level: 'A2',
      category: 'beginner',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      duration: '15 MIN',
      usersOnline: 22,
    },
    {
      id: 3,
      title: 'Tech & Remote Work',
      desc: 'Discuta sobre tecnologia, mercado global de trabalho e reuniões em inglês.',
      level: 'B2',
      category: 'intermediate',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      duration: '25 MIN',
      usersOnline: 18,
    },
    {
      id: 4,
      title: 'Debates & Global Trends',
      desc: 'Formule argumentos complexos e expresse opiniões sobre tendências do mundo moderno.',
      level: 'C1',
      category: 'advanced',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      duration: '30 MIN',
      usersOnline: 8,
    },
  ];

  const filteredRooms = activeCategory === 'all'
    ? rooms
    : rooms.filter((room) => room.category === activeCategory);

  return (
    <div className="min-h-screen w-full bg-[#0B1120] text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 overflow-x-hidden relative">
      
      {/* Bolinha do Cursor */}
      <div
        className="pointer-events-none fixed z-50 w-3.5 h-3.5 rounded-full bg-emerald-400/80 shadow-[0_0_12px_rgba(52,211,153,0.8)] transition-opacity duration-300 ease-out -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${followerPos.x}px`,
          top: `${followerPos.y}px`,
          opacity: cursorOpacity,
        }}
      />

      {/* Header Flutuante */}
      <div className="fixed top-6 left-0 right-0 w-full flex justify-center z-40 px-4">
        <header className="w-full max-w-5xl px-6 py-3.5 flex items-center justify-between bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-full shadow-2xl shadow-black/50">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center font-black text-slate-950 text-lg shadow-md shadow-emerald-500/20">
              S
            </div>
            <span className="text-lg font-black tracking-tight text-white uppercase">SideBySide</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold tracking-wider uppercase text-slate-300">
            <button type="button" onClick={() => scrollToSection('about')} className="hover:text-emerald-400 transition-colors">A Plataforma</button>
            <button type="button" onClick={() => scrollToSection('features')} className="hover:text-emerald-400 transition-colors">Pilares</button>
            <button type="button" onClick={() => scrollToSection('rooms')} className="hover:text-emerald-400 transition-colors">Salas</button>
          </nav>

          <button
            type="button"
            onClick={() => scrollToSection('auth')}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-full transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-105"
          >
            <span>Acessar</span>
            <span>→</span>
          </button>
        </header>
      </div>

      {/* HERO SECTION */}
      <section className="relative min-h-screen w-full flex flex-col justify-between pt-36 pb-12 px-6 lg:px-12 border-b border-slate-800/80 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&auto=format&fit=crop&q=80')` }} />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/80 to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto my-auto text-center flex flex-col items-center gap-6">
          <span className="px-4 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-emerald-400 text-xs font-bold uppercase tracking-widest shadow-lg">
            Prática de Conversação P2P por IA
          </span>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.95] text-white h-[180px] sm:h-[220px] flex flex-col justify-center">
            <div className={`transition-all duration-700 ease-in-out transform ${fadeState ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <div>{isEnglish ? 'Conversation' : 'Conversação'}</div>
              <div className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-400 to-emerald-400">
                {isEnglish ? 'Meets Connection' : 'Encontra Conexão'}
              </div>
            </div>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl font-medium leading-relaxed mt-2">
            O SideBySide aproxima a próxima geração de falantes de inglês. Treine sua escuta e fala sem medo em um ambiente de nível equivalente e segurança ativa.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
            <button
              type="button"
              onClick={() => scrollToSection('auth')}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-full transition-all shadow-xl shadow-emerald-500/20 hover:scale-105"
            >
              Comece a Praticar Agora →
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('about')}
              className="px-8 py-4 bg-slate-900/80 border border-slate-700 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all"
            >
              Conheça o Método
            </button>
          </div>
        </div>

        <div className="relative z-10 flex justify-between items-end text-xs font-bold tracking-widest text-slate-500 uppercase">
          <span>SideBySide © 2026</span>
          <button type="button" onClick={() => scrollToSection('about')} className="animate-bounce text-emerald-400">
            Role para baixo ↓
          </button>
        </div>
      </section>

      {/* SEÇÃO STATEMENT COM TEXTO INTERATIVO E CARDS DE IMPACTO ANIMADOS (SEM TEXTO ESTÁTICO) */}
      <section id="about" className="py-24 px-6 lg:px-12 max-w-6xl mx-auto flex flex-col gap-12 border-b border-slate-800/80">
        
        {/* Frase Principal com Palavras em Destaque Dinâmico */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-[1.25] text-center sm:text-left">
          AQUI NÃO HÁ TEORIA OU EXERCÍCIOS PASSIVOS. NOSSO FOCO É{" "}
          <span className="relative inline-block text-slate-950 px-4 py-1 my-1 bg-emerald-400 rounded-2xl transform -rotate-1 hover:rotate-0 transition-transform duration-300 shadow-xl shadow-emerald-500/20 cursor-pointer">
            100% CONVERSAÇÃO
          </span>{" "}
          PARA VOCÊ{" "}
          <span className="relative inline-block text-white px-4 py-1 my-1 bg-blue-600 rounded-2xl transform rotate-1 hover:rotate-0 transition-transform duration-300 shadow-xl shadow-blue-600/20 cursor-pointer">
            OUVIR MELHOR
          </span>{" "}
          E FALAR COM{" "}
          <span className="relative inline-block text-slate-950 px-4 py-1 my-1 bg-gradient-to-r from-emerald-300 to-teal-400 rounded-2xl transform -rotate-1 hover:rotate-0 transition-transform duration-300 shadow-xl shadow-teal-400/20 cursor-pointer">
            CONFIANÇA
          </span>{" "}
          EM INGLÊS.
        </h2>

        {/* Bloco de Interação Interativa: Alternância de Foco em Escuta e Fala */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          <div className="group relative bg-slate-900/90 border border-slate-800 p-8 rounded-3xl overflow-hidden hover:border-emerald-500/80 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                PILAR 01: ESCUTA
              </span>
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h3 className="text-2xl font-black uppercase text-white mb-2">Escuta Ativa & Compreensão Real</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Acostume seus ouvidos com diferentes sotaques e velocidades reais sem a pausada artificial das salas de aula tradicionais.
            </p>
          </div>

          <div className="group relative bg-slate-900/90 border border-slate-800 p-8 rounded-3xl overflow-hidden hover:border-blue-500/80 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                PILAR 02: FALA
              </span>
              <span className="w-3 h-3 rounded-full bg-blue-400 animate-ping" />
            </div>
            <h3 className="text-2xl font-black uppercase text-white mb-2">Destrave a Pronúncia sem Medo</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pratique a formulação imediata de frases com quem entende seu momento, superando a trava inicial do medo de errar.
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-6 border-t border-slate-800/80">
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Esqueça a passividade. No SideBySide você entra diretamente em chamadas reais para praticar a escuta ativa e desenvolver a fala em tempo real com parceiros do seu mesmo nível.
          </p>
          <div className="flex sm:justify-end">
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="px-8 py-3.5 border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-black text-xs uppercase tracking-widest rounded-full transition-all"
            >
              Nossa Abordagem →
            </button>
          </div>
        </div>
      </section>

      {/* SEÇÃO PILARES COM EFEITO BARALHO DE CARDS */}
      <section id="features" className="py-24 px-6 lg:px-12 max-w-5xl mx-auto flex flex-col gap-12 border-b border-slate-800/80">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Nossos Pilares</span>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
            Tudo o que você precisa para destravar
          </h2>
        </div>

        <div className="relative w-full min-h-[500px] flex items-center justify-center py-8">
          
          {/* Card 1 */}
          <div className="absolute w-full max-w-md h-[400px] rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl flex flex-col justify-between transform -rotate-6 hover:rotate-0 hover:scale-105 hover:z-30 transition-all duration-500 ease-out cursor-pointer group hover:border-emerald-500 left-0 sm:left-10 z-10">
            <div className="absolute inset-0 bg-cover bg-center opacity-20 rounded-3xl" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80')` }} />
            <div className="relative z-10 flex flex-col gap-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">01 / PAREAMENTO</span>
              <h3 className="text-2xl font-black uppercase text-white">Níveis CEFR</h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-2">
                Pareamento automático do A1 ao C2. Converse de igual para igual sem medo de cometer erros.
              </p>
            </div>
            <div className="relative z-10 pt-4 border-t border-slate-800 text-[11px] text-emerald-400 font-bold">
              ✓ Ritmo e vocabulário adaptados ao seu estágio
            </div>
          </div>

          {/* Card 2 */}
          <div className="absolute w-full max-w-md h-[400px] rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl flex flex-col justify-between transform rotate-2 hover:rotate-0 hover:scale-105 hover:z-30 transition-all duration-500 ease-out cursor-pointer group hover:border-blue-500 z-20">
            <div className="absolute inset-0 bg-cover bg-center opacity-20 rounded-3xl" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80')` }} />
            <div className="relative z-10 flex flex-col gap-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">02 / SEGURANÇA</span>
              <h3 className="text-2xl font-black uppercase text-white">Moderação por IA</h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-2">
                Análise de áudio e vídeo em tempo real. Ambiente 100% focado na prática saudável de conversação.
              </p>
            </div>
            <div className="relative z-10 pt-4 border-t border-slate-800 text-[11px] text-blue-400 font-bold">
              ✓ Detecção e desativação automática de condutas inadequadas
            </div>
          </div>

          {/* Card 3 */}
          <div className="absolute w-full max-w-md h-[400px] rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl flex flex-col justify-between transform rotate-6 hover:rotate-0 hover:scale-105 hover:z-30 transition-all duration-500 ease-out cursor-pointer group hover:border-emerald-500 right-0 sm:right-10 z-10">
            <div className="absolute inset-0 bg-cover bg-center opacity-20 rounded-3xl" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80')` }} />
            <div className="relative z-10 flex flex-col gap-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">03 / SUPORTE VISUAL</span>
              <h3 className="text-2xl font-black uppercase text-white">Guia de Fala</h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-2">
                Cartões interativos de vocabulário e perguntas dinâmicas exibidos na tela durante a chamada.
              </p>
            </div>
            <div className="relative z-10 pt-4 border-t border-slate-800 text-[11px] text-emerald-400 font-bold">
              ✓ Nunca fique em silêncio ou sem assunto
            </div>
          </div>

        </div>
      </section>

      {/* SEÇÃO DE SALAS EM DESTAQUE */}
      <section id="rooms" className="bg-slate-900/60 border-y border-slate-800/80 py-20 px-6 lg:px-12 w-full">
        <div className="max-w-7xl mx-auto flex flex-col gap-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Prática em Tempo Real</span>
              <h2 className="text-4xl font-black uppercase tracking-tight text-white">Salas em Destaque</h2>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold uppercase tracking-wider overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                  activeCategory === 'all'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Todas as Salas
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('beginner')}
                className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                  activeCategory === 'beginner'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Iniciante (A1-A2)
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('intermediate')}
                className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                  activeCategory === 'intermediate'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Intermediário (B1-B2)
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('advanced')}
                className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                  activeCategory === 'advanced'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Avançado (C1-C2)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className="bg-slate-950 border border-slate-800/90 text-white p-6 rounded-3xl flex flex-col justify-between gap-6 shadow-xl hover:border-emerald-500/60 hover:-translate-y-1.5 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase border ${room.badgeColor}`}>
                    NÍVEL {room.level}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{room.usersOnline} online</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-black uppercase text-white group-hover:text-emerald-400 transition-colors">
                    {room.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {room.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-900 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">{room.duration}</span>
                  <button
                    type="button"
                    onClick={() => scrollToSection('auth')}
                    className="text-xs font-black uppercase text-emerald-400 group-hover:underline flex items-center gap-1"
                  >
                    <span>Entrar na Fila</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SEÇÃO DE AUTENTICAÇÃO */}
      <section id="auth" className="py-24 px-6 max-w-md mx-auto w-full flex flex-col justify-center">
        <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col gap-6 text-slate-900">
          <div className="flex flex-col gap-1 text-center">
            <h2 className="text-2xl font-black tracking-tight uppercase text-slate-950">
              {isLogin ? 'Entrar no SideBySide' : 'Criar Sua Conta'}
            </h2>
            <p className="text-xs text-slate-500">
              {isLogin
                ? 'Digite suas credenciais para acessar a plataforma.'
                : 'Cadastre-se gratuitamente e escolha seu nível CEFR.'}
            </p>
          </div>

          <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl text-xs font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`py-2.5 rounded-lg transition-all ${isLogin ? 'bg-white shadow-sm text-slate-950' : 'text-slate-500'}`}
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

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />

            <Input
              label="Senha"
              type="password"
              placeholder="Sua senha secreta"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />

            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nível CEFR Inicial
                </label>
                <select
                  value={cefrLevel}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCefrLevel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 text-slate-900 text-xs rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                >
                  <option value="A1">A1 - Iniciante</option>
                  <option value="A2">A2 - Básico</option>
                  <option value="B1">B1 - Intermediário</option>
                  <option value="B2">B2 - Intermediário Avançado</option>
                  <option value="C1">C1 - Avançado</option>
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
                  Li e aceito os <a href="#" className="text-blue-600 underline font-bold">Termos de Uso</a> e a <a href="#" className="text-blue-600 underline font-bold">Moderação de Vídeo</a>.
                </span>
              </label>
            )}

            <Button variant="primary" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-blue-600/20">
              {isLogin ? 'Entrar' : 'Cadastrar Gratuitamente'}
            </Button>
          </form>

          <div className="relative flex py-0.5 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              OU ENTRE COM
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <button type="button" className="py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center">
              Google
            </button>
            <button type="button" className="py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center">
              Facebook
            </button>
            <button type="button" className="py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center">
              E-mail
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-[#070C16] border-t border-slate-800/80 pt-16 pb-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-4">
            <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-white leading-none">
              SIDEBYSIDE <br />
              <span className="text-emerald-400">P2P SPEAKING</span>
            </h2>
            <p className="text-xs text-slate-500 max-w-sm">
              Conectando estudantes globais para prática ativa e segura de conversação em inglês.
            </p>
          </div>

          <div className="flex justify-start md:justify-end">
            <div className="w-40 h-40 rounded-full border-4 border-emerald-500/30 flex items-center justify-center p-4 relative animate-pulse">
              <div className="w-28 h-28 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-2xl">
                S×S
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 SideBySide. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-emerald-400">Termos de Uso</a>
            <a href="#" className="hover:text-emerald-400">Política de Moderação</a>
            <a href="#" className="hover:text-emerald-400">Privacidade</a>
          </div>
        </div>
      </footer>

    </div>
  );
};