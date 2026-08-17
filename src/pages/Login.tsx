import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('sidebyside_last_email');

    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);
  
  // Estado da animação no rodapé
  const [footerAnimStep, setFooterAnimStep] = useState<0 | 1 | 2 | 3 | 4>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFooterAnimStep((prev) => (prev === 4 ? 0 : ((prev + 1) as 0 | 1 | 2 | 3 | 4)));
    }, 550);

    return () => clearInterval(interval);
  }, []);

  // Estado de Consentimento de Cookies e LGPD
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowCookieBanner(true);
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowCookieBanner(false);
  };

  // Lista ordenada das seções para a transição de slide via wheel
  const sectionIds = ['hero', 'about', 'features', 'testimonials', 'faq', 'auth', 'footer'];
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isScrollingRef.current) return;

      if (e.deltaY > 30) {
        setCurrentSectionIndex((prevIndex) => {
          const nextIndex = Math.min(prevIndex + 1, sectionIds.length - 1);
          scrollToSection(sectionIds[nextIndex]);
          return nextIndex;
        });
      } else if (e.deltaY < -30) {
        setCurrentSectionIndex((prevIndex) => {
          const nextIndex = Math.max(prevIndex - 1, 0);
          scrollToSection(sectionIds[nextIndex]);
          return nextIndex;
        });
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  const scrollToSection = (id: string) => {
    isScrollingRef.current = true;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

    const targetIdx = sectionIds.indexOf(id);
    if (targetIdx !== -1) {
      setCurrentSectionIndex(targetIdx);
    }

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 850);
  };

  // Estado do indicador de atividade ao vivo
  const [activeUsers, setActiveUsers] = useState(142);

  useEffect(() => {
    const interval = setInterval(() => {
      const delta = Math.floor(Math.random() * 6) - 2;
      setActiveUsers((prev) => Math.max(110, prev + delta));
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Estado para validações e mensagens
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Lógica de cálculo da força da senha
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-[#E7E5E4]', width: 'w-0' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Fraca', color: 'bg-red-500', width: 'w-1/3' };
    if (score <= 3) return { score: 2, label: 'Média', color: 'bg-amber-500', width: 'w-2/3' };
    return { score: 3, label: 'Forte', color: 'bg-emerald-500', width: 'w-full' };
  };

  const passwordStrength = getPasswordStrength(password);

  // Estado do FAQ Interativo
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Hero: Alternância PT/EN
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

  // Observador para acionar a entrada dos cards
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isForgotPassword) {
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        setErrorMessage('Por favor, informe um e-mail válido para a recuperação.');
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // CORREÇÃO: Permite envio do cookie
          body: JSON.stringify({ email }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erro ao solicitar recuperação.');

        setSuccessMessage(data.message || 'Enviamos um link de redefinição de senha para o seu e-mail!');
      } catch (err: any) {
        setErrorMessage(err.message || 'Erro ao conectar com o servidor.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!email || !password) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage('Por favor, insira um e-mail válido.');
      return;
    }

    if (!isLogin && password.length < 6) {
      setErrorMessage('A senha precisa ter no mínimo 6 caracteres.');
      return;
    }

    if (!isLogin && !agreeTerms) {
      setErrorMessage('Você deve aceitar os Termos de Uso e a Política de Moderação para continuar.');
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = isLogin
        ? 'http://localhost:3000/api/auth/login'
        : 'http://localhost:3000/api/auth/register';

      const payload = isLogin
        ? { email, password }
        : { email, password, level: 'B1' };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // CORREÇÃO DE SEGURANÇA: Garante o envio e o set do Cookie Http-Only!
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar a requisição.');
      }

      // Se for login bem-sucedido, salva no localStorage os dados novos e faz o "hard reload" limpo pro dashboard
      if (isLogin) {
        localStorage.setItem('sidebyside_last_email', email);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        window.location.href = '/dashboard';
        return;
      } 
      
      // Se for criação de conta, vai para a tela de Verificação do E-mail
      if (!isLogin) {
        localStorage.setItem('sidebyside_pending_email', email);
        navigate('/verify-code');
      }

    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao conectar com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqItems = [
    {
      question: 'A plataforma é realmente gratuita?',
      answer: 'Sim! Você pode realizar conexões diárias e praticar em salas ao vivo sem custo algum na versão base.',
    },
    {
      question: 'Como funciona a segurança nas chamadas de vídeo?',
      answer: 'Contamos com moderação ativa por Inteligência Artificial em tempo real que monitora desvios de conduta, além de botões de troca de par e denúncia instantânea.',
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

      {/* Header Fixo */}
      <div className="fixed top-6 left-0 right-0 w-full flex justify-center z-40 px-4">
        <header className="w-full max-w-5xl px-6 py-3.5 flex items-center justify-between bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('hero')}>
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
          </nav>

          <button
            type="button"
            onClick={() => scrollToSection('auth')}
            className="px-6 py-2.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-bold text-xs uppercase tracking-wider rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            Acessar
            <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </header>
      </div>

      {/* HERO SLIDE */}
      <section id="hero" className="relative min-h-screen w-full flex flex-col justify-between pt-32 pb-10 px-6 lg:px-12 border-b border-[#E7E5E4] overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto my-auto text-center flex flex-col items-center gap-6">
          
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-[#FFFFFF] border border-[#E7E5E4] rounded-full shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#1C1917]">
              {activeUsers} estudantes praticando agora
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.95] h-[190px] sm:h-[230px] flex flex-col justify-center">
            <div className="text-[#1C1917]">{isEnglish ? 'Conversation' : 'Conversação'}</div>
            <div className="text-[#A8A29E]">
              {isEnglish ? 'Meets Connection' : 'Encontra Conexão'}
            </div>
          </h1>

          <p className="text-[#57534E] text-base sm:text-lg max-w-2xl font-medium leading-relaxed mt-2">
            A forma mais rápida de destravar o inglês é conversando com pessoas do seu mesmo nível em salas de áudio e vídeo seguras e moderadas por IA.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <button
              type="button"
              onClick={() => scrollToSection('auth')}
              className="px-9 py-4 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-bold text-xs uppercase tracking-widest rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-2.5"
            >
              Praticar Agora Gratuitamente
              <svg className="w-4 h-4 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
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
          <button type="button" onClick={() => scrollToSection('about')} className="text-[#1C1917] hover:underline flex items-center gap-1.5">
            Explorar Método
            <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
            </svg>
          </button>
        </div>
      </section>

      {/* STATEMENT SLIDE */}
      <section id="about" className="min-h-screen w-full pt-20 pb-8 px-6 lg:px-12 max-w-6xl mx-auto flex flex-col justify-center gap-8 border-b border-[#E7E5E4]">
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#1C1917] leading-[1.2] text-center sm:text-left">
          SEM TEORIA OU EXERCÍCIOS PASSIVOS. NOSSO FOCO É{" "}
          <span className="inline-block text-[#FAF9F6] px-3.5 py-1 bg-[#1C1917] font-black rounded-lg">
            100% PRÁTICO
          </span>{" "}
          PARA VOCÊ{" "}
          <span className="inline-block text-[#1C1917] px-3.5 py-1 bg-[#E7E5E4] font-black rounded-lg">
            OUVIR MELHOR
          </span>{" "}
          E FALAR COM{" "}
          <span className="inline-block text-[#1C1917] px-3.5 py-1 border-2 border-[#1C1917] font-black rounded-lg">
            TOTAL CONFIANÇA
          </span>{" "}
          EM INGLÊS.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] p-6 sm:p-8 rounded-2xl flex flex-col justify-between gap-4 hover:border-[#1C1917] transition-colors shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[#1C1917] bg-[#F5F5F4] px-3 py-1 rounded-md border border-[#E7E5E4]">
                TREINO DE ESCUTA (LISTENING)
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#1C1917]" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-black uppercase text-[#1C1917]">Sotaques & Ritmo Real</h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Treine seu ouvido para compreender falantes reais em diferentes velocidades, superando o bloqueio de escutar diálogos fora dos livros acadêmicos.
              </p>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E7E5E4] p-6 sm:p-8 rounded-2xl flex flex-col justify-between gap-4 hover:border-[#1C1917] transition-colors shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[#1C1917] bg-[#F5F5F4] px-3 py-1 rounded-md border border-[#E7E5E4]">
                TREINO DE FALA (SPEAKING)
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#1C1917]" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-black uppercase text-[#1C1917]">Formulações Instantâneas</h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Pratique a construção rápida de frases no seu próprio nível CEFR, construindo confiança e fluência sem a ansiedade de ser avaliado.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-4 border-t border-[#E7E5E4]">
          <p className="text-[#57534E] text-xs sm:text-sm leading-relaxed">
            No SideBySide, você entra diretamente em salas ao vivo de áudio e vídeo pareadas no seu nível de fluência.
          </p>
          <div className="flex sm:justify-end">
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="px-8 py-3 bg-[#FAF9F6] border border-[#1C1917] text-[#1C1917] hover:bg-[#1C1917] hover:text-[#FAF9F6] font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
            >
              Conhecer Nossos Pilares
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* PILARES SLIDE */}
      <section id="features" ref={featuresRef} className="min-h-screen w-full pt-20 pb-8 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col justify-center gap-10 border-b border-[#E7E5E4] overflow-hidden">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-[#78716C] uppercase tracking-widest">Estrutura e Garantias</span>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#1C1917]">
            Três Pilares do Nosso Ecossistema
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full items-stretch">
          <div
            className={`w-full transition-all duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isCardsVisible ? 'translate-x-0 opacity-100' : '-translate-x-[100vw] opacity-0'
            }`}
          >
            <div className="w-full h-full min-h-[320px] rounded-2xl bg-[#FFFFFF] border border-[#E7E5E4] p-6 sm:p-8 shadow-xl flex flex-col justify-between cursor-pointer group transition-all duration-500 hover:border-[#1C1917] hover:-translate-y-2">
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-[#78716C] uppercase tracking-widest">01 / PAREAMENTO CEFR</span>
                <h3 className="text-2xl font-black uppercase text-[#1C1917]">Nível Equivalente</h3>
                <p className="text-xs text-[#57534E] leading-relaxed mt-1">
                  Conecte-se com pessoas do A1 ao C2. Fale de igual para igual com quem está no mesmo patamar de aprendizado.
                </p>
              </div>
              <div className="pt-4 border-t border-[#F5F5F4] text-[11px] text-[#1C1917] font-bold uppercase flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 fill-none stroke-emerald-600 stroke-[3]" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Comunicação fluida sem assimetria
              </div>
            </div>
          </div>

          <div
            className={`w-full transition-all duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isCardsVisible ? 'translate-x-0 opacity-100' : '-translate-x-[100vw] opacity-0'
            }`}
            style={{ transitionDelay: isCardsVisible ? '300ms' : '0ms' }}
          >
            <div className="w-full h-full min-h-[320px] rounded-2xl bg-[#FFFFFF] border border-[#E7E5E4] p-6 sm:p-8 shadow-xl flex flex-col justify-between cursor-pointer group transition-all duration-500 hover:border-[#1C1917] hover:-translate-y-2">
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-[#78716C] uppercase tracking-widest">02 / MODERAÇÃO POR IA</span>
                <h3 className="text-2xl font-black uppercase text-[#1C1917]">Ambiente Protegido</h3>
                <p className="text-xs text-[#57534E] leading-relaxed mt-1">
                  Análise contínua em tempo real contra comportamentos abusivos ou desrespeitosos para uma prática 100% segura.
                </p>
              </div>
              <div className="pt-4 border-t border-[#F5F5F4] text-[11px] text-[#1C1917] font-bold uppercase flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 fill-none stroke-emerald-600 stroke-[3]" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Banimento instantâneo de abusos
              </div>
            </div>
          </div>

          <div
            className={`w-full transition-all duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isCardsVisible ? 'translate-x-0 opacity-100' : '-translate-x-[100vw] opacity-0'
            }`}
            style={{ transitionDelay: isCardsVisible ? '600ms' : '0ms' }}
          >
            <div className="w-full h-full min-h-[320px] rounded-2xl bg-[#FFFFFF] border border-[#E7E5E4] p-6 sm:p-8 shadow-xl flex flex-col justify-between cursor-pointer group transition-all duration-500 hover:border-[#1C1917] hover:-translate-y-2">
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-[#78716C] uppercase tracking-widest">03 / SUPORTE VISUAL</span>
                <h3 className="text-2xl font-black uppercase text-[#1C1917]">Guia na Tela</h3>
                <p className="text-xs text-[#57534E] leading-relaxed mt-1">
                  Sugestões de temas, perguntas quebra-gelo e dicas de vocabulário aparecem no painel lateral durante a chamada.
                </p>
              </div>
              <div className="pt-4 border-t border-[#F5F5F4] text-[11px] text-[#1C1917] font-bold uppercase flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 fill-none stroke-emerald-600 stroke-[3]" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Nunca fique sem saber o que dizer
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS SLIDE */}
      <section id="testimonials" className="min-h-screen w-full pt-20 pb-8 px-6 lg:px-12 max-w-5xl mx-auto flex flex-col justify-center gap-10 border-b border-[#E7E5E4]">
        <div className="flex flex-col gap-2 text-center items-center">
          <span className="text-xs font-bold text-[#78716C] uppercase tracking-widest">Comunidade em Ação</span>
          <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-[#1C1917]">
            Quem Pratica,{' '}
            <span className="bg-gradient-to-r from-[#1C1917] via-[#78716C] to-[#1C1917] bg-[length:200%_auto] bg-clip-text text-transparent underline decoration-[#E7E5E4] underline-offset-8">
              Destrava
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-sm text-center">
          <div className="flex flex-col gap-1">
            <span className="text-3xl sm:text-4xl font-black text-[#1C1917]">+15.000</span>
            <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Conversas Realizadas</span>
          </div>
          <div className="flex flex-col gap-1 border-y sm:border-y-0 sm:border-x border-[#E7E5E4] py-4 sm:py-0">
            <span className="text-3xl sm:text-4xl font-black text-[#1C1917]">98.4%</span>
            <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Avaliações Positivas</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl sm:text-4xl font-black text-[#1C1917]">4.9 / 5</span>
            <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Nota Média de Segurança</span>
          </div>
        </div>

        <div className="relative bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-10 shadow-sm min-h-[200px] flex flex-col justify-between transition-all duration-500">
          <div className="flex flex-col gap-4">
            <span className="text-3xl font-black text-[#A8A29E] leading-none">“</span>
            <p className="text-sm sm:text-lg font-medium text-[#1C1917] leading-relaxed italic -mt-4">
              {testimonials[currentTestimonial].quote}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-[#F5F5F4] mt-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1C1917] text-[#FAF9F6] font-black text-xs flex items-center justify-center uppercase">
                {testimonials[currentTestimonial].initials}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#1C1917]">{testimonials[currentTestimonial].author}</span>
                <span className="text-[11px] font-bold text-[#A8A29E] uppercase">{testimonials[currentTestimonial].level}</span>
              </div>
            </div>

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
                  className="w-8 h-8 rounded-lg border border-[#E7E5E4] hover:bg-[#F5F5F4] text-[#1C1917] font-bold flex items-center justify-center transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
                  }
                  className="w-8 h-8 rounded-lg border border-[#E7E5E4] hover:bg-[#F5F5F4] text-[#1C1917] font-bold flex items-center justify-center transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SLIDE */}
      <section id="faq" className="min-h-screen w-full pt-20 pb-8 px-6 lg:px-12 max-w-4xl mx-auto flex flex-col justify-center gap-8 border-b border-[#E7E5E4]">
        <div className="flex flex-col gap-2 text-center items-center">
          <span className="text-xs font-bold text-[#78716C] uppercase tracking-widest">Tire suas dúvidas</span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#1C1917]">
            Perguntas Frequentes
          </h2>
        </div>

        <div className="flex flex-col gap-3.5">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-5 sm:p-6 transition-all shadow-sm cursor-pointer hover:border-[#1C1917]"
              onClick={() => toggleFaq(index)}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm sm:text-base font-bold text-[#1C1917] uppercase tracking-tight">
                  {item.question}
                </h3>
                <span className="text-base font-black text-[#1C1917] ml-4">
                  {openFaq === index ? '−' : '+'}
                </span>
              </div>
              {openFaq === index && (
                <p className="text-xs text-[#57534E] leading-relaxed mt-3 pt-3 border-t border-[#F5F5F4]">
                  {item.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* AUTH SLIDE */}
      <section id="auth" className="min-h-screen w-full pt-16 pb-8 px-6 max-w-md mx-auto flex flex-col justify-center">
        <div className="bg-[#FFFFFF] rounded-2xl p-7 shadow-lg flex flex-col gap-5 text-[#1C1917] border border-[#E7E5E4]">
          
          <div className="flex flex-col gap-1 text-center">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase text-[#1C1917]">
              {isForgotPassword
                ? 'Recuperar Senha'
                : isLogin
                ? 'Acessar Conta'
                : 'Criar Conta Grátis'}
            </h2>
            <p className="text-xs text-[#78716C]">
              {isForgotPassword
                ? 'Digite seu e-mail para receber o link de redefinição.'
                : isLogin
                ? 'Insira suas credenciais para entrar na plataforma.'
                : 'Comece a praticar seu inglês hoje mesmo.'}
            </p>
          </div>

          {!isForgotPassword && (
            <div className="grid grid-cols-2 bg-[#F5F5F4] p-1 rounded-xl text-xs font-bold uppercase tracking-wider border border-[#E7E5E4]">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setIsForgotPassword(false);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 rounded-lg transition-all ${isLogin ? 'bg-[#1C1917] text-[#FAF9F6]' : 'text-[#78716C]'}`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setIsForgotPassword(false);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 rounded-lg transition-all ${!isLogin ? 'bg-[#1C1917] text-[#FAF9F6]' : 'text-[#78716C]'}`}
              >
                Criar Conta
              </button>
            </div>
          )}

          {/* Mensagem de Erro Estilizada */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
              <svg className="w-4 h-4 shrink-0 fill-current text-red-600" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" />
              </svg>
              <p className="flex-1 leading-snug">{errorMessage}</p>
            </div>
          )}

          {/* Mensagem de Sucesso */}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
              <svg className="w-4 h-4 shrink-0 fill-current text-emerald-600" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              <p className="flex-1 leading-snug">{successMessage}</p>
            </div>
          )}

          <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              className="bg-[#FFFFFF] border-[#E7E5E4] text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#1C1917] focus:bg-[#FFFFFF] focus:text-[#1C1917]"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
            />

            {!isForgotPassword && (
              <div className="flex flex-col gap-1.5">
                <div className="relative w-full">
                  <Input
                    label="Senha"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    value={password}
                    className="bg-[#FFFFFF] border-[#E7E5E4] text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#1C1917] focus:bg-[#FFFFFF] focus:text-[#1C1917]"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                  />
                    
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-[38px] text-[#78716C] hover:text-[#1C1917] transition-colors p-0.5"
                    title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>

                {isLogin && (
                  <div className="flex justify-end mt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-xs font-bold text-[#78716C] hover:text-[#1C1917] transition-colors"
                    >
                      Esqueceu sua senha?
                    </button>
                  </div>
                )}

                {!isLogin && password.length > 0 && (
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-[#78716C] uppercase">
                      <span>Força da senha:</span>
                      <span className={passwordStrength.score === 1 ? 'text-red-500' : passwordStrength.score === 2 ? 'text-amber-500' : 'text-emerald-600'}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F5F5F4] rounded-full overflow-hidden border border-[#E7E5E4]">
                      <div className={`h-full rounded-full transition-all duration-500 ease-out ${passwordStrength.width} ${passwordStrength.color}`} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isLogin && !isForgotPassword && (
              <div className="flex flex-col gap-2 mt-1">
                <label className="flex items-start gap-2 text-xs text-[#78716C] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setAgreeTerms(e.target.checked);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="mt-0.5 rounded border-[#E7E5E4] text-[#1C1917] focus:ring-[#1C1917]"
                  />
                  <span className="text-xs text-[#78716C] leading-snug">
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

                  <div className="relative inline-block ml-1">
                    <button
                      type="button"
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                      onClick={() => setShowTooltip(!showTooltip)}
                      className="w-4 h-4 rounded-full bg-[#E7E5E4] text-[#1C1917] font-bold text-[10px] flex items-center justify-center hover:bg-[#1C1917] hover:text-[#FAF9F6] transition-colors"
                    >
                      ?
                    </button>

                    {showTooltip && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-[#1C1917] text-[#FAF9F6] text-[11px] rounded-xl shadow-xl z-50 leading-relaxed font-normal pointer-events-none">
                        A moderação analisa condutas em tempo real por IA. Suas chamadas não são gravadas ou vendidas.
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1C1917]" />
                      </div>
                    )}
                  </div>
                </label>
              </div>
            )}

            <Button disabled={isSubmitting} variant="primary" className="w-full py-3.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-bold text-xs uppercase tracking-widest rounded-xl transition-all">
              {isSubmitting
                ? 'Processando...'
                : isForgotPassword
                ? 'Enviar E-mail de Recuperação'
                : isLogin
                ? 'Entrar'
                : 'Cadastrar Gratuitamente'}
            </Button>

            {isForgotPassword && (
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="w-full text-center text-xs font-bold text-[#78716C] hover:text-[#1C1917] transition-colors mt-1 flex items-center justify-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Voltar para o Login
              </button>
            )}
          </form>

          {!isForgotPassword && (
            <>
              <div className="relative flex py-0.5 items-center">
                <div className="flex-grow border-t border-[#E7E5E4]"></div>
                <span className="flex-shrink mx-4 text-[10px] font-bold text-[#A8A29E] uppercase tracking-widest">
                  OU ENTRE COM
                </span>
                <div className="flex-grow border-t border-[#E7E5E4]"></div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  className="py-2.5 border border-[#E7E5E4] bg-[#FFFFFF] rounded-xl text-xs font-bold text-[#1C1917] hover:bg-[#F5F5F4] flex items-center justify-center gap-2 transition-all"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.23v3.15C3.25 21.37 7.34 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.23C.44 8.16 0 9.99 0 12s.44 3.84 1.23 5.42l4.05-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.63 1.23 6.58l4.05 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  Google
                </button>

                <button
                  type="button"
                  className="py-2.5 border border-[#E7E5E4] bg-[#FFFFFF] rounded-xl text-xs font-bold text-[#1C1917] hover:bg-[#F5F5F4] flex items-center justify-center gap-2 transition-all"
                >
                  <svg className="w-4 h-4 shrink-0 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>

                <button
                  type="button"
                  className="py-2.5 border border-[#E7E5E4] bg-[#FFFFFF] rounded-xl text-xs font-bold text-[#1C1917] hover:bg-[#F5F5F4] flex items-center justify-center gap-2 transition-all"
                >
                  <svg className="w-4 h-4 shrink-0 stroke-[#1C1917] fill-none stroke-2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  E-mail
                </button>
              </div>
            </>
          )}

        </div>
      </section>

      {/* Banner de Cookies / LGPD Fixo */}
      {showCookieBanner && (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md bg-[#1C1917] text-[#FAF9F6] p-6 rounded-2xl shadow-2xl border border-[#292524] z-50 flex flex-col gap-4 animate-fadeIn">
          <div className="flex flex-col gap-1.5">
            <h4 className="text-sm font-black uppercase tracking-wider text-[#FAF9F6]">
              Privacidade e Cookies (LGPD)
            </h4> 
            <p className="text-xs text-[#A8A29E] leading-relaxed">
              Utilizamos cookies estritamente necessários para otimizar sua experiência de navegação e garantir conexões P2P seguras.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#292524]">
            <button
              type="button"
              onClick={() => navigate('/Privacy')}
              className="text-xs font-bold text-[#A8A29E] hover:text-[#FAF9F6] underline transition-colors"
            >
              Saiba mais
            </button>
            <button
              type="button"
              onClick={handleAcceptCookies}
              className="px-5 py-2.5 bg-[#FAF9F6] hover:bg-[#E7E5E4] text-[#1C1917] font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* FOOTER SLIDE */}
      <footer id="footer" className="min-h-screen w-full bg-[#1C1917] border-t-4 border-[#1C1917] px-6 lg:px-12 text-[#FAF9F6] flex flex-col justify-between pt-24 pb-12">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center my-auto">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF9F6] flex items-center justify-center font-black text-[#1C1917] text-xl shadow-[4px_4px_0px_0px_#A8A29E]">
                S
              </div>
              <span className="text-2xl font-black tracking-tight text-[#FAF9F6] uppercase">SideBySide</span>
            </div>

            <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-[#FAF9F6] leading-none">
              P2P SPEAKING <br />
              <span className="text-[#A8A29E]">COMMUNITY</span>
            </h2>
            <p className="text-xs text-[#A8A29E] max-w-sm leading-relaxed font-medium">
              Conectando estudantes globais para prática ativa e segura de conversação em inglês sem filtros ou rodeios.
            </p>

            <nav className="flex flex-wrap gap-4 text-xs font-black uppercase tracking-widest text-[#FAF9F6] pt-2">
              <button type="button" onClick={() => scrollToSection('about')} className="hover:text-[#A8A29E] transition-colors underline">Método</button>
              <button type="button" onClick={() => scrollToSection('features')} className="hover:text-[#A8A29E] transition-colors underline">Pilares</button>
              <button type="button" onClick={() => scrollToSection('testimonials')} className="hover:text-[#A8A29E] transition-colors underline">Comunidade</button>
              <button type="button" onClick={() => scrollToSection('faq')} className="hover:text-[#A8A29E] transition-colors underline">FAQ</button>
            </nav>
          </div>

          <div className="flex justify-start md:justify-end">
            <div className="w-auto h-40 border-4 border-[#FAF9F6] bg-[#292524] px-8 flex items-center justify-center rounded-3xl shadow-[8px_8px_0px_0px_#FAF9F6] overflow-hidden">
              <div className="flex items-center justify-center gap-2">
                <span
                  className={`text-2xl sm:text-3xl font-black uppercase text-[#FAF9F6] tracking-tighter transition-all duration-300 ${
                    footerAnimStep >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                  }`}
                >
                  Side
                </span>

                <span
                  className={`text-2xl sm:text-3xl font-black text-[#FAF9F6] transition-all duration-300 ${
                    footerAnimStep >= 2 ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
                  }`}
                >
                  |
                </span>

                <div className="relative inline-flex items-center">
                  <span
                    className={`text-2xl sm:text-3xl font-black text-[#A8A29E] transition-all duration-300 absolute left-0 ${
                      footerAnimStep === 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-x-0'
                    }`}
                  >
                    |
                  </span>
                  <span
                    className={`text-xl sm:text-2xl font-black text-[#A8A29E] uppercase tracking-wider transition-all duration-400 origin-left ${
                      footerAnimStep >= 3
                        ? 'opacity-100 translate-x-0 scale-x-100'
                        : 'opacity-0 translate-x-1 scale-x-0'
                    }`}
                  >
                    BY
                  </span>
                </div>

                <span
                  className={`text-2xl sm:text-3xl font-black uppercase text-[#FAF9F6] tracking-tighter transition-all duration-400 ${
                    footerAnimStep >= 4 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                  }`}
                >
                  SIDE
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full pt-8 border-t-2 border-[#292524] flex flex-col sm:flex-row items-center justify-between text-xs text-[#A8A29E] gap-4 font-bold">
          <p>© 2026 SIDEBYSIDE. TODOS OS DIREITOS RESERVADOS.</p>
          <div className="flex gap-6 uppercase tracking-wider">
            <button type="button" onClick={() => navigate('/Terms')} className="hover:text-[#FAF9F6] transition-colors underline">Termos de Uso</button>
            <button type="button" onClick={() => navigate('/Moderation')} className="hover:text-[#FAF9F6] transition-colors underline">Política de Moderação</button>
            <button type="button" onClick={() => navigate('/Privacy')} className="hover:text-[#FAF9F6] transition-colors underline">Privacidade</button>
          </div>
        </div>
      </footer>

    </div>
  );
};