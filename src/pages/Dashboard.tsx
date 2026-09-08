import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Socket } from 'socket.io-client';
import { Button } from '../components/ui/Button';
import { FriendsManagerModal, Friend, FriendRequest } from '../components/dashboard/FriendsManagerModal';
import { DirectChatsModal } from '../components/dashboard/DirectChatsModal';
import { BadgesModal } from '../components/dashboard/BadgesModal';
import { DeviceCheckModal } from '../components/dashboard/DeviceCheckModal';
import { SupportModal } from '../components/dashboard/SupportModal';
import { NotificationsModal } from '../components/dashboard/NotificationsModal';
import { useToast } from '../components/ui/ToastContext';
import { TopicItemType } from '../types/user';
import { useFetchCache } from '../hooks/useFetchCache';
import { BADGES_CATALOG } from '../data/badgesData';
import { api } from '../services/api';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface SessionHistoryItem {
  id: string;
  partner: string;
  date: string;
  duration: number;
  topic: string;
  rating: number;
}

interface WeeklyGoal {
  target: number;
  completed: number;
  days: { day: string; completed: boolean }[];
}

interface LastSessionFeedback {
  date: string;
  duration: string;
  partnerName: string;
  partnerAvatar: string;
  topic: string;
  userNote: string;
  vocabLearned: string[];
}

interface UserData {
  id: string;
  name: string;
  email: string;
  level: string;
  reputation: number;
  avatar: string | null;
  streak: number;
  maxStreak: number;
  hasPracticedToday: boolean;
  totalMinutes: number;
  totalSessions: number;
  weeklyGoal?: WeeklyGoal;
  lastSession?: LastSessionFeedback | null;
  sessionsHistory?: SessionHistoryItem[];
  minutesHistory?: { day: string; min: number }[];
}

const FALLBACK_VOCAB_LIST = [
  { word: 'serendipity', phonetic: '/ˌser.ənˈdɪp.ə.ti/', definition: 'A ocorrência de acontecimentos afortunados por mero acaso ou sorte.' },
  { word: 'eloquent', phonetic: '/ˈel.ə.kwənt/', definition: 'Capacidade de se expressar com fluência, clareza e persuasão.' },
  { word: 'resilience', phonetic: '/rɪˈzɪl.jəns/', definition: 'A capacidade de se recuperar rapidamente de dificuldades ou desafios.' },
  { word: 'empathy', phonetic: '/ˈem.pə.θi/', definition: 'A habilidade de compreender e compartilhar os sentimentos de outra pessoa.' },
  { word: 'ephemeral', phonetic: '/ɪˈfem.ər.əl/', definition: 'Coisas passageiras, que duram por um período de tempo muito curto.' },
  { word: 'pragmatic', phonetic: '/præɡˈmæt.ɪk/', definition: 'Maneira de tratar as coisas de forma prática e realista em vez de teórica.' },
  { word: 'tenacity', phonetic: '/təˈnæs.ə.ti/', definition: 'A qualidade de ser muito determinado, firme e persistente.' },
  { word: 'gregarious', phonetic: '/ɡrɪˈɡeə.ri.əs/', definition: 'Pessoa sociável que gosta do convívio e da companhia dos outros.' },
];

const DEFAULT_MINUTES_HISTORY = [
  { day: 'Seg', min: 0 }, { day: 'Ter', min: 0 }, { day: 'Qua', min: 0 },
  { day: 'Qui', min: 0 }, { day: 'Sex', min: 0 }, { day: 'Sáb', min: 0 }, { day: 'Dom', min: 0 },
];

const WEEK_DAYS_LIST = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const DAILY_TOPICS: TopicItemType[] = [
  { 
    id: 'travel', 
    category: 'Viagens & Culturas', 
    title: 'Experiências Inesquecíveis', 
    icebreaker: 'Qual foi o destino mais marcante que você já visitou e por quê?', 
    vocabPreview: ['Destination', 'Wanderlust', 'Unforgettable'] 
  },
  { 
    id: 'career', 
    category: 'Trabalho & Inovação', 
    title: 'O Futuro da Inteligência Artificial', 
    icebreaker: 'Como a tecnologia e a IA têm mudado a sua rotina diária no trabalho?', 
    vocabPreview: ['Automation', 'Efficiency', 'Workflow'] 
  },
  { 
    id: 'hobbies', 
    category: 'Estilo de Vida', 
    title: 'Passatempos & Hábitos Diários', 
    icebreaker: 'O que você mais gosta de fazer para relaxar no final de semana?', 
    vocabPreview: ['Leisure', 'Unwind', 'Routine'] 
  },
];

interface VocabResult {
  word: string;
  phonetic?: string;
  definition: string;
}

