export interface Badge {
  id: string;
  title: string;
  description: string;
  category: 'streak' | 'time' | 'social' | 'topics' | 'admin';
  icon: string; // Nome ou tipo do ícone SVG
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedAt?: string;
}

export const BADGES_CATALOG: Badge[] = [
  // --- ORIGINAIS ---
  {
    id: 'first-step',
    title: 'Primeiro Passo',
    description: 'Conclua sua primeira conversa P2P na plataforma.',
    category: 'social',
    icon: 'chat',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'streak-5',
    title: 'Fogo Inicial',
    description: 'Mantenha uma sequência de 5 dias seguidos praticando.',
    category: 'streak',
    icon: 'fire',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: 'talkative-100',
    title: 'Sem Parar',
    description: 'Acumule 100 minutos de conversação ativa em salas.',
    category: 'time',
    icon: 'clock',
    unlocked: false,
    progress: 0,
    maxProgress: 100,
  },
  {
    id: 'streak-15',
    title: 'Hábito Inabalável',
    description: 'Alcance uma ofensiva de 15 dias ininterruptos.',
    category: 'streak',
    icon: 'fire',
    unlocked: false,
    progress: 0,
    maxProgress: 15,
  },
  {
    id: 'topic-explorer',
    title: 'Explorador de Temas',
    description: 'Complete conversas em pelo menos 5 tópicos diferentes.',
    category: 'topics',
    icon: 'compass',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: 'social-butterfly',
    title: 'Conector Global',
    description: 'Adicione 5 parceiros à sua lista de amigos.',
    category: 'social',
    icon: 'users',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: 'top-rated',
    title: 'Parceiro Exemplar',
    description: 'Mantenha uma nota de reputação superior a 95 pontos.',
    category: 'social',
    icon: 'star',
    unlocked: false,
    progress: 0,
    maxProgress: 100,
  },
  {
    id: 'marathoner',
    title: 'Maratonista da Fala',
    description: 'Acumule 500 minutos praticando conversação.',
    category: 'time',
    icon: 'award',
    unlocked: false,
    progress: 0,
    maxProgress: 500,
  },

  // --- NOVAS CONQUISTAS SOLICITADAS ---
  {
    id: 'first-friend',
    title: 'Primeira Amizade',
    description: 'Adicione o seu primeiro amigo na rede de contatos.',
    category: 'social',
    icon: 'user-plus',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'first-message',
    title: 'Primeira Mensagem',
    description: 'Envie sua primeira mensagem direta para um amigo.',
    category: 'social',
    icon: 'chat',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'first-room-3min',
    title: 'Primeira Sala',
    description: 'Participe de uma sala temática por mais de 3 minutos.',
    category: 'time',
    icon: 'clock',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },

  // --- NOVAS: STREAKS & HÁBITOS ---
  {
    id: 'streak-7-verbal-marathon',
    title: 'Maratonista Verbal',
    description: 'Realize pelo menos 1 sessão de conversação por 7 dias seguidos.',
    category: 'streak',
    icon: 'fire',
    unlocked: false,
    progress: 0,
    maxProgress: 7,
  },
  {
    id: 'early-bird',
    title: 'Madrugador Poligota',
    description: 'Complete uma sessão de prática antes das 08h da manhã.',
    category: 'streak',
    icon: 'sun',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'night-owl',
    title: 'Coruja da Conversa',
    description: 'Participe de uma sala de vídeo após as 22h.',
    category: 'streak',
    icon: 'moon',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },

  // --- NOVAS: COMUNIDADE & REPUTAÇÃO ---
  {
    id: 'social-magnet',
    title: 'Ímã de Conexões',
    description: 'Adicione 5 novos amigos na plataforma após sessões.',
    category: 'social',
    icon: 'user-plus',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: 'empathy-ambassador',
    title: 'Embaixador da Empatia',
    description: 'Receba 10 avaliações máximas (5 estrelas) consecutivas.',
    category: 'social',
    icon: 'heart',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
  },

  // --- NOVAS: TEMPO DE CONVERSA (MINUTOS) ---
  {
    id: 'talkative-centenary',
    title: 'Centenário de Conversa',
    description: 'Acumule um total de 1.000 minutos de conversação ativa.',
    category: 'time',
    icon: 'clock',
    unlocked: false,
    progress: 0,
    maxProgress: 1000,
  },

  // --- NOVAS: TEMPO DE CONTA (ANTIGUIDADE) ---
  {
    id: 'account-one-month',
    title: 'Mês de Prática',
    description: 'Completar 30 dias desde a data de cadastro na comunidade.',
    category: 'time',
    icon: 'calendar',
    unlocked: false,
    progress: 0,
    maxProgress: 30,
  },
  {
    id: 'account-gold-veteran',
    title: 'Veterano de Ouro',
    description: 'Manter a conta ativa e registrada na plataforma por 1 ano.',
    category: 'time',
    icon: 'shield',
    unlocked: false,
    progress: 0,
    maxProgress: 365,
  },

  // --- NOVAS: EXCLUSIVA / ADMIN ---
  {
    id: 'community-guardian',
    title: 'Guardião da Comunidade',
    description: 'Concedida aos administradores e moderadores oficiais da plataforma.',
    category: 'admin',
    icon: 'shield-check',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
];