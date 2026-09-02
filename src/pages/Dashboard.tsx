import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
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

const DEFAULT_MINUTES_HISTORY = [
  { day: 'Seg', min: 0 }, { day: 'Ter', min: 0 }, { day: 'Qua', min: 0 },
  { day: 'Qui', min: 0 }, { day: 'Sex', min: 0 }, { day: 'Sáb', min: 0 }, { day: 'Dom', min: 0 },
];

const WEEK_DAYS_LIST = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const DAILY_TOPICS: TopicItemType[] = [
  { id: 'travel', category: 'Viagens & Culturas', title: 'Experiências Inesquecíveis', icebreaker: 'Qual foi o destino mais marcante que você já visitou e por quê?', vocabPreview: ['Destination', 'Wanderlust', 'Unforgettable'] },
  { id: 'career', category: 'Trabalho & Tecnologia', title: 'O Futuro da Inteligência Artificial', icebreaker: 'Como a tecnologia e a IA têm mudado a sua rotina diária no trabalho?', vocabPreview: ['Automation', 'Efficiency', 'Workflow'] },
  { id: 'hobbies', category: 'Estilo de Vida', title: 'Passatempos & Hábitos Diários', icebreaker: 'O que você mais gosta de fazer para relaxar no final de semana?', vocabPreview: ['Leisure', 'Unwind', 'Daily Routine'] },
];

