import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'general' | 'social' | 'stats' | 'security'>('general');

  // Estado do Modal de Perfil Público e Solicitação de Amizade
  const [showPublicPreview, setShowPublicPreview] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);

  // Estados SBS-34: Dados Pessoais e Nível CEFR
  const [name, setName] = useState('Lucas Silva');
  const [email, setEmail] = useState('lucas.silva@email.com');
  const [cefrLevel, setCefrLevel] = useState('B1');
  const [avatarUrl, setAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  );

  // Estados SBS-41: Biografia e Interesses ("Sobre Mim")
  const [bio, setBio] = useState(
    'Desenvolvedor de software focado em evoluir no inglês para entrevistas e reuniões internacionais.'
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Tecnologia',
    'Viagens',
    'Carreira & Negócios',
  ]);
  const availableInterests = [
    'Tecnologia',
    'Viagens',
    'Carreira & Negócios',
    'Cinema & Séries',
    'Música',
    'Esportes',
  ];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  // Estados SBS-35: Conexão e Privacidade
  const [defaultMediaMode, setDefaultMediaMode] = useState<'video' | 'audio'>('video');
  const [expandedMatching, setExpandedMatching] = useState(true);
  const [showEmailInProfile, setShowEmailInProfile] = useState(false);
  const [allowDirectReconnect, setAllowDirectReconnect] = useState(true);

  // Estados SBS-36: Segurança
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Estados SBS-37: Metas Semanais e Gamificação
  const [weeklyGoalTarget, setWeeklyGoalTarget] = useState(5);
  const [weeklyGoalCompleted] = useState(3);
  const [currentStreak] = useState(5);

  const badgesList = [
    { id: 'first_chat', title: 'Primeira Conversa', desc: 'Sessão inicial concluída', unlocked: true, icon: '💬' },
    { id: 'streak_5', title: '5 Dias de Ofensiva', desc: 'Prática contínua', unlocked: true, icon: '🔥' },
    { id: 'minutes_100', title: '100 Minutos Falados', desc: '+100 minutos em sala', unlocked: true, icon: '⏱️' },
    { id: 'level_b2', title: 'Rumo ao B2', desc: '10 treinos no nível B1', unlocked: false, icon: '🎓' },
  ];

  // Dados SBS-38: Estatísticas Detalhadas
  const evolutionStats = {
    reputationScore: '98/100',
    topicsDistribution: [
      { name: 'Viagens & Culturas', percentage: 45, color: 'bg-emerald-500' },
      { name: 'Trabalho & Tecnologia', percentage: 35, color: 'bg-amber-500' },
      { name: 'Estilo de Vida & Hábitos', percentage: 20, color: 'bg-sky-500' },
    ],
    partnerLevels: [
      { level: 'A2 (Básico)', count: 2 },
      { level: 'B1 (Intermediário)', count: 8 },
      { level: 'B2 (Avançado)', count: 2 },
    ],
  };

  // Estados SBS-39: Parceiros Favoritos & Notas Privadas
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

  // Estados SBS-40: Calendário de Disponibilidade
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Preencha todos os campos de senha.');
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

    setPasswordSuccess('Senha alterada com sucesso!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(null), 3000);
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmationText === 'EXCLUIR') {
      alert('Sua conta e dados foram removidos permanentemente.');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1917] flex flex-col font-sans selection:bg-[#1C1917] selection:text-[#FAF9F6]">
      {/* Header Bar */}
      <header className="bg-[#FFFFFF] border-b border-[#E7E5E4] px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-8 h-8 rounded-md bg-[#1C1917] flex items-center justify-center font-black text-[#FAF9F6] text-base">
            S
          </div>
          <span className="text-lg font-black tracking-tight text-[#1C1917] uppercase">SideBySide</span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-[#F5F5F4] hover:bg-[#E7E5E4] border border-[#E7E5E4] text-[#1C1917] font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
        >
          <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Voltar
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 lg:p-8 flex flex-col gap-6">
        {/* Top Header Card */}
        <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative group w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#E7E5E4] bg-[#F5F5F4] shrink-0">
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              <label className="absolute inset-0 bg-[#1C1917]/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                <svg className="w-5 h-5 stroke-[#FAF9F6] fill-none stroke-2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
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
              className="py-2.5 px-4 bg-[#F5F5F4] hover:bg-[#E7E5E4] border border-[#E7E5E4] text-[#1C1917] font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
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
              className="py-2.5 px-5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Salvar Perfil
            </Button>
          </div>
        </section>

        {/* Abas de Navegação */}
        <div className="grid grid-cols-2 sm:grid-cols-4 bg-[#FFFFFF] border border-[#E7E5E4] p-1.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-sm">
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

        {/* Mensagem de Sucesso */}
        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-150">
            <svg className="w-4 h-4 shrink-0 fill-current text-emerald-600" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            <span>Alterações salvas com sucesso!</span>
          </div>
        )}

        {/* CONTEÚDO DA ABA 1: GERAL & BIO */}
        {activeTab === 'general' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-150">
            <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
              <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917] border-b border-[#E7E5E4] pb-3">
                Informações Pessoais
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Nome Completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 pt-2">
                <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Mini Biografia</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] resize-none"
                />
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-[#E7E5E4]">
                <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Tópicos de Interesse</label>
                <div className="flex flex-wrap gap-2">
                  {availableInterests.map((interest) => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]'
                            : 'bg-[#FAF9F6] text-[#78716C] border-[#E7E5E4] hover:border-[#1C1917]'
                        }`}
                      >
                        {isSelected ? `✓ ${interest}` : `+ ${interest}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* CEFR Level Selection */}
            <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
              <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917] border-b border-[#E7E5E4] pb-3">
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
                      className={`p-3.5 rounded-xl border text-left flex items-center justify-between gap-4 transition-all ${
                        isSelected
                          ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]'
                          : 'bg-[#FAF9F6] text-[#1C1917] border-[#E7E5E4] hover:border-[#1C1917]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-lg font-black text-xs flex items-center justify-center ${isSelected ? 'bg-[#292524] text-[#FAF9F6]' : 'bg-[#E7E5E4] text-[#1C1917]'}`}>
                          {item.code}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold uppercase">{item.label}</span>
                          <span className={`text-[11px] font-medium ${isSelected ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
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

        {/* CONTEÚDO DA ABA 2: AGENDA & PARCEIROS */}
        {activeTab === 'social' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-150">
            {/* Disponibilidade */}
            <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-[#E7E5E4] pb-3">
                <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
                  Agenda de Disponibilidade
                </h2>
                <span className="text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-200">
                  🔥 Pico: Noite (18h-22h)
                </span>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[480px] flex flex-col gap-2">
                  <div className="grid grid-cols-8 gap-2 text-center text-[10px] font-black uppercase text-[#78716C] pb-1 border-b border-[#E7E5E4]">
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
                            className={`py-2 rounded-lg border text-[10px] font-extrabold uppercase transition-all ${
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

            {/* Parceiros Favoritos */}
            <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
              <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917] border-b border-[#E7E5E4] pb-3">
                Parceiros Favoritos
              </h2>

              <div className="flex flex-col gap-3">
                {favoritePartners.map((partner) => (
                  <div key={partner.id} className="bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <img src={partner.avatar} alt={partner.name} className="w-10 h-10 rounded-xl object-cover border" />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[#1C1917]">{partner.name} ({partner.level})</span>
                          <span className="text-[10px] font-medium text-[#78716C]">{partner.isOnline ? 'Online' : 'Offline'}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-[#57534E] italic bg-[#FFFFFF] p-2.5 rounded-lg border border-[#E7E5E4]">
                      "{partner.note}"
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* CONTEÚDO DA ABA 3: METAS & EVOLUÇÃO */}
        {activeTab === 'stats' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-150">
            {/* Metas Semanais */}
            <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-[#E7E5E4] pb-3">
                <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
                  Meta Semanal de Prática
                </h2>
                <span className="text-xs font-bold text-[#78716C]">{weeklyGoalCompleted}/{weeklyGoalTarget} Concluídas</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[3, 5, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setWeeklyGoalTarget(num)}
                    className={`py-3 rounded-xl border font-bold text-xs uppercase ${
                      weeklyGoalTarget === num ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]' : 'bg-[#FAF9F6] border-[#E7E5E4]'
                    }`}
                  >
                    {num} Sessões
                  </button>
                ))}
              </div>

              <div className="w-full h-3 bg-[#F5F5F4] rounded-full overflow-hidden p-0.5 border border-[#E7E5E4]">
                <div className="h-full bg-[#1C1917] rounded-full transition-all" style={{ width: `${goalProgressPercentage}%` }} />
              </div>
            </section>

            {/* Badges e Relatório */}
            <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
              <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917] border-b border-[#E7E5E4] pb-3">
                Conquistas & Badges
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {badgesList.map((badge) => (
                  <div key={badge.id} className="p-3.5 rounded-xl border bg-[#FAF9F6] border-[#E7E5E4] flex items-center gap-3">
                    <span className="text-2xl">{badge.icon}</span>
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

        {/* CONTEÚDO DA ABA 4: SEGURANÇA */}
        {activeTab === 'security' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-150">
            <form onSubmit={handlePasswordChange} className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
              <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917] border-b border-[#E7E5E4] pb-3">
                Alterar Senha
              </h2>

              {passwordError && <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-bold">{passwordError}</div>}
              {passwordSuccess && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold">{passwordSuccess}</div>}

              <div className="flex flex-col gap-3">
                <input
                  type="password"
                  placeholder="Senha Atual"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="px-4 py-2.5 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold outline-none"
                />
                <input
                  type="password"
                  placeholder="Nova Senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="px-4 py-2.5 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold outline-none"
                />
                <input
                  type="password"
                  placeholder="Confirmar Nova Senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="px-4 py-2.5 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold outline-none"
                />
              </div>

              <Button type="submit" variant="primary" className="py-3 text-xs font-bold uppercase tracking-wider bg-[#1C1917] text-[#FAF9F6] rounded-xl">
                Atualizar Senha
              </Button>
            </form>

            <section className="bg-[#FFFFFF] border border-red-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-3">
              <h2 className="text-base font-black uppercase text-red-600">Exclusão Definitiva da Conta</h2>
              <p className="text-xs text-[#57534E]">Ação irreversível de remoção permanente de todos os seus dados cadastrais.</p>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="w-fit px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 font-bold text-xs uppercase rounded-xl"
              >
                Encerrar Conta
              </button>
            </section>
          </div>
        )}
      </main>

      {/* Modal de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-[#1C1917]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-red-200 rounded-2xl p-6 max-w-md w-full flex flex-col gap-4">
            <h3 className="text-base font-black uppercase text-red-600">Confirmar Exclusão</h3>
            <p className="text-xs text-[#57534E]">Digite "EXCLUIR" para apagar permanentemente seus dados.</p>
            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="EXCLUIR"
              className="px-4 py-2.5 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 bg-[#F5F5F4] text-xs font-bold uppercase rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleteConfirmationText !== 'EXCLUIR'}
                onClick={handleDeleteAccount}
                className="flex-1 py-2.5 bg-red-600 text-white text-xs font-bold uppercase rounded-xl disabled:opacity-50"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização do Perfil Público Expandido */}
      {showPublicPreview && (
        <div className="fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-3">
              <span className="text-[10px] font-black uppercase tracking-widest bg-[#F5F5F4] text-[#78716C] px-2.5 py-1 rounded border border-[#E7E5E4]">
                COMO OS OUTROS TE VEEM
              </span>
              <button
                type="button"
                onClick={() => setShowPublicPreview(false)}
                className="text-sm font-bold text-[#78716C] hover:text-[#1C1917]"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#E7E5E4] bg-[#F5F5F4]">
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black uppercase text-[#1C1917]">{name}</h3>
                  <span className="px-2 py-0.5 bg-[#1C1917] text-[#FAF9F6] font-black text-[10px] rounded uppercase">
                    {cefrLevel}
                  </span>
                </div>
                {showEmailInProfile && (
                  <span className="text-xs font-bold text-[#78716C]">{email}</span>
                )}
                
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Reputação: {evolutionStats.reputationScore}
                  </span>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    🔥 {currentStreak} Dias de Ofensiva
                  </span>
                </div>
              </div>

              {/* Botão de Solicitação de Amizade */}
              <button
                type="button"
                onClick={() => setFriendRequestSent(!friendRequestSent)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  friendRequestSent
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
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

              <p className="text-xs text-[#57534E] font-medium leading-relaxed italic bg-[#FAF9F6] p-3 rounded-xl border border-[#E7E5E4] w-full text-left">
                "{bio || 'Sem biografia informada.'}"
              </p>

              {/* Conquistas / Badges no Perfil Público */}
              <div className="flex flex-col gap-1.5 w-full pt-1 text-left">
                <span className="text-[10px] font-bold uppercase text-[#78716C]">
                  Conquistas Desbloqueadas:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {badgesList.filter((b) => b.unlocked).map((badge) => (
                    <div key={badge.id} className="p-2 rounded-lg bg-[#FAF9F6] border border-[#E7E5E4] flex items-center gap-2">
                      <span className="text-base">{badge.icon}</span>
                      <span className="text-[10px] font-bold text-[#1C1917] uppercase truncate">{badge.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tópicos de Interesse */}
              {selectedInterests.length > 0 && (
                <div className="flex flex-col gap-1.5 w-full pt-1 text-left">
                  <span className="text-[10px] font-bold uppercase text-[#78716C]">
                    Interesses de Conversa:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedInterests.map((interest) => (
                      <span
                        key={interest}
                        className="text-[10px] font-bold px-2.5 py-1 bg-[#F5F5F4] border border-[#E7E5E4] text-[#1C1917] rounded-md"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Agenda / Resumo de Disponibilidade */}
              <div className="flex flex-col gap-1.5 w-full pt-1 text-left">
                <span className="text-[10px] font-bold uppercase text-[#78716C]">
                  Horários Frequentes:
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedAvailability.length > 0 ? (
                    selectedAvailability.map((slot) => (
                      <span key={slot} className="text-[10px] font-semibold px-2 py-0.5 bg-[#FAF9F6] border border-[#E7E5E4] text-[#57534E] rounded">
                        {slot.split(' ')[0]}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-[#78716C]">Sem agenda cadastrada</span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPublicPreview(false)}
              className="w-full py-3 bg-[#F5F5F4] hover:bg-[#E7E5E4] border border-[#E7E5E4] text-[#1C1917] font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
            >
              Fechar Visualização
            </button>
          </div>
        </div>
      )}
    </div>
  );
};