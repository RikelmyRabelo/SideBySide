import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const Profile: React.FC = () => {
  const navigate = useNavigate();

  // Estados SBS-34: Dados Pessoais e Nível CEFR
  const [name, setName] = useState('Lucas Silva');
  const [email, setEmail] = useState('lucas.silva@email.com');
  const [cefrLevel, setCefrLevel] = useState('B1');
  const [avatarUrl, setAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  );

  // Estados SBS-41: Biografia e Interesses ("Sobre Mim")
  const [bio, setBio] = useState(
    'Desenvolvedor de software focado em evoluir no inglês para entrevistas e reuniões internacionais. Adoro conversar sobre tecnologia, viagens e música.'
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Tecnologia',
    'Viagens',
    'Carreira & Negócios',
    'Música',
  ]);
  const availableInterests = [
    'Tecnologia',
    'Viagens',
    'Carreira & Negócios',
    'Cinema & Séries',
    'Música',
    'Esportes',
    'Leitura',
    'Culinária',
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
  const badgesList = [
    {
      id: 'first_chat',
      title: 'Primeira Conversa',
      desc: 'Realizou a primeira sessão ao vivo na plataforma',
      unlocked: true,
      icon: '💬',
    },
    {
      id: 'streak_5',
      title: '5 Dias de Ofensiva',
      desc: 'Manteve a prática diária ativa por 5 dias seguidos',
      unlocked: true,
      icon: '🔥',
    },
    {
      id: 'minutes_100',
      title: '100 Minutos Falados',
      desc: 'Soma total de mais de 100 minutos em chamadas',
      unlocked: true,
      icon: '⏱️',
    },
    {
      id: 'level_b2',
      title: 'Rumo ao B2',
      desc: 'Completou 10 conversas na categoria intermediária',
      unlocked: false,
      icon: '🎓',
    },
  ];

  // Dados SBS-38: Estatísticas Detalhadas & Relatório de Evolução
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
  const [favoriteSearch, setFavoriteSearch] = useState('');
  const [favoritePartners, setFavoritePartners] = useState([
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

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNoteText, setSaveTempNoteText] = useState('');

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
    { code: 'A2', label: 'Básico', desc: 'Comunica-se em tarefas rotineiras e simples.' },
    { code: 'B1', label: 'Intermediário', desc: 'Mantém conversas sobre temas familiares.' },
    { code: 'B2', label: 'Intermediário Avançado', desc: 'Fala com fluência e espontaneidade.' },
    { code: 'C1', label: 'Avançado', desc: 'Expressa-se de forma fluida e bem estruturada.' },
  ];

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: '', color: 'bg-[#E7E5E4]', width: 'w-0' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { label: 'Fraca', color: 'bg-red-500', width: 'w-1/3' };
    if (score <= 3) return { label: 'Média', color: 'bg-amber-500', width: 'w-2/3' };
    return { label: 'Forte', color: 'bg-emerald-500', width: 'w-full' };
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const goalProgressPercentage = Math.min(100, Math.round((weeklyGoalCompleted / weeklyGoalTarget) * 100));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
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

  const handleSaveNote = (partnerId: string) => {
    setFavoritePartners((prev) =>
      prev.map((partner) =>
        partner.id === partnerId ? { ...partner, note: tempNoteText } : partner
      )
    );
    setEditingNoteId(null);
  };

  const handleRemoveFavorite = (partnerId: string) => {
    setFavoritePartners((prev) => prev.filter((p) => p.id !== partnerId));
  };

  const filteredPartners = favoritePartners.filter((p) =>
    p.name.toLowerCase().includes(favoriteSearch.toLowerCase())
  );

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
          className="px-4 py-2 bg-[#F5F5F4] hover:bg-[#E7E5E4] border border-[#E7E5E4] text-[#1C1917] font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
        >
          ← Voltar para Dashboard
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 lg:p-8 flex flex-col gap-6">
        {/* Banner do Perfil */}
        <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-2">
          <span className="text-[10px] font-bold tracking-widest text-[#78716C] uppercase bg-[#F5F5F4] border border-[#E7E5E4] px-3 py-1 rounded-md w-fit">
            CONFIGURAÇÕES DA CONTA
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#1C1917] mt-1">
            Meu Perfil
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E] max-w-xl leading-relaxed font-medium">
            Gerencie suas informações cadastrais, biografia, agenda de estudos, parceiros favoritos e privacidade.
          </p>
        </section>

        {/* Mensagem de Sucesso Geral */}
        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-150">
            <svg className="w-4 h-4 shrink-0 fill-current text-emerald-600" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            <span>Preferências salvas com sucesso!</span>
          </div>
        )}

        {/* SBS-41: Seção "Sobre Mim" e Interesses */}
        <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="border-b border-[#E7E5E4] pb-4">
            <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
              Sobre Mim & Interesses
            </h2>
            <p className="text-xs text-[#78716C] font-medium">
              Sua biografia e tópicos ajudam a quebrar o gelo nas primeiras frases das chamadas.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
                Mini Biografia
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Escreva uma breve introdução sobre você e seus objetivos no inglês..."
                className="w-full p-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] resize-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
                Tópicos de Interesse
              </label>
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
          </div>
        </section>

        {/* SBS-40: Calendário de Disponibilidade Diária & Horários de Pico */}
        <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E7E5E4] pb-4">
            <div>
              <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
                Agenda de Disponibilidade
              </h2>
              <p className="text-xs text-[#78716C] font-medium">
                Marque os turnos em que costuma ficar livre para otimizar o pareamento.
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-[#F5F5F4] border border-[#E7E5E4] rounded-lg text-[10px] font-bold text-[#1C1917] uppercase w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Pico de usuários: Noite (18h-22h)
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[500px] flex flex-col gap-2">
              <div className="grid grid-cols-8 gap-2 text-center text-[10px] font-black uppercase text-[#78716C] pb-1 border-b border-[#E7E5E4]">
                <span>Turno</span>
                {weekDays.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              {timeSlots.map((slot) => (
                <div key={slot} className="grid grid-cols-8 gap-2 items-center">
                  <span className="text-[10px] font-bold text-[#1C1917] uppercase leading-tight">
                    {slot.split(' ')[0]}
                  </span>
                  {weekDays.map((day) => {
                    const slotKey = `${day}-${slot}`;
                    const isSelected = selectedAvailability.includes(slotKey);
                    const isPeak = slot.includes('Noite');
                    return (
                      <button
                        key={slotKey}
                        type="button"
                        onClick={() => toggleAvailabilitySlot(slotKey)}
                        className={`py-2.5 rounded-lg border text-[10px] font-extrabold uppercase transition-all flex items-center justify-center ${
                          isSelected
                            ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]'
                            : isPeak
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:border-[#1C1917]'
                            : 'bg-[#FAF9F6] text-[#A8A29E] border-[#E7E5E4] hover:border-[#1C1917]'
                        }`}
                      >
                        {isSelected ? '✓' : isPeak ? '🔥' : '+'}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SBS-39: Parceiros Favoritos & Notas Privadas */}
        <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7E5E4] pb-4">
            <div>
              <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
                Parceiros Favoritos
              </h2>
              <p className="text-xs text-[#78716C] font-medium">
                Gerencie suas conexões salvas e mantenha anotações privadas pós-conversa.
              </p>
            </div>

            <input
              type="text"
              placeholder="Buscar parceiro..."
              value={favoriteSearch}
              onChange={(e) => setFavoriteSearch(e.target.value)}
              className="px-3.5 py-2 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] w-full sm:w-48"
            />
          </div>

          {filteredPartners.length > 0 ? (
            <div className="flex flex-col gap-4">
              {filteredPartners.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-[#D6D3D1] bg-[#E7E5E4] shrink-0">
                        <img src={partner.avatar} alt={partner.name} className="w-full h-full object-cover" />
                        <span
                          className={`absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                            partner.isOnline ? 'bg-emerald-500' : 'bg-stone-300'
                          }`}
                        />
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#1C1917]">{partner.name}</span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#E7E5E4] text-[#1C1917] rounded-md">
                            {partner.level}
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-[#78716C]">
                          {partner.isOnline ? 'Disponível agora' : 'Offline'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveFavorite(partner.id)}
                        className="px-3 py-1.5 text-[#78716C] hover:text-red-600 text-xs font-bold uppercase transition-colors"
                      >
                        Remover
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#FFFFFF] border border-[#E7E5E4] p-3 rounded-lg flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase text-[#78716C]">
                        Sua Nota Privada
                      </span>
                      {editingNoteId !== partner.id && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNoteId(partner.id);
                            setSaveTempNoteText(partner.note);
                          }}
                          className="text-[10px] font-bold uppercase text-[#1C1917] underline"
                        >
                          Editar Nota
                        </button>
                      )}
                    </div>

                    {editingNoteId === partner.id ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          rows={2}
                          value={tempNoteText}
                          onChange={(e) => setSaveTempNoteText(e.target.value)}
                          className="w-full p-2 bg-[#FAF9F6] border border-[#E7E5E4] rounded-md text-xs font-medium text-[#1C1917] outline-none focus:border-[#1C1917] resize-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingNoteId(null)}
                            className="px-3 py-1 bg-[#F5F5F4] text-[#78716C] rounded text-xs font-bold uppercase"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveNote(partner.id)}
                            className="px-3 py-1 bg-[#1C1917] text-[#FAF9F6] rounded text-xs font-bold uppercase"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-[#57534E] font-medium italic">
                        "{partner.note || 'Nenhuma nota gravada.'}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs font-bold text-[#78716C] bg-[#FAF9F6] border border-dashed border-[#D6D3D1] rounded-xl">
              Nenhum parceiro favorito encontrado.
            </div>
          )}
        </section>

        {/* SBS-38: Relatório de Evolução */}
        <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4">
            <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
              Relatório de Evolução & Métricas
            </h2>
            <span className="text-xs font-bold text-[#78716C] uppercase">
              Reputação: <strong className="text-[#1C1917]">{evolutionStats.reputationScore}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl p-5 flex flex-col gap-4">
              <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
                Tempo por Tópico Praticado
              </span>
              <div className="flex flex-col gap-3">
                {evolutionStats.topicsDistribution.map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-xs font-bold text-[#1C1917]">
                      <span>{item.name}</span>
                      <span>{item.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#E7E5E4] rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl p-5 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
                  Nível dos Parceiros Pareados
                </span>
                <span className="text-xs text-[#57534E] font-medium">
                  Total de conversas com cada nível CEFR
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {evolutionStats.partnerLevels.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[#FFFFFF] border border-[#E7E5E4] px-3 py-2 rounded-lg text-xs font-bold">
                    <span className="text-[#1C1917]">{item.level}</span>
                    <span className="bg-[#F5F5F4] px-2 py-0.5 rounded text-[#78716C]">{item.count} conexões</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SBS-37: Painel de Metas Semanais */}
        <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4">
            <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
              Metas Semanais & Conquistas
            </h2>
            <span className="text-xs font-bold text-[#78716C] uppercase">
              Ciclo Atual: {weeklyGoalCompleted} / {weeklyGoalTarget}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
              Sessões Desejadas por Semana
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[3, 5, 7].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setWeeklyGoalTarget(num)}
                  className={`py-3 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all ${
                    weeklyGoalTarget === num
                      ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917] shadow-md'
                      : 'bg-[#FAF9F6] text-[#1C1917] border-[#E7E5E4] hover:border-[#1C1917]'
                  }`}
                >
                  {num} Sessões
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex justify-between items-center text-xs font-bold text-[#1C1917]">
                <span>Progresso Semanal</span>
                <span>{goalProgressPercentage}% concluído</span>
              </div>
              <div className="w-full h-3 bg-[#F5F5F4] border border-[#E7E5E4] rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-[#1C1917] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${goalProgressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
              Conquistas Desbloqueadas
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {badgesList.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                    badge.unlocked
                      ? 'bg-[#FAF9F6] border-[#E7E5E4] text-[#1C1917]'
                      : 'bg-[#F5F5F4] border-[#E7E5E4] text-[#A8A29E] opacity-60'
                  }`}
                >
                  <span className="text-2xl shrink-0">{badge.icon}</span>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase">{badge.title}</span>
                      {badge.unlocked && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-[#1C1917] text-[#FAF9F6] rounded">
                          Ativo
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-medium leading-snug">{badge.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Formulário Principal */}
        <form onSubmit={handleSubmit} className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-8">
          
          {/* SBS-34: Foto do Perfil */}
          <div className="flex flex-col gap-4 border-b border-[#E7E5E4] pb-6">
            <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
              Foto do Perfil
            </h2>

            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#E7E5E4] bg-[#F5F5F4] shrink-0">
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="px-4 py-2 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all w-fit">
                  Alterar Foto
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
                <span className="text-[11px] font-medium text-[#78716C]">
                  Recomendado: Imagem quadrada em formato JPG ou PNG.
                </span>
              </div>
            </div>
          </div>

          {/* SBS-34: Informações Pessoais */}
          <div className="flex flex-col gap-4 border-b border-[#E7E5E4] pb-6">
            <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
              Informações Pessoais
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] w-full"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] w-full"
                  required
                />
              </div>
            </div>
          </div>

          {/* SBS-34: Nível CEFR */}
          <div className="flex flex-col gap-4 border-b border-[#E7E5E4] pb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
                Nível de Fluência (CEFR)
              </h2>
              <span className="text-xs font-bold text-[#78716C] uppercase">
                Atual: <strong className="text-[#1C1917]">{cefrLevel}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {cefrLevelsInfo.map((item) => {
                const isSelected = cefrLevel === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setCefrLevel(item.code)}
                    className={`p-4 rounded-xl border text-left flex items-center justify-between gap-4 transition-all ${
                      isSelected
                        ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917] shadow-md'
                        : 'bg-[#FAF9F6] text-[#1C1917] border-[#E7E5E4] hover:border-[#1C1917]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-9 h-9 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#292524] text-[#FAF9F6]' : 'bg-[#E7E5E4] text-[#1C1917]'
                        }`}
                      >
                        {item.code}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase">{item.label}</span>
                        <span
                          className={`text-[11px] font-medium leading-snug ${
                            isSelected ? 'text-[#A8A29E]' : 'text-[#78716C]'
                          }`}
                        >
                          {item.desc}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[#FAF9F6] bg-[#FAF9F6]' : 'border-[#D6D3D1]'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-[#1C1917]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SBS-35: Preferências de Conexão */}
          <div className="flex flex-col gap-4 border-b border-[#E7E5E4] pb-6">
            <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
              Preferências de Conexão
            </h2>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
                  Modo de Mídia Padrão
                </label>
                <div className="grid grid-cols-2 bg-[#F5F5F4] p-1 rounded-xl border border-[#E7E5E4] text-xs font-bold uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => setDefaultMediaMode('video')}
                    className={`py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
                      defaultMediaMode === 'video' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-sm' : 'text-[#78716C]'
                    }`}
                  >
                    Vídeo + Áudio
                  </button>
                  <button
                    type="button"
                    onClick={() => setDefaultMediaMode('audio')}
                    className={`py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
                      defaultMediaMode === 'audio' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-sm' : 'text-[#78716C]'
                    }`}
                  >
                    Apenas Áudio
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-[#FAF9F6] border border-[#E7E5E4] p-4 rounded-xl">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-[#1C1917]">Pareamento Ampliado</span>
                  <span className="text-[11px] text-[#78716C] font-medium">
                    Permitir conectar com níveis adjacentes (ex: A2 e B2 para nível B1)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedMatching(!expandedMatching)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
                    expandedMatching ? 'bg-[#1C1917]' : 'bg-[#E7E5E4]'
                  }`}
                >
                  <div
                    className={`bg-[#FFFFFF] w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      expandedMatching ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* SBS-35: Opções de Privacidade */}
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
              Privacidade da Conta
            </h2>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between bg-[#FAF9F6] border border-[#E7E5E4] p-4 rounded-xl">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-[#1C1917]">Exibir E-mail no Perfil Público</span>
                  <span className="text-[11px] text-[#78716C] font-medium">
                    Tornar seu endereço de e-mail visível para os seus parceiros de conversa
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmailInProfile(!showEmailInProfile)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
                    showEmailInProfile ? 'bg-[#1C1917]' : 'bg-[#E7E5E4]'
                  }`}
                >
                  <div
                    className={`bg-[#FFFFFF] w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      showEmailInProfile ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between bg-[#FAF9F6] border border-[#E7E5E4] p-4 rounded-xl">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-[#1C1917]">Permitir Reconexões Diretas</span>
                  <span className="text-[11px] text-[#78716C] font-medium">
                    Permitir que parceiros recentes enviem solicitações diretas de conversa
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowDirectReconnect(!allowDirectReconnect)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
                    allowDirectReconnect ? 'bg-[#1C1917]' : 'bg-[#E7E5E4]'
                  }`}
                >
                  <div
                    className={`bg-[#FFFFFF] w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      allowDirectReconnect ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            type="submit"
            className="w-full py-4 text-xs font-bold uppercase tracking-widest bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] rounded-xl shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            Salvar Alterações
          </Button>
        </form>

        {/* SBS-36: Bloco de Segurança */}
        <form onSubmit={handlePasswordChange} className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
            Segurança da Conta & Alteração de Senha
          </h2>

          {passwordError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              {passwordSuccess}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
                Senha Atual
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] w-full"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] w-full"
                />
              </div>
            </div>

            {newPassword.length > 0 && (
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-[#78716C] uppercase">
                  <span>Força da senha:</span>
                  <span className={passwordStrength.label === 'Fraca' ? 'text-red-500' : passwordStrength.label === 'Média' ? 'text-amber-500' : 'text-emerald-600'}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#F5F5F4] rounded-full overflow-hidden border border-[#E7E5E4]">
                  <div className={`h-full rounded-full transition-all duration-500 ease-out ${passwordStrength.width} ${passwordStrength.color}`} />
                </div>
              </div>
            )}
          </div>

          <Button
            variant="primary"
            type="submit"
            className="w-full py-3.5 text-xs font-bold uppercase tracking-widest bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] rounded-xl transition-all"
          >
            Atualizar Senha
          </Button>
        </form>

        {/* SBS-36: Exclusão de Conta */}
        <section className="bg-[#FFFFFF] border border-red-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-black uppercase tracking-tight text-red-600">
              Exclusão Definitiva de Conta (LGPD)
            </h2>
            <p className="text-xs text-[#57534E] leading-relaxed font-medium">
              Conforme a Lei Geral de Proteção de Dados, você pode solicitar o encerramento permanente da sua conta e remoção imediata do seu histórico.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="w-full sm:w-fit px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
          >
            Encerrar Minha Conta
          </button>
        </section>
      </main>

      {/* Modal de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-[#1C1917]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-red-200 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-black uppercase tracking-tight text-red-600">
                Excluir Conta Permanentemente?
              </h3>
              <p className="text-xs text-[#57534E] leading-relaxed font-medium">
                Esta ação é irreversível. Seu perfil, métricas de ofensiva, histórico de conversas e dados cadastrais serão completamente apagados.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-[#78716C] uppercase">
                Digite "EXCLUIR" para confirmar:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="EXCLUIR"
                className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-red-500 w-full"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmationText('');
                }}
                className="flex-1 py-3 bg-[#F5F5F4] hover:bg-[#E7E5E4] border border-[#E7E5E4] text-[#1C1917] font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleteConfirmationText !== 'EXCLUIR'}
                onClick={handleDeleteAccount}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};