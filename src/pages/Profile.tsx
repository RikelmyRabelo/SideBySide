import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { INTERESTS_LIBRARY, CEFR_LEVELS_INFO } from '../data/topicsData';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'general' | 'social' | 'stats' | 'security'>('general');

  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [followerPos, setFollowerPos] = useState({ x: -100, y: -100 });
  const [cursorOpacity, setCursorOpacity] = useState(1);

  const [isAvatarExpanded, setIsAvatarExpanded] = useState(false);

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
  const [recentConversations, setRecentConversations] = useState<any[]>([]);
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);

  const [showTopicsModal, setShowTopicsModal] = useState(false);
  const [topicSearch, setTopicSearch] = useState('');

  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [showAgeInProfile, setShowAgeInProfile] = useState(true);

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        const img = new Image();
        img.onload = () => {
          const maxWidth = 800;
          const maxHeight = 800;
          const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve(result);
            return;
          }

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = () => reject(new Error('Erro ao processar a imagem do perfil.'));
        img.src = result;
      };
      reader.onerror = () => reject(new Error('Erro ao ler a imagem do perfil.'));
      reader.readAsDataURL(file);
    });
  const [gender, setGender] = useState('Masculino');
  const [pronouns, setPronouns] = useState('ele/dele (he/him)');
  const [cefrLevel, setCefrLevel] = useState('B1');
  const [avatarUrl, setAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  );

  const [bio, setBio] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPush, setNotifyPush] = useState(true);
  const [notifyAdvance, setNotifyAdvance] = useState('15');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/user/me', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setName(data.name || '');
          if (data.tag) setTag(data.tag);
          setEmail(data.email || '');
          setCefrLevel(data.level || 'B1');
          if (data.avatar) setAvatarUrl(data.avatar);
          if (data.bio) setBio(data.bio);
          if (data.birthDate) setBirthDate(data.birthDate);
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

  const [receivedFeedback, setReceivedFeedback] = useState<any[]>([]);

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
  const [weeklyGoalCompleted] = useState(0);
  const [currentStreak] = useState(0);

  const [badgesList, setBadgesList] = useState<any[]>([]);

  const evolutionStats = {
    reputationScore: '98/100',
  };

  const calculateAge = (dob: string) => {
    if (!dob) return '';
    const birthDateObj = new Date(dob);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
      calculatedAge--;
    }
    return calculatedAge;
  };

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

  const goalProgressPercentage = Math.min(100, Math.round((weeklyGoalCompleted / weeklyGoalTarget) * 100));

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      setAvatarUrl(dataUrl);
    } catch (error) {
      console.error('Erro ao converter imagem para data URL:', error);
      alert('Não foi possível carregar a imagem do perfil.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          birthDate,
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
        return;
      }

      const errorData = await response.json().catch(() => ({}));
      alert(errorData.error || 'Erro ao salvar perfil');
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao salvar perfil. Tente novamente em instantes.');
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
      const response = await fetch('http://localhost:3000/api/user/account', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: deletePasswordConfirm })
      });

      if (response.ok) {
        alert('Sua conta e dados foram removidos permanentemente.');
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

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 lg:p-8 flex flex-col gap-8">
        
        <section className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative group w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#1C1917] bg-[#F5F5F4] shrink-0 shadow-sm">
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              <label className="absolute inset-0 bg-[#1C1917]/80 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                <svg className="w-5 h-5 stroke-[#FAF9F6] fill-none stroke-2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                </svg>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#1C1917]">{name}</h1>
                <span className="px-2.5 py-1 bg-[#1C1917] text-[#FAF9F6] font-black text-xs rounded-xl uppercase tracking-wider shadow-xs">
                  {cefrLevel}
                </span>
              </div>
              {tag && (
                <span className="px-2.5 py-1 bg-[#FAF9F6] border-2 border-[#1C1917] text-[#1C1917] font-black text-xs rounded-xl shadow-xs w-fit">
                  #{tag}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setShowPublicPreview(true)}
              className="py-3 px-4 bg-[#FAF9F6] hover:bg-[#F5F5F4] border-2 border-[#1C1917] text-[#1C1917] font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm flex-1 sm:flex-initial"
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
              className="py-3 px-6 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-black text-xs uppercase tracking-wider rounded-xl transition-all border-2 border-[#1C1917] shadow-[2px_2px_0px_0px_#78716C] flex-1 sm:flex-initial"
            >
              Salvar
            </Button>
          </div>
        </section>

        <div className="grid grid-cols-2 sm:grid-cols-4 bg-[#FFFFFF] border-2 border-[#1C1917] p-2 rounded-2xl text-xs font-black uppercase tracking-wider gap-2 shadow-[4px_4px_0px_0px_#1C1917]">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`py-3.5 px-3 rounded-xl transition-all text-center ${
              activeTab === 'general' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-sm' : 'text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF9F6]'
            }`}
          >
            Geral & Bio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('social')}
            className={`py-3.5 px-3 rounded-xl transition-all text-center ${
              activeTab === 'social' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-sm' : 'text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF9F6]'
            }`}
          >
            Agenda & Alertas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`py-3.5 px-3 rounded-xl transition-all text-center ${
              activeTab === 'stats' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-sm' : 'text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF9F6]'
            }`}
          >
            Metas & Evolução
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`py-3.5 px-3 rounded-xl transition-all text-center ${
              activeTab === 'security' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-sm' : 'text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF9F6]'
            }`}
          >
            Segurança
          </button>
        </div>

        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-600 text-emerald-800 text-xs font-black flex items-center gap-3 animate-in fade-in duration-150 shadow-sm">
            <svg className="w-5 h-5 shrink-0 fill-current text-emerald-600" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            <span>Alterações salvas com sucesso!</span>
          </div>
        )}

        {activeTab === 'general' && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-150">
            <section className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-6">
              <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917] border-b-2 border-[#E7E5E4] pb-4">
                Informações Pessoais
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-[#1C1917] uppercase tracking-wider">Nome Completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="px-4 py-3.5 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-2xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-[#1C1917] uppercase tracking-wider">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="px-4 py-3.5 bg-[#F5F5F4] border-2 border-[#E7E5E4] rounded-2xl text-xs font-bold text-[#78716C] cursor-not-allowed outline-none select-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-[#1C1917] uppercase tracking-wider">Data de Nascimento</label>
                    <button
                      type="button"
                      onClick={() => setShowAgeInProfile(!showAgeInProfile)}
                      className="text-[10px] font-black uppercase text-[#1C1917] hover:bg-[#F5F5F4] flex items-center gap-1.5 bg-[#FAF9F6] px-2.5 py-1 rounded-xl border-2 border-[#E7E5E4] transition-all"
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
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="px-4 py-3.5 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-2xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-[#1C1917] uppercase tracking-wider">Gênero</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="px-4 py-3.5 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-2xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] transition-all"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Não-binário">Não-binário</option>
                    <option value="Prefiro não dizer">Prefiro não dizer</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="text-xs font-black text-[#1C1917] uppercase tracking-wider">Pronomes</label>
                  <select
                    value={pronouns}
                    onChange={(e) => setPronouns(e.target.value)}
                    className="px-4 py-3.5 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-2xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] transition-all"
                  >
                    <option value="ele/dele (he/him)">ele/dele (he/him)</option>
                    <option value="ela/dela (she/her)">ela/dela (she/her)</option>
                    <option value="elu/delu (they/them)">elu/delu (they/them)</option>
                    <option value="Qualquer pronome (any pronouns)">Qualquer pronome (any pronouns)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <label className="text-xs font-black text-[#1C1917] uppercase tracking-wider">Mini Biografia</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-4 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-2xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] resize-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-4 pt-4 border-t-2 border-[#E7E5E4]">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <label className="text-xs font-black text-[#1C1917] uppercase tracking-wider">
                      Tópicos de Interesse
                    </label>
                    <span className="text-[10px] font-black uppercase bg-[#1C1917] text-[#FAF9F6] px-2.5 py-1 rounded-xl">
                      {selectedInterests.length}/5
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTopicsModal(true)}
                    className="text-xs font-black uppercase text-[#1C1917] hover:underline flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF9F6] border-2 border-[#E7E5E4] transition-all"
                  >
                    <span>+</span> Explorar Tópicos
                  </button>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {selectedInterests.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className="px-3.5 py-2 rounded-xl border-2 text-xs font-black transition-all bg-[#1C1917] text-[#FAF9F6] border-[#1C1917] flex items-center gap-2 shadow-xs"
                    >
                      <span>✓ {interest}</span>
                      <span className="text-[10px] opacity-70">✕</span>
                    </button>
                  ))}

                  {selectedInterests.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setShowTopicsModal(true)}
                      className="px-3.5 py-2 rounded-xl border-2 border-dashed border-[#1C1917] text-xs font-black text-[#1C1917] hover:bg-[#F5F5F4] transition-all"
                    >
                      + Adicionar Tópicos
                    </button>
                  )}
                </div>
              </div>
            </section>

            <section className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-5">
              <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917] border-b-2 border-[#E7E5E4] pb-4">
                Nível de Fluência (CEFR)
              </h2>

              <div className="grid grid-cols-1 gap-3">
                {CEFR_LEVELS_INFO.map((item) => {
                  const isSelected = cefrLevel === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setCefrLevel(item.code)}
                      className={`p-4 rounded-2xl border-2 text-left flex items-center justify-between gap-4 transition-all ${
                        isSelected
                          ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917] shadow-[2px_2px_0px_0px_#78716C]'
                          : 'bg-[#FAF9F6] text-[#1C1917] border-[#E7E5E4] hover:border-[#1C1917]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center border-2 ${
                          isSelected ? 'bg-[#FAF9F6] text-[#1C1917] border-[#FAF9F6]' : 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]'
                        }`}>
                          {item.code}
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-black uppercase">{item.label}</span>
                          <span className={`text-[11px] font-medium leading-relaxed ${isSelected ? 'text-[#D6D3D1]' : 'text-[#78716C]'}`}>
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
          <div className="flex flex-col gap-8 animate-in fade-in duration-150">
            <section className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-6">
              <div className="flex justify-between items-center border-b-2 border-[#E7E5E4] pb-4">
                <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
                  Agenda de Disponibilidade
                </h2>
                <span className="text-[10px] font-black uppercase bg-[#FAF9F6] text-[#1C1917] px-3 py-1.5 rounded-xl border-2 border-[#1C1917]">
                  Pico: Noite (18h-22h)
                </span>
              </div>

              <div className="overflow-x-auto pb-2">
                <div className="min-w-[500px] flex flex-col gap-3">
                  <div className="grid grid-cols-8 gap-2.5 text-center text-[11px] font-black uppercase text-[#1C1917] pb-2 border-b-2 border-[#E7E5E4]">
                    <span>Turno</span>
                    {weekDays.map((day) => <span key={day}>{day}</span>)}
                  </div>

                  {timeSlots.map((slot) => (
                    <div key={slot} className="grid grid-cols-8 gap-2.5 items-center">
                      <span className="text-[10px] font-black text-[#1C1917] uppercase">{slot.split(' ')[0]}</span>
                      {weekDays.map((day) => {
                        const slotKey = `${day}-${slot}`;
                        const isSelected = selectedAvailability.includes(slotKey);
                        return (
                          <button
                            key={slotKey}
                            type="button"
                            onClick={() => toggleAvailabilitySlot(slotKey)}
                            className={`py-3 rounded-xl border-2 text-xs font-black uppercase transition-all ${
                              isSelected ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917] shadow-xs' : 'bg-[#FAF9F6] text-[#A8A29E] border-[#E7E5E4] hover:border-[#1C1917]'
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

            <section className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-6">
              <div className="flex justify-between items-center border-b-2 border-[#E7E5E4] pb-4">
                <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
                  Lembretes de Prática
                </h2>
                <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-800 border-2 border-emerald-200 px-3 py-1 rounded-xl">
                  Ativo
                </span>
              </div>

              <div className="flex flex-col gap-5">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-black uppercase text-[#1C1917]">Notificações Push</span>
                    <span className="text-[11px] font-bold text-[#78716C]">Receba alertas rápidos do sistema</span>
                  </div>
                  <div className={`w-12 h-7 rounded-full border-2 border-[#1C1917] flex items-center p-0.5 transition-all ${notifyPush ? 'bg-[#1C1917]' : 'bg-[#FAF9F6]'}`}>
                    <div className={`w-5 h-5 rounded-full bg-[#FAF9F6] border-2 border-[#1C1917] transition-all ${notifyPush ? 'translate-x-5 border-[#FAF9F6]' : 'translate-x-0'}`} />
                  </div>
                  <input type="checkbox" className="hidden" checked={notifyPush} onChange={(e) => setNotifyPush(e.target.checked)} />
                </label>

                <label className="flex items-center justify-between cursor-pointer border-t-2 border-[#F5F5F4] pt-5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-black uppercase text-[#1C1917]">Alertas por E-mail</span>
                    <span className="text-[11px] font-bold text-[#78716C]">Lembretes direto na sua caixa de entrada</span>
                  </div>
                  <div className={`w-12 h-7 rounded-full border-2 border-[#1C1917] flex items-center p-0.5 transition-all ${notifyEmail ? 'bg-[#1C1917]' : 'bg-[#FAF9F6]'}`}>
                    <div className={`w-5 h-5 rounded-full bg-[#FAF9F6] border-2 border-[#1C1917] transition-all ${notifyEmail ? 'translate-x-5 border-[#FAF9F6]' : 'translate-x-0'}`} />
                  </div>
                  <input type="checkbox" className="hidden" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} />
                </label>

                <div className="flex flex-col gap-2 border-t-2 border-[#F5F5F4] pt-5">
                  <label className="text-xs font-black text-[#1C1917] uppercase tracking-wider">Avisar com antecedência de:</label>
                  <select
                    value={notifyAdvance}
                    onChange={(e) => setNotifyAdvance(e.target.value)}
                    className="px-4 py-3.5 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-2xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] transition-all"
                  >
                    <option value="5">5 minutos antes da sessão agendada</option>
                    <option value="15">15 minutos antes da sessão agendada</option>
                    <option value="30">30 minutos antes da sessão agendada</option>
                    <option value="60">1 hora antes da sessão agendada</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-6">
              <div className="flex justify-between items-center border-b-2 border-[#E7E5E4] pb-4">
                <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
                  Conversas & Chats
                </h2>
                <span className="text-[10px] font-black uppercase bg-[#FAF9F6] text-[#1C1917] px-3 py-1 rounded-xl border-2 border-[#1C1917]">
                  {recentConversations.length}
                </span>
              </div>

              {recentConversations.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-[#E7E5E4] bg-[#FAF9F6] p-6 text-center text-xs font-black uppercase tracking-wider text-[#78716C]">
                  Nenhuma conversa registrada ainda.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentConversations.map((conversation) => (
                    <div key={conversation.id} className="p-4 rounded-2xl border-2 border-[#E7E5E4] bg-[#FAF9F6] flex justify-between items-center gap-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="block text-xs font-black text-[#1C1917] uppercase">{conversation.name}</span>
                        <span className="block text-[11px] font-bold text-[#78716C]">{conversation.lastMessage}</span>
                      </div>
                      <span className="text-[10px] font-black text-[#78716C] uppercase shrink-0">{conversation.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-6">
              <div className="flex justify-between items-center border-b-2 border-[#E7E5E4] pb-4">
                <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
                  Amigos & Solicitações
                </h2>
                <span className="text-[10px] font-black uppercase bg-[#FAF9F6] text-[#1C1917] px-3 py-1 rounded-xl border-2 border-[#1C1917]">
                  {friendsList.length + friendRequests.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#78716C]">Lista de amigos</span>
                  {friendsList.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-[#E7E5E4] bg-[#FAF9F6] p-5 text-center text-[11px] font-black uppercase tracking-wider text-[#78716C]">
                      Ainda sem amigos.
                    </div>
                  ) : (
                    friendsList.map((friend) => (
                      <div key={friend.id} className="p-3.5 rounded-2xl border-2 border-[#E7E5E4] bg-[#FAF9F6] text-xs font-black text-[#1C1917] uppercase">
                        {friend.name}
                      </div>
                    ))
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#78716C]">Solicitações</span>
                  {friendRequests.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-[#E7E5E4] bg-[#FAF9F6] p-5 text-center text-[11px] font-black uppercase tracking-wider text-[#78716C]">
                      Nenhuma solicitação pendente.
                    </div>
                  ) : (
                    friendRequests.map((request) => (
                      <div key={request.id} className="p-3.5 rounded-2xl border-2 border-[#E7E5E4] bg-[#FAF9F6] text-xs font-black text-[#1C1917] uppercase">
                        {request.name}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-150">
            <section className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-6">
              <div className="flex justify-between items-center border-b-2 border-[#E7E5E4] pb-4">
                <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
                  Meta Semanal de Prática
                </h2>
                <span className="text-xs font-black text-[#1C1917] bg-[#FAF9F6] px-3 py-1 rounded-xl border-2 border-[#1C1917]">{weeklyGoalCompleted}/{weeklyGoalTarget} Concluídas</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[3, 5, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setWeeklyGoalTarget(num)}
                    className={`py-3.5 rounded-xl border-2 font-black text-xs uppercase transition-all ${
                      weeklyGoalTarget === num ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917] shadow-xs' : 'bg-[#FAF9F6] border-[#E7E5E4] text-[#1C1917] hover:border-[#1C1917]'
                    }`}
                  >
                    {num} Sessões
                  </button>
                ))}
              </div>

              <div className="w-full h-5 bg-[#F5F5F4] rounded-full overflow-hidden p-0.5 border-2 border-[#1C1917]">
                <div className="h-full bg-[#1C1917] rounded-full transition-all" style={{ width: `${goalProgressPercentage}%` }} />
              </div>
            </section>

            <section className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-6">
              <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917] border-b-2 border-[#E7E5E4] pb-4">
                Conquistas & Badges
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {badgesList.map((badge) => (
                  <div key={badge.id} className="p-4 rounded-2xl border-2 bg-[#FAF9F6] border-[#E7E5E4] flex items-center gap-4">
                    <span className="text-3xl shrink-0">{badge.icon}</span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-black text-[#1C1917] uppercase">{badge.title}</span>
                      <span className="text-[11px] text-[#78716C] font-bold leading-relaxed">{badge.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-150">
            <form onSubmit={handlePasswordChange} className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-6">
              <div className="flex flex-col gap-2 border-b-2 border-[#E7E5E4] pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FAF9F6] bg-[#1C1917] px-3 py-1 rounded-xl w-fit">
                  VERIFICAÇÃO VIA E-MAIL
                </span>
                <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
                  Alterar Senha de Acesso
                </h2>
              </div>

              {passwordError && <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-600 text-red-700 text-xs font-black">{passwordError}</div>}
              {passwordSuccess && <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-600 text-emerald-800 text-xs font-black">{passwordSuccess}</div>}

              <div className="flex flex-col gap-3">
                <label className="text-xs font-black text-[#1C1917] uppercase tracking-wider flex items-center gap-2.5">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${isEmailCodeVerified ? 'bg-emerald-600 text-white' : 'bg-[#1C1917] text-[#FAF9F6]'}`}>
                    {isEmailCodeVerified ? '✓' : '1'}
                  </span>
                  <span>1. Solicitar Código para: <span className="text-[#78716C]">{email}</span></span>
                </label>

                {!emailCodeSent ? (
                  <button
                    type="button"
                    onClick={handleSendEmailCode}
                    className="py-3.5 px-6 bg-[#1C1917] text-[#FAF9F6] font-black text-xs uppercase rounded-xl border-2 border-[#1C1917] hover:bg-[#292524] transition-all w-fit shadow-xs"
                  >
                    Enviar Código de Confirmação por E-mail
                  </button>
                ) : (
                  <div className="flex flex-col gap-3 pt-1">
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 p-3 rounded-xl border-2 border-emerald-200">
                      ✉️ Código enviado! Verifique sua caixa de entrada.
                    </span>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        maxLength={6}
                        disabled={isEmailCodeVerified}
                        placeholder="Digite o código de 6 dígitos..."
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="flex-1 px-4 py-3.5 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-2xl text-xs font-bold outline-none focus:border-[#1C1917] disabled:opacity-75 transition-all"
                      />
                      {!isEmailCodeVerified ? (
                        <button
                          type="button"
                          onClick={handleVerifyEmailCode}
                          className="px-6 py-3.5 bg-[#1C1917] text-[#FAF9F6] font-black text-xs uppercase rounded-xl border-2 border-[#1C1917] hover:bg-[#292524] transition-all shadow-xs"
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
                          className="px-6 py-3.5 bg-[#FAF9F6] text-[#78716C] hover:text-[#1C1917] font-black text-xs uppercase rounded-xl border-2 border-[#E7E5E4]"
                        >
                          Alterar
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {isEmailCodeVerified && (
                <div className="flex flex-col gap-4 pt-4 animate-in fade-in slide-in-from-top-4 duration-300 border-t-2 border-[#E7E5E4]">
                  <label className="text-xs font-black text-[#1C1917] uppercase tracking-wider flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#1C1917] text-[#FAF9F6] flex items-center justify-center text-[11px] font-black shrink-0">
                      2
                    </span>
                    <span>2. Digite e Confirme a Nova Senha</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Nova Senha (Mínimo 6 caracteres)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="px-4 py-3.5 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-2xl text-xs font-bold outline-none focus:border-[#1C1917] transition-all"
                  />
                  <input
                    type="password"
                    placeholder="Confirmar Nova Senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="px-4 py-3.5 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-2xl text-xs font-bold outline-none focus:border-[#1C1917] transition-all"
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    className="py-4 text-xs font-black uppercase tracking-wider bg-[#1C1917] text-[#FAF9F6] rounded-2xl border-2 border-[#1C1917] mt-2 shadow-[2px_2px_0px_0px_#78716C]"
                  >
                    Salvar Nova Senha
                  </Button>
                </div>
              )}
            </form>

            <section className="bg-[#FFFFFF] border-2 border-red-600 rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#DC2626] flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-xl border-2 border-red-200 w-fit">
                ZONA CRÍTICA
              </span>
              <h2 className="text-base font-black uppercase text-red-600">Exclusão Definitiva da Conta</h2>
              <p className="text-xs text-[#57534E] font-medium leading-relaxed">Ação irreversível de remoção permanente de todos os seus dados cadastrais, histórico e conquistas.</p>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="w-fit px-6 py-3 bg-red-50 text-red-600 border-2 border-red-600 font-black text-xs uppercase rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-xs"
              >
                Iniciar Processo de Exclusão
              </button>
            </section>
          </div>
        )}
      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border-2 border-red-600 rounded-3xl p-6 sm:p-8 max-w-md w-full flex flex-col gap-6 shadow-[8px_8px_0px_0px_#DC2626] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b-2 border-red-200 pb-4">
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

            <div className="flex flex-col gap-4 border-t-2 border-[#E7E5E4] pt-5">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black text-[#1C1917] uppercase">1. Digite sua Senha do Perfil *</label>
                <input
                  type="password"
                  value={deletePasswordConfirm}
                  onChange={(e) => setDeletePasswordConfirm(e.target.value)}
                  placeholder="Sua senha atual..."
                  className="px-4 py-3.5 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-2xl text-xs font-bold text-[#1C1917] outline-none focus:border-red-600 transition-all"
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer bg-[#FAF9F6] p-4 rounded-2xl border-2 border-[#E7E5E4]">
                <input
                  type="checkbox"
                  checked={agreeDeleteTerms}
                  onChange={(e) => setAgreeDeleteTerms(e.target.checked)}
                  className="mt-0.5 rounded border-2 border-[#1C1917] text-red-600 focus:ring-red-600 w-4 h-4 shrink-0"
                />
                <span className="text-[11px] font-bold text-[#1C1917] leading-snug">
                  Estou ciente de que a remoção é irreversível e não poderei recuperar este perfil.
                </span>
              </label>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black text-[#1C1917] uppercase">
                  2. Digite "EXCLUIR PERMANENTEMENTE" *
                </label>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="EXCLUIR PERMANENTEMENTE"
                  className="px-4 py-3.5 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-2xl text-xs font-bold text-[#1C1917] outline-none focus:border-red-600 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3.5 bg-[#FAF9F6] hover:bg-[#F5F5F4] border-2 border-[#1C1917] text-xs font-black uppercase rounded-2xl transition-all"
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
                className="flex-1 py-3.5 bg-red-600 text-white text-xs font-black uppercase rounded-2xl border-2 border-red-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all hover:bg-red-700"
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
            <div className="flex items-center justify-between border-b-2 border-[#E7E5E4] pb-4">
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-black uppercase text-[#1C1917]">
                  Explorar Tópicos
                </h3>
                <span className="text-[10px] font-black uppercase bg-[#1C1917] text-[#FAF9F6] px-2.5 py-1 rounded-xl">
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
              className="px-4 py-3.5 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-2xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] transition-all"
            />

            <div className="flex flex-col gap-6">
              {INTERESTS_LIBRARY.map((cat) => {
                const filteredItems = cat.items.filter((item) =>
                  item.toLowerCase().includes(topicSearch.toLowerCase())
                );
                if (filteredItems.length === 0) return null;

                return (
                  <div key={cat.category} className="flex flex-col gap-2.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#78716C]">
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
                            className={`px-3.5 py-2.5 rounded-xl border-2 text-xs font-black transition-all ${
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
              className="w-full py-4 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-black text-xs uppercase tracking-widest rounded-2xl transition-all border-2 border-[#1C1917] shadow-sm"
            >
              Concluir Seleção ({selectedInterests.length}/5)
            </button>
          </div>
        </div>
      )}

      {showPublicPreview && (
        <div className="fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[8px_8px_0px_0px_#1C1917] flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-[#E7E5E4] pb-4">
              <span className="text-[10px] font-black uppercase tracking-widest bg-[#FAF9F6] border-2 border-[#1C1917] text-[#1C1917] px-3 py-1 rounded-xl">
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

            <div className="flex flex-col items-center text-center gap-4">
              <div 
                onClick={() => setIsAvatarExpanded(true)}
                className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#1C1917] bg-[#F5F5F4] shadow-sm cursor-pointer relative group transition-transform hover:scale-105"
                title="Clique para expandir a foto"
              >
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <svg className="w-5 h-5 text-white stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                  </svg>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <h3 className="text-lg font-black uppercase text-[#1C1917]">{name}</h3>
                  <span className="px-2.5 py-0.5 bg-[#1C1917] text-[#FAF9F6] font-black text-xs rounded-xl uppercase">
                    {cefrLevel}
                  </span>
                </div>
                {tag && (
                  <span className="px-2.5 py-0.5 bg-[#FAF9F6] border-2 border-[#1C1917] text-[#1C1917] font-black text-xs rounded-xl">
                    #{tag}
                  </span>
                )}

                <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-[#78716C]">
                  {showAgeInProfile && birthDate && <span>{calculateAge(birthDate)} anos</span>}
                  {showAgeInProfile && birthDate && <span>•</span>}
                  <span>{gender}</span>
                  <span>•</span>
                  <span className="italic">{pronouns}</span>
                </div>
                
                <div className="flex flex-wrap justify-center gap-2 mt-1">
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border-2 border-emerald-200">
                    Reputação: {evolutionStats.reputationScore}
                  </span>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-xl border-2 border-amber-200">
                    🔥 {currentStreak} Dias de Ofensiva
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFriendRequestSent(!friendRequestSent)}
                className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border-2 border-[#1C1917] flex items-center justify-center gap-2 shadow-xs ${
                  friendRequestSent
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-600'
                    : 'bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6]'
                }`}
              >
                {friendRequestSent ? (
                  <>
                    <svg className="w-4 h-4 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Solicitação Enviada
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                    </svg>
                    Enviar Solicitação de Amizade
                  </>
                )}
              </button>

              <p className="text-xs text-[#57534E] font-medium leading-relaxed italic bg-[#FAF9F6] p-4 rounded-2xl border-2 border-[#E7E5E4] w-full text-left">
                "{bio || 'Sem biografia informada.'}"
              </p>

              <div className="flex flex-col gap-3 w-full pt-2 text-left border-t-2 border-[#E7E5E4]">
                <span className="text-[11px] font-black uppercase text-[#78716C] tracking-wider">
                  Avaliações e Comentários da Comunidade ({receivedFeedback.length}):
                </span>
                {receivedFeedback.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-[#E7E5E4] bg-[#FAF9F6] p-4 text-center text-[11px] font-black uppercase tracking-wider text-[#78716C]">
                    Ainda não há avaliações registradas.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {receivedFeedback.map((fb) => (
                      <div
                        key={fb.id}
                        className="bg-[#FAF9F6] p-4 rounded-2xl border-2 border-[#E7E5E4] flex flex-col gap-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-[#1C1917] uppercase">{fb.author}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-amber-600">
                              {'★'.repeat(fb.rating)}
                            </span>
                            <span className="text-[10px] font-bold text-[#A8A29E] uppercase">{fb.date}</span>
                          </div>
                        </div>
                        <p className="text-xs text-[#57534E] font-medium italic leading-relaxed">
                          "{fb.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2.5 w-full pt-2 text-left">
                <span className="text-[11px] font-black uppercase text-[#78716C] tracking-wider">
                  Conquistas Desbloqueadas:
                </span>
                {badgesList.filter((b) => b.unlocked).length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-[#E7E5E4] bg-[#FAF9F6] p-4 text-center text-[11px] font-black uppercase tracking-wider text-[#78716C]">
                    Ainda não há conquistas desbloqueadas.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {badgesList.filter((b) => b.unlocked).map((badge) => (
                      <div key={badge.id} className="p-3 rounded-xl bg-[#FAF9F6] border-2 border-[#E7E5E4] flex items-center gap-2.5">
                        <span className="text-xl">{badge.icon}</span>
                        <span className="text-[11px] font-black text-[#1C1917] uppercase truncate">{badge.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedInterests.length > 0 && (
                <div className="flex flex-col gap-2.5 w-full pt-2 text-left">
                  <span className="text-[11px] font-black uppercase text-[#78716C] tracking-wider">
                    Interesses de Conversa:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedInterests.map((interest) => (
                      <span
                        key={interest}
                        className="text-[11px] font-black px-3 py-1.5 bg-[#FAF9F6] border-2 border-[#1C1917] text-[#1C1917] rounded-xl"
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
              className="w-full py-3.5 bg-[#FAF9F6] hover:bg-[#F5F5F4] border-2 border-[#1C1917] text-[#1C1917] font-black text-xs uppercase tracking-widest rounded-2xl transition-all"
            >
              Fechar Visualização
            </button>
          </div>
        </div>
      )}

      {isAvatarExpanded && (
        <div 
          onClick={() => setIsAvatarExpanded(false)}
          className="fixed inset-0 bg-[#1C1917]/85 backdrop-blur-md z-[100] flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
        >
          <div className="relative max-w-lg w-full flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
            <img 
              src={avatarUrl} 
              alt={name} 
              className="w-full max-h-[80vh] object-contain rounded-3xl border-4 border-[#FFFFFF] shadow-2xl" 
            />
            <button
              type="button"
              onClick={() => setIsAvatarExpanded(false)}
              className="px-6 py-3 bg-[#FFFFFF] text-[#1C1917] font-black text-xs uppercase tracking-widest rounded-2xl border-2 border-[#1C1917] hover:bg-[#F5F5F4] transition-all shadow-md"
            >
              Fechar Imagem
            </button>
          </div>
        </div>
      )}
    </div>
  );
};