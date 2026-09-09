import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { BADGES_CATALOG } from '../data/badgesData';
import { api } from '../services/api';

/* =========================================================
   ÍCONES VETORIAIS EXCLUSIVOS SIDEBYSIDE
   ========================================================= */

const PandaPawIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <ellipse cx="12" cy="15.8" rx="4.6" ry="3.8" />
    <circle cx="6.5" cy="9.6" r="2" />
    <circle cx="10.1" cy="6.6" r="2.1" />
    <circle cx="13.9" cy="6.6" r="2.1" />
    <circle cx="17.5" cy="9.6" r="2" />
  </svg>
);

const BambooIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M12 2v20" />
    <path d="M9.5 7h5" />
    <path d="M9.5 14h5" />
    <path d="M12 7c2.5-2 5.5-2 7.5 0" />
    <path d="M12 14c-2.5-2 -5.5-2 -7.5 0" />
  </svg>
);

const FlameIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2c-.5 2.5-2.5 4.5-4 7-1.8 3-1.8 6.5 0 9.5 2 3.2 6 4.5 9 3 2.5-1.2 4-3.8 4-6.5 0-4-3-7-4.5-9.5-1-1.6-1.5-3.5-1.5-5.5-.8 1-2 2-3 2.5z" />
  </svg>
);

const PandaMascotIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="5" cy="5.5" r="2.5" fill="currentColor" />
    <circle cx="19" cy="5.5" r="2.5" fill="currentColor" />
    <circle cx="12" cy="13" r="7.5" />
    <ellipse cx="9.2" cy="12" rx="1.8" ry="1.4" fill="currentColor" />
    <ellipse cx="14.8" cy="12" rx="1.8" ry="1.4" fill="currentColor" />
    <path d="M11 15.2h2" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const ShieldIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.105-2.574-.305-3.8A11.983 11.983 0 0112 2.714z" />
  </svg>
);

interface FriendItem {
  id: string;
  name: string;
  tag?: string;
  avatar: string;
  level: string;
  isOnline?: boolean;
}

