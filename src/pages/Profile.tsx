import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { BADGES_CATALOG } from '../data/badgesData';
import { api } from '../services/api';

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

  const [copiedTag, setCopiedTag] = useState(false);
  const [topicLimitWarning, setTopicLimitWarning] = useState(false);

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

  const timeSlots = ['Manhã (08h - 12h)', 'Tarde (12h - 18h)', 'Noite (18h - 22h)'];
  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>(initialUser.availability || []);

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

  const handleCopyTag = () => {
    if (!tag) return;
    navigator.clipboard.writeText(tag);
    setCopiedTag(true);
    setTimeout(() => setCopiedTag(false), 2000);
  };

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
      
      <div
        className="pointer-events-none fixed z-50 w-3.5 h-3.5 rounded-full bg-[#1C1917] transition-opacity duration-300 ease-out -translate-x-1/2 -translate-y-1/2 hidden md:block ring-2 ring-emerald-500/20"
        style={{ left: `${followerPos.x}px`, top: `${followerPos.y}px`, opacity: cursorOpacity }}
      />

      <header className="bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E7E5E4] px-6 sm:px-10 lg:px-14 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3.5 cursor-pointer group text-left outline-none shrink-0" onClick={() => navigate('/dashboard')}>
          <img 
            src="/images/logo.png" 
            alt="SideBySide" 
            className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3" 
          />
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-[#1C1917] uppercase leading-none font-sans">SIDEBYSIDE</span>
            <span className="font-mono text-[9px] font-bold tracking-widest text-[#78716C] uppercase mt-0.5 flex items-center gap-1.5">
              <BambooIcon className="w-3 h-3 text-emerald-600" />
              <span>PERFIL DO USUÁRIO</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="px-5 py-2.5 bg-[#FAF9F6] hover:bg-[#F5F5F4] border border-[#E7E5E4] hover:border-[#1C1917] text-[#1C1917] font-mono text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-2xs cursor-pointer active:scale-95"
        >
          <svg className="w-4 h-4 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span className="hidden sm:inline">Voltar ao Painel</span>
        </button>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 lg:p-8 flex flex-col gap-6">
        
        <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="pointer-events-none absolute -bottom-10 -right-6 text-[#1C1917] opacity-[0.03] select-none">
            <svg className="w-64 h-64 fill-current" viewBox="0 0 200 200">
              <path d="M40 180 C40 120 70 80 120 40 C100 80 110 140 140 180 Z" />
              <path d="M70 180 C70 130 95 90 145 50 C125 90 135 150 165 180 Z" />
              <circle cx="150" cy="45" r="14" />
            </svg>
          </div>

          <div className="flex items-center gap-6 sm:gap-7 relative z-10">
            <div className="relative group w-20 h-20 min-w-[80px] min-h-[80px] max-w-[80px] max-h-[80px] rounded-2xl overflow-hidden border-2 border-[#1C1917] bg-[#F5F5F4] shrink-0 shadow-[4px_4px_0px_0px_#1C1917] flex items-center justify-center transition-all">
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

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black uppercase text-[#1C1917] leading-none">
                  {name || 'Seu Nome'}
                </h1>
                <span className="px-2.5 py-1 bg-[#1C1917] text-[#FAF9F6] font-mono font-bold text-[10px] rounded-lg uppercase flex items-center gap-1.5 shadow-2xs tracking-widest border border-[#1C1917]">
                  <PandaPawIcon className="w-2.5 h-2.5 text-emerald-400" />
                  {cefrLevel}
                </span>
              </div>
              <span className="font-mono text-[11px] font-bold text-[#78716C] tracking-widest uppercase">{email}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto relative z-10">
            <button
              type="button"
              onClick={() => setShowPublicPreview(true)}
              className="py-3 px-5 bg-[#FAF9F6] hover:bg-[#F5F5F4] border border-[#E7E5E4] hover:border-[#1C1917] text-[#1C1917] font-mono text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95"
            >
              <svg className="w-4 h-4 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden sm:inline">Perfil Público</span>
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmit(e)}
              disabled={isSaving}
              className="py-3 px-6 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-mono text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-2 border border-[#1C1917] active:scale-95 disabled:opacity-50"
            >
              <PandaPawIcon className="w-4 h-4 text-emerald-400" />
              {isSaving ? 'SALVANDO...' : 'SALVAR PERFIL'}
            </button>
          </div>
        </section>

        <div className="grid grid-cols-2 sm:grid-cols-4 bg-[#FAF9F6] border border-[#E7E5E4] p-1.5 rounded-2xl font-mono text-[10px] font-bold uppercase tracking-widest shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`py-3.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'general' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-2xs' : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Geral & Bio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('social')}
            className={`py-3.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'social' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-2xs' : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Agenda & Amigos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`py-3.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'stats' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-2xs' : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Metas & Badges
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`py-3.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'security' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-2xs' : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Segurança
          </button>
        </div>

        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-500 text-emerald-800 font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-2.5 animate-in fade-in duration-150 shadow-2xs">
            <CheckIcon className="w-4 h-4 text-emerald-600" />
            <span>Perfil atualizado com sucesso e sincronizado no sistema!</span>
          </div>
        )}

        {activeTab === 'general' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-150">
            <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
              <h2 className="text-sm font-black uppercase tracking-tight text-[#1C1917] border-b border-[#E7E5E4] pb-3 flex items-center gap-2">
                <BambooIcon className="w-4 h-4 text-emerald-600" />
                Informações Da Conta
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] font-bold text-[#78716C] uppercase tracking-widest">Nome Completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome..."
                    className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl font-mono text-[11px] font-bold text-[#1C1917] outline-none focus:border-[#1C1917] transition-colors shadow-2xs"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] font-bold text-[#78716C] uppercase tracking-widest">Seu Usuário e Tag</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tag}
                      disabled
                      className="flex-1 px-4 py-3 bg-[#F5F5F4] border border-[#E7E5E4] rounded-xl font-mono text-[11px] font-bold text-[#A8A29E] cursor-not-allowed outline-none select-all shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={handleCopyTag}
                      className="px-4 py-3 bg-[#FAF9F6] hover:bg-[#F5F5F4] border border-[#E7E5E4] hover:border-[#1C1917] text-[#1C1917] font-mono text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 active:scale-95 shadow-2xs"
                      title="Copiar tag para a área de transferência"
                    >
                      {copiedTag ? (
                        <>
                          <CheckIcon className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-700">COPIADO</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                          </svg>
                          <span>COPIAR</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] font-bold text-[#78716C] uppercase tracking-widest">E-mail Cadastrado</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="px-4 py-3 bg-[#F5F5F4] border border-[#E7E5E4] rounded-xl font-mono text-[11px] font-bold text-[#A8A29E] cursor-not-allowed outline-none select-none shadow-2xs"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="font-mono text-[10px] font-bold text-[#78716C] uppercase tracking-widest">Idade</label>
                    <button
                      type="button"
                      onClick={() => setShowAgeInProfile(!showAgeInProfile)}
                      className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#78716C] hover:text-[#1C1917] flex items-center gap-1.5 bg-[#FAF9F6] px-2.5 py-1 rounded border border-[#E7E5E4] cursor-pointer shadow-2xs"
                    >
                      {showAgeInProfile ? 'VISÍVEL NO PERFIL' : 'OCULTA'}
                    </button>
                  </div>
                  <input
                    type="number"
                    min={18}
                    max={100}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Ex: 24"
                    className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl font-mono text-[11px] font-bold text-[#1C1917] outline-none focus:border-[#1C1917] transition-colors shadow-2xs"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] font-bold text-[#78716C] uppercase tracking-widest">Gênero</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl font-mono text-[11px] font-bold text-[#1C1917] outline-none focus:border-[#1C1917] transition-colors shadow-2xs appearance-none"
                  >
                    <option value="Masculino">MASCULINO</option>
                    <option value="Feminino">FEMININO</option>
                    <option value="Não-binário">NÃO-BINÁRIO</option>
                    <option value="Prefiro não dizer">PREFIRO NÃO DIZER</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] font-bold text-[#78716C] uppercase tracking-widest">Pronomes</label>
                  <select
                    value={pronouns}
                    onChange={(e) => setPronouns(e.target.value)}
                    className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl font-mono text-[11px] font-bold text-[#1C1917] outline-none focus:border-[#1C1917] transition-colors shadow-2xs appearance-none"
                  >
                    <option value="ele/dele (he/him)">ELE/DELE (HE/HIM)</option>
                    <option value="ela/dela (she/her)">ELA/DELA (SHE/HER)</option>
                    <option value="elu/delu (they/them)">ELU/DELU (THEY/THEM)</option>
                    <option value="Qualquer pronome (any pronouns)">QUALQUER PRONOME (ANY PRONOUNS)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-3 border-t border-[#E7E5E4]">
                <label className="font-mono text-[10px] font-bold text-[#78716C] uppercase tracking-widest">Biografia</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Compartilhe seus objetivos de aprendizado, rotina e o que gosta de conversar..."
                  className="w-full p-4 bg-[#FAF9F6] border border-[#E7E5E4] rounded-2xl font-mono text-[11px] font-bold text-[#1C1917] outline-none focus:border-[#1C1917] resize-none transition-colors shadow-2xs"
                />
              </div>

              <div className="flex flex-col gap-3 pt-3 border-t border-[#E7E5E4]">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <label className="font-mono text-[10px] font-bold text-[#78716C] uppercase tracking-widest">
                      Tópicos de Interesse
                    </label>
                    <span className="font-mono text-[9px] font-bold uppercase tracking-widest bg-[#1C1917] text-[#FAF9F6] px-2 py-0.5 rounded shadow-2xs border border-[#1C1917]">
                      {selectedInterests.length}/5
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTopicsModal(true)}
                    className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#1C1917] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    + EXPLORAR TÓPICOS
                  </button>
                </div>

                {topicLimitWarning && (
                  <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl animate-in fade-in duration-200 flex items-center gap-2 w-fit shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>LIMITE ATINGIDO: MÁXIMO 5 TÓPICOS.</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {selectedInterests.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className="px-3 py-2 rounded-xl border-2 font-mono text-[10px] font-bold uppercase tracking-widest transition-all bg-[#1C1917] text-[#FAF9F6] border-[#1C1917] flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#1C1917] cursor-pointer hover:bg-[#FAF9F6] hover:text-[#1C1917]"
                    >
                      <span>{interest}</span>
                      <span className="text-[10px] opacity-70">✕</span>
                    </button>
                  ))}

                  {selectedInterests.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setShowTopicsModal(true)}
                      className="px-4 py-2 rounded-xl border border-dashed border-[#1C1917] font-mono text-[10px] font-bold uppercase tracking-widest text-[#1C1917] hover:bg-[#F5F5F4] transition-all cursor-pointer shadow-2xs"
                    >
                      + ADICIONAR TÓPICOS
                    </button>
                  )}
                </div>
              </div>
            </section>

            <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
              <h2 className="text-sm font-black uppercase tracking-tight text-[#1C1917] border-b border-[#E7E5E4] pb-3 flex items-center gap-2">
                <BambooIcon className="w-4 h-4 text-emerald-600" />
                Nível de Fluência Atual (CEFR)
              </h2>

              <div className="grid grid-cols-1 gap-3">
                {cefrLevelsInfo.map((item) => {
                  const isSelected = cefrLevel === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setCefrLevel(item.code)}
                      className={`p-4 rounded-2xl border-2 text-left flex items-center justify-between gap-4 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917] shadow-[4px_4px_0px_0px_#1C1917]'
                          : 'bg-[#FAF9F6] text-[#1C1917] border-[#E7E5E4] hover:border-[#1C1917]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`w-10 h-10 rounded-xl font-mono font-black text-sm flex items-center justify-center border-2 ${
                          isSelected ? 'bg-[#FAF9F6] text-[#1C1917] border-[#FAF9F6]' : 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]'
                        }`}>
                          {item.code}
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                          <span className={`font-mono text-[10px] font-bold tracking-wider ${isSelected ? 'text-[#D6D3D1]' : 'text-[#78716C]'}`}>
                            {item.desc}
                          </span>
                        </div>
                      </div>
                      {isSelected && <CheckIcon className="w-5 h-5 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-150">
            <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-[#E7E5E4] pb-3">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-tight text-[#1C1917] flex items-center gap-2">
                    <BambooIcon className="w-4 h-4 text-emerald-600" />
                    Horários de Preferência
                  </h2>
                  <p className="font-mono text-[10px] font-bold tracking-widest uppercase text-[#78716C] mt-1">Indique quando você costuma estar online</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[480px] flex flex-col gap-3">
                  <div className="grid grid-cols-8 gap-2 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-[#1C1917] pb-2 border-b border-[#E7E5E4]">
                    <span>TURNO</span>
                    {weekDays.map((day) => <span key={day}>{day}</span>)}
                  </div>

                  {timeSlots.map((slot) => (
                    <div key={slot} className="grid grid-cols-8 gap-2 items-center">
                      <span className="font-mono text-[9px] font-bold text-[#78716C] uppercase tracking-widest">{slot.split(' ')[0]}</span>
                      {weekDays.map((day) => {
                        const slotKey = `${day}-${slot}`;
                        const isSelected = selectedAvailability.includes(slotKey);
                        return (
                          <button
                            key={slotKey}
                            type="button"
                            onClick={() => toggleAvailabilitySlot(slotKey)}
                            className={`py-2.5 rounded-xl border-2 font-mono text-[11px] font-bold uppercase transition-all cursor-pointer ${
                              isSelected ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917] shadow-[2px_2px_0px_0px_#1C1917]' : 'bg-[#FAF9F6] text-[#A8A29E] border-[#E7E5E4] hover:border-[#1C1917]'
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

            <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
              <div className="flex justify-between items-center border-b border-[#E7E5E4] pb-3">
                <h2 className="text-sm font-black uppercase tracking-tight text-[#1C1917] flex items-center gap-2">
                  <PandaPawIcon className="w-4 h-4 text-[#1C1917]" />
                  Amigos de Conversa ({realFriends.length})
                </h2>
              </div>

              {realFriends.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {realFriends.map((friend) => (
                    <div key={friend.id} className="bg-[#FAF9F6] border-2 border-[#E7E5E4] hover:border-[#1C1917] transition-colors rounded-2xl p-4 flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-3">
                        <img src={friend.avatar || '/images/default-avatar.png'} alt={friend.name} className="w-12 h-12 rounded-xl object-cover border-2 border-[#1C1917]" />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-black uppercase tracking-tight text-[#1C1917]">{friend.name}</span>
                          <span className="font-mono text-[9px] font-bold tracking-widest uppercase text-[#78716C]">{friend.tag || friend.level}</span>
                        </div>
                      </div>
                      <span className={`w-3 h-3 rounded-full border border-white ${friend.isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-[#D6D3D1]'}`} title={friend.isOnline ? "Online" : "Offline"} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center flex flex-col items-center gap-3 border-2 border-dashed border-[#E7E5E4] rounded-3xl bg-[#FAF9F6]">
                  <PandaMascotIcon className="w-10 h-10 text-[#A8A29E]" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#1C1917]">NENHUM AMIGO ADICIONADO</span>
                  <p className="text-xs text-[#78716C] max-w-sm font-medium">Conecte-se em conversas pelo painel para enviar solicitações de amizade e salvar parceiros de treino.</p>
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-150">
            <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-[#E7E5E4] pb-3">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-tight text-[#1C1917] flex items-center gap-2">
                    <BambooIcon className="w-4 h-4 text-emerald-600" />
                    Meta Semanal de Prática
                  </h2>
                  <p className="font-mono text-[10px] font-bold tracking-widest uppercase text-[#78716C] mt-1">Defina quantas conversas realizar a cada 7 dias</p>
                </div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest bg-[#1C1917] text-[#FAF9F6] px-3 py-1.5 rounded-lg border border-[#1C1917]">
                  {weeklyGoalCompleted}/{weeklyGoalTarget} CONCLUÍDAS
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[3, 5, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setWeeklyGoalTarget(num);
                      handleSubmit();
                    }}
                    className={`py-4 rounded-2xl border-2 font-mono font-bold text-[10px] uppercase tracking-widest cursor-pointer transition-all ${
                      weeklyGoalTarget === num ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917] shadow-[4px_4px_0px_0px_#1C1917]' : 'bg-[#FAF9F6] text-[#78716C] border-[#E7E5E4] hover:border-[#1C1917] hover:text-[#1C1917]'
                    }`}
                  >
                    {num} SESSÕES/SEMANA
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <div className="flex justify-between font-mono text-[10px] font-bold uppercase tracking-widest text-[#78716C]">
                  <span>PROGRESSO ATUAL</span>
                  <span className="text-[#1C1917]">{goalProgressPercentage}%</span>
                </div>
                <div className="w-full h-4 bg-[#FAF9F6] rounded-full overflow-hidden p-0.5 border-2 border-[#1C1917]">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${goalProgressPercentage}%` }} />
                </div>
              </div>
            </section>

            <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
              <h2 className="text-sm font-black uppercase tracking-tight text-[#1C1917] border-b border-[#E7E5E4] pb-3 flex items-center gap-2">
                <PandaPawIcon className="w-4 h-4 text-[#1C1917]" />
                Conquistas & Badges da Conta
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {BADGES_CATALOG.map((badge) => (
                  <div 
                    key={badge.id} 
                    className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all shadow-2xs ${
                      badge.unlocked ? 'bg-[#FAF9F6] border-[#1C1917]' : 'bg-[#F5F5F4]/50 border-[#E7E5E4] opacity-60'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#FFFFFF] border-2 border-[#E7E5E4] flex items-center justify-center shrink-0">
                      <PandaPawIcon className={`w-6 h-6 ${badge.unlocked ? 'text-[#1C1917]' : 'text-[#A8A29E]'}`} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-black uppercase tracking-tight text-[#1C1917]">{badge.title}</span>
                      <span className="font-mono text-[9px] font-bold tracking-widest uppercase text-[#78716C]">{badge.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-150">
            <form onSubmit={handlePasswordChange} className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
              <div className="flex flex-col gap-2 border-b border-[#E7E5E4] pb-3">
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200 w-fit">
                  SEGURANÇA DA CONTA
                </span>
                <h2 className="text-sm font-black uppercase tracking-tight text-[#1C1917]">
                  Alterar Senha de Acesso
                </h2>
              </div>

              {passwordError && <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-700 font-mono text-[10px] font-bold uppercase tracking-widest shadow-2xs">{passwordError}</div>}
              {passwordSuccess && <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono text-[10px] font-bold uppercase tracking-widest shadow-2xs">{passwordSuccess}</div>}

              <div className="flex flex-col gap-3">
                <label className="font-mono text-[10px] font-bold text-[#78716C] uppercase tracking-widest flex items-center gap-2">
                  1. SOLICITAR CÓDIGO PARA: <span className="text-[#1C1917]">{email}</span>
                </label>

                {!emailCodeSent ? (
                  <button
                    type="button"
                    onClick={handleSendEmailCode}
                    className="py-3.5 px-6 bg-[#1C1917] text-[#FAF9F6] font-mono font-bold text-[10px] uppercase tracking-widest rounded-xl border border-[#1C1917] hover:bg-[#292524] transition-all w-fit cursor-pointer shadow-2xs active:scale-95"
                  >
                    ENVIAR CÓDIGO DE CONFIRMAÇÃO
                  </button>
                ) : (
                  <div className="flex flex-col gap-3 pt-1">
                    <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center gap-2 shadow-2xs">
                      <CheckIcon className="w-4 h-4 text-emerald-600" /> CÓDIGO ENVIADO PARA A CAIXA DE ENTRADA.
                    </span>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        disabled={isEmailCodeVerified}
                        placeholder="Código de 6 dígitos..."
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="flex-1 px-4 py-3.5 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl font-mono text-[11px] font-bold outline-none focus:border-[#1C1917] disabled:opacity-75 shadow-2xs transition-colors"
                      />
                      {!isEmailCodeVerified ? (
                        <button
                          type="button"
                          onClick={handleVerifyEmailCode}
                          className="px-6 py-3.5 bg-[#1C1917] text-[#FAF9F6] font-mono font-bold text-[10px] uppercase tracking-widest rounded-xl border border-[#1C1917] hover:bg-[#292524] transition-all cursor-pointer shadow-2xs active:scale-95"
                        >
                          VALIDAR CÓDIGO
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setIsEmailCodeVerified(false);
                            setVerificationCode('');
                          }}
                          className="px-6 py-3.5 bg-[#FAF9F6] text-[#78716C] hover:text-[#1C1917] font-mono font-bold text-[10px] uppercase tracking-widest rounded-xl border border-[#E7E5E4] hover:border-[#1C1917] cursor-pointer shadow-2xs transition-colors"
                        >
                          ALTERAR
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {isEmailCodeVerified && (
                <div className="flex flex-col gap-4 pt-3 animate-in fade-in slide-in-from-top-4 duration-300 border-t border-[#E7E5E4]">
                  <label className="font-mono text-[10px] font-bold text-[#78716C] uppercase tracking-widest">
                    2. DIGITE E CONFIRME A NOVA SENHA
                  </label>
                  <input
                    type="password"
                    placeholder="Nova Senha (Mínimo 6 caracteres)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="px-4 py-3.5 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl font-mono text-[11px] font-bold outline-none focus:border-[#1C1917] shadow-2xs transition-colors"
                  />
                  <input
                    type="password"
                    placeholder="Confirmar Nova Senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="px-4 py-3.5 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl font-mono text-[11px] font-bold outline-none focus:border-[#1C1917] shadow-2xs transition-colors"
                  />

                  <button
                    type="submit"
                    className="py-4 font-mono text-[10px] font-bold uppercase tracking-widest bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] rounded-xl mt-2 cursor-pointer shadow-xs border border-[#1C1917] active:scale-95 transition-all"
                  >
                    SALVAR NOVA SENHA
                  </button>
                </div>
              )}
            </form>

            <section className="bg-[#FFFFFF] border-2 border-red-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-md border border-red-200 w-fit">
                ZONA CRÍTICA • IRREVERSÍVEL
              </span>
              <h2 className="text-sm font-black uppercase tracking-tight text-red-600">Exclusão Definitiva da Conta</h2>
              <p className="text-xs text-[#57534E] font-medium leading-relaxed">Ação irreversível de remoção permanente de todos os seus dados cadastrais, histórico de conversas e amizades formadas.</p>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="w-fit px-6 py-3 bg-red-50 text-red-600 border border-red-300 font-mono text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all mt-2 cursor-pointer shadow-2xs active:scale-95"
              >
                EXCLUIR CONTA PERMANENTEMENTE
              </button>
            </section>
          </div>
        )}
      </main>

      {/* MODAL DE EXCLUSÃO (PANDA STYLE - MATCHING ROOM EXIT MODAL) */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-8 max-w-sm w-full shadow-[8px_8px_0px_0px_#1C1917] flex flex-col gap-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-2xl bg-red-50 border-2 border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-2xs">
              <PandaMascotIcon className="w-8 h-8" />
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#FAF9F6] bg-red-600 px-3 py-1 rounded-lg w-fit mx-auto border border-red-700">EXCLUSÃO DEFINITIVA</span>
              <h3 className="text-xl font-black uppercase text-[#1C1917] mt-1">Apagar Tudo?</h3>
              <p className="text-xs text-[#57534E] font-medium leading-relaxed">
                Esta ação removerá permanentemente seu histórico, badges, amizades e estatísticas. Não pode ser desfeita.
              </p>
            </div>

            <div className="flex flex-col gap-4 border-t border-[#E7E5E4] pt-4 text-left">
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[9px] font-bold text-[#78716C] uppercase tracking-widest">1. SUA SENHA ATUAL *</label>
                <input
                  type="password"
                  value={deletePasswordConfirm}
                  onChange={(e) => setDeletePasswordConfirm(e.target.value)}
                  placeholder="Sua senha..."
                  className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl font-mono text-[11px] font-bold text-[#1C1917] outline-none focus:border-red-600 shadow-2xs transition-colors"
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer bg-[#FAF9F6] p-4 rounded-xl border border-[#E7E5E4] shadow-2xs">
                <input
                  type="checkbox"
                  checked={agreeDeleteTerms}
                  onChange={(e) => setAgreeDeleteTerms(e.target.checked)}
                  className="mt-0.5 rounded border-[#1C1917] text-red-600 focus:ring-red-600"
                />
                <span className="font-mono text-[9px] font-bold text-[#1C1917] leading-relaxed uppercase tracking-widest">
                  ESTOU CIENTE DE QUE A REMOÇÃO É IRREVERSÍVEL.
                </span>
              </label>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-[9px] font-bold text-[#78716C] uppercase tracking-widest">
                  2. DIGITE "EXCLUIR PERMANENTEMENTE" *
                </label>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="EXCLUIR PERMANENTEMENTE"
                  className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl font-mono text-[11px] font-bold text-[#1C1917] outline-none focus:border-red-600 shadow-2xs transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="w-full py-3.5 bg-[#FAF9F6] border-2 border-[#1C1917] text-[#1C1917] font-mono text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#E7E5E4] transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                CANCELAR E VOLTAR
              </button>
              <button
                type="button"
                disabled={
                  !deletePasswordConfirm ||
                  !agreeDeleteTerms ||
                  deleteConfirmationText !== 'EXCLUIR PERMANENTEMENTE'
                }
                onClick={handleDeleteAccount}
                className="w-full py-3.5 bg-red-600 text-white font-mono text-[11px] font-bold uppercase tracking-widest rounded-xl border-2 border-[#1C1917] hover:bg-red-700 transition-all shadow-2xs cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                SIM, APAGAR CONTA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EXPLORAR TÓPICOS (PANDA STYLE) */}
      {showTopicsModal && (
        <div className="fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[8px_8px_0px_0px_#1C1917] flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black uppercase text-[#1C1917] flex items-center gap-2">
                  <BambooIcon className="w-4 h-4 text-emerald-600" />
                  EXPLORAR TÓPICOS
                </h3>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest bg-[#1C1917] text-[#FAF9F6] px-2.5 py-0.5 rounded shadow-2xs border border-[#1C1917]">
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
              className="px-4 py-3.5 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl font-mono text-[11px] font-bold text-[#1C1917] outline-none focus:border-[#1C1917] shadow-2xs transition-colors"
            />

            {topicLimitWarning && (
              <div className="font-mono text-[10px] font-bold tracking-widest uppercase text-amber-800 bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl animate-in fade-in duration-200 flex items-center gap-2 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <span>LIMITE ATINGIDO: MÁXIMO 5 TÓPICOS PERMITIDOS.</span>
              </div>
            )}

            <div className="flex flex-col gap-6">
              {topicsLibrary.map((cat) => {
                const filteredItems = cat.items.filter((item) =>
                  item.toLowerCase().includes(topicSearch.toLowerCase())
                );
                if (filteredItems.length === 0) return null;

                return (
                  <div key={cat.category} className="flex flex-col gap-3">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#78716C] border-b border-[#E7E5E4] pb-1.5">
                      {cat.category}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {filteredItems.map((item) => {
                        const isSelected = selectedInterests.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleInterest(item)}
                            className={`px-4 py-2.5 rounded-xl border-2 font-mono text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer shadow-2xs active:scale-95 ${
                              isSelected
                                ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917] shadow-[2px_2px_0px_0px_#1C1917]'
                                : 'bg-[#FAF9F6] text-[#78716C] border-[#E7E5E4] hover:border-[#1C1917] hover:text-[#1C1917]'
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
              className="w-full py-4 mt-2 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-mono text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-xs border border-[#1C1917] active:scale-95"
            >
              CONCLUIR SELEÇÃO ({selectedInterests.length}/5)
            </button>
          </div>
        </div>
      )}

      {/* PREVIEW PÚBLICO REAL (PANDA STYLE) */}
      {showPublicPreview && (
        <div className="fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[8px_8px_0px_0px_#1C1917] flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-3">
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest bg-[#FAF9F6] border border-[#E7E5E4] text-[#1C1917] px-3 py-1.5 rounded-lg shadow-2xs">
                VISÃO DO PERFIL PÚBLICO
              </span>
              <button
                type="button"
                onClick={() => setShowPublicPreview(false)}
                className="text-sm font-bold text-[#78716C] hover:text-[#1C1917] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-28 h-28 min-w-[112px] min-h-[112px] rounded-3xl overflow-hidden border-2 border-[#1C1917] bg-[#F5F5F4] shadow-[4px_4px_0px_0px_#1C1917] flex items-center justify-center shrink-0">
                <img 
                  src={avatarUrl || '/images/default-avatar.png'} 
                  alt={name || 'Avatar'} 
                  className="w-full h-full object-cover object-center aspect-square" 
                />
              </div>

              <div className="flex flex-col items-center gap-1.5 mt-2">
                <div className="flex items-center gap-2.5 flex-wrap justify-center">
                  <h3 className="text-xl font-black uppercase text-[#1C1917]">{name || 'Estudante'}</h3>
                  <span className="font-mono text-[10px] font-bold text-[#78716C] uppercase tracking-widest bg-[#FAF9F6] px-2.5 py-1 rounded border border-[#E7E5E4] shadow-2xs">{tag}</span>
                  <span className="px-2.5 py-1 bg-[#1C1917] text-[#FAF9F6] font-mono text-[10px] font-bold rounded uppercase tracking-widest border border-[#1C1917] shadow-2xs">
                    {cefrLevel}
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-[#78716C] mt-1">
                  {showAgeInProfile && age && <span>{age} ANOS •</span>}
                  <span>{gender}</span>
                  <span>•</span>
                  <span>{pronouns}</span>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                    <ShieldIcon className="w-3.5 h-3.5 text-emerald-600" /> REPUTAÇÃO: {reputationScore}%
                  </span>
                  <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                    <FlameIcon className="w-3.5 h-3.5 text-emerald-600" /> STREAK: {currentStreak} DIAS
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#1C1917] font-bold leading-relaxed bg-[#FAF9F6] p-4 rounded-2xl border-2 border-[#E7E5E4] w-full text-left shadow-2xs">
                "{bio || 'Nenhuma biografia adicionada ainda.'}"
              </p>

              <div className="flex flex-col gap-3 w-full pt-2 text-left border-t border-[#E7E5E4] mt-1">
                <span className="font-mono text-[10px] font-bold uppercase text-[#78716C] tracking-widest">
                  AVALIAÇÕES RECEBIDAS ({receivedFeedback.length})
                </span>
                {receivedFeedback.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {receivedFeedback.map((fb) => (
                      <div key={fb.id} className="bg-[#FAF9F6] p-4 rounded-2xl border-2 border-[#E7E5E4] flex flex-col gap-1.5 shadow-2xs">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#1C1917]">{fb.author}</span>
                          <span className="font-mono text-[9px] font-bold text-[#A8A29E] tracking-widest">{fb.date}</span>
                        </div>
                        <p className="text-xs text-[#57534E] font-bold">"{fb.comment}"</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-[#FAF9F6] rounded-2xl border-2 border-dashed border-[#E7E5E4] text-center font-mono text-[10px] font-bold uppercase tracking-widest text-[#78716C]">
                    NENHUMA AVALIAÇÃO PÚBLICA REGISTRADA.
                  </div>
                )}
              </div>

              {selectedInterests.length > 0 && (
                <div className="flex flex-col gap-2.5 w-full pt-2 text-left border-t border-[#E7E5E4]">
                  <span className="font-mono text-[10px] font-bold uppercase text-[#78716C] tracking-widest">
                    TÓPICOS DE INTERESSE
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedInterests.map((interest) => (
                      <span key={interest} className="font-mono text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 bg-[#FAF9F6] border-2 border-[#E7E5E4] text-[#1C1917] rounded-xl shadow-2xs">
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
              className="w-full py-3.5 bg-[#FAF9F6] hover:bg-[#F5F5F4] border-2 border-[#1C1917] text-[#1C1917] font-mono text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95 mt-2"
            >
              FECHAR VISUALIZAÇÃO
            </button>
          </div>
        </div>
      )}
    </div>
  );
};