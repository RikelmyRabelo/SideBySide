import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cefrLevel, setCefrLevel] = useState('B1');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Estado do FAQ Interativo
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Hero: Alternância PT/EN estática
  const [isEnglish, setIsEnglish] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsEnglish((prev) => !prev);
    }, 3800);

    return () => clearInterval(interval);
  }, []);

  // Estado do Carrossel de Depoimentos
  const testimonials = [
    {
      quote: "Fiquei super apreensivo na primeira conversa, mas o suporte de temas na tela me ajudou demais. Hoje converso sem medo no trabalho!",
      author: "Mariana R.",
      initials: "MR",
      level: "Nível B1 — Intermediário",
    },
    {
      quote: "A moderação por IA dá uma tranquilidade absurda. Todas as conexões que fiz foram super respeitosas e focadas em aprender.",
      author: "Lucas C.",
      initials: "LC",
      level: "Nível B2 — Avançado",
    },
    {
      quote: "Treinar o listening com pessoas reais e sotaques diferentes mudou totalmente minha compreensão. Vale muito a pena!",
      author: "Fernanda S.",
      initials: "FS",
      level: "Nível A2 — Básico",
    },
    {
      quote: "Eu costumava travar completamente tentando pensar em gramática antes de falar. O método P2P destravou minha fala em 3 semanas.",
      author: "Rodrigo M.",
      initials: "RM",
      level: "Nível B1 — Intermediário",
    },
    {
      quote: "Excelente para quem não tem com quem praticar no dia a dia. Conectei com um parceiro do mesmo nível e agora praticamos diariamente.",
      author: "Camila T.",
      initials: "CT",
      level: "Nível C1 — Avançado",
    },
  ];

  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const testimonialTimer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(testimonialTimer);
  }, [testimonials.length]);

  // Cursor com rastreamento e ocultação nas bordas
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

  // Observador para acionar a entrada dos cards vindos da borda esquerda da tela
  const [isCardsVisible, setIsCardsVisible] = useState(false);
  const featuresRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsCardsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (featuresRef.current) {
      observer.observe(featuresRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const faqItems = [
    {
      question: 'A plataforma é realmente gratuita?',
      answer: 'Sim! Você pode realizar conexões diárias e praticar em salas ao vivo sem custo algum na versão base.',
    },
    {
      question: 'Como funciona a segurança nas chamadas de vídeo?',
      answer: 'Contamos com moderação ativa por Inteligência Artificial em tempo real que monitora desvios de condutas, além de botões de troca de par e denúncia instantânea.',
    },
    {
      question: 'E se meu nível de inglês for muito básico?',
      answer: 'Nosso algoritmo realiza o pareamento exato pelo seu nível CEFR (A1 a C1). Você conversará com pessoas que estão exatamente no mesmo patamar de aprendizado.',
    },
    {
      question: 'E se eu ficar travado sem saber o que falar?',
      answer: 'Durante todas as chamadas, um painel lateral exibe automaticamente sugestões de perguntas quebra-gelo, tópicos de conversa e dicas de vocabulário.',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] text-[#1C1917] font-sans selection:bg-[#1C1917] selection:text-[#FAF9F6] overflow-x-hidden relative">
      
      {/* Cursor Solido Neutro */}
      <div
        className="pointer-events-none fixed z-50 w-3.5 h-3.5 rounded-full bg-[#1C1917] transition-opacity duration-300 ease-out -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${followerPos.x}px`,
          top: `${followerPos.y}px`,
          opacity: cursorOpacity,
        }}
      />

      {/* Header com Bloco Sólido e Bordas Definidas */}
      <div className="fixed top-6 left-0 right-0 w-full flex justify-center z-40 px-4">
        <header className="w-full max-w-5xl px-6 py-3.5 flex items-center justify-between bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 bg-[#1C1917] flex items-center justify-center font-black text-[#FAF9F6] text-base rounded-md">
              S
            </div>
            <span className="text-lg font-black tracking-tight text-[#1C1917] uppercase">SideBySide</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold tracking-widest uppercase text-[#78716C]">
            <button type="button" onClick={() => scrollToSection('about')} className="hover:text-[#1C1917] transition-colors">Método</button>
            <button type="button" onClick={() => scrollToSection('features')} className="hover:text-[#1C1917] transition-colors">Pilares</button>
            <button type="button" onClick={() => scrollToSection('testimonials')} className="hover:text-[#1C1917] transition-colors">Comunidade</button>
            <button type="button" onClick={() => scrollToSection('faq')} className="hover:text-[#1C1917] transition-colors">FAQ</button>
            <button type="button" onClick={() => scrollToSection('auth')} className="hover:text-[#1C1917] transition-colors">Entrar</button>
          </nav>

          <button
            type="button"
            onClick={() => scrollToSection('auth')}
            className="px-6 py-2.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-bold text-xs uppercase tracking-wider rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            Acessar →
          </button>
        </header>
      </div>

      {/* HERO SECTION - Minimalista & Editorial */}
      <section className="relative min-h-screen w-full flex flex-col justify-between pt-36 pb-12 px-6 lg:px-12 border-b border-[#E7E5E4] overflow-hidden">
        
        <div className="relative z-10 max-w-5xl mx-auto my-auto text-center flex flex-col items-center gap-6">
          <span className="px-4 py-1.5 bg-[#F5F5F4] border border-[#E7E5E4] text-[#57534E] text-xs font-bold uppercase tracking-widest rounded-lg">
            ● Plataforma P2P de Prática Ativa
          </span>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.95] h-[190px] sm:h-[230px] flex flex-col justify-center">
            <div className="text-[#1C1917]">{isEnglish ? 'Conversation' : 'Conversação'}</div>
            <div className="text-[#A8A29E]">
              {isEnglish ? 'Meets Connection' : 'Encontra Conexão'}
            </div>
          </h1>

          <p className="text-[#57534E] text-base sm:text-lg max-w-2xl font-medium leading-relaxed mt-2">
            A forma mais rápida de destravar o inglês é conversando com pessoas do seu mesmo nível em salas de áudio e vídeo seguras e moderadas por IA.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
            <button
              type="button"
              onClick={() => scrollToSection('auth')}
              className="px-9 py-4 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-bold text-xs uppercase tracking-widest rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              Praticar Agora Gratuitamente →
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('about')}
              className="px-9 py-4 bg-[#FFFFFF] border border-[#D6D3D1] hover:bg-[#F5F5F4] text-[#1C1917] font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
            >
              Como Funciona
            </button>
          </div>
        </div>

        <div className="relative z-10 flex justify-between items-end text-xs font-bold tracking-widest text-[#A8A29E] uppercase">
          <span>SideBySide © 2026</span>
          <button type="button" onClick={() => scrollToSection('about')} className="text-[#1C1917] hover:underline">
            Explorar Método ↓
          </button>
        </div>
      </section>

      {/* SEÇÃO STATEMENT - Neutra e Sofisticada */}
      <section id="about" className="py-28 px-6 lg:px-12 max-w-6xl mx-auto flex flex-col gap-14 border-b border-[#E7E5E4]">
        
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#1C1917] leading-[1.25] text-center sm:text-left">
          AQUI NÃO HÁ TEORIA OU EXERCÍCIOS PASSIVOS. NOSSO FOCO É{" "}
          <span className="inline-block text-[#FAF9F6] px-4 py-1.5 bg-[#1C1917] font-black rounded-lg">
            100% PRÁTICO
          </span>{" "}
          PARA VOCÊ{" "}
          <span className="inline-block text-[#1C1917] px-4 py-1.5 bg-[#E7E5E4] font-black rounded-lg">
            OUVIR MELHOR
          </span>{" "}
          E FALAR COM{" "}
          <span className="inline-block text-[#1C1917] px-4 py-1.5 border-2 border-[#1C1917] font-black rounded-lg">
            TOTAL CONFIANÇA
          </span>{" "}
          EM INGLÊS.
        </h2>

        {/* Pilares Neutros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] p-8 rounded-2xl flex flex-col justify-between gap-6 hover:border-[#1C1917] transition-colors shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[#1C1917] bg-[#F5F5F4] px-3 py-1 rounded-md border border-[#E7E5E4]">
                TREINO DE ESCUTA (LISTENING)
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#1C1917]" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-black uppercase text-[#1C1917]">Sotaques & Ritmo Real</h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Treine seu ouvido para compreender falantes reais em diferentes velocidades, superando o bloqueio de escutar diálogos fora dos livros acadêmicos.
              </p>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E7E5E4] p-8 rounded-2xl flex flex-col justify-between gap-6 hover:border-[#1C1917] transition-colors shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[#1C1917] bg-[#F5F5F4] px-3 py-1 rounded-md border border-[#E7E5E4]">
                TREINO DE FALA (SPEAKING)
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#1C1917]" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-black uppercase text-[#1C1917]">Formulações Instantâneas</h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Pratique a construção rápida de frases no seu próprio nível CEFR, construindo confiança e fluência sem a ansiedade de ser avaliado.
              </p>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-8 border-t border-[#E7E5E4]">
          <p className="text-[#57534E] text-sm leading-relaxed">
            No SideBySide, você não perde tempo memorizando regras decoradas. Você entra diretamente em salas ao vivo de áudio e vídeo pareadas no seu nível de fluência.
          </p>
          <div className="flex sm:justify-end">
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="px-8 py-3.5 bg-[#FAF9F6] border border-[#1C1917] text-[#1C1917] hover:bg-[#1C1917] hover:text-[#FAF9F6] font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
            >
              Conhecer Nossos Pilares →
            </button>
          </div>
        </div>
      </section>

      {/* SEÇÃO PILARES - Entrada em Cascata Suave e Lenta (1.8s) */}
      <section id="features" ref={featuresRef} className="py-28 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col gap-12 border-b border-[#E7E5E4] overflow-hidden">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-[#78716C] uppercase tracking-widest">Estrutura e Garantias</span>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#1C1917]">
            Três Pilares do Nosso Ecossistema
          </h2>
        </div>

        {/* Grid de 3 colunas com animação desacelerada */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full min-h-[400px] items-stretch pt-4">
          
          {/* Card 1 - Posição Esquerda */}
          <div
            className={`w-full transition-all duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isCardsVisible
                ? 'translate-x-0 opacity-100'
                : '-translate-x-[100vw] opacity-0'
            }`}
            style={{ transitionDelay: isCardsVisible ? '0ms' : '0ms' }}
          >
            <div className="w-full h-full min-h-[380px] rounded-2xl bg-[#FFFFFF] border border-[#E7E5E4] p-8 shadow-xl flex flex-col justify-between cursor-pointer group transition-all duration-500 hover:border-[#1C1917] hover:-translate-y-2">
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-[#78716C] uppercase tracking-widest">01 / PAREAMENTO CEFR</span>
                <h3 className="text-2xl font-black uppercase text-[#1C1917]">Nível Equivalente</h3>
                <p className="text-xs text-[#57534E] leading-relaxed mt-1">
                  Conecte-se com pessoas do A1 ao C2. Fale de igual para igual com quem está no mesmo patamar de aprendizado.
                </p>
              </div>
              <div className="pt-4 border-t border-[#F5F5F4] text-[11px] text-[#1C1917] font-bold uppercase">
                ✓ Comunicação fluida sem assimetria
              </div>
            </div>
          </div>

          {/* Card 2 - Posição Centro */}
          <div
            className={`w-full transition-all duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isCardsVisible
                ? 'translate-x-0 opacity-100'
                : '-translate-x-[100vw] opacity-0'
            }`}
            style={{ transitionDelay: isCardsVisible ? '300ms' : '0ms' }}
          >
            <div className="w-full h-full min-h-[380px] rounded-2xl bg-[#FFFFFF] border border-[#E7E5E4] p-8 shadow-xl flex flex-col justify-between cursor-pointer group transition-all duration-500 hover:border-[#1C1917] hover:-translate-y-2">
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-[#78716C] uppercase tracking-widest">02 / MODERAÇÃO POR IA</span>
                <h3 className="text-2xl font-black uppercase text-[#1C1917]">Ambiente Protegido</h3>
                <p className="text-xs text-[#57534E] leading-relaxed mt-1">
                  Análise contínua em tempo real contra comportamentos abusivos ou desrespeitosos para uma prática 100% segura.
                </p>
              </div>
              <div className="pt-4 border-t border-[#F5F5F4] text-[11px] text-[#1C1917] font-bold uppercase">
                ✓ Banimento instantâneo de abusos
              </div>
            </div>
          </div>

          {/* Card 3 - Posição Direita */}
          <div
            className={`w-full transition-all duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isCardsVisible
                ? 'translate-x-0 opacity-100'
                : '-translate-x-[100vw] opacity-0'
            }`}
            style={{ transitionDelay: isCardsVisible ? '600ms' : '0ms' }}
          >
            <div className="w-full h-full min-h-[380px] rounded-2xl bg-[#FFFFFF] border border-[#E7E5E4] p-8 shadow-xl flex flex-col justify-between cursor-pointer group transition-all duration-500 hover:border-[#1C1917] hover:-translate-y-2">
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-[#78716C] uppercase tracking-widest">03 / SUPORTE VISUAL</span>
                <h3 className="text-2xl font-black uppercase text-[#1C1917]">Guia na Tela</h3>
                <p className="text-xs text-[#57534E] leading-relaxed mt-1">
                  Sugestões de temas, perguntas quebra-gelo e dicas de vocabulário aparecem no painel lateral durante a chamada.
                </p>
              </div>
              <div className="pt-4 border-t border-[#F5F5F4] text-[11px] text-[#1C1917] font-bold uppercase">
                ✓ Nunca fique sem saber o que dizer
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SEÇÃO PROVA SOCIAL (CARROSSEL DE DEPOIMENTOS & MÉTRICAS) */}
      <section id="testimonials" className="py-28 px-6 lg:px-12 max-w-5xl mx-auto flex flex-col gap-16 border-b border-[#E7E5E4]">
        <div className="flex flex-col gap-2 text-center items-center">
          <span className="text-xs font-bold text-[#78716C] uppercase tracking-widest">Comunidade em Ação</span>
          
          {/* Título com Texto Gradiente / Brilho Destacado */}
          <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-[#1C1917]">
            Quem Pratica,{' '}
            <span className="bg-gradient-to-r from-[#1C1917] via-[#78716C] to-[#1C1917] bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent underline decoration-[#E7E5E4] underline-offset-8">
              Destrava
            </span>
          </h2>
        </div>

        {/* Banner de Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-8 shadow-sm text-center">
          <div className="flex flex-col gap-1">
            <span className="text-4xl font-black text-[#1C1917]">+15.000</span>
            <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Conversas Realizadas</span>
          </div>
          <div className="flex flex-col gap-1 border-y sm:border-y-0 sm:border-x border-[#E7E5E4] py-4 sm:py-0">
            <span className="text-4xl font-black text-[#1C1917]">98.4%</span>
            <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Avaliações Positivas</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-4xl font-black text-[#1C1917]">4.9 / 5★</span>
            <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Nota Média de Segurança</span>
          </div>
        </div>

        {/* Carrossel de Depoimentos Destaque */}
        <div className="relative bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-8 sm:p-12 shadow-sm min-h-[220px] flex flex-col justify-between transition-all duration-500">
          
          <div className="flex flex-col gap-4">
            <span className="text-3xl font-black text-[#A8A29E] leading-none">“</span>
            <p className="text-base sm:text-xl font-medium text-[#1C1917] leading-relaxed italic -mt-4">
              {testimonials[currentTestimonial].quote}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-[#F5F5F4] mt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1C1917] text-[#FAF9F6] font-black text-xs flex items-center justify-center uppercase">
                {testimonials[currentTestimonial].initials}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#1C1917]">{testimonials[currentTestimonial].author}</span>
                <span className="text-[11px] font-bold text-[#A8A29E] uppercase">{testimonials[currentTestimonial].level}</span>
              </div>
            </div>

            {/* Controles do Carrossel */}
            <div className="flex items-center gap-4">
              <div className="flex gap-1.5">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentTestimonial(idx)}
                    className={`h-2 rounded-full transition-all ${
                      currentTestimonial === idx ? 'w-6 bg-[#1C1917]' : 'w-2 bg-[#E7E5E4]'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
                  }
                  className="w-8 h-8 rounded-lg border border-[#E7E5E4] hover:bg-[#F5F5F4] text-[#1C1917] font-bold flex items-center justify-center text-xs transition-colors"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
                  }
                  className="w-8 h-8 rounded-lg border border-[#E7E5E4] hover:bg-[#F5F5F4] text-[#1C1917] font-bold flex items-center justify-center text-xs transition-colors"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO FAQ (PERGUNTAS FREQUENTES INTERATIVAS) */}
      <section id="faq" className="py-28 px-6 lg:px-12 max-w-4xl mx-auto flex flex-col gap-12 border-b border-[#E7E5E4]">
        <div className="flex flex-col gap-2 text-center items-center">
          <span className="text-xs font-bold text-[#78716C] uppercase tracking-widest">Tire suas dúvidas</span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#1C1917]">
            Perguntas Frequentes
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 transition-all shadow-sm cursor-pointer hover:border-[#1C1917]"
              onClick={() => toggleFaq(index)}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-[#1C1917] uppercase tracking-tight">
                  {item.question}
                </h3>
                <span className="text-lg font-black text-[#1C1917] ml-4">
                  {openFaq === index ? '−' : '+'}
                </span>
              </div>
              {openFaq === index && (
                <p className="text-xs text-[#57534E] leading-relaxed mt-4 pt-4 border-t border-[#F5F5F4]">
                  {item.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FORMULÁRIO DE AUTENTICAÇÃO */}
      <section id="auth" className="py-28 px-6 max-w-md mx-auto w-full flex flex-col justify-center">
        <div className="bg-[#FFFFFF] rounded-2xl p-8 shadow-lg flex flex-col gap-6 text-[#1C1917] border border-[#E7E5E4]">
          <div className="flex flex-col gap-1 text-center">
            <h2 className="text-2xl font-black tracking-tight uppercase text-[#1C1917]">
              {isLogin ? 'Acessar Conta' : 'Criar Conta Grátis'}
            </h2>
            <p className="text-xs text-[#78716C]">
              {isLogin
                ? 'Insira suas credenciais para entrar na plataforma.'
                : 'Selecione seu nível CEFR inicial e comece hoje.'}
            </p>
          </div>

          <div className="grid grid-cols-2 bg-[#F5F5F4] p-1 rounded-xl text-xs font-bold uppercase tracking-wider border border-[#E7E5E4]">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`py-2.5 rounded-lg transition-all ${isLogin ? 'bg-[#1C1917] text-[#FAF9F6]' : 'text-[#78716C]'}`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`py-2.5 rounded-lg transition-all ${!isLogin ? 'bg-[#1C1917] text-[#FAF9F6]' : 'text-[#78716C]'}`}
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
                <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
                  Nível CEFR Inicial
                </label>
                <select
                  value={cefrLevel}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCefrLevel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#D6D3D1] text-[#1C1917] text-xs rounded-xl outline-none focus:border-[#1C1917] font-bold"
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
              <label className="flex items-start gap-2 text-xs text-[#78716C] cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-[#D6D3D1] text-[#1C1917] focus:ring-[#1C1917]"
                />
                <span className="text-xs text-[#78716C]">
                  Li e aceito os{' '}
                  <button 
                    type="button" 
                    onClick={() => navigate('/Terms')} 
                    className="text-[#1C1917] underline font-bold"
                  >
                    Termos de Uso
                  </button>
                  {' '}e a{' '}
                  <button 
                    type="button" 
                    onClick={() => navigate('/Moderation')} 
                    className="text-[#1C1917] underline font-bold"
                  >
                    Moderação de Vídeo
                  </button>.
                </span>
              </label>
            )}

            <Button variant="primary" className="w-full py-3.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-bold text-xs uppercase tracking-widest rounded-xl transition-all">
              {isLogin ? 'Entrar' : 'Cadastrar Gratuitamente'}
            </Button>
          </form>

          <div className="relative flex py-0.5 items-center">
            <div className="flex-grow border-t border-[#E7E5E4]"></div>
            <span className="flex-shrink mx-4 text-[10px] font-bold text-[#A8A29E] uppercase tracking-widest">
              OU ENTRE COM
            </span>
            <div className="flex-grow border-t border-[#E7E5E4]"></div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <button type="button" className="py-2.5 border border-[#E7E5E4] bg-[#FAF9F6] rounded-xl text-xs font-bold text-[#1C1917] hover:bg-[#F5F5F4] flex items-center justify-center">
              Google
            </button>
            <button type="button" className="py-2.5 border border-[#E7E5E4] bg-[#FAF9F6] rounded-xl text-xs font-bold text-[#1C1917] hover:bg-[#F5F5F4] flex items-center justify-center">
              Facebook
            </button>
            <button type="button" className="py-2.5 border border-[#E7E5E4] bg-[#FAF9F6] rounded-xl text-xs font-bold text-[#1C1917] hover:bg-[#F5F5F4] flex items-center justify-center">
              E-mail
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-[#1C1917] border-t border-[#292524] pt-16 pb-12 px-6 lg:px-12 text-[#FAF9F6]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-4">
            <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-[#FAF9F6] leading-none">
              SIDEBYSIDE <br />
              <span className="text-[#A8A29E]">P2P SPEAKING</span>
            </h2>
            <p className="text-xs text-[#A8A29E] max-w-sm">
              Conectando estudantes globais para prática ativa e segura de conversação em inglês.
            </p>
          </div>

          <div className="flex justify-start md:justify-end">
            <div className="w-32 h-32 border border-[#44403C] bg-[#292524] flex items-center justify-center rounded-xl">
              <span className="text-[#FAF9F6] font-black text-xl">S×S</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-[#292524] flex flex-col sm:flex-row items-center justify-between text-xs text-[#A8A29E] gap-4">
          <p>© 2026 SideBySide. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <button type="button" onClick={() => navigate('/Terms')} className="hover:text-[#FAF9F6] transition-colors">Termos de Uso</button>
            <button type="button" onClick={() => navigate('/Moderation')} className="hover:text-[#FAF9F6] transition-colors">Política de Moderação</button>
            <button type="button" onClick={() => navigate('/Privacy')} className="hover:text-[#FAF9F6] transition-colors">Privacidade</button>
          </div>
        </div>
      </footer>

    </div>
  );
};