export const Dashboard: React.FC = memo(() => { 
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { data: userData, refetch: refetchUserData } = useFetchCache<any>('http://localhost:3000/api/user/me', {
    credentials: 'include'
  });

  // Atualiza os dados automaticamente quando a janela ganha foco (ex: volta da sala de aula/avaliação)
  useEffect(() => {
    const handleFocus = () => {
      if (refetchUserData) refetchUserData();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchUserData]);

  const [mediaMode, setMediaMode] = useState<'video' | 'audio'>('video');
  const [expandedMatching, setExpandedMatching] = useState(true);

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

  const [notifications, setNotifications] = useState<any[]>([]);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [activeModal, setActiveModal] = useState<'goals' | 'reminders' | null>(null);
  
  const [showTopicConfirmModal, setShowTopicConfirmModal] = useState(false);
  const [topicToJoin, setTopicToJoin] = useState<TopicItemType | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<TopicItemType>(DAILY_TOPICS[0]);

  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('19:00');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const [friendsList, setFriendsList] = useState<Friend[]>([]);
  const [requestsList, setRequestsList] = useState<FriendRequest[]>([]);

  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const socket: Socket = io('http://localhost:3000', { withCredentials: true });

    socket.on('direct_message', (data: { senderId: string }) => {
      setUnreadCounts((prev) => ({
        ...prev,
        [data.senderId]: (prev[data.senderId] || 0) + 1
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const clearUnreadForSender = useCallback((senderId: string) => {
    setUnreadCounts((prev) => {
      if (!prev[senderId]) return prev;
      const newCounts = { ...prev };
      delete newCounts[senderId];
      return newCounts;
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, friendsRes] = await Promise.all([
          fetch('http://localhost:3000/api/friends/requests', { credentials: 'include' }),
          fetch('http://localhost:3000/api/friends/list', { credentials: 'include' })
        ]);
        if (reqRes.ok) {
          setRequestsList(await reqRes.json());
        }
        if (friendsRes.ok) {
          setFriendsList(await friendsRes.json());
        }
      } catch (e) {
        console.error('Erro ao buscar dados de amigos/solicitações:', e);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const friendRequestsCount = requestsList.length;
  const unreadChatMessages = Object.keys(unreadCounts).length;

  const mockSessionsHistory = useMemo(() => userData?.sessionsHistory || [], [userData]);
  const mockMinutesHistory = useMemo(() => userData?.minutesHistory || DEFAULT_MINUTES_HISTORY, [userData]);
  const unreadCount = useMemo(() => (notifications || []).filter((n) => !n?.read).length, [notifications]);
  
  const lastSessionFeedback = useMemo(() => userData?.lastSession || null, [userData]);
  const weeklyGoal = useMemo(() => userData?.weeklyGoal || {
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
  const userAvatarDisplay = useMemo(() => userData?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', [userData]);

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
      const response = await fetch('http://localhost:3000/api/notifications', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        const localReadCache = JSON.parse(localStorage.getItem('sbs_read_notifications') || '[]');
        const mergedData = data.map((n: any) => 
          localReadCache.includes(n.id) ? { ...n, read: true } : n
        );
        setNotifications(mergedData);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações globais:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 8000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleOpenNotifications = () => {
    setIsNotificationsOpen(true);
    
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      const readIds = updated.map(n => n.id);
      localStorage.setItem('sbs_read_notifications', JSON.stringify(readIds));
      return updated;
    });
    
    fetch('http://localhost:3000/api/notifications/read-all', {
      method: 'PUT',
      credentials: 'include'
    }).catch((error) => console.error('A rota PUT de notificações não existe no servidor (Ignorando erro).', error));
  };

  const startMatchingFlow = useCallback(() => {
    navigate('/room');
  }, [navigate]);

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
    if (targetTopic && targetTopic.id) navigate(`/room/${targetTopic.id}`);
    else navigate('/room');
  }, [topicToJoin, selectedTopic, navigate]);

  const handleSaveReminders = useCallback(() => {
    setActiveModal(null);
    showToast('Preferências de lembretes salvas com sucesso!', 'success');
  }, [showToast]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Erro ao encerrar sessão no servidor', err);
    }
    localStorage.removeItem('sidebyside_user'); 
    showToast('Sessão encerrada com sucesso.', 'info');
    navigate('/');
  }, [navigate, showToast]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1917] flex flex-col font-sans relative selection:bg-[#1C1917] selection:text-[#FAF9F6]">
      <div
        className="pointer-events-none fixed z-50 w-3.5 h-3.5 rounded-full bg-[#1C1917] transition-opacity duration-300 ease-out -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{ left: `${followerPos.x}px`, top: `${followerPos.y}px`, opacity: cursorOpacity }}
      />

      <header className="bg-[#FFFFFF] border-b border-[#E7E5E4] px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.reload()}>
          <div className="w-8 h-8 rounded-md bg-[#1C1917] flex items-center justify-center font-black text-[#FAF9F6] text-base">
            S
          </div>
          <span className="text-lg font-black tracking-tight text-[#1C1917] uppercase">SideBySide</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#F5F5F4] border border-[#E7E5E4] rounded-lg text-xs font-bold uppercase tracking-wider text-[#57534E]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Nível: {userLevelDisplay}
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#F5F5F4] border border-[#E7E5E4] rounded-lg text-xs font-bold uppercase tracking-wider text-[#57534E]">
            <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2 text-[#1C1917]" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.105-2.574-.305-3.8A11.983 11.983 0 0112 2.714z" />
            </svg>
            Reputação: {userReputationDisplay}/100
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={handleOpenNotifications}
              className="p-2.5 bg-[#FAF9F6] border-2 border-[#1C1917] rounded-xl hover:bg-[#F5F5F4] transition-all relative flex items-center justify-center outline-none shadow-sm"
              title="Notificações"
            >
              <svg className="w-4 h-4 stroke-current fill-none stroke-2 text-[#1C1917]" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-black flex items-center justify-center border border-[#FFFFFF]">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <div className="relative" ref={userMenuRef}>
            <button type="button" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2.5 border-l border-[#E7E5E4] pl-4 cursor-pointer hover:opacity-80 transition-opacity outline-none relative">
              <div className="w-8 h-8 rounded-lg bg-[#E7E5E4] overflow-hidden border border-[#D6D3D1] relative">
                <img src={userAvatarDisplay} alt={userNameDisplay} className="w-full h-full object-cover" />
              </div>
              
              {(friendRequestsCount > 0 || unreadChatMessages > 0) && (
                <span className="absolute top-0 left-2 w-3 h-3 bg-red-600 border-2 border-[#FFFFFF] rounded-full z-10 animate-pulse" />
              )}

              <span className="text-xs font-bold text-[#1C1917] hidden md:inline-block">{userNameDisplay}</span>
              <svg className={`w-4 h-4 stroke-[#78716C] fill-none stroke-2 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl shadow-xl py-2 z-50 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-[#E7E5E4] flex flex-col">
                  <span className="text-xs font-black text-[#1C1917]">{userNameDisplay}</span>
                  <span className="text-[10px] font-bold text-[#78716C] uppercase">{userEmailDisplay}</span>
                </div>

                <button type="button" onClick={() => { setIsUserMenuOpen(false); setIsFriendsOpen(true); }} className="px-4 py-2.5 hover:bg-[#FAF9F6] text-left flex items-center justify-between transition-colors group">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 stroke-[#57534E] group-hover:stroke-[#1C1917] fill-none stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.75 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                    <span className="text-xs font-bold text-[#57534E] group-hover:text-[#1C1917]">Lista de Amigos</span>
                  </div>
                  {friendRequestsCount > 0 && <span className="text-[10px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded">{friendRequestsCount}</span>}
                </button>

                <button type="button" onClick={() => { setIsUserMenuOpen(false); setSelectedChatContact(null); setIsDirectChatsOpen(true); }} className="px-4 py-2.5 hover:bg-[#FAF9F6] text-left flex items-center justify-between transition-colors group">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 stroke-[#57534E] group-hover:stroke-[#1C1917] fill-none stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                    <span className="text-xs font-bold text-[#57534E] group-hover:text-[#1C1917]">Conversas</span>
                  </div>
                  {unreadChatMessages > 0 ? (
                    <span className="text-[10px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded">{unreadChatMessages}</span>
                  ) : (
                    <span className="text-[10px] font-black bg-[#F5F5F4] px-2 py-0.5 rounded text-[#1C1917]">0</span>
                  )}
                </button>

                <button type="button" onClick={() => { setIsUserMenuOpen(false); setIsBadgesOpen(true); }} className="px-4 py-2.5 hover:bg-[#FAF9F6] text-left flex items-center justify-between transition-colors group">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 stroke-[#57534E] group-hover:stroke-[#1C1917] fill-none stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                    <span className="text-xs font-bold text-[#57534E] group-hover:text-[#1C1917]">Badges & Conquistas</span>
                  </div>
                  <span className="text-[10px] font-black bg-[#F5F5F4] px-2 py-0.5 rounded text-[#1C1917]">
                    {BADGES_CATALOG.filter(b => b.unlocked).length}/{BADGES_CATALOG.length}
                  </span>
                </button>

                <button type="button" onClick={() => { setIsUserMenuOpen(false); setActiveModal('reminders'); }} className="px-4 py-2.5 hover:bg-[#FAF9F6] text-left flex items-center justify-between transition-colors group">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 stroke-[#57534E] group-hover:stroke-[#1C1917] fill-none stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
                    <span className="text-xs font-bold text-[#57534E] group-hover:text-[#1C1917]">Lembretes Diários</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#78716C] uppercase">{reminderEnabled ? reminderTime : 'Off'}</span>
                </button>

                <button type="button" onClick={() => { setIsUserMenuOpen(false); setIsSupportOpen(true); }} className="px-4 py-2.5 hover:bg-[#FAF9F6] text-left flex items-center justify-between transition-colors group">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 stroke-[#57534E] group-hover:stroke-[#1C1917] fill-none stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18a.75.75 0 100-1.5.75.75 0 000 1.5z" /></svg>
                    <span className="text-xs font-bold text-[#57534E] group-hover:text-[#1C1917]">Ajuda & Suporte</span>
                  </div>
                </button>

                <div className="border-t border-[#E7E5E4] mt-1 pt-1">
                  <button type="button" onClick={() => { setIsUserMenuOpen(false); navigate('/profile'); }} className="w-full px-4 py-2.5 hover:bg-[#FAF9F6] text-left flex items-center gap-2.5 transition-colors group">
                    <svg className="w-4 h-4 stroke-[#57534E] group-hover:stroke-[#1C1917] fill-none stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                    <span className="text-xs font-bold text-[#57534E] group-hover:text-[#1C1917]">Meu Perfil</span>
                  </button>
                  <button type="button" onClick={handleLogout} className="w-full px-4 py-2.5 hover:bg-red-50 text-left flex items-center gap-2.5 transition-colors group mt-1">
                    <svg className="w-4 h-4 stroke-red-600 fill-none stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
                    <span className="text-xs font-bold text-red-600">Sair da Conta</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 lg:p-8 flex flex-col gap-6">
        
        <section className="flex flex-col gap-1 px-1">
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#1C1917]">
            Olá, {userFirstName}! Pronto para praticar?
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E] max-w-2xl leading-relaxed font-medium">
            Conecte-se instantaneamente com estudantes de nível {userLevelDisplay} de todo o mundo. Suas sessões são moderadas ativamente por IA para garantir um ambiente seguro.
          </p>
        </section>

        <section className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 bg-[#F5F5F4] w-40 h-40 rounded-full blur-3xl opacity-50 pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center relative z-10 border-b-2 border-[#E7E5E4] pb-6">
            <div className="flex flex-col gap-2 max-w-md">
              <span className="text-[10px] font-black tracking-widest text-[#FAF9F6] uppercase bg-[#1C1917] px-3 py-1 rounded-md w-fit">
                BATE-PAPO LIVRE
              </span>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#1C1917]">Procurar Par de Conversa</h2>
              <p className="text-xs text-[#57534E] leading-relaxed font-medium">
                Conecte-se aleatoriamente para falar sobre qualquer assunto. Treine a fluência improvisando e usando seu inglês do dia a dia de forma natural.
              </p>
            </div>
            
            <Button 
              variant="primary" 
              onClick={startMatchingFlow} 
              className="w-full sm:w-auto py-4 px-8 text-sm font-black uppercase tracking-widest bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] rounded-xl shadow-md flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="w-5 h-5 fill-current text-[#FAF9F6]" viewBox="0 0 24 24"><path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>
              INICIAR BUSCA AGORA
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 relative z-10">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-[#1C1917] uppercase tracking-wider">Modo de Mídia</label>
                <button type="button" onClick={() => setIsDeviceCheckOpen(true)} className="text-[9px] font-bold uppercase text-[#78716C] hover:text-[#1C1917] underline decoration-[#E7E5E4] underline-offset-2">Testar Hardware</button>
              </div>
              <div className="flex bg-[#F5F5F4] p-1.5 rounded-xl border-2 border-[#E7E5E4] text-[11px] font-black uppercase tracking-wider">
                <button type="button" onClick={() => { setMediaMode('video'); showToast('Modo Vídeo + Áudio selecionado', 'info'); }} className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${mediaMode === 'video' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-sm' : 'text-[#78716C] hover:bg-[#E7E5E4]'}`}>
                  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /></svg>
                  Vídeo + Áudio
                </button>
                <button type="button" onClick={() => { setMediaMode('audio'); showToast('Modo Apenas Áudio selecionado', 'info'); }} className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${mediaMode === 'audio' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-sm' : 'text-[#78716C] hover:bg-[#E7E5E4]'}`}>
                  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 003-3V4.5a3 3 0 00-3-3 3 3 0 00-3 3v8.25a3 3 0 003 3z" /></svg>
                  Apenas Áudio
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="text-[11px] font-black text-[#1C1917] uppercase tracking-wider">Opções de Pareamento</label>
              <div className="flex items-center justify-between bg-[#FAF9F6] border-2 border-[#E7E5E4] px-4 py-3 rounded-xl h-full">
                <span className="text-xs font-bold text-[#57534E] max-w-[200px] leading-tight">Permitir conectar com estudantes de níveis adjacentes (A2 e B2)</span>
                <button type="button" onClick={() => { setExpandedMatching(!expandedMatching); showToast(expandedMatching ? 'Pareamento estrito ativado' : 'Pareamento ampliado ativado', 'info'); }} className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${expandedMatching ? 'bg-[#1C1917]' : 'bg-[#E7E5E4]'}`}>
                  <div className={`bg-[#FFFFFF] w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${expandedMatching ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold tracking-widest text-[#78716C] uppercase">PRÁTICA GUIADA</span>
              <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">Salas Temáticas Recomendadas</h2>
            </div>
            <span className="text-[9px] font-black text-[#1C1917] bg-[#F5F5F4] px-2 py-1 rounded-md uppercase tracking-wider hidden sm:block border border-[#E7E5E4]">Atualizado Diariamente</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {DAILY_TOPICS.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => handleTopicCardClick(topic)}
                className={`p-5 rounded-2xl border text-left flex flex-col justify-between gap-4 transition-all hover:-translate-y-1 active:translate-y-0 ${selectedTopic.id === topic.id ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917] shadow-lg' : 'bg-[#FAF9F6] text-[#1C1917] border-[#E7E5E4] hover:border-[#1C1917]'}`}
              >
                <div className="flex flex-col gap-2">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md w-fit border ${selectedTopic.id === topic.id ? 'bg-[#292524] text-[#D6D3D1] border-[#57534E]' : 'bg-[#FFFFFF] text-[#57534E] border-[#E7E5E4]'}`}>
                    {topic.category}
                  </span>
                  <h3 className="text-[15px] font-black mt-1 leading-snug">{topic.title}</h3>
                </div>
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pt-3 border-t ${selectedTopic.id === topic.id ? 'border-[#57534E]' : 'border-[#E7E5E4]'}`}>
                  <span className={selectedTopic.id === topic.id ? 'text-[#FAF9F6]' : 'text-[#1C1917]'}>Entrar neste tópico</span>
                  <svg className={`w-3.5 h-3.5 fill-none stroke-current stroke-2 ${selectedTopic.id === topic.id ? 'text-emerald-400' : 'text-[#78716C]'}`} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </div>
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="flex flex-col gap-4">
            <h3 className="text-[11px] font-black text-[#78716C] uppercase tracking-widest pl-1">Seu Desempenho</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
              <button type="button" onClick={() => setActiveMetricModal('streak')} className="text-left group bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:border-[#1C1917] transition-all hover:shadow-md outline-none">
                <div className="w-12 h-12 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4] text-[#1C1917] flex items-center justify-center shrink-0 group-hover:bg-[#1C1917] group-hover:text-[#FAF9F6] transition-colors">
                  {userMetrics.hasPracticedToday ? (
                    <svg className="w-6 h-6 fill-none stroke-current stroke-2 group-hover:animate-bounce transition-transform duration-300" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.283 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" /></svg>
                  ) : (
                    <svg className="w-6 h-6 fill-none stroke-current stroke-2 text-sky-500 group-hover:text-[#FAF9F6] group-hover:rotate-12 transition-transform duration-300" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3m14.5-6.5l-11 11m11 0l-11-11M12 6.75L14.25 9M12 6.75L9.75 9m2.25 8.25l2.25-2.25m-2.25 2.25l-2.25-2.25M6.75 12L9 14.25M6.75 12L9 9.75m8.25 2.25L15 14.25m2.25-2.25L15 9.75" /></svg>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-[#1C1917] tracking-tight">{userMetrics.currentStreak} Dias</span>
                  <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider">{userMetrics.hasPracticedToday ? 'Sequência Ativa 🔥' : 'Praticar Hoje 🧊'}</span>
                </div>
              </button>

              <button type="button" onClick={() => setActiveMetricModal('sessions')} className="text-left group bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:border-[#1C1917] transition-all hover:shadow-md outline-none">
                <div className="w-12 h-12 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4] text-[#1C1917] flex items-center justify-center shrink-0 group-hover:bg-[#1C1917] group-hover:text-[#FAF9F6] transition-colors">
                  <svg className="w-6 h-6 fill-none stroke-current stroke-2 group-hover:scale-125 transition-transform duration-300" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.75 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-[#1C1917] tracking-tight">{userMetrics.totalSessions} Sessões</span>
                  <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider">Total Concluído</span>
                </div>
              </button>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-[11px] font-black text-[#78716C] uppercase tracking-widest pl-1">Sua Última Prática</h3>
            {lastSessionFeedback ? (
              <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-5 shadow-sm flex flex-col gap-3 h-full justify-center">
                <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#D6D3D1] bg-[#E7E5E4] shrink-0">
                      <img src={lastSessionFeedback.partnerAvatar} alt={lastSessionFeedback.partnerName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-[#1C1917] leading-none">{lastSessionFeedback.partnerName}</span>
                      <span className="text-[9px] font-bold text-[#78716C] uppercase mt-0.5">{lastSessionFeedback.date}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black bg-[#1C1917] text-[#FAF9F6] px-2 py-0.5 rounded">{lastSessionFeedback.duration}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-black text-[#78716C] uppercase tracking-wider">Vocabulário Aprendido</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(lastSessionFeedback.vocabLearned || []).map((word: string, idx: number) => (
                      <span key={idx} className="text-[10px] font-bold px-2 py-0.5 bg-[#FAF9F6] border border-[#E7E5E4] text-[#1C1917] rounded-md">{word}</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center text-center gap-2 h-full min-h-[140px]">
                <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Nenhuma sessão recente</span>
                <p className="text-[11px] text-[#57534E] max-w-[200px]">Participe de uma sala para visualizar seu resumo de vocabulário.</p>
              </div>
            )}
          </section>
        </div>

      </main>

      <FriendsManagerModal isOpen={isFriendsOpen} onClose={() => setIsFriendsOpen(false)} onOpenDirectChat={(friend) => { setSelectedChatContact(friend); setIsDirectChatsOpen(true); }} requestsList={requestsList} setRequestsList={setRequestsList} friendsList={friendsList} setFriendsList={setFriendsList} />
      <DirectChatsModal isOpen={isDirectChatsOpen} onClose={() => setIsDirectChatsOpen(false)} selectedContact={selectedChatContact} friendsList={friendsList} unreadCounts={unreadCounts} onClearUnread={clearUnreadForSender} />
      <BadgesModal isOpen={isBadgesOpen} onClose={() => setIsBadgesOpen(false)} />
      <DeviceCheckModal isOpen={isDeviceCheckOpen} onClose={() => setIsDeviceCheckOpen(false)} mediaMode={mediaMode} />
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
      <NotificationsModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} notifications={notifications} />

      {showTopicConfirmModal && (topicToJoin || selectedTopic) && (
        <div className="fixed inset-0 bg-[#1C1917]/80 backdrop-blur-md z-[130] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-8 max-w-md w-full shadow-[8px_8px_0px_0px_#1C1917] flex flex-col gap-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border-2 border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
              <svg className="w-8 h-8 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FAF9F6] bg-[#1C1917] px-2.5 py-0.5 rounded w-fit mx-auto">
                SALA TEMÁTICA: {(topicToJoin || selectedTopic)?.category}
              </span>
              <h3 className="text-lg font-black uppercase text-[#1C1917]">
                Entrando na sala: {(topicToJoin || selectedTopic)?.title}
              </h3>
              <p className="text-xs text-[#57534E] font-medium leading-relaxed">
                Você está entrando em uma sessão temática guiada. Para garantir um excelente aprendizado, você concorda em focar e seguir o assunto proposto pela sala junto ao seu parceiro?
              </p>
            </div>
            
            <div className="bg-[#FAF9F6] border-2 border-[#E7E5E4] p-4 rounded-xl flex flex-col gap-2 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">Pergunta Quebra-gelo Inicial:</span>
              <p className="text-xs font-bold text-[#1C1917] italic">"{(topicToJoin || selectedTopic)?.icebreaker}"</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowTopicConfirmModal(false)} className="flex-1 py-3.5 bg-[#FAF9F6] border-2 border-[#1C1917] text-[#1C1917] text-xs font-black uppercase rounded-xl hover:bg-[#F5F5F4] transition-all">
                Cancelar
              </button>
              <button type="button" onClick={confirmJoinRoomWithTopic} className="flex-1 py-3.5 bg-[#1C1917] text-[#FAF9F6] text-xs font-black uppercase rounded-xl border-2 border-[#1C1917] hover:bg-[#292524] transition-all shadow-sm cursor-pointer">
                Concordar e Começar
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'goals' && (
        <div className="fixed inset-0 bg-[#1C1917]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4">
              <h3 className="text-base font-black uppercase tracking-tight text-[#1C1917]">Meta Semanal de Prática</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-[#78716C] hover:text-[#1C1917] text-sm font-bold">✕</button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center text-xs font-bold text-[#1C1917]">
                <span>Progresso Atual</span>
                <span>{weeklyGoal.completed} de {weeklyGoal.target} conversas ({goalPercentage}%)</span>
              </div>
              <div className="w-full h-3 bg-[#F5F5F4] border border-[#E7E5E4] rounded-full overflow-hidden p-0.5">
                <div className="h-full bg-[#1C1917] rounded-full transition-all duration-500 ease-out" style={{ width: `${goalPercentage}%` }} />
              </div>
              <div className="grid grid-cols-7 gap-2 pt-2">
                {(mockMinutesHistory || []).map((item: { day: string; min: number }, index: number) => (
                  <div key={index} className="flex flex-col items-center gap-2 group w-full">
                    <div className="relative w-full flex justify-center h-full items-end">
                      <div className={`w-6 sm:w-8 rounded-t-md transition-all duration-300 ${item.min > 0 ? 'bg-[#1C1917] group-hover:bg-[#57534E]' : 'bg-[#E7E5E4]'}`} style={{ height: `${item.min === 0 ? 4 : (item.min / 40) * 100}%` }} />
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

      {activeModal === 'reminders' && (
        <div className="fixed inset-0 bg-[#1C1917]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4">
              <h3 className="text-base font-black uppercase tracking-tight text-[#1C1917]">Configuração de Lembretes</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-[#78716C] hover:text-[#1C1917] text-sm font-bold">✕</button>
            </div>
            <div className="flex items-center justify-between bg-[#FAF9F6] border border-[#E7E5E4] p-4 rounded-xl">
              <span className="text-xs font-bold text-[#1C1917]">Notificações Diárias</span>
              <button type="button" onClick={() => setReminderEnabled(!reminderEnabled)} className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${reminderEnabled ? 'bg-[#1C1917]' : 'bg-[#E7E5E4]'}`}>
                <div className={`bg-[#FFFFFF] w-4 h-4 rounded-full shadow-md transform transition-transform ${reminderEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
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

      {activeMetricModal && (
        <div className="fixed inset-0 bg-[#1C1917]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
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
                <div className="flex items-center justify-between bg-[#FAF9F6] p-4 rounded-xl border border-[#E7E5E4]">
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
                    {(weeklyGoal.days || []).map((item: { day: string; completed: boolean }, index: number) => (
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
                <div className="flex items-center justify-between bg-[#FAF9F6] p-4 rounded-xl border border-[#E7E5E4]">
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
                  <div className="flex items-end justify-between h-32 pt-4 border-b border-[#E7E5E4]">
                    {(weeklyGoal.days || []).map((item: { day: string; completed: boolean }, index: number) => (
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
                <div className="flex flex-col gap-3 max-h-60 overflow-y-auto">
                  {mockSessionsHistory.length > 0 ? (
                    mockSessionsHistory.map((session: { id: string; partner: string; date: string; duration: number; topic: string; rating: number; comment?: string }) => (
                      <div key={session.id} className="bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl p-4 flex flex-col gap-3 hover:border-[#1C1917] transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-black text-[#1C1917] uppercase">{session.partner}</span>
                            <span className="text-[10px] font-bold text-[#78716C]">{session.date}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-[#FFFFFF] border border-[#E7E5E4] px-2 py-1 rounded-lg">
                            <span className="text-[10px] font-black text-amber-500">{'★'.repeat(session.rating)}</span>
                          </div>
                        </div>
                        {session.comment && (
                          <p className="text-xs text-[#57534E] italic bg-[#FFFFFF] p-2.5 rounded-lg border border-[#E7E5E4]">
                            "{session.comment}"
                          </p>
                        )}
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
            <Button variant="primary" onClick={() => setActiveMetricModal(null)} className="w-full py-3 mt-2 text-xs font-bold uppercase tracking-widest bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] rounded-xl">Fechar Visualização</Button>
          </div>
        </div>
      )}
    </div>
  );
});

Dashboard.displayName = 'Dashboard';
export default Dashboard;