export const Dashboard: React.FC = memo(() => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { data: userData } = useFetchCache<UserData>('/api/user/me');

  const [mediaMode, setMediaMode] = useState<'video' | 'audio'>('video');
  const [expandedMatching, setExpandedMatching] = useState(true);
  
  const [isMatching, setIsMatching] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [followerPos, setFollowerPos] = useState({ x: -100, y: -100 });
  const [cursorOpacity, setCursorOpacity] = useState(1);

  const [activeMetricModal, setActiveMetricModal] = useState<'streak' | 'minutes' | 'sessions' | null>(null);

  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [isDirectChatsOpen, setIsDirectChatsOpen] = useState(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [isDeviceCheckOpen, setIsDeviceCheckOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedChatContact, setSelectedChatContact] = useState<Friend | null>(null);

  const [friendRequestsCount, setFriendRequestsCount] = useState(0);
  const [requestsList, setRequestsList] = useState<FriendRequest[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [vocabTip, setVocabTip] = useState<VocabResult>(FALLBACK_VOCAB_LIST[0]);
  const [isLoadingVocab, setIsLoadingVocab] = useState(false);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [activeModal, setActiveModal] = useState<'goals' | 'reminders' | null>(null);
  
  const [showTopicConfirmModal, setShowTopicConfirmModal] = useState(false);
  const [topicToJoin, setTopicToJoin] = useState<TopicItemType | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<TopicItemType>(DAILY_TOPICS[0]);

  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('19:00');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const [friendsList, setFriendsList] = useState<Friend[]>([
    { id: '1', name: 'Carlos T.', tag: 'Carlos#9988', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&auto=format&fit=crop&q=80', level: 'B1', isOnline: true },
  ]);

  const mockSessionsHistory = useMemo(() => userData?.sessionsHistory || [], [userData]);
  const mockMinutesHistory = useMemo(() => userData?.minutesHistory || DEFAULT_MINUTES_HISTORY, [userData]);
  const unreadCount = useMemo(() => (notifications || []).filter((n) => !n?.read).length, [notifications]);
  
  const clearUnread = useCallback((senderId: string) => {
    setUnreadCounts((current) => ({ ...current, [senderId]: 0 }));
  }, []);
  
  const lastSessionFeedback = useMemo(() => userData?.lastSession || null, [userData]);
  const weeklyGoal = useMemo<WeeklyGoal>(() => userData?.weeklyGoal || {
    target: 5, completed: 0,
    days: [
      { day: 'Seg', completed: false }, { day: 'Ter', completed: false }, { day: 'Qua', completed: false },
      { day: 'Qui', completed: false }, { day: 'Sex', completed: false }, { day: 'Sáb', completed: false },
      { day: 'Dom', completed: false },
    ],
  }, [userData]);
  const goalPercentage = useMemo(() => Math.min(100, Math.round((weeklyGoal.completed / (weeklyGoal.target || 1)) * 100)), [weeklyGoal]);

  const userMetrics = useMemo(() => ({
    currentStreak: userData?.streak || 0,
    hasPracticedToday: userData?.hasPracticedToday || false,
    totalMinutes: userData?.totalMinutes || 0,
    totalSessions: userData?.totalSessions || 0,
  }), [userData]);

  const userNameDisplay = useMemo(() => userData?.name || 'Estudante', [userData]);
  const userFirstName = useMemo(() => userNameDisplay.split(' ')[0], [userNameDisplay]);
  const userEmailDisplay = useMemo(() => userData?.email || 'usuario@email.com', [userData]);
  const userLevelDisplay = useMemo(() => userData?.level || 'B1', [userData]);
  const userReputationDisplay = useMemo(() => userData?.reputation ?? 100, [userData]);
  const userAvatarDisplay = useMemo(() => userData?.avatar || '/images/default-avatar.png', [userData]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      const padding = 40;
      const isNearEdge = e.clientX < padding || e.clientY < padding || e.clientX > window.innerWidth - padding || e.clientY > window.innerHeight - padding;
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setIsUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get<{ items?: NotificationItem[] } | NotificationItem[]>('/api/notifications');
      const data = response.data;
      if (data && 'items' in data && Array.isArray(data.items)) {
        setNotifications(data.items);
      } else if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        setNotifications([]);
      }
    } catch (error: unknown) {
      console.error('Erro ao carregar notificações globais:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const fetchFriendsData = async () => {
      api.get('/api/friends')
        .then(res => { if (res.data) setFriendsList(res.data); })
        .catch(err => console.warn('A rota de amigos falhou ou está vazia.', err));

      api.get('/api/friends/requests')
        .then(res => { if (res.data) setRequestsList(res.data); })
        .catch(err => console.warn('A rota de solicitações falhou.', err));
    };
    fetchFriendsData();
  }, []);

  useEffect(() => {
    setFriendRequestsCount(requestsList.length);
  }, [requestsList]);

  const handleOpenNotifications = () => {
    setIsNotificationsOpen(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    void api.put('/api/notifications/read-all').catch((error: unknown) => console.error('Erro ao atualizar leitura no servidor:', error));
  };

  useEffect(() => {
    return () => {
      if (socket) {
        socket.emit('cancel_match');
      }
    };
  }, [socket]);

  const fetchDynamicVocab = useCallback(async () => {
    setIsLoadingVocab(true);
    const randomFallback = FALLBACK_VOCAB_LIST[Math.floor(Math.random() * FALLBACK_VOCAB_LIST.length)];
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${randomFallback.word}`);
      if (response.ok) {
        const data = await response.json();
        const entry = data[0];
        setVocabTip({
          word: entry.word,
          phonetic: entry.phonetic || entry.phonetics?.find((p: { text?: string }) => p.text)?.text || randomFallback.phonetic,
          definition: randomFallback.definition,
        });
      } else {
        setVocabTip(randomFallback);
      }
    } catch {
      setVocabTip(randomFallback);
    } finally {
      setIsLoadingVocab(false);
    }
  }, []);

  useEffect(() => {
    if (isMatching) fetchDynamicVocab();
  }, [isMatching, fetchDynamicVocab]);

  const startMatchingFlow = useCallback(() => {
    setIsMatching(false);
    showToast('Abrindo a fila de pareamento...', 'info');
    navigate('/room');
  }, [showToast, navigate]);

  const handleCancelMatch = useCallback(() => {
    if (socket) {
      socket.emit('cancel_match');
      setSocket(null);
    }
    setIsMatching(false);
  }, [socket]);

  const toggleDaySelection = useCallback((day: string) => {
    setSelectedDays(prev => (prev || []).includes(day) ? (prev || []).filter((d) => d !== day) : [...(prev || []), day]);
  }, []);

  const handleTopicCardClick = useCallback((topic: TopicItemType) => {
    setSelectedTopic(topic);
    setTopicToJoin(topic);
    setShowTopicConfirmModal(true);
  }, []);

  const confirmJoinRoomWithTopic = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const targetTopic = topicToJoin || selectedTopic;
    setShowTopicConfirmModal(false);
    showToast(`Entrando na sala: ${targetTopic.title}`, 'success');
    if (targetTopic && targetTopic.id) navigate(`/room/${targetTopic.id}`);
    else navigate('/room');
  }, [topicToJoin, selectedTopic, navigate, showToast]);

  const handleSaveReminders = useCallback(() => {
    setActiveModal(null);
    showToast('Preferências de lembretes salvas com sucesso!', 'success');
  }, [showToast]);

  const handleLogout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error('Erro ao encerrar sessão no servidor', err);
    }
    localStorage.removeItem('sidebyside_user'); 
    showToast('Sessão encerrada com sucesso.', 'info');
    navigate('/');
  }, [navigate, showToast]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1917] flex flex-col font-sans relative selection:bg-[#1C1917] selection:text-[#FAF9F6]">
      {/* Cursor Follower */}
      <div
        className="pointer-events-none fixed z-50 w-3.5 h-3.5 rounded-full bg-[#1C1917] transition-opacity duration-300 ease-out -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{ left: `${followerPos.x}px`, top: `${followerPos.y}px`, opacity: cursorOpacity }}
      />

      {/* HEADER / NAVBAR */}
      <header className="bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E7E5E4] px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 transition-all">
        <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => navigate('/')}>
          {/* Logo container polido e harmonizado */}
          <div className="w-10 h-10 rounded-xl bg-[#FAF9F6] border border-[#E7E5E4] p-2 flex items-center justify-center transition-all duration-300 group-hover:border-[#1C1917] group-hover:shadow-sm">
            <img 
              src="/images/logo.png" 
              alt="SideBySide" 
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" 
            />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight text-[#1C1917] uppercase leading-none">SideBySide</span>
            <span className="text-[9px] font-bold tracking-widest text-[#78716C] uppercase mt-0.5">Language Exchange</span>
          </div>
        </div>

        {/* Action Pills & User Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#57534E]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Nível <strong className="text-[#1C1917]">{userLevelDisplay}</strong></span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#57534E]">
            <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2 text-[#1C1917]" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.105-2.574-.305-3.8A11.983 11.983 0 0112 2.714z" />
            </svg>
            <span>{userReputationDisplay}% Reputação</span>
          </div>

          {/* Notificações */}
          <div className="relative">
            <button
              type="button"
              onClick={handleOpenNotifications}
              className="p-2.5 bg-[#FFFFFF] border border-[#E7E5E4] hover:border-[#1C1917] rounded-xl transition-all relative flex items-center justify-center text-[#1C1917] shadow-xs active:scale-95"
              title="Notificações"
            >
              <svg className="w-4 h-4 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-black flex items-center justify-center ring-2 ring-[#FFFFFF]">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Menu do Usuário */}
          <div className="relative" ref={userMenuRef}>
            <button 
              type="button" 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
              className="flex items-center gap-2.5 pl-2 py-1 pr-1.5 rounded-xl border border-[#E7E5E4] hover:border-[#1C1917] transition-all bg-[#FFFFFF] shadow-xs cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-[#F5F5F4] overflow-hidden border border-[#D6D3D1]">
                <img src={userAvatarDisplay} alt={userNameDisplay} className="w-full h-full object-cover" />
              </div>
              <span className="text-xs font-bold text-[#1C1917] hidden sm:inline-block max-w-[100px] truncate">{userFirstName}</span>
              <svg className={`w-3.5 h-3.5 stroke-[#78716C] fill-none stroke-2 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2.5 w-64 bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl shadow-xl py-2 z-50 flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-[#E7E5E4] flex flex-col">
                  <span className="text-xs font-black text-[#1C1917] truncate">{userNameDisplay}</span>
                  <span className="text-[10px] font-semibold text-[#78716C] truncate">{userEmailDisplay}</span>
                </div>

                <button type="button" onClick={() => { setIsUserMenuOpen(false); setIsFriendsOpen(true); }} className="px-4 py-2 hover:bg-[#FAF9F6] text-left flex items-center justify-between transition-colors group">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 stroke-[#57534E] group-hover:stroke-[#1C1917] fill-none stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.75 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                    <span className="text-xs font-bold text-[#57534E] group-hover:text-[#1C1917]">Lista de Amigos</span>
                  </div>
                  {friendRequestsCount > 0 && <span className="text-[10px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{friendRequestsCount}</span>}
                </button>

                <button type="button" onClick={() => { setIsUserMenuOpen(false); setSelectedChatContact(null); setIsDirectChatsOpen(true); }} className="px-4 py-2 hover:bg-[#FAF9F6] text-left flex items-center justify-between transition-colors group">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 stroke-[#57534E] group-hover:stroke-[#1C1917] fill-none stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                    <span className="text-xs font-bold text-[#57534E] group-hover:text-[#1C1917]">Conversas</span>
                  </div>
                  <span className="text-[10px] font-black bg-[#F5F5F4] px-2 py-0.5 rounded text-[#1C1917]">0</span>
                </button>

                <button type="button" onClick={() => { setIsUserMenuOpen(false); setIsBadgesOpen(true); }} className="px-4 py-2 hover:bg-[#FAF9F6] text-left flex items-center justify-between transition-colors group">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 stroke-[#57534E] group-hover:stroke-[#1C1917] fill-none stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                    <span className="text-xs font-bold text-[#57534E] group-hover:text-[#1C1917]">Badges & Conquistas</span>
                  </div>
                  <span className="text-[10px] font-black bg-[#F5F5F4] px-2 py-0.5 rounded text-[#1C1917]">
                    {BADGES_CATALOG.filter(b => b.unlocked).length}/{BADGES_CATALOG.length}
                  </span>
                </button>

                <button type="button" onClick={() => { setIsUserMenuOpen(false); setActiveModal('reminders'); }} className="px-4 py-2 hover:bg-[#FAF9F6] text-left flex items-center justify-between transition-colors group">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 stroke-[#57534E] group-hover:stroke-[#1C1917] fill-none stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-xs font-bold text-[#57534E] group-hover:text-[#1C1917]">Lembretes Diários</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#78716C] uppercase">{reminderEnabled ? reminderTime : 'Off'}</span>
                </button>

                <button type="button" onClick={() => { setIsUserMenuOpen(false); setIsSupportOpen(true); }} className="px-4 py-2 hover:bg-[#FAF9F6] text-left flex items-center justify-between transition-colors group">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 stroke-[#57534E] group-hover:stroke-[#1C1917] fill-none stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18a.75.75 0 100-1.5.75.75 0 000 1.5z" /></svg>
                    <span className="text-xs font-bold text-[#57534E] group-hover:text-[#1C1917]">Ajuda & Suporte</span>
                  </div>
                </button>

                <div className="border-t border-[#E7E5E4] mt-1 pt-1">
                  <button type="button" onClick={() => { setIsUserMenuOpen(false); navigate('/profile'); }} className="w-full px-4 py-2 hover:bg-[#FAF9F6] text-left flex items-center gap-2.5 transition-colors group">
                    <svg className="w-4 h-4 stroke-[#57534E] group-hover:stroke-[#1C1917] fill-none stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                    <span className="text-xs font-bold text-[#57534E] group-hover:text-[#1C1917]">Meu Perfil</span>
                  </button>
                  <button type="button" onClick={handleLogout} className="w-full px-4 py-2 hover:bg-red-50 text-left flex items-center gap-2.5 transition-colors group">
                    <svg className="w-4 h-4 stroke-red-600 fill-none stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
                    <span className="text-xs font-bold text-red-600">Sair da Conta</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* DASHBOARD CONTAINER EM BENTO GRID */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* GRID PRINCIPAL: 8 Colunas (Área Ativa) + 4 Colunas (Progresso & Métricas) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* COLUNA ESQUERDA (PRINCIPAL - 8 COLS) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* HERO LAUNCHPAD: AÇÃO IMEDIATA */}
            <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#78716C]">Fila Global Aberta</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#1C1917]">
                    Olá, {userFirstName}! Pronto para falar?
                  </h1>
                  <p className="text-xs sm:text-sm text-[#57534E] max-w-xl font-medium leading-relaxed">
                    Pratique agora com estudantes que compartilham do seu nível de fluência. Conversas naturais, seguras e com feedback pós-sessão.
                  </p>
                </div>

                <button 
                  type="button" 
                  onClick={() => setIsDeviceCheckOpen(true)} 
                  className="self-start sm:self-center px-3.5 py-2 bg-[#FAF9F6] border border-[#E7E5E4] hover:border-[#1C1917] rounded-xl text-xs font-bold text-[#1C1917] transition-all flex items-center gap-2 shrink-0 shadow-xs"
                >
                  <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.83m0 0a5.99 5.99 0 00-2.003-7.234L10.87 6.44a1.125 1.125 0 00-1.221.22L6.15 10.16a1.125 1.125 0 00-.22 1.221l2.302 2.498a5.99 5.99 0 007.188.291z" /></svg>
                  Testar Equipamento
                </button>
              </div>

              {/* OPÇÕES RÁPIDAS DE CONEXÃO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[#E7E5E4]">
                {/* Modo de mídia */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider">Modo de Mídia</span>
                  <div className="grid grid-cols-2 bg-[#FAF9F6] p-1 rounded-xl border border-[#E7E5E4] text-xs font-bold">
                    <button 
                      type="button" 
                      onClick={() => { setMediaMode('video'); showToast('Modo Vídeo + Áudio selecionado', 'info'); }} 
                      className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${mediaMode === 'video' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-sm' : 'text-[#78716C] hover:text-[#1C1917]'}`}
                    >
                      <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /></svg>
                      Vídeo + Áudio
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setMediaMode('audio'); showToast('Modo Apenas Áudio selecionado', 'info'); }} 
                      className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${mediaMode === 'audio' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-sm' : 'text-[#78716C] hover:text-[#1C1917]'}`}
                    >
                      <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 003-3V4.5a3 3 0 00-3-3 3 3 0 00-3 3v8.25a3 3 0 003 3z" /></svg>
                      Apenas Áudio
                    </button>
                  </div>
                </div>

                {/* Pareamento Ampliado */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider">Pareamento Estendido</span>
                  <div className="flex items-center justify-between bg-[#FAF9F6] border border-[#E7E5E4] px-3.5 py-1.5 rounded-xl h-[42px]">
                    <span className="text-[11px] font-bold text-[#57534E]">Permitir níveis adjacentes</span>
                    <button 
                      type="button" 
                      onClick={() => { setExpandedMatching(!expandedMatching); showToast(expandedMatching ? 'Pareamento estrito ativado' : 'Pareamento ampliado ativado', 'info'); }} 
                      className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${expandedMatching ? 'bg-[#1C1917]' : 'bg-[#D6D3D1]'}`}
                    >
                      <div className={`bg-[#FFFFFF] w-4 h-4 rounded-full shadow-md transform transition-transform ${expandedMatching ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* GRANDE BOTÃO DE MATCHING */}
              <Button 
                variant="primary" 
                onClick={startMatchingFlow} 
                className="w-full py-4 text-xs font-black uppercase tracking-widest bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.008] active:scale-[0.99]"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
                PROCURAR PAR DE CONVERSA AGORA
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </Button>
            </div>

            {/* SEÇÃO: TÓPICOS SUGERIDOS PARA HOJE */}
            <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4">
                <div>
                  <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">Tópicos em Alta Hoje</h2>
                  <p className="text-xs text-[#78716C] font-medium">Selecione uma pauta para orientar sua conversa com quebra-gelos</p>
                </div>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-[#F5F5F4] px-2.5 py-1 rounded-md text-[#57534E]">
                  Atualização Diária
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {DAILY_TOPICS.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleTopicCardClick(topic)}
                    className={`p-5 rounded-2xl border text-left flex flex-col justify-between gap-4 transition-all hover:-translate-y-0.5 ${
                      selectedTopic.id === topic.id 
                        ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917] shadow-md' 
                        : 'bg-[#FAF9F6] text-[#1C1917] border-[#E7E5E4] hover:border-[#1C1917]'
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md w-fit ${
                        selectedTopic.id === topic.id ? 'bg-[#292524] text-[#D6D3D1]' : 'bg-[#E7E5E4] text-[#57534E]'
                      }`}>
                        {topic.category}
                      </span>
                      <h3 className="text-sm font-bold leading-snug">{topic.title}</h3>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider pt-3 border-t border-current/10">
                      <span>Praticar Este</span>
                      <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* SEÇÃO EDUCATIVA E SEGURANÇA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-5 flex items-start gap-3.5 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-[#FAF9F6] border border-[#E7E5E4] text-[#1C1917] flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.105-2.574-.305-3.8A11.983 11.983 0 0112 2.714z" /></svg>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-xs font-black uppercase text-[#1C1917]">Moderação em Tempo Real</h3>
                  <p className="text-[11px] text-[#57534E] leading-relaxed">Nossa IA monitora e protege suas conexões para que você converse em paz e respeito.</p>
                </div>
              </div>

              <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-5 flex items-start gap-3.5 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-[#FAF9F6] border border-[#E7E5E4] text-[#1C1917] flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.516 0c.85.493 1.508 1.333 1.508 2.316V18" /></svg>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-xs font-black uppercase text-[#1C1917]">Destrave seu Inglês</h3>
                  <p className="text-[11px] text-[#57534E] leading-relaxed">Não se preocupe com a perfeição sintática. A prioridade é a clareza e a troca de experiências.</p>
                </div>
              </div>
            </div>

          </div>

          {/* COLUNA DIREITA (STATS, METAS & RECAP - 4 COLS) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* CARDS DE MÉTRICAS RÁPIDAS (STREAK, MINUTOS, SESSÕES) */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Streak */}
              <button 
                type="button" 
                onClick={() => setActiveMetricModal('streak')} 
                className="bg-[#FFFFFF] border border-[#E7E5E4] hover:border-[#1C1917] rounded-2xl p-3.5 flex flex-col items-center justify-center gap-1 transition-all shadow-xs group"
              >
                <span className="text-lg font-black text-[#1C1917] leading-none group-hover:scale-110 transition-transform">
                  {userMetrics.currentStreak} 🔥
                </span>
                <span className="text-[9px] font-bold text-[#78716C] uppercase tracking-wider">Ofensiva</span>
              </button>

              {/* Minutos */}
              <button 
                type="button" 
                onClick={() => setActiveMetricModal('minutes')} 
                className="bg-[#FFFFFF] border border-[#E7E5E4] hover:border-[#1C1917] rounded-2xl p-3.5 flex flex-col items-center justify-center gap-1 transition-all shadow-xs group"
              >
                <span className="text-lg font-black text-[#1C1917] leading-none group-hover:scale-110 transition-transform">
                  {userMetrics.totalMinutes}m
                </span>
                <span className="text-[9px] font-bold text-[#78716C] uppercase tracking-wider">Prática</span>
              </button>

              {/* Sessões */}
              <button 
                type="button" 
                onClick={() => setActiveMetricModal('sessions')} 
                className="bg-[#FFFFFF] border border-[#E7E5E4] hover:border-[#1C1917] rounded-2xl p-3.5 flex flex-col items-center justify-center gap-1 transition-all shadow-xs group"
              >
                <span className="text-lg font-black text-[#1C1917] leading-none group-hover:scale-110 transition-transform">
                  {userMetrics.totalSessions}
                </span>
                <span className="text-[9px] font-bold text-[#78716C] uppercase tracking-wider">Sessões</span>
              </button>
            </div>

            {/* CARD: META SEMANAL */}
            <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#1C1917]">Meta Semanal</span>
                <button 
                  type="button" 
                  onClick={() => setActiveModal('goals')} 
                  className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] hover:text-[#1C1917] transition-colors"
                >
                  Ver Detalhes →
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#57534E]">{weeklyGoal.completed} de {weeklyGoal.target} conversas</span>
                  <span className="text-[#1C1917] font-black">{goalPercentage}%</span>
                </div>
                <div className="w-full h-2.5 bg-[#FAF9F6] border border-[#E7E5E4] rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-[#1C1917] rounded-full transition-all duration-500" 
                    style={{ width: `${goalPercentage}%` }} 
                  />
                </div>
              </div>

              {/* Dias da semana em mini-pills */}
              <div className="grid grid-cols-7 gap-1 pt-1">
                {(weeklyGoal.days || []).map((day, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div className={`w-full aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold ${
                      day.completed ? 'bg-[#1C1917] text-white' : 'bg-[#FAF9F6] text-[#A8A29E] border border-[#E7E5E4]'
                    }`}>
                      {day.completed ? '✓' : ''}
                    </div>
                    <span className="text-[9px] font-bold text-[#78716C] uppercase">{day.day[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD: ÚLTIMA SESSÃO DE CONVERSA */}
            {lastSessionFeedback ? (
              <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-[#1C1917]">Última Sessão</span>
                  <span className="text-[10px] font-bold text-[#78716C]">{lastSessionFeedback.date}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#D6D3D1] bg-[#F5F5F4] shrink-0">
                    <img src={lastSessionFeedback.partnerAvatar} alt={lastSessionFeedback.partnerName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-[#1C1917]">{lastSessionFeedback.partnerName}</span>
                    <span className="text-[10px] font-semibold text-[#78716C]">Tema: {lastSessionFeedback.topic}</span>
                  </div>
                </div>

                {lastSessionFeedback.userNote && (
                  <div className="bg-[#FAF9F6] border border-[#E7E5E4] p-3 rounded-xl text-xs font-medium italic text-[#57534E]">
                    "{lastSessionFeedback.userNote}"
                  </div>
                )}

                {lastSessionFeedback.vocabLearned && lastSessionFeedback.vocabLearned.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-bold text-[#78716C] uppercase tracking-wider">Vocabulário Utilizado</span>
                    <div className="flex flex-wrap gap-1">
                      {lastSessionFeedback.vocabLearned.map((w, i) => (
                        <span key={i} className="text-[10px] font-bold px-2 py-0.5 bg-[#FAF9F6] border border-[#E7E5E4] text-[#1C1917] rounded-md">{w}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 shadow-xs flex flex-col items-center justify-center text-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#FAF9F6] border border-[#E7E5E4] flex items-center justify-center text-[#78716C]">
                  <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="text-xs font-bold text-[#1C1917]">Pronto para a estreia?</span>
                <p className="text-[11px] text-[#78716C]">Conecte-se hoje para ver seu resumo e vocabulário registrado aqui.</p>
              </div>
            )}

            {/* VOCABULÁRIO RÁPIDO DO DIA */}
            <div className="bg-[#FAF9F6] border border-[#E7E5E4] rounded-3xl p-5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#78716C]">Dica de Vocabulário</span>
                <button type="button" onClick={fetchDynamicVocab} className="text-[10px] font-bold text-[#1C1917] hover:underline uppercase">Outra ↻</button>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-sm font-black text-[#1C1917] capitalize">{vocabTip.word}</span>
                {vocabTip.phonetic && <span className="text-[10px] font-semibold text-[#78716C] italic">{vocabTip.phonetic}</span>}
              </div>
              <p className="text-xs text-[#57534E] font-medium leading-relaxed">{vocabTip.definition}</p>
            </div>

          </div>

        </div>
      </main>

      {/* MODAIS COMPONENTIZADOS */}
      <FriendsManagerModal isOpen={isFriendsOpen} onClose={() => setIsFriendsOpen(false)} onOpenDirectChat={(friend: Friend) => { setSelectedChatContact(friend); setIsDirectChatsOpen(true); }} friendsList={friendsList} setFriendsList={setFriendsList} requestsList={requestsList} setRequestsList={setRequestsList} />
      <DirectChatsModal isOpen={isDirectChatsOpen} onClose={() => setIsDirectChatsOpen(false)} selectedContact={selectedChatContact} friendsList={friendsList} unreadCounts={unreadCounts} onClearUnread={clearUnread} />
      <BadgesModal isOpen={isBadgesOpen} onClose={() => setIsBadgesOpen(false)} />
      <DeviceCheckModal isOpen={isDeviceCheckOpen} onClose={() => setIsDeviceCheckOpen(false)} mediaMode={mediaMode} />
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
      <NotificationsModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} notifications={notifications} />

      {/* MODAL DE CONFIRMAÇÃO DE TÓPICO */}
      {showTopicConfirmModal && (topicToJoin || selectedTopic) && (
        <div className="fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-3">
              <span className="text-[10px] font-black uppercase tracking-widest bg-[#FAF9F6] text-[#1C1917] px-2.5 py-1 rounded-lg border border-[#E7E5E4]">
                {(topicToJoin || selectedTopic)?.category}
              </span>
              <button type="button" onClick={() => setShowTopicConfirmModal(false)} className="text-sm font-bold text-[#78716C] hover:text-[#1C1917]">✕</button>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-black uppercase text-[#1C1917]">{(topicToJoin || selectedTopic)?.title}</h3>
              <p className="text-xs text-[#57534E] font-medium leading-relaxed">Deseja entrar na sala de conversação com o guia deste tópico ativado? Os quebra-gelos e a linha narrativa serão ajustados para esse assunto.</p>
            </div>
            <div className="bg-[#FAF9F6] border border-[#E7E5E4] p-4 rounded-2xl flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">Pergunta Quebra-gelo:</span>
              <p className="text-xs font-bold text-[#1C1917] italic">"{(topicToJoin || selectedTopic)?.icebreaker}"</p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowTopicConfirmModal(false)} className="flex-1 py-3 bg-[#FAF9F6] hover:bg-[#E7E5E4] text-[#1C1917] font-bold text-xs uppercase tracking-wider rounded-xl transition-all">Cancelar</button>
              <button type="button" onClick={confirmJoinRoomWithTopic} className="flex-1 py-3 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md">Entrar na Sala</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE BUSCA/MATCHING ATIVA */}
      {isMatching && (
        <div className="fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-8 sm:p-10 max-w-lg w-full shadow-2xl flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-[#F5F5F4] border-t-[#1C1917] animate-spin" />
              <div className="w-12 h-12 rounded-2xl bg-[#FAF9F6] border border-[#E7E5E4] absolute flex items-center justify-center p-2.5">
                <img src="/images/logo.png" alt="SideBySide" className="w-full h-full object-contain" />
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-1.5">
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#1C1917]">Buscando Par de Conversa...</h3>
              <p className="text-xs font-bold text-[#78716C]">Aguardando conexão com estudante de nível <span className="text-[#1C1917] underline">{userLevelDisplay}</span></p>
            </div>

            <div className="w-full bg-[#FAF9F6] border border-[#E7E5E4] rounded-2xl p-5 flex flex-col gap-2.5 text-left">
              <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-2.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#78716C]">Vocabulário para Praticar</span>
                <button type="button" onClick={fetchDynamicVocab} className="text-[10px] font-bold text-[#1C1917] hover:underline uppercase">Outra Palavra ↻</button>
              </div>
              {isLoadingVocab ? (
                <div className="py-3 text-center text-xs font-bold text-[#78716C] animate-pulse">Buscando vocabulário...</div>
              ) : (
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-black text-[#1C1917] capitalize">{vocabTip.word}</span>
                    {vocabTip.phonetic && <span className="text-[10px] font-bold text-[#78716C] italic">{vocabTip.phonetic}</span>}
                  </div>
                  <p className="text-xs font-medium text-[#57534E] leading-relaxed">{vocabTip.definition}</p>
                </div>
              )}
            </div>

            <button type="button" onClick={handleCancelMatch} className="w-full py-3.5 bg-[#FAF9F6] hover:bg-[#E7E5E4] border border-[#E7E5E4] text-[#1C1917] font-bold text-xs uppercase tracking-widest rounded-xl transition-all">Cancelar Busca</button>
          </div>
        </div>
      )}

      {/* MODAL DE METAS SEMANAIS */}
      {activeModal === 'goals' && (
        <div className="fixed inset-0 bg-[#1C1917]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4">
              <h3 className="text-base font-black uppercase tracking-tight text-[#1C1917]">Meta Semanal de Prática</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-[#78716C] hover:text-[#1C1917] text-sm font-bold">✕</button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center text-xs font-bold text-[#1C1917]">
                <span>Progresso Atual</span>
                <span>{weeklyGoal.completed} de {weeklyGoal.target} conversas ({goalPercentage}%)</span>
              </div>
              <div className="w-full h-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-full overflow-hidden p-0.5">
                <div className="h-full bg-[#1C1917] rounded-full transition-all duration-500 ease-out" style={{ width: `${goalPercentage}%` }} />
              </div>
              <div className="grid grid-cols-7 gap-2 pt-2">
                {(mockMinutesHistory || []).map((item, index: number) => (
                  <div key={index} className="flex flex-col items-center gap-2 group w-full">
                    <div className="relative w-full flex justify-center h-20 items-end">
                      <div className={`w-full rounded-md transition-all duration-300 ${item.min > 0 ? 'bg-[#1C1917] group-hover:bg-[#57534E]' : 'bg-[#E7E5E4]'}`} style={{ height: `${item.min === 0 ? 6 : (item.min / 40) * 100}%` }} />
                      {item.min > 0 && <span className="absolute -top-6 text-[9px] font-black text-[#1C1917] opacity-0 group-hover:opacity-100 transition-opacity">{item.min}m</span>}
                    </div>
                    <span className="text-[10px] font-bold text-[#78716C] uppercase mt-1">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" onClick={() => { setActiveModal(null); navigate('/profile'); }} className="flex-1 py-3 text-xs font-bold uppercase tracking-widest bg-[#FAF9F6] border border-[#1C1917] text-[#1C1917] hover:bg-[#F5F5F4] rounded-xl">Ajustar no Perfil</Button>
              <Button variant="primary" onClick={() => setActiveModal(null)} className="flex-1 py-3 text-xs font-bold uppercase tracking-widest bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] rounded-xl">Fechar</Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE LEMBRETES */}
      {activeModal === 'reminders' && (
        <div className="fixed inset-0 bg-[#1C1917]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4">
              <h3 className="text-base font-black uppercase tracking-tight text-[#1C1917]">Configuração de Lembretes</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-[#78716C] hover:text-[#1C1917] text-sm font-bold">✕</button>
            </div>
            <div className="flex items-center justify-between bg-[#FAF9F6] border border-[#E7E5E4] p-4 rounded-2xl">
              <span className="text-xs font-bold text-[#1C1917]">Notificações Diárias</span>
              <button type="button" onClick={() => setReminderEnabled(!reminderEnabled)} className={`w-10 h-6 flex items-center rounded-full p-0.5 transition-colors ${reminderEnabled ? 'bg-[#1C1917]' : 'bg-[#D6D3D1]'}`}>
                <div className={`bg-[#FFFFFF] w-5 h-5 rounded-full shadow-md transform transition-transform ${reminderEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
            {reminderEnabled && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Horário Preferencial</label>
                  <input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="px-4 py-2.5 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] w-full" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Dias Ativos</label>
                  <div className="flex gap-1 justify-between">
                    {WEEK_DAYS_LIST.map((day) => {
                      const isSelected = selectedDays.includes(day);
                      return (
                        <button key={day} type="button" onClick={() => toggleDaySelection(day)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase border transition-all ${isSelected ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]' : 'bg-[#FAF9F6] text-[#78716C] border-[#E7E5E4]'}`}>
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="primary" onClick={() => { setActiveModal(null); navigate('/profile'); }} className="flex-1 py-3 text-xs font-bold uppercase tracking-widest bg-[#FAF9F6] border border-[#1C1917] text-[#1C1917] hover:bg-[#F5F5F4] rounded-xl">Gerenciar no Perfil</Button>
              <Button variant="primary" onClick={handleSaveReminders} className="flex-1 py-3 text-xs font-bold uppercase tracking-widest bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] rounded-xl">Salvar Preferências</Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE MÉTRICAS (STREAK, MINUTOS OU SESSÕES) */}
      {activeMetricModal && (
        <div className="fixed inset-0 bg-[#1C1917]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4">
              <h3 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
                {activeMetricModal === 'streak' && 'Histórico de Ofensiva'}
                {activeMetricModal === 'minutes' && 'Minutos Praticados'}
                {activeMetricModal === 'sessions' && 'Histórico de Sessões'}
              </h3>
              <button type="button" onClick={() => setActiveMetricModal(null)} className="text-[#78716C] hover:text-[#1C1917] text-sm font-bold">✕</button>
            </div>

            {activeMetricModal === 'streak' && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between bg-[#FAF9F6] p-4 rounded-2xl border border-[#E7E5E4]">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider">Sequência Máxima</span>
                    <span className="text-xl font-black text-[#1C1917]">{userData?.maxStreak || 0} Dias</span>
                  </div>
                  <div className="w-px h-8 bg-[#E7E5E4]" />
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider">Sequência Atual</span>
                    <span className="text-xl font-black text-emerald-600">{userMetrics.currentStreak} Dias 🔥</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#1C1917]">Últimos 7 dias</span>
                  <div className="grid grid-cols-7 gap-2">
                    {(weeklyGoal.days || []).map((item, index: number) => (
                      <div key={index} className="flex flex-col items-center gap-1.5">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-xs transition-colors ${item.completed ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]' : 'bg-[#FAF9F6] text-[#A8A29E] border-[#E7E5E4]'}`}>
                          {item.completed ? '🔥' : '🧊'}
                        </div>
                        <span className="text-[10px] font-bold text-[#78716C] uppercase">{item.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeMetricModal === 'minutes' && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between bg-[#FAF9F6] p-4 rounded-2xl border border-[#E7E5E4]">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider">Total na Semana</span>
                    <span className="text-xl font-black text-[#1C1917]">{userMetrics.totalMinutes} min</span>
                  </div>
                  <div className="w-px h-8 bg-[#E7E5E4]" />
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider">Média por Sessão</span>
                    <span className="text-xl font-black text-[#1C1917]">{userMetrics.totalSessions > 0 ? Math.round(userMetrics.totalMinutes / userMetrics.totalSessions) : 0} min</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#1C1917]">Distribuição Semanal</span>
                  <div className="flex items-end justify-between h-28 pt-4 border-b border-[#E7E5E4]">
                    {(weeklyGoal.days || []).map((item, index: number) => (
                      <div key={index} className="flex flex-col items-center gap-1.5">
                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs transition-colors ${item.completed ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]' : 'bg-[#FAF9F6] text-[#A8A29E] border-[#E7E5E4]'}`}>
                          {item.completed ? <svg className="w-4 h-4 fill-none stroke-current stroke-[3]" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg> : '•'}
                        </div>
                        <span className="text-[10px] font-bold text-[#78716C] uppercase">{item.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeMetricModal === 'sessions' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#1C1917]">Sessões Recentes</span>
                  <span className="text-[10px] font-bold text-[#78716C] uppercase">Total Realizado: {userMetrics.totalSessions}</span>
                </div>
                <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto">
                  {mockSessionsHistory.length > 0 ? (
                    mockSessionsHistory.map((session: SessionHistoryItem) => (
                      <div key={session.id} className="bg-[#FAF9F6] border border-[#E7E5E4] rounded-2xl p-4 flex flex-col gap-2 hover:border-[#1C1917] transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-[#1C1917] uppercase">{session.partner}</span>
                            <span className="text-[10px] font-bold text-[#78716C]">{session.date}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-[#FFFFFF] border border-[#E7E5E4] px-2 py-0.5 rounded-lg">
                            <span className="text-[10px] font-black text-amber-500">{'★'.repeat(session.rating)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 pt-2 border-t border-[#E7E5E4]">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-[#A8A29E] uppercase">Duração:</span>
                            <span className="text-[10px] font-black text-[#1C1917]">{session.duration} min</span>
                          </div>
                          <span className="text-[10px] text-[#E7E5E4]">|</span>
                          <div className="flex items-center gap-1 truncate">
                            <span className="text-[10px] font-bold text-[#A8A29E] uppercase">Tópico:</span>
                            <span className="text-[10px] font-black text-[#1C1917] truncate">{session.topic}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs font-bold text-[#78716C] uppercase">Nenhuma sessão registrada no histórico ainda.</div>
                  )}
                </div>
              </div>
            )}
            <Button variant="primary" onClick={() => setActiveMetricModal(null)} className="w-full py-3 text-xs font-bold uppercase tracking-widest bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] rounded-xl">Fechar Visualização</Button>
          </div>
        </div>
      )}
    </div>
  );
});

Dashboard.displayName = 'Dashboard';
export default Dashboard;