import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'general' | 'social' | 'stats' | 'security'>('general');

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

  const [showPublicPreview, setShowPublicPreview] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);

  const [showTopicsModal, setShowTopicsModal] = useState(false);
  const [topicSearch, setTopicSearch] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState<number | string>('');
  const [showAgeInProfile, setShowAgeInProfile] = useState(true);
  const [gender, setGender] = useState('Masculino');
  const [pronouns, setPronouns] = useState('ele/dele (he/him)');
  const [cefrLevel, setCefrLevel] = useState('B1');
  const [avatarUrl, setAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  );

  const [bio, setBio] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Estados de Notificação
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPush, setNotifyPush] = useState(true);
  const [notifyAdvance, setNotifyAdvance] = useState('15');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/user/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setName(data.name || '');
          setEmail(data.email || '');
          setCefrLevel(data.level || 'B1');
          if (data.avatar) setAvatarUrl(data.avatar);
          if (data.bio) setBio(data.bio);
          if (data.age) setAge(data.age);
          if (data.gender) setGender(data.gender);
          if (data.pronouns) setPronouns(data.pronouns);
          if (data.interests) setSelectedInterests(data.interests);
          if (data.showAgeInProfile !== undefined) setShowAgeInProfile(data.showAgeInProfile);
          if (data.notifyEmail !== undefined) setNotifyEmail(data.notifyEmail);
          if (data.notifyPush !== undefined) setNotifyPush(data.notifyPush);
          if (data.notifyAdvance !== undefined) setNotifyAdvance(data.notifyAdvance);
        }
      } catch (err) {
        console.error('Erro ao carregar perfil', err);
      }
    };
    fetchProfile();
  }, []);

  const [receivedFeedback] = useState([
    {
      id: 'fb-1',
      author: 'Alex (Espanha)',
      rating: 5,
      date: 'Ontem',
      comment: 'Excelente conversa! Fala com muita clareza e ajudou bastante a manter a fluidez do tópico.',
    },
    {
      id: 'fb-2',
      author: 'Elena Rostova',
      rating: 5,
      date: 'Há 3 dias',
      comment: 'Muito paciente e com bom vocabulário sobre tecnologia. Recomendo a prática!',
    },
    {
      id: 'fb-3',
      author: 'Mateo Rossi',
      rating: 4,
      date: 'Há 1 semana',
      comment: 'Ótima troca de ideias sobre viagens e cultura. Sessão super produtiva.',
    },
  ]);

  const topicsLibrary = [
    { category: 'Tecnologia & Carreira', items: ['Tecnologia', 'Carreira & Negócios', 'Inteligência Artificial', 'Startups', 'Programação', 'Marketing Digital'] },
    { category: 'Cultura & Entretenimento', items: ['Cinema & Séries', 'Música', 'Leitura', 'Jogos & eSports', 'Arte & Design', 'Fotografia'] },
    { category: 'Estilo de Vida & Hobbies', items: ['Viagens', 'Esportes', 'Culinária', 'Saúde & Fitness', 'Gastronomia', 'Idiomas'] },
    { category: 'Sociedade & Atualidades', items: ['Economia', 'Meio Ambiente', 'Psicologia', 'História', 'Filosofia', 'Moda'] },
  ];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      if (selectedInterests.length >= 5) {
        alert('Você só pode selecionar até 5 tópicos de interesse.');
        return;
      }
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailCodeVerified, setIsEmailCodeVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePasswordConfirm, setDeletePasswordConfirm] = useState('');
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [agreeDeleteTerms, setAgreeDeleteTerms] = useState(false);

  const [weeklyGoalTarget, setWeeklyGoalTarget] = useState(5);
  const [weeklyGoalCompleted] = useState(3);
  const [currentStreak] = useState(5);

  const badgesList = [
    { id: 'first_chat', title: 'Primeira Conversa', desc: 'Sessão inicial concluída', unlocked: true, icon: '💬' },
    { id: 'streak_5', title: '5 Dias de Ofensiva', desc: 'Prática contínua', unlocked: true, icon: '🔥' },
    { id: 'minutes_100', title: '100 Minutos Falados', desc: '+100 minutos em sala', unlocked: true, icon: '⏱️' },
    { id: 'level_b2', title: 'Rumo ao B2', desc: '10 treinos no nível B1', unlocked: false, icon: '🎓' },
  ];

  const evolutionStats = {
    reputationScore: '98/100',
  };

  const [favoritePartners] = useState([
    {
      id: '1',
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      level: 'B1',
      isOnline: true,
      note: 'Engenheira de Software. Excelente pronúncia e fala calma.',
    },
    {
      id: '2',
      name: 'Mateo Rossi',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      level: 'B2',
      isOnline: false,
      note: 'Gosta de falar sobre tecnologia e viagens na Europa.',
    },
  ]);

  const timeSlots = ['Manhã (08h - 12h)', 'Tarde (12h - 18h)', 'Noite (18h - 22h)'];
  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([
    'Seg-Noite (18h - 22h)',
    'Qua-Noite (18h - 22h)',
    'Sex-Noite (18h - 22h)',
  ]);

  const toggleAvailabilitySlot = (slotKey: string) => {
    if (selectedAvailability.includes(slotKey)) {
      setSelectedAvailability(selectedAvailability.filter((item) => item !== slotKey));
    } else {
      setSelectedAvailability([...selectedAvailability, slotKey]);
    }
  };

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const cefrLevelsInfo = [
    { code: 'A1', label: 'Iniciante', desc: 'Compreende frases simples do dia a dia.' },
    { code: 'A2', label: 'Básico', desc: 'Comunica-se em tarefas rotineiras.' },
    { code: 'B1', label: 'Intermediário', desc: 'Mantém conversas sobre temas familiares.' },
    { code: 'B2', label: 'Intermediário Avançado', desc: 'Fala com fluência e espontaneidade.' },
    { code: 'C1', label: 'Avançado', desc: 'Expressa-se de forma fluida e bem estruturada.' },
  ];

  const goalProgressPercentage = Math.min(100, Math.round((weeklyGoalCompleted / weeklyGoalTarget) * 100));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          age,
          showAgeInProfile,
          gender,
          pronouns,
          cefrLevel,
          bio,
          interests: selectedInterests,
          avatar: avatarUrl,
          notifyEmail,
          notifyPush,
          notifyAdvance
        })
      });
      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert('Erro ao salvar perfil');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao salvar perfil');
    }
  };

  const handleSendEmailCode = async () => {
    setPasswordError(null);
    try {
      const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (response.ok) {
        setEmailCodeSent(true);
      } else {
        const data = await response.json();
        setPasswordError(data.error || 'Erro ao enviar código.');
      }
    } catch (err) {
      setPasswordError('Erro ao conectar com o servidor.');
    }
  };

  const handleVerifyEmailCode = async () => {
    setPasswordError(null);
    if (!verificationCode || verificationCode.length < 6) {
      setPasswordError('Informe o código de 6 dígitos enviado ao e-mail.');
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode })
      });
      if (response.ok) {
        setIsEmailCodeVerified(true);
      } else {
        setPasswordError('Código inválido ou expirado.');
      }
    } catch (err) {
      setPasswordError('Erro ao verificar o código.');
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
      const response = await fetch('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode, newPassword })
      });

      if (response.ok) {
        setPasswordSuccess('Senha alterada com sucesso!');
        setEmailCodeSent(false);
        setVerificationCode('');
        setIsEmailCodeVerified(false);
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(null), 3000);
      } else {
        setPasswordError('Erro ao redefinir a senha.');
      }
    } catch (err) {
      setPasswordError('Erro ao conectar com o servidor.');
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
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/user/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: deletePasswordConfirm })
      });

      if (response.ok) {
        alert('Sua conta e dados foram removidos permanentemente.');
        localStorage.removeItem('token');
        navigate('/');
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao excluir a conta.');
      }
    } catch (err) {
      alert('Erro de conexão ao excluir a conta.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1917] flex flex-col font-sans selection:bg-[#1C1917] selection:text-[#FAF9F6] relative overflow-x-hidden">
      
      <div
        className="pointer-events-none fixed z-50 w-3.5 h-3.5 rounded-full bg-[#1C1917] transition-opacity duration-300 ease-out -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{
          left: `${followerPos.x}px`,
          top: `${followerPos.y}px`,
          opacity: cursorOpacity,
        }}
      />

      <header className="bg-[#FFFFFF] border-b border-[#E7E5E4] px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-[#1C1917] flex items-center justify-center font-black text-[#FAF9F6] text-base shadow-sm">
            S
          </div>
          <span className="text-lg font-black tracking-tight text-[#1C1917] uppercase">SideBySide</span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-[#FAF9F6] hover:bg-[#F5F5F4] border-2 border-[#1C1917] text-[#1C1917] font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-sm"
        >
          <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Voltar
        </button>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 lg:p-8 flex flex-col gap-6">
        
        <section className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative group w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#1C1917] bg-[#F5F5F4] shrink-0 shadow-sm">
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              <label className="absolute inset-0 bg-[#1C1917]/80 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                <svg className="w-5 h-5 stroke-[#FAF9F6] fill-none stroke-2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                </svg>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black uppercase text-[#1C1917]">{name}</h1>
                <span className="px-2 py-0.5 bg-[#1C1917] text-[#FAF9F6] font-black text-[10px] rounded uppercase">
                  {cefrLevel}
                </span>
              </div>
              <span className="text-xs font-bold text-[#78716C]">{email}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setShowPublicPreview(true)}
              className="py-2.5 px-4 bg-[#FAF9F6] hover:bg-[#F5F5F4] border-2 border-[#1C1917] text-[#1C1917] font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Ver Perfil Público
            </button>

            <Button
              variant="primary"
              onClick={handleSubmit}
              className="py-2.5 px-5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-black text-xs uppercase tracking-wider rounded-xl transition-all border-2 border-[#1C1917] shadow-sm"
            >
              Salvar Perfil
            </Button>
          </div>
        </section>

        <div className="grid grid-cols-2 sm:grid-cols-4 bg-[#FFFFFF] border-2 border-[#1C1917] p-1.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#1C1917]">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`py-3 rounded-xl transition-all ${
              activeTab === 'general' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-sm' : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Geral & Bio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('social')}
            className={`py-3 rounded-xl transition-all ${
              activeTab === 'social' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-sm' : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Agenda & Parceiros
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`py-3 rounded-xl transition-all ${
              activeTab === 'stats' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-sm' : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Metas & Evolução
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`py-3 rounded-xl transition-all ${
              activeTab === 'security' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-sm' : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Segurança
          </button>
        </div>

        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-600 text-emerald-800 text-xs font-black flex items-center gap-2.5 animate-in fade-in duration-150 shadow-sm">
            <svg className="w-4 h-4 shrink-0 fill-current text-emerald-600" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            <span>Alterações salvas com sucesso!</span>
          </div>
        )}

        {activeTab === 'general' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-150">
            <section className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-6">
              <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917] border-b-2 border-[#E7E5E4] pb-3">
                Informações Pessoais
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-[#1C1917] uppercase tracking-wider">Nome Completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-[#1C1917] uppercase tracking-wider">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="px-4 py-3 bg-[#F5F5F4] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#78716C] cursor-not-allowed outline-none select-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-[#1C1917] uppercase tracking-wider">Idade</label>
                    <button
                      type="button"
                      onClick={() => setShowAgeInProfile(!showAgeInProfile)}
                      className="text-[10px] font-black uppercase text-[#1C1917] hover:underline flex items-center gap-1.5 bg-[#FAF9F6] px-2 py-0.5 rounded border border-[#E7E5E4]"
                    >
                      {showAgeInProfile ? (
                        <>
                          <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Visível
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2 text-[#78716C]" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                          Oculta
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type="number"
                    min={18}
                    max={100}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-[#1C1917] uppercase tracking-wider">Gênero</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Não-binário">Não-binário</option>
                    <option value="Prefiro não dizer">Prefiro não dizer</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-black text-[#1C1917] uppercase tracking-wider">Pronomes</label>
                  <select
                    value={pronouns}
                    onChange={(e) => setPronouns(e.target.value)}
                    className="px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
                  >
                    <option value="ele/dele (he/him)">ele/dele (he/him)</option>
                    <option value="ela/dela (she/her)">ela/dela (she/her)</option>
                    <option value="elu/delu (they/them)">elu/delu (they/them)</option>
                    <option value="Qualquer pronome (any pronouns)">Qualquer pronome (any pronouns)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 pt-2">
                <label className="text-xs font-black text-[#1C1917] uppercase tracking-wider">Mini Biografia</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] resize-none"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2 border-t-2 border-[#E7E5E4]">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-black text-[#1C1917] uppercase tracking-wider">
                      Tópicos de Interesse
                    </label>
                    <span className="text-[10px] font-black uppercase bg-[#1C1917] text-[#FAF9F6] px-2 py-0.5 rounded">
                      {selectedInterests.length}/5
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTopicsModal(true)}
                    className="text-xs font-black uppercase text-[#1C1917] hover:underline flex items-center gap-1"
                  >
                    <span>+</span> Explorar Tópicos
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedInterests.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className="px-3 py-1.5 rounded-xl border-2 text-xs font-black transition-all bg-[#1C1917] text-[#FAF9F6] border-[#1C1917] flex items-center gap-1.5 shadow-xs"
                    >
                      <span>✓ {interest}</span>
                      <span className="text-[10px] opacity-70">✕</span>
                    </button>
                  ))}

                  {selectedInterests.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setShowTopicsModal(true)}
                      className="px-3 py-1.5 rounded-xl border-2 border-dashed border-[#1C1917] text-xs font-black text-[#1C1917] hover:bg-[#F5F5F4] transition-all"
                    >
                      + Adicionar Tópicos
                    </button>
                  )}
                </div>
              </div>
            </section>

            <section className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-4">
              <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917] border-b-2 border-[#E7E5E4] pb-3">
                Nível de Fluência (CEFR)
              </h2>

              <div className="grid grid-cols-1 gap-2.5">
                {cefrLevelsInfo.map((item) => {
                  const isSelected = cefrLevel === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setCefrLevel(item.code)}
                      className={`p-3.5 rounded-2xl border-2 text-left flex items-center justify-between gap-4 transition-all ${
                        isSelected
                          ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917] shadow-[2px_2px_0px_0px_#78716C]'
                          : 'bg-[#FAF9F6] text-[#1C1917] border-[#E7E5E4] hover:border-[#1C1917]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center border-2 ${
                          isSelected ? 'bg-[#FAF9F6] text-[#1C1917] border-[#FAF9F6]' : 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]'
                        }`}>
                          {item.code}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase">{item.label}</span>
                          <span className={`text-[11px] font-medium ${isSelected ? 'text-[#D6D3D1]' : 'text-[#78716C]'}`}>
                            {item.desc}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-150">
            <section className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-6">
              <div className="flex justify-between items-center border-b-2 border-[#E7E5E4] pb-3">
                <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
                  Agenda de Disponibilidade
                </h2>
                <span className="text-[10px] font-black uppercase bg-[#FAF9F6] text-[#1C1917] px-2.5 py-1 rounded-lg border-2 border-[#1C1917]">
                  Pico: Noite (18h-22h)
                </span>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[480px] flex flex-col gap-2">
                  <div className="grid grid-cols-8 gap-2 text-center text-[10px] font-black uppercase text-[#1C1917] pb-1 border-b-2 border-[#E7E5E4]">
                    <span>Turno</span>
                    {weekDays.map((day) => <span key={day}>{day}</span>)}
                  </div>

                  {timeSlots.map((slot) => (
                    <div key={slot} className="grid grid-cols-8 gap-2 items-center">
                      <span className="text-[10px] font-black text-[#1C1917] uppercase">{slot.split(' ')[0]}</span>
                      {weekDays.map((day) => {
                        const slotKey = `${day}-${slot}`;
                        const isSelected = selectedAvailability.includes(slotKey);
                        return (
                          <button
                            key={slotKey}
                            type="button"
                            onClick={() => toggleAvailabilitySlot(slotKey)}
                            className={`py-2 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${
                              isSelected ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]' : 'bg-[#FAF9F6] text-[#A8A29E] border-[#E7E5E4]'
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

            {/* Nova Seção de Lembretes de Prática */}
            <section className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-5">
              <div className="flex justify-between items-center border-b-2 border-[#E7E5E4] pb-3">
                <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
                  Lembretes de Prática
                </h2>
                <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  Ativo
                </span>
              </div>

              <div className="flex flex-col gap-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase text-[#1C1917]">Notificações Push</span>
                    <span className="text-[10px] font-bold text-[#78716C]">Receba alertas rápidos do sistema</span>
                  </div>
                  <div className={`w-11 h-6 rounded-full border-2 border-[#1C1917] flex items-center p-0.5 transition-all ${notifyPush ? 'bg-[#1C1917]' : 'bg-[#FAF9F6]'}`}>
                    <div className={`w-4 h-4 rounded-full bg-[#FAF9F6] border-2 border-[#1C1917] transition-all ${notifyPush ? 'translate-x-5 border-[#FAF9F6]' : 'translate-x-0'}`} />
                  </div>
                  <input type="checkbox" className="hidden" checked={notifyPush} onChange={(e) => setNotifyPush(e.target.checked)} />
                </label>

                <label className="flex items-center justify-between cursor-pointer border-t-2 border-[#F5F5F4] pt-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase text-[#1C1917]">Alertas por E-mail</span>
                    <span className="text-[10px] font-bold text-[#78716C]">Lembretes direto na sua caixa de entrada</span>
                  </div>
                  <div className={`w-11 h-6 rounded-full border-2 border-[#1C1917] flex items-center p-0.5 transition-all ${notifyEmail ? 'bg-[#1C1917]' : 'bg-[#FAF9F6]'}`}>
                    <div className={`w-4 h-4 rounded-full bg-[#FAF9F6] border-2 border-[#1C1917] transition-all ${notifyEmail ? 'translate-x-5 border-[#FAF9F6]' : 'translate-x-0'}`} />
                  </div>
                  <input type="checkbox" className="hidden" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} />
                </label>

                <div className="flex flex-col gap-1.5 border-t-2 border-[#F5F5F4] pt-4">
                  <label className="text-xs font-black text-[#1C1917] uppercase tracking-wider">Avisar com antecedência de:</label>
                  <select
                    value={notifyAdvance}
                    onChange={(e) => setNotifyAdvance(e.target.value)}
                    className="px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
                  >
                    <option value="5">5 minutos antes da sessão agendada</option>
                    <option value="15">15 minutos antes da sessão agendada</option>
                    <option value="30">30 minutos antes da sessão agendada</option>
                    <option value="60">1 hora antes da sessão agendada</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-4">
              <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917] border-b-2 border-[#E7E5E4] pb-3">
                Parceiros Favoritos
              </h2>

              <div className="flex flex-col gap-3">
                {favoritePartners.map((partner) => (
                  <div key={partner.id} className="bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-2xl p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <img src={partner.avatar} alt={partner.name} className="w-10 h-10 rounded-xl object-cover border-2 border-[#1C1917]" />
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-[#1C1917]">{partner.name} ({partner.level})</span>
                          <span className="text-[10px] font-bold text-[#78716C]">{partner.isOnline ? 'Online' : 'Offline'}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-[#57534E] italic bg-[#FFFFFF] p-2.5 rounded-xl border-2 border-[#E7E5E4]">
                      "{partner.note}"
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-150">
            <section className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-6">
              <div className="flex justify-between items-center border-b-2 border-[#E7E5E4] pb-3">
                <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
                  Meta Semanal de Prática
                </h2>
                <span className="text-xs font-black text-[#1C1917]">{weeklyGoalCompleted}/{weeklyGoalTarget} Concluídas</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[3, 5, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setWeeklyGoalTarget(num)}
                    className={`py-3 rounded-xl border-2 font-black text-xs uppercase ${
                      weeklyGoalTarget === num ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]' : 'bg-[#FAF9F6] border-[#E7E5E4]'
                    }`}
                  >
                    {num} Sessões
                  </button>
                ))}
              </div>

              <div className="w-full h-4 bg-[#F5F5F4] rounded-full overflow-hidden p-0.5 border-2 border-[#1C1917]">
                <div className="h-full bg-[#1C1917] rounded-full transition-all" style={{ width: `${goalProgressPercentage}%` }} />
              </div>
            </section>

            <section className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-4">
              <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917] border-b-2 border-[#E7E5E4] pb-3">
                Conquistas & Badges
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {badgesList.map((badge) => (
                  <div key={badge.id} className="p-3.5 rounded-2xl border-2 bg-[#FAF9F6] border-[#E7E5E4] flex items-center gap-3">
                    <span className="text-2xl">{badge.icon}</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-[#1C1917] uppercase">{badge.title}</span>
                      <span className="text-[11px] text-[#78716C] font-bold">{badge.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-150">
            <form onSubmit={handlePasswordChange} className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-5">
              <div className="flex flex-col gap-1 border-b-2 border-[#E7E5E4] pb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FAF9F6] bg-[#1C1917] px-2.5 py-0.5 rounded w-fit">
                  VERIFICAÇÃO VIA E-MAIL
                </span>
                <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917] mt-1">
                  Alterar Senha de Acesso
                </h2>
              </div>

              {passwordError && <div className="p-3 rounded-xl bg-red-50 border-2 border-red-600 text-red-700 text-xs font-black">{passwordError}</div>}
              {passwordSuccess && <div className="p-3 rounded-xl bg-emerald-50 border-2 border-emerald-600 text-emerald-800 text-xs font-black">{passwordSuccess}</div>}

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-[#1C1917] uppercase tracking-wider flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${isEmailCodeVerified ? 'bg-emerald-600 text-white' : 'bg-[#1C1917] text-[#FAF9F6]'}`}>
                    {isEmailCodeVerified ? '✓' : '1'}
                  </span>
                  1. Solicitar Código para: <span className="text-[#78716C]">{email}</span>
                </label>

                {!emailCodeSent ? (
                  <button
                    type="button"
                    onClick={handleSendEmailCode}
                    className="py-3 px-5 bg-[#1C1917] text-[#FAF9F6] font-black text-xs uppercase rounded-xl border-2 border-[#1C1917] hover:bg-[#292524] transition-all w-fit"
                  >
                    Enviar Código de Confirmação por E-mail
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 pt-1">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                      ✉️ Código enviado! Verifique sua caixa de entrada.
                    </span>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        disabled={isEmailCodeVerified}
                        placeholder="Digite o código de 6 dígitos..."
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="flex-1 px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold outline-none focus:border-[#1C1917] disabled:opacity-75"
                      />
                      {!isEmailCodeVerified ? (
                        <button
                          type="button"
                          onClick={handleVerifyEmailCode}
                          className="px-5 py-3 bg-[#1C1917] text-[#FAF9F6] font-black text-xs uppercase rounded-xl border-2 border-[#1C1917] hover:bg-[#292524] transition-all"
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
                          className="px-4 py-3 bg-[#FAF9F6] text-[#78716C] hover:text-[#1C1917] font-black text-xs uppercase rounded-xl border-2 border-[#E7E5E4]"
                        >
                          Alterar
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {isEmailCodeVerified && (
                <div className="flex flex-col gap-3 pt-2 animate-in fade-in slide-in-from-top-4 duration-300 border-t-2 border-[#E7E5E4]">
                  <label className="text-xs font-black text-[#1C1917] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#1C1917] text-[#FAF9F6] flex items-center justify-center text-[10px] font-black">
                      2
                    </span>
                    2. Digite e Confirme a Nova Senha
                  </label>
                  <input
                    type="password"
                    placeholder="Nova Senha (Mínimo 6 caracteres)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold outline-none focus:border-[#1C1917]"
                  />
                  <input
                    type="password"
                    placeholder="Confirmar Nova Senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold outline-none focus:border-[#1C1917]"
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    className="py-3.5 text-xs font-black uppercase tracking-wider bg-[#1C1917] text-[#FAF9F6] rounded-xl border-2 border-[#1C1917] mt-2 shadow-md"
                  >
                    Salvar Nova Senha
                  </Button>
                </div>
              )}
            </form>

            <section className="bg-[#FFFFFF] border-2 border-red-600 rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#DC2626] flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-2.5 py-0.5 rounded border border-red-200 w-fit">
                ZONA CRÍTICA
              </span>
              <h2 className="text-base font-black uppercase text-red-600">Exclusão Definitiva da Conta</h2>
              <p className="text-xs text-[#57534E] font-medium">Ação irreversível de remoção permanente de todos os seus dados cadastrais, histórico e conquistas.</p>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="w-fit px-5 py-2.5 bg-red-50 text-red-600 border-2 border-red-600 font-black text-xs uppercase rounded-xl hover:bg-red-600 hover:text-white transition-all mt-1"
              >
                Iniciar Processo de Exclusão
              </button>
            </section>
          </div>
        )}
      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border-2 border-red-600 rounded-3xl p-6 sm:p-8 max-w-md w-full flex flex-col gap-5 shadow-[8px_8px_0px_0px_#DC2626] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b-2 border-red-200 pb-3">
              <h3 className="text-base font-black uppercase text-red-600 flex items-center gap-2">
                <span>⚠️</span> Confirmar Exclusão
              </h3>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="text-sm font-black text-[#78716C] hover:text-[#1C1917]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#57534E] font-medium leading-relaxed">
              Esta ação removerá permanentemente seu histórico de conversas, badges, amizades e estatísticas.
            </p>

            <div className="flex flex-col gap-3 border-t-2 border-[#E7E5E4] pt-4">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-black text-[#1C1917] uppercase">1. Digite sua Senha do Perfil *</label>
                <input
                  type="password"
                  value={deletePasswordConfirm}
                  onChange={(e) => setDeletePasswordConfirm(e.target.value)}
                  placeholder="Sua senha atual..."
                  className="px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-red-600"
                />
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer bg-[#FAF9F6] p-3 rounded-xl border-2 border-[#E7E5E4]">
                <input
                  type="checkbox"
                  checked={agreeDeleteTerms}
                  onChange={(e) => setAgreeDeleteTerms(e.target.checked)}
                  className="mt-0.5 rounded border-2 border-[#1C1917] text-red-600 focus:ring-red-600"
                />
                <span className="text-[11px] font-bold text-[#1C1917] leading-snug">
                  Estou ciente de que a remoção é irreversível e não poderei recuperar este perfil.
                </span>
              </label>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-black text-[#1C1917] uppercase">
                  2. Digite "EXCLUIR PERMANENTEMENTE" *
                </label>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="EXCLUIR PERMANENTEMENTE"
                  className="px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-red-600"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 bg-[#FAF9F6] border-2 border-[#1C1917] text-xs font-black uppercase rounded-xl"
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
                className="flex-1 py-3 bg-red-600 text-white text-xs font-black uppercase rounded-xl border-2 border-red-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                Apagar Conta
              </button>
            </div>
          </div>
        </div>
      )}

      {showTopicsModal && (
        <div className="fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[8px_8px_0px_0px_#1C1917] flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-[#E7E5E4] pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black uppercase text-[#1C1917]">
                  Explorar Tópicos
                </h3>
                <span className="text-[10px] font-black uppercase bg-[#1C1917] text-[#FAF9F6] px-2 py-0.5 rounded">
                  {selectedInterests.length}/5
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowTopicsModal(false)}
                className="text-sm font-black text-[#78716C] hover:text-[#1C1917]"
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              placeholder="Buscar tópico..."
              value={topicSearch}
              onChange={(e) => setTopicSearch(e.target.value)}
              className="px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
            />

            <div className="flex flex-col gap-5">
              {topicsLibrary.map((cat) => {
                const filteredItems = cat.items.filter((item) =>
                  item.toLowerCase().includes(topicSearch.toLowerCase())
                );
                if (filteredItems.length === 0) return null;

                return (
                  <div key={cat.category} className="flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#78716C]">
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
                            className={`px-3.5 py-2 rounded-xl border-2 text-xs font-black transition-all ${
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
              onClick={() => setShowTopicsModal(false)}
              className="w-full py-3.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-black text-xs uppercase tracking-widest rounded-xl transition-all border-2 border-[#1C1917]"
            >
              Concluir Seleção ({selectedInterests.length}/5)
            </button>
          </div>
        </div>
      )}

      {showPublicPreview && (
        <div className="fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[8px_8px_0px_0px_#1C1917] flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-[#E7E5E4] pb-3">
              <span className="text-[10px] font-black uppercase tracking-widest bg-[#FAF9F6] border border-[#1C1917] text-[#1C1917] px-2.5 py-1 rounded-lg">
                COMO OS OUTROS TE VEEM
              </span>
              <button
                type="button"
                onClick={() => setShowPublicPreview(false)}
                className="text-sm font-black text-[#78716C] hover:text-[#1C1917]"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#1C1917] bg-[#F5F5F4] shadow-sm">
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black uppercase text-[#1C1917]">{name}</h3>
                  <span className="px-2 py-0.5 bg-[#1C1917] text-[#FAF9F6] font-black text-[10px] rounded uppercase">
                    {cefrLevel}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-[#78716C]">
                  {showAgeInProfile && <span>{age} anos</span>}
                  {showAgeInProfile && <span>•</span>}
                  <span>{gender}</span>
                  <span>•</span>
                  <span className="italic">{pronouns}</span>
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Reputação: {evolutionStats.reputationScore}
                  </span>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    🔥 {currentStreak} Dias de Ofensiva
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFriendRequestSent(!friendRequestSent)}
                className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all border-2 border-[#1C1917] flex items-center justify-center gap-2 ${
                  friendRequestSent
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-600'
                    : 'bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6]'
                }`}
              >
                {friendRequestSent ? (
                  <>
                    <span>✓</span> Solicitação Enviada
                  </>
                ) : (
                  <>
                    <span>👤+</span> Enviar Solicitação de Amizade
                  </>
                )}
              </button>

              <p className="text-xs text-[#57534E] font-medium leading-relaxed italic bg-[#FAF9F6] p-3 rounded-2xl border-2 border-[#E7E5E4] w-full text-left">
                "{bio || 'Sem biografia informada.'}"
              </p>

              <div className="flex flex-col gap-2 w-full pt-1 text-left border-t-2 border-[#E7E5E4] mt-1">
                <span className="text-[10px] font-black uppercase text-[#78716C] tracking-wider">
                  Avaliações e Comentários da Comunidade ({receivedFeedback.length}):
                </span>
                <div className="flex flex-col gap-2">
                  {receivedFeedback.map((fb) => (
                    <div
                      key={fb.id}
                      className="bg-[#FAF9F6] p-3 rounded-2xl border-2 border-[#E7E5E4] flex flex-col gap-1.5"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-black text-[#1C1917]">{fb.author}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-amber-600">
                            {'★'.repeat(fb.rating)}
                          </span>
                          <span className="text-[9px] font-bold text-[#A8A29E] uppercase">{fb.date}</span>
                        </div>
                      </div>
                      <p className="text-xs text-[#57534E] font-medium italic leading-relaxed">
                        "{fb.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 w-full pt-1 text-left">
                <span className="text-[10px] font-black uppercase text-[#78716C]">
                  Conquistas Desbloqueadas:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {badgesList.filter((b) => b.unlocked).map((badge) => (
                    <div key={badge.id} className="p-2 rounded-xl bg-[#FAF9F6] border-2 border-[#E7E5E4] flex items-center gap-2">
                      <span className="text-base">{badge.icon}</span>
                      <span className="text-[10px] font-black text-[#1C1917] uppercase truncate">{badge.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedInterests.length > 0 && (
                <div className="flex flex-col gap-1.5 w-full pt-1 text-left">
                  <span className="text-[10px] font-black uppercase text-[#78716C]">
                    Interesses de Conversa:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedInterests.map((interest) => (
                      <span
                        key={interest}
                        className="text-[10px] font-black px-2.5 py-1 bg-[#FAF9F6] border-2 border-[#1C1917] text-[#1C1917] rounded-lg"
                      >
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
              className="w-full py-3 bg-[#FAF9F6] hover:bg-[#F5F5F4] border-2 border-[#1C1917] text-[#1C1917] font-black text-xs uppercase tracking-widest rounded-xl transition-all"
            >
              Fechar Visualização
            </button>
          </div>
        </div>
      )}
    </div>
  );
};