interface UserFeedback {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('sidebyside_user') || localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.user || parsed?.data || parsed;
  } catch {
    return null;
  }
};

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'general' | 'social' | 'stats' | 'security'>('general');

  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [followerPos, setFollowerPos] = useState({ x: -100, y: -100 });
  const [cursorOpacity, setCursorOpacity] = useState(1);

  // Inicializa imediatamente com dados reais do cache local
  const initialUser = useMemo(() => getStoredUser() || {}, []);

  const [name, setName] = useState(initialUser.name || initialUser.fullName || '');
  const [tag, setTag] = useState(initialUser.tag || `${(initialUser.name || 'User').replace(/\s+/g, '')}#0001`);
  const [email, setEmail] = useState(initialUser.email || '');
  const [age, setAge] = useState<number | string>(initialUser.age || '');
  const [showAgeInProfile, setShowAgeInProfile] = useState<boolean>(initialUser.showAgeInProfile ?? true);
  const [gender, setGender] = useState(initialUser.gender || 'Prefiro não dizer');
  const [pronouns, setPronouns] = useState(initialUser.pronouns || 'ele/dele (he/him)');
  const [cefrLevel, setCefrLevel] = useState(initialUser.level || 'B1');
  const [avatarUrl, setAvatarUrl] = useState(initialUser.avatar || initialUser.avatarUrl || '/images/default-avatar.png');
  const [bio, setBio] = useState(initialUser.bio || '');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialUser.interests || []);

  const [reputationScore, setReputationScore] = useState<number>(initialUser.reputation ?? 100);
  const [currentStreak, setCurrentStreak] = useState<number>(initialUser.streak ?? 0);
  const [weeklyGoalTarget, setWeeklyGoalTarget] = useState<number>(initialUser.weeklyGoal?.target ?? 5);
  const [weeklyGoalCompleted, setWeeklyGoalCompleted] = useState<number>(initialUser.weeklyGoal?.completed ?? 0);

  const [realFriends, setRealFriends] = useState<FriendItem[]>([]);
  const [receivedFeedback, setReceivedFeedback] = useState<UserFeedback[]>([]);

  const [showPublicPreview, setShowPublicPreview] = useState(false);
  const [showTopicsModal, setShowTopicsModal] = useState(false);
  const [topicSearch, setTopicSearch] = useState('');

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estados de cópia e aviso sutil de tópicos
  const [copiedTag, setCopiedTag] = useState(false);
  const [topicLimitWarning, setTopicLimitWarning] = useState(false);

  // Estados de Segurança
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailCodeVerified, setIsEmailCodeVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePasswordConfirm, setDeletePasswordConfirm] = useState('');
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [agreeDeleteTerms, setAgreeDeleteTerms] = useState(false);

  // Disponibilidade
  const timeSlots = ['Manhã (08h - 12h)', 'Tarde (12h - 18h)', 'Noite (18h - 22h)'];
  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>(initialUser.availability || []);

  // Seguidor do Cursor
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

  // Carrega dados reais do usuário da API
  const fetchProfile = useCallback(async () => {
    try {
      let res;
      try {
        res = await api.get('/api/user/me');
      } catch (err: any) {
        if (err?.response?.status === 404) {
          try {
            res = await api.get('/api/auth/me');
          } catch {
            res = await api.get('/api/users/me');
          }
        } else {
          throw err;
        }
      }

      if (res && res.data) {
        const raw = res.data;
        const data = raw.user || raw.data?.user || raw.data || raw;

        if (data.name || data.fullName) setName(data.name || data.fullName);
        if (data.tag) setTag(data.tag);
        if (data.email) setEmail(data.email);
        if (data.level) setCefrLevel(data.level);
        if (data.avatar || data.avatarUrl) setAvatarUrl(data.avatar || data.avatarUrl);
        if (data.bio !== undefined) setBio(data.bio);
        if (data.age !== undefined) setAge(data.age);
        if (data.gender) setGender(data.gender);
        if (data.pronouns) setPronouns(data.pronouns);
        if (data.interests) setSelectedInterests(data.interests);
        if (data.showAgeInProfile !== undefined) setShowAgeInProfile(data.showAgeInProfile);
        if (data.reputation !== undefined) setReputationScore(data.reputation);
        if (data.streak !== undefined) setCurrentStreak(data.streak);
        if (data.weeklyGoal) {
          if (data.weeklyGoal.target) setWeeklyGoalTarget(data.weeklyGoal.target);
          if (data.weeklyGoal.completed !== undefined) setWeeklyGoalCompleted(data.weeklyGoal.completed);
        }
        if (data.availability) setSelectedAvailability(data.availability);
        if (Array.isArray(data.feedbacks)) setReceivedFeedback(data.feedbacks);

        localStorage.setItem('sidebyside_user', JSON.stringify(data));
      }
    } catch (err) {
      console.warn('Utilizando dados em cache do perfil.', err);
    }
  }, []);

  const fetchFriends = useCallback(async () => {
    try {
      const res = await api.get('/api/friends');
      if (res.data && Array.isArray(res.data)) {
        setRealFriends(res.data);
      }
    } catch (err) {
      console.warn('Não foi possível carregar a lista de amigos.', err);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchFriends();
  }, [fetchProfile, fetchFriends]);

  const topicsLibrary = [
    { category: 'Tecnologia & Carreira', items: ['Tecnologia', 'Carreira & Negócios', 'Inteligência Artificial', 'Startups', 'Programação', 'Marketing Digital'] },
    { category: 'Cultura & Entretenimento', items: ['Cinema & Séries', 'Música', 'Leitura', 'Jogos & eSports', 'Arte & Design', 'Fotografia'] },
    { category: 'Estilo de Vida & Hobbies', items: ['Viagens', 'Esportes', 'Culinária', 'Saúde & Fitness', 'Gastronomia', 'Idiomas'] },
    { category: 'Sociedade & Atualidades', items: ['Economia', 'Meio Ambiente', 'Psicologia', 'História', 'Filosofia', 'Moda'] },
  ];

  // Alterna tópico com aviso sutil ao ultrapassar 5
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
      setTopicLimitWarning(false);
    } else {
      if (selectedInterests.length >= 5) {
        setTopicLimitWarning(true);
        setTimeout(() => setTopicLimitWarning(false), 3500);
        return;
      }
      setTopicLimitWarning(false);
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const toggleAvailabilitySlot = (slotKey: string) => {
    if (selectedAvailability.includes(slotKey)) {
      setSelectedAvailability(selectedAvailability.filter((item) => item !== slotKey));
    } else {
      setSelectedAvailability([...selectedAvailability, slotKey]);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Copia a Tag do Usuário com feedback
  const handleCopyTag = () => {
    if (!tag) return;
    navigator.clipboard.writeText(tag);
    setCopiedTag(true);
    setTimeout(() => setCopiedTag(false), 2000);
  };

  // Salva os dados na API e no localStorage
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    const payload = {
      name,
      tag,
      age: age ? Number(age) : null,
      showAgeInProfile,
      gender,
      pronouns,
      level: cefrLevel,
      bio,
      interests: selectedInterests,
      avatar: avatarUrl,
      availability: selectedAvailability,
      weeklyGoal: {
        target: weeklyGoalTarget,
        completed: weeklyGoalCompleted,
      }
    };

    try {
      let res;
      try {
        res = await api.put('/api/user/profile', payload);
      } catch {
        res = await api.put('/api/user', payload);
      }

      const stored = getStoredUser() || {};
      const updatedUser = { ...stored, ...payload };
      localStorage.setItem('sidebyside_user', JSON.stringify(updatedUser));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
      const stored = getStoredUser() || {};
      localStorage.setItem('sidebyside_user', JSON.stringify({ ...stored, ...payload }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendEmailCode = async () => {
    setPasswordError(null);
    try {
      await api.post('/api/auth/forgot-password', { email });
      setEmailCodeSent(true);
    } catch (err: any) {
      setPasswordError(err?.response?.data?.error || 'Erro ao enviar código.');
    }
  };

  const handleVerifyEmailCode = async () => {
    setPasswordError(null);
    if (!verificationCode || verificationCode.length < 6) {
      setPasswordError('Informe o código de 6 dígitos enviado ao e-mail.');
      return;
    }
    try {
      await api.post('/api/auth/verify-reset-code', { email, code: verificationCode });
      setIsEmailCodeVerified(true);
    } catch (err: any) {
      setPasswordError(err?.response?.data?.error || 'Código inválido ou expirado.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!newPassword || !confirmPassword) {
      setPasswordError('Preencha os campos da nova senha.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('A confirmação da nova senha não confere.');
      return;
    }

    try {
      await api.post('/api/auth/reset-password', { email, code: verificationCode, newPassword });
      setPasswordSuccess('Senha alterada com sucesso!');
      setEmailCodeSent(false);
      setVerificationCode('');
      setIsEmailCodeVerified(false);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 3000);
    } catch (err: any) {
      setPasswordError(err?.response?.data?.error || 'Erro ao redefinir a senha.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePasswordConfirm) {
      alert('Por favor, informe sua senha atual para confirmar.');
      return;
    }
    if (!agreeDeleteTerms) {
      alert('Você precisa aceitar os termos de exclusão permanente.');
      return;
    }
    if (deleteConfirmationText !== 'EXCLUIR PERMANENTEMENTE') {
      alert('Confirmação de exclusão incorreta.');
      return;
    }

    try {
      await api.delete('/api/user/account', { data: { password: deletePasswordConfirm } });
      alert('Sua conta e dados foram removidos permanentemente.');
      localStorage.removeItem('sidebyside_user');
      localStorage.removeItem('token');
      navigate('/');
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Erro ao excluir a conta.');
    }
  };

  const cefrLevelsInfo = [
    { code: 'A1', label: 'Iniciante', desc: 'Compreende frases simples do dia a dia.' },
    { code: 'A2', label: 'Básico', desc: 'Comunica-se em tarefas rotineiras.' },
    { code: 'B1', label: 'Intermediário', desc: 'Mantém conversas sobre temas familiares.' },
    { code: 'B2', label: 'Intermediário Avançado', desc: 'Fala com fluência e espontaneidade.' },
    { code: 'C1', label: 'Avançado', desc: 'Expressa-se de forma fluida e bem estruturada.' },
  ];

  const goalProgressPercentage = Math.min(100, Math.round((weeklyGoalCompleted / (weeklyGoalTarget || 1)) * 100));

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1917] flex flex-col font-sans selection:bg-[#1C1917] selection:text-[#FAF9F6] relative overflow-x-hidden">
      
      {/* CURSOR FOLLOWER */}
      <div
        className="pointer-events-none fixed z-50 w-3.5 h-3.5 rounded-full bg-[#1C1917] transition-opacity duration-300 ease-out -translate-x-1/2 -translate-y-1/2 hidden md:block ring-2 ring-emerald-500/20"
        style={{ left: `${followerPos.x}px`, top: `${followerPos.y}px`, opacity: cursorOpacity }}
      />

      {/* HEADER NAS EXTREMIDADES */}
      <header className="bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E7E5E4] px-6 sm:px-10 lg:px-14 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => navigate('/dashboard')}>
          <img 
            src="/images/logo.png" 
            alt="SideBySide" 
            className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105" 
          />
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-[#1C1917] uppercase leading-none">SideBySide</span>
            <span className="text-[9px] font-bold tracking-widest text-[#78716C] uppercase mt-0.5 flex items-center gap-1">
              <BambooIcon className="w-2.5 h-2.5 text-emerald-600" />
              Versão 1.0.0
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-[#FAF9F6] hover:bg-[#F5F5F4] border border-[#E7E5E4] hover:border-[#1C1917] text-[#1C1917] text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-2xs cursor-pointer active:scale-95"
        >
          <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Voltar ao Painel
        </button>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 lg:p-8 flex flex-col gap-6">
        
        {/* CARD HERO DO PERFIL (MAIOR RESPIRO ENTRE FOTO E DADOS • APENAS NOME, EMAIL E NÍVEL) */}
        <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
          
          {/* Marca d'água vetorial de bambu */}
          <div className="pointer-events-none absolute -bottom-10 -right-6 text-[#1C1917] opacity-[0.03] select-none">
            <svg className="w-64 h-64 fill-current" viewBox="0 0 200 200">
              <path d="M40 180 C40 120 70 80 120 40 C100 80 110 140 140 180 Z" />
              <path d="M70 180 C70 130 95 90 145 50 C125 90 135 150 165 180 Z" />
              <circle cx="150" cy="45" r="14" />
            </svg>
          </div>

          <div className="flex items-center gap-6 sm:gap-7 relative z-10">
            {/* FOTO TRAVADA E SEGURA CONTRA BUGS DE FULLSCREEN */}
            <div className="relative group w-20 h-20 min-w-[80px] min-h-[80px] max-w-[80px] max-h-[80px] rounded-2xl overflow-hidden border border-[#D6D3D1] bg-[#F5F5F4] shrink-0 shadow-2xs flex items-center justify-center">
              <img 
                src={avatarUrl || '/images/default-avatar.png'} 
                alt={name || 'Avatar'} 
                className="w-full h-full object-cover object-center aspect-square" 
              />
              <label className="absolute inset-0 bg-[#1C1917]/75 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                <svg className="w-5 h-5 stroke-[#FAF9F6] fill-none stroke-2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                </svg>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>

            {/* DADOS DO TOPO: APENAS NOME, NÍVEL E EMAIL */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black uppercase text-[#1C1917] leading-none">
                  {name || 'Seu Nome'}
                </h1>
                <span className="px-2.5 py-1 bg-[#1C1917] text-[#FAF9F6] font-bold text-[10px] rounded-lg uppercase flex items-center gap-1.5 shadow-2xs">
                  <PandaPawIcon className="w-2.5 h-2.5 text-emerald-400" />
                  {cefrLevel}
                </span>
              </div>
              <span className="text-xs text-[#78716C] font-medium tracking-wide">{email}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto relative z-10">
            <button
              type="button"
              onClick={() => setShowPublicPreview(true)}
              className="py-2.5 px-4 bg-[#FAF9F6] hover:bg-[#F5F5F4] border border-[#E7E5E4] hover:border-[#1C1917] text-[#1C1917] text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Ver Perfil Público
            </button>

            <Button
              variant="primary"
              onClick={() => handleSubmit()}
              disabled={isSaving}
              className="py-2.5 px-5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <PandaPawIcon className="w-3.5 h-3.5 text-emerald-400" />
              {isSaving ? 'Salvando...' : 'Salvar Perfil'}
            </Button>
          </div>
        </section>

        {/* NAVEGAÇÃO ENTRE ABAS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 bg-[#FFFFFF] border border-[#E7E5E4] p-1.5 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`py-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'general' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-2xs' : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Geral & Bio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('social')}
            className={`py-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'social' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-2xs' : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Agenda & Amigos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`py-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'stats' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-2xs' : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Metas & Badges
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`py-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'security' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-2xs' : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Segurança
          </button>
        </div>

        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-500 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-150 shadow-2xs">
            <CheckIcon className="w-4 h-4 text-emerald-600" />
            <span>Perfil atualizado com sucesso e sincronizado no sistema!</span>
          </div>
        )}

        {/* ABA: GERAL & BIO */}
        {activeTab === 'general' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-150">
            <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-6">
              <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917] border-b border-[#E7E5E4] pb-3 flex items-center gap-2">
                <BambooIcon className="w-4 h-4 text-emerald-600" />
                Informações Da Conta
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">Nome Completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome..."
                    className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
                  />
                </div>

                {/* CAMPO DE USUÁRIO E TAG COM BOTÃO DE COPIAR */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">Seu Usuário e Tag</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tag}
                      disabled
                      className="flex-1 px-4 py-3 bg-[#F5F5F4] border border-[#E7E5E4] rounded-xl font-mono text-xs font-bold text-[#78716C] cursor-not-allowed outline-none select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopyTag}
                      className="px-3.5 py-3 bg-[#FAF9F6] hover:bg-[#F5F5F4] border border-[#E7E5E4] hover:border-[#1C1917] text-[#1C1917] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
                      title="Copiar tag para a área de transferência"
                    >
                      {copiedTag ? (
                        <>
                          <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copiado</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                          </svg>
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">E-mail Cadastrado</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="px-4 py-3 bg-[#F5F5F4] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#78716C] cursor-not-allowed outline-none select-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">Idade</label>
                    <button
                      type="button"
                      onClick={() => setShowAgeInProfile(!showAgeInProfile)}
                      className="text-[10px] font-bold uppercase text-[#78716C] hover:text-[#1C1917] flex items-center gap-1.5 bg-[#FAF9F6] px-2 py-0.5 rounded border border-[#E7E5E4] cursor-pointer"
                    >
                      {showAgeInProfile ? 'Visível no Perfil' : 'Oculta'}
                    </button>
                  </div>
                  <input
                    type="number"
                    min={18}
                    max={100}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Ex: 24"
                    className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">Gênero</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Não-binário">Não-binário</option>
                    <option value="Prefiro não dizer">Prefiro não dizer</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">Pronomes</label>
                  <select
                    value={pronouns}
                    onChange={(e) => setPronouns(e.target.value)}
                    className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
                  >
                    <option value="ele/dele (he/him)">ele/dele (he/him)</option>
                    <option value="ela/dela (she/her)">ela/dela (she/her)</option>
                    <option value="elu/delu (they/them)">elu/delu (they/them)</option>
                    <option value="Qualquer pronome (any pronouns)">Qualquer pronome (any pronouns)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 pt-2">
                <label className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">Biografia</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Compartilhe seus objetivos de aprendizado, rotina e o que gosta de conversar..."
                  className="w-full p-3.5 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-medium text-[#1C1917] outline-none focus:border-[#1C1917] resize-none"
                />
              </div>

              {/* TÓPICOS DE INTERESSE COM AVISO SUTIL DE LIMITE */}
              <div className="flex flex-col gap-3 pt-2 border-t border-[#E7E5E4]">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">
                      Tópicos de Interesse
                    </label>
                    <span className="text-[10px] font-bold uppercase bg-[#1C1917] text-[#FAF9F6] px-2 py-0.5 rounded">
                      {selectedInterests.length}/5
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTopicsModal(true)}
                    className="text-xs font-bold uppercase text-[#1C1917] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    + Explorar Tópicos
                  </button>
                </div>

                {/* AVISO SUTIL QUANDO O USUÁRIO TENTA ESCOLHER MAIS DE 5 */}
                {topicLimitWarning && (
                  <div className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl animate-in fade-in duration-200 flex items-center gap-2 w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>Limite atingido: você pode selecionar no máximo 5 tópicos de interesse.</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {selectedInterests.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className="px-3 py-1.5 rounded-xl border text-xs font-bold transition-all bg-[#1C1917] text-[#FAF9F6] border-[#1C1917] flex items-center gap-1.5 shadow-2xs cursor-pointer hover:bg-red-950"
                    >
                      <span>{interest}</span>
                      <span className="text-[10px] opacity-70">✕</span>
                    </button>
                  ))}

                  {selectedInterests.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setShowTopicsModal(true)}
                      className="px-3 py-1.5 rounded-xl border border-dashed border-[#1C1917] text-xs font-bold text-[#1C1917] hover:bg-[#F5F5F4] transition-all cursor-pointer"
                    >
                      + Adicionar Tópicos
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* SELEÇÃO DO NÍVEL CEFR */}
            <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-4">
              <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917] border-b border-[#E7E5E4] pb-3">
                Nível de Fluência Atual (CEFR)
              </h2>

              <div className="grid grid-cols-1 gap-2.5">
                {cefrLevelsInfo.map((item) => {
                  const isSelected = cefrLevel === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setCefrLevel(item.code)}
                      className={`p-4 rounded-2xl border text-left flex items-center justify-between gap-4 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917] shadow-xs'
                          : 'bg-[#FAF9F6] text-[#1C1917] border-[#E7E5E4] hover:border-[#1C1917]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className={`w-9 h-9 rounded-xl font-mono font-bold text-xs flex items-center justify-center border ${
                          isSelected ? 'bg-[#FAF9F6] text-[#1C1917] border-[#FAF9F6]' : 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]'
                        }`}>
                          {item.code}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold uppercase">{item.label}</span>
                          <span className={`text-[11px] font-medium ${isSelected ? 'text-[#D6D3D1]' : 'text-[#78716C]'}`}>
                            {item.desc}
                          </span>
                        </div>
                      </div>
                      {isSelected && <CheckIcon className="w-4 h-4 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* ABA: AGENDA & AMIGOS REAIS */}
        {activeTab === 'social' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-150">
            <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-[#E7E5E4] pb-3">
                <div>
                  <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
                    Horários de Preferência
                  </h2>
                  <p className="text-xs text-[#78716C]">Indique quando você costuma estar online para praticar</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[480px] flex flex-col gap-2">
                  <div className="grid grid-cols-8 gap-2 text-center text-[10px] font-bold uppercase text-[#1C1917] pb-1 border-b border-[#E7E5E4]">
                    <span>Turno</span>
                    {weekDays.map((day) => <span key={day}>{day}</span>)}
                  </div>

                  {timeSlots.map((slot) => (
                    <div key={slot} className="grid grid-cols-8 gap-2 items-center">
                      <span className="text-[10px] font-bold text-[#1C1917] uppercase">{slot.split(' ')[0]}</span>
                      {weekDays.map((day) => {
                        const slotKey = `${day}-${slot}`;
                        const isSelected = selectedAvailability.includes(slotKey);
                        return (
                          <button
                            key={slotKey}
                            type="button"
                            onClick={() => toggleAvailabilitySlot(slotKey)}
                            className={`py-2 rounded-xl border text-[10px] font-bold uppercase transition-all cursor-pointer ${
                              isSelected ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]' : 'bg-[#FAF9F6] text-[#A8A29E] border-[#E7E5E4] hover:border-[#1C1917]'
                            }`}
                          >
                            {isSelected ? '✓' : '+'}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* LISTA REAL DE AMIGOS */}
            <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-[#E7E5E4] pb-3">
                <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917] flex items-center gap-2">
                  <PandaPawIcon className="w-4 h-4 text-[#1C1917]" />
                  Amigos de Conversa ({realFriends.length})
                </h2>
              </div>

              {realFriends.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {realFriends.map((friend) => (
                    <div key={friend.id} className="bg-[#FAF9F6] border border-[#E7E5E4] rounded-2xl p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={friend.avatar || '/images/default-avatar.png'} alt={friend.name} className="w-10 h-10 rounded-xl object-cover border border-[#D6D3D1]" />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[#1C1917]">{friend.name}</span>
                          <span className="font-mono text-[10px] text-[#78716C]">{friend.tag || friend.level}</span>
                        </div>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${friend.isOnline ? 'bg-emerald-500' : 'bg-stone-300'}`} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center flex flex-col items-center gap-2 border border-dashed border-[#E7E5E4] rounded-2xl bg-[#FAF9F6]">
                  <PandaMascotIcon className="w-8 h-8 text-[#78716C]" />
                  <span className="text-xs font-bold text-[#1C1917]">Nenhum amigo adicionado ainda</span>
                  <p className="text-xs text-[#78716C] max-w-sm">Conecte-se em conversas pelo painel para enviar solicitações de amizade e salvar parceiros de treino.</p>
                </div>
              )}
            </section>
          </div>
        )}

        {/* ABA: METAS & BADGES */}
        {activeTab === 'stats' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-150">
            <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-[#E7E5E4] pb-3">
                <div>
                  <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
                    Meta Semanal de Prática
                  </h2>
                  <p className="text-xs text-[#78716C]">Defina quantas conversas você quer realizar a cada 7 dias</p>
                </div>
                <span className="text-xs font-bold text-[#1C1917]">{weeklyGoalCompleted}/{weeklyGoalTarget} Concluídas</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[3, 5, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setWeeklyGoalTarget(num);
                      handleSubmit();
                    }}
                    className={`py-3 rounded-xl border font-bold text-xs uppercase cursor-pointer transition-all ${
                      weeklyGoalTarget === num ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]' : 'bg-[#FAF9F6] border-[#E7E5E4] hover:border-[#1C1917]'
                    }`}
                  >
                    {num} Sessões por Semana
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-bold text-[#57534E]">
                  <span>Progresso Atual</span>
                  <span className="font-mono text-[#1C1917] font-bold">{goalProgressPercentage}%</span>
                </div>
                <div className="w-full h-3 bg-[#FAF9F6] rounded-full overflow-hidden p-0.5 border border-[#E7E5E4]">
                  <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${goalProgressPercentage}%` }} />
                </div>
              </div>
            </section>

            {/* CONQUISTAS / BADGES REAIS */}
            <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-4">
              <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917] border-b border-[#E7E5E4] pb-3 flex items-center gap-2">
                <BambooIcon className="w-4 h-4 text-emerald-600" />
                Conquistas & Badges da Conta
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BADGES_CATALOG.map((badge) => (
                  <div 
                    key={badge.id} 
                    className={`p-3.5 rounded-2xl border flex items-center gap-3.5 transition-all ${
                      badge.unlocked ? 'bg-[#FAF9F6] border-[#1C1917]' : 'bg-[#F5F5F4]/50 border-[#E7E5E4] opacity-50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#FFFFFF] border border-[#E7E5E4] flex items-center justify-center shrink-0">
                      <PandaPawIcon className={`w-5 h-5 ${badge.unlocked ? 'text-[#1C1917]' : 'text-[#A8A29E]'}`} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#1C1917] uppercase">{badge.title}</span>
                      <span className="text-[11px] text-[#78716C]">{badge.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ABA: SEGURANÇA */}
        {activeTab === 'security' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-150">
            <form onSubmit={handlePasswordChange} className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-5">
              <div className="flex flex-col gap-1 border-b border-[#E7E5E4] pb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 w-fit">
                  Segurança da Conta
                </span>
                <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917] mt-1">
                  Alterar Senha de Acesso
                </h2>
              </div>

              {passwordError && <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-700 text-xs font-bold">{passwordError}</div>}
              {passwordSuccess && <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold">{passwordSuccess}</div>}

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#1C1917] uppercase tracking-wider flex items-center gap-2">
                  1. Solicitar Código para: <span className="font-mono text-[#78716C]">{email}</span>
                </label>

                {!emailCodeSent ? (
                  <button
                    type="button"
                    onClick={handleSendEmailCode}
                    className="py-3 px-5 bg-[#1C1917] text-[#FAF9F6] font-bold text-xs uppercase rounded-xl border border-[#1C1917] hover:bg-[#292524] transition-all w-fit cursor-pointer"
                  >
                    Enviar Código de Confirmação por E-mail
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 pt-1">
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center gap-2">
                      <CheckIcon className="w-4 h-4 text-emerald-600" /> Código enviado para sua caixa de entrada.
                    </span>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        disabled={isEmailCodeVerified}
                        placeholder="Código de 6 dígitos..."
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="flex-1 px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl font-mono text-xs font-bold outline-none focus:border-[#1C1917] disabled:opacity-75"
                      />
                      {!isEmailCodeVerified ? (
                        <button
                          type="button"
                          onClick={handleVerifyEmailCode}
                          className="px-5 py-3 bg-[#1C1917] text-[#FAF9F6] font-bold text-xs uppercase rounded-xl border border-[#1C1917] hover:bg-[#292524] transition-all cursor-pointer"
                        >
                          Validar Código
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setIsEmailCodeVerified(false);
                            setVerificationCode('');
                          }}
                          className="px-4 py-3 bg-[#FAF9F6] text-[#78716C] hover:text-[#1C1917] font-bold text-xs uppercase rounded-xl border border-[#E7E5E4] cursor-pointer"
                        >
                          Alterar
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {isEmailCodeVerified && (
                <div className="flex flex-col gap-3 pt-2 animate-in fade-in slide-in-from-top-4 duration-300 border-t border-[#E7E5E4]">
                  <label className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">
                    2. Digite e Confirme a Nova Senha
                  </label>
                  <input
                    type="password"
                    placeholder="Nova Senha (Mínimo 6 caracteres)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold outline-none focus:border-[#1C1917]"
                  />
                  <input
                    type="password"
                    placeholder="Confirmar Nova Senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold outline-none focus:border-[#1C1917]"
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    className="py-3.5 text-xs font-bold uppercase tracking-wider bg-[#1C1917] text-[#FAF9F6] rounded-xl mt-2 cursor-pointer"
                  >
                    Salvar Nova Senha
                  </Button>
                </div>
              )}
            </form>

            <section className="bg-[#FFFFFF] border border-red-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-50 px-2.5 py-0.5 rounded border border-red-200 w-fit">
                Zona Crítica • Irreversível
              </span>
              <h2 className="text-base font-black uppercase text-red-600">Exclusão Definitiva da Conta</h2>
              <p className="text-xs text-[#57534E] font-medium">Ação irreversível de remoção permanente de todos os seus dados cadastrais, histórico e amizades.</p>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="w-fit px-5 py-2.5 bg-red-50 text-red-600 border border-red-300 text-xs font-bold uppercase rounded-xl hover:bg-red-600 hover:text-white transition-all mt-1 cursor-pointer"
              >
                Excluir Conta Permanentemente
              </button>
            </section>
          </div>
        )}
      </main>

      {/* MODAL DE EXCLUSÃO */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-red-300 rounded-3xl p-6 sm:p-8 max-w-md w-full flex flex-col gap-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-red-200 pb-3">
              <h3 className="text-base font-black uppercase text-red-600">
                Confirmar Exclusão
              </h3>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="text-sm font-bold text-[#78716C] hover:text-[#1C1917]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#57534E] font-medium leading-relaxed">
              Esta ação removerá permanentemente seu histórico de conversas, badges, amizades e estatísticas.
            </p>

            <div className="flex flex-col gap-3 border-t border-[#E7E5E4] pt-4">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#1C1917] uppercase">1. Digite sua Senha Atual *</label>
                <input
                  type="password"
                  value={deletePasswordConfirm}
                  onChange={(e) => setDeletePasswordConfirm(e.target.value)}
                  placeholder="Sua senha..."
                  className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-red-600"
                />
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer bg-[#FAF9F6] p-3 rounded-xl border border-[#E7E5E4]">
                <input
                  type="checkbox"
                  checked={agreeDeleteTerms}
                  onChange={(e) => setAgreeDeleteTerms(e.target.checked)}
                  className="mt-0.5 rounded border-[#1C1917] text-red-600 focus:ring-red-600"
                />
                <span className="text-[11px] font-bold text-[#1C1917] leading-snug">
                  Estou ciente de que a remoção é irreversível e não poderei recuperar este perfil.
                </span>
              </label>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#1C1917] uppercase">
                  2. Digite "EXCLUIR PERMANENTEMENTE" *
                </label>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="EXCLUIR PERMANENTEMENTE"
                  className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-red-600"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 bg-[#FAF9F6] border border-[#E7E5E4] text-xs font-bold uppercase rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={
                  !deletePasswordConfirm ||
                  !agreeDeleteTerms ||
                  deleteConfirmationText !== 'EXCLUIR PERMANENTEMENTE'
                }
                onClick={handleDeleteAccount}
                className="flex-1 py-3 bg-red-600 text-white text-xs font-bold uppercase rounded-xl border border-red-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
              >
                Apagar Conta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EXPLORAR TÓPICOS COM AVISO SUTIL INTEGRADO */}
      {showTopicsModal && (
        <div className="fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black uppercase text-[#1C1917] flex items-center gap-1.5">
                  <BambooIcon className="w-4 h-4 text-emerald-600" />
                  Explorar Tópicos
                </h3>
                <span className="text-[10px] font-bold uppercase bg-[#1C1917] text-[#FAF9F6] px-2 py-0.5 rounded">
                  {selectedInterests.length}/5
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowTopicsModal(false)}
                className="text-sm font-bold text-[#78716C] hover:text-[#1C1917] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              placeholder="Buscar assunto ou tecnologia..."
              value={topicSearch}
              onChange={(e) => setTopicSearch(e.target.value)}
              className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
            />

            {/* AVISO SUTIL DENTRO DO MODAL */}
            {topicLimitWarning && (
              <div className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl animate-in fade-in duration-200 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Você só pode selecionar até 5 tópicos de interesse.</span>
              </div>
            )}

            <div className="flex flex-col gap-5">
              {topicsLibrary.map((cat) => {
                const filteredItems = cat.items.filter((item) =>
                  item.toLowerCase().includes(topicSearch.toLowerCase())
                );
                if (filteredItems.length === 0) return null;

                return (
                  <div key={cat.category} className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
                      {cat.category}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {filteredItems.map((item) => {
                        const isSelected = selectedInterests.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleInterest(item)}
                            className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]'
                                : 'bg-[#FAF9F6] text-[#78716C] border-[#E7E5E4] hover:border-[#1C1917]'
                            }`}
                          >
                            {isSelected ? `✓ ${item}` : `+ ${item}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setShowTopicsModal(false);
                handleSubmit();
              }}
              className="w-full py-3.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
            >
              Concluir Seleção ({selectedInterests.length}/5)
            </button>
          </div>
        </div>
      )}

      {/* PREVIEW PÚBLICO REAL */}
      {showPublicPreview && (
        <div className="fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-[#FAF9F6] border border-[#E7E5E4] text-[#1C1917] px-2.5 py-1 rounded-lg">
                Como os Outros Te Veem
              </span>
              <button
                type="button"
                onClick={() => setShowPublicPreview(false)}
                className="text-sm font-bold text-[#78716C] hover:text-[#1C1917] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center text-center gap-3">
              {/* AVATAR DO MODAL COM TAMANHO RIGIDAMENTE TRAVADO */}
              <div className="w-24 h-24 min-w-[96px] min-h-[96px] max-w-[96px] max-h-[96px] rounded-2xl overflow-hidden border border-[#D6D3D1] bg-[#F5F5F4] shadow-2xs flex items-center justify-center shrink-0">
                <img 
                  src={avatarUrl || '/images/default-avatar.png'} 
                  alt={name || 'Avatar'} 
                  className="w-full h-full object-cover object-center aspect-square" 
                />
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <h3 className="text-lg font-black uppercase text-[#1C1917]">{name || 'Estudante'}</h3>
                  <span className="font-mono text-xs text-[#78716C] bg-[#FAF9F6] px-2 py-0.5 rounded border border-[#E7E5E4]">{tag}</span>
                  <span className="px-2 py-0.5 bg-[#1C1917] text-[#FAF9F6] text-[10px] font-bold rounded uppercase">
                    {cefrLevel}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-[#78716C]">
                  {showAgeInProfile && age && <span>{age} anos •</span>}
                  <span>{gender}</span>
                  <span>•</span>
                  <span className="italic">{pronouns}</span>
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <ShieldIcon className="w-3 h-3 text-emerald-600" /> Reputação: {reputationScore}%
                  </span>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <FlameIcon className="w-3 h-3 text-emerald-600" /> {currentStreak} Dias
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#57534E] font-medium leading-relaxed italic bg-[#FAF9F6] p-3.5 rounded-2xl border border-[#E7E5E4] w-full text-left">
                "{bio || 'Nenhuma biografia adicionada ainda.'}"
              </p>

              {/* AVALIAÇÕES REAIS (SEM FAKES) */}
              <div className="flex flex-col gap-2 w-full pt-1 text-left border-t border-[#E7E5E4] mt-1">
                <span className="text-[10px] font-bold uppercase text-[#78716C] tracking-wider">
                  Avaliações Recebidas ({receivedFeedback.length})
                </span>
                {receivedFeedback.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {receivedFeedback.map((fb) => (
                      <div key={fb.id} className="bg-[#FAF9F6] p-3 rounded-2xl border border-[#E7E5E4] flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-[#1C1917]">{fb.author}</span>
                          <span className="font-mono text-[10px] text-[#A8A29E]">{fb.date}</span>
                        </div>
                        <p className="text-xs text-[#57534E] font-medium italic">"{fb.comment}"</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-[#FAF9F6] rounded-xl border border-dashed border-[#E7E5E4] text-center text-xs text-[#78716C]">
                    Nenhuma avaliação pública registrada até o momento.
                  </div>
                )}
              </div>

              {/* INTERESSES REAIS */}
              {selectedInterests.length > 0 && (
                <div className="flex flex-col gap-1.5 w-full pt-1 text-left border-t border-[#E7E5E4]">
                  <span className="text-[10px] font-bold uppercase text-[#78716C]">
                    Tópicos de Interesse
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedInterests.map((interest) => (
                      <span key={interest} className="text-[10px] font-bold px-2.5 py-1 bg-[#FAF9F6] border border-[#E7E5E4] text-[#1C1917] rounded-lg">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowPublicPreview(false)}
              className="w-full py-3 bg-[#FAF9F6] hover:bg-[#F5F5F4] border border-[#E7E5E4] text-[#1C1917] text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
            >
              Fechar Visualização
            </button>
          </div>
        </div>
      )}
    </div>
  );
};