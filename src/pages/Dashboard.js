import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { FriendsManagerModal } from '../components/dashboard/FriendsManagerModal';
import { DirectChatsModal } from '../components/dashboard/DirectChatsModal';
import { BadgesModal } from '../components/dashboard/BadgesModal';
import { DeviceCheckModal } from '../components/dashboard/DeviceCheckModal';
import { SupportModal } from '../components/dashboard/SupportModal';
const FALLBACK_VOCAB_LIST = [
    {
        word: 'serendipity',
        phonetic: '/ˌser.ənˈdɪp.ə.ti/',
        definition: 'A ocorrência de acontecimentos afortunados por mero acaso ou sorte.',
    },
    {
        word: 'eloquent',
        phonetic: '/ˈel.ə.kwənt/',
        definition: 'Capacidade de se expressar com fluência, clareza e persuasão.',
    },
    {
        word: 'resilience',
        phonetic: '/rɪˈzɪl.jəns/',
        definition: 'A capacidade de se recuperar rapidamente de dificuldades ou desafios.',
    },
    {
        word: 'empathy',
        phonetic: '/ˈem.pə.θi/',
        definition: 'A habilidade de compreender e compartilhar os sentimentos de outra pessoa.',
    },
    {
        word: 'ephemeral',
        phonetic: '/ɪˈfem.ər.əl/',
        definition: 'Coisas passageiras, que duram por um período de tempo muito curto.',
    },
    {
        word: 'pragmatic',
        phonetic: '/præɡˈmæt.ɪk/',
        definition: 'Maneira de tratar as coisas de forma prática e realista em vez de teórica.',
    },
    {
        word: 'tenacity',
        phonetic: '/təˈnæs.ə.ti/',
        definition: 'A qualidade de ser muito determinado, firme e persistente.',
    },
    {
        word: 'gregarious',
        phonetic: '/ɡrɪˈɡeə.ri.əs/',
        definition: 'Pessoa sociável que gosta do convívio e da companhia dos outros.',
    },
];
export const Dashboard = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [mediaMode, setMediaMode] = useState('video');
    const [expandedMatching, setExpandedMatching] = useState(true);
    const [isMatching, setIsMatching] = useState(false);
    const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
    const [followerPos, setFollowerPos] = useState({ x: -100, y: -100 });
    const [cursorOpacity, setCursorOpacity] = useState(1);
    const [activeMetricModal, setActiveMetricModal] = useState(null);
    const mockSessionsHistory = userData?.sessionsHistory || [];
    const mockMinutesHistory = userData?.minutesHistory || [
        { day: 'Seg', min: 0 },
        { day: 'Ter', min: 0 },
        { day: 'Qua', min: 0 },
        { day: 'Qui', min: 0 },
        { day: 'Sex', min: 0 },
        { day: 'Sáb', min: 0 },
        { day: 'Dom', min: 0 },
    ];
    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch('http://localhost:3000/api/user/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUserData(data);
                }
            }
            catch (err) {
                console.error('Erro ao buscar dados do usuário', err);
            }
        };
        fetchUserData();
    }, []);
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
            const padding = 40;
            const isNearEdge = e.clientX < padding ||
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
        let animationFrameId;
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
    const [isFriendsOpen, setIsFriendsOpen] = useState(false);
    const [isDirectChatsOpen, setIsDirectChatsOpen] = useState(false);
    const [isBadgesOpen, setIsBadgesOpen] = useState(false);
    const [isDeviceCheckOpen, setIsDeviceCheckOpen] = useState(false);
    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const [selectedChatContact, setSelectedChatContact] = useState(null);
    const [friendRequestsCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationsRef = useRef(null);
    const [notifications, setNotifications] = useState([]);
    const unreadCount = notifications.filter((n) => n.unread).length;
    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    };
    const removeNotification = (id, e) => {
        if (e) {
            e.stopPropagation();
        }
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };
    const handleNotificationClick = (item) => {
        setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n)));
        setShowNotifications(false);
        if (item.type === 'friend') {
            setIsFriendsOpen(true);
        }
        else if (item.type === 'badge') {
            setIsBadgesOpen(true);
        }
        else if (item.type === 'reminder') {
            setIsMatching(true);
        }
        else if (item.type === 'goal') {
            setActiveModal('goals');
        }
    };
    const [vocabTip, setVocabTip] = useState(FALLBACK_VOCAB_LIST[0]);
    const [isLoadingVocab, setIsLoadingVocab] = useState(false);
    const fetchDynamicVocab = async () => {
        setIsLoadingVocab(true);
        const randomFallback = FALLBACK_VOCAB_LIST[Math.floor(Math.random() * FALLBACK_VOCAB_LIST.length)];
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${randomFallback.word}`);
            if (response.ok) {
                const data = await response.json();
                const entry = data[0];
                setVocabTip({
                    word: entry.word,
                    phonetic: entry.phonetic || entry.phonetics?.find((p) => p.text)?.text || randomFallback.phonetic,
                    definition: randomFallback.definition,
                });
            }
            else {
                setVocabTip(randomFallback);
            }
        }
        catch {
            setVocabTip(randomFallback);
        }
        finally {
            setIsLoadingVocab(false);
        }
    };
    useEffect(() => {
        if (isMatching) {
            fetchDynamicVocab();
        }
    }, [isMatching]);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);
    const [activeModal, setActiveModal] = useState(null);
    const [showTopicConfirmModal, setShowTopicConfirmModal] = useState(false);
    const [topicToJoin, setTopicToJoin] = useState(null);
    const lastSessionFeedback = userData?.lastSession || null;
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState('19:00');
    const [selectedDays, setSelectedDays] = useState([]);
    const weekDaysList = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const toggleDaySelection = (day) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter((d) => d !== day));
        }
        else {
            setSelectedDays([...selectedDays, day]);
        }
    };
    const weeklyGoal = userData?.weeklyGoal || {
        target: 5,
        completed: 0,
        days: [
            { day: 'Seg', completed: false },
            { day: 'Ter', completed: false },
            { day: 'Qua', completed: false },
            { day: 'Qui', completed: false },
            { day: 'Sex', completed: false },
            { day: 'Sáb', completed: false },
            { day: 'Dom', completed: false },
        ],
    };
    const goalPercentage = Math.min(100, Math.round((weeklyGoal.completed / weeklyGoal.target) * 100));
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const userMetrics = {
        currentStreak: userData?.streak || 0,
        hasPracticedToday: userData?.hasPracticedToday || false,
        totalMinutes: userData?.totalMinutes || 0,
        totalSessions: userData?.totalSessions || 0,
    };
    const dailyTopics = [
        {
            id: 'travel',
            category: 'Viagens & Culturas',
            title: 'Experiências Inesquecíveis',
            icebreaker: 'Qual foi o destino mais marcante que você já visitou e por quê?',
            vocabPreview: ['Destination', 'Wanderlust', 'Unforgettable'],
        },
        {
            id: 'career',
            category: 'Trabalho & Tecnologia',
            title: 'O Futuro da Inteligência Artificial',
            icebreaker: 'Como a tecnologia e a IA têm mudado a sua rotina diária no trabalho?',
            vocabPreview: ['Automation', 'Efficiency', 'Workflow'],
        },
        {
            id: 'hobbies',
            category: 'Estilo de Vida',
            title: 'Passatempos & Hábitos Diários',
            icebreaker: 'O que você mais gosta de fazer para relaxar no final de semana?',
            vocabPreview: ['Leisure', 'Unwind', 'Daily Routine'],
        },
    ];
    const [selectedTopic, setSelectedTopic] = useState(dailyTopics[0]);
    const handleTopicCardClick = (topic) => {
        setSelectedTopic(topic);
        setTopicToJoin(topic);
        setShowTopicConfirmModal(true);
    };
    const confirmJoinRoomWithTopic = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const targetTopic = topicToJoin || selectedTopic;
        setShowTopicConfirmModal(false);
        if (targetTopic && targetTopic.id) {
            navigate(`/room/${targetTopic.id}`);
        }
        else {
            navigate('/room');
        }
    };
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };
    const userNameDisplay = userData?.name || 'Estudante';
    const userFirstName = userNameDisplay.split(' ')[0];
    const userEmailDisplay = userData?.email || 'usuario@email.com';
    const userLevelDisplay = userData?.level || 'B1';
    const userReputationDisplay = userData?.reputation ?? 100;
    const userAvatarDisplay = userData?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
    return (_jsxs("div", { className: "min-h-screen bg-[#FAF9F6] text-[#1C1917] flex flex-col font-sans relative selection:bg-[#1C1917] selection:text-[#FAF9F6]", children: [_jsx("div", { className: "pointer-events-none fixed z-50 w-3.5 h-3.5 rounded-full bg-[#1C1917] transition-opacity duration-300 ease-out -translate-x-1/2 -translate-y-1/2 hidden md:block", style: {
                    left: `${followerPos.x}px`,
                    top: `${followerPos.y}px`,
                    opacity: cursorOpacity,
                } }), _jsxs("header", { className: "bg-[#FFFFFF] border-b border-[#E7E5E4] px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm", children: [_jsxs("div", { className: "flex items-center gap-3 cursor-pointer", onClick: () => navigate('/'), children: [_jsx("div", { className: "w-8 h-8 rounded-md bg-[#1C1917] flex items-center justify-center font-black text-[#FAF9F6] text-base", children: "S" }), _jsx("span", { className: "text-lg font-black tracking-tight text-[#1C1917] uppercase", children: "SideBySide" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#F5F5F4] border border-[#E7E5E4] rounded-lg text-xs font-bold uppercase tracking-wider text-[#57534E]", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-500 inline-block" }), "N\u00EDvel: ", userLevelDisplay] }), _jsxs("div", { className: "hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#F5F5F4] border border-[#E7E5E4] rounded-lg text-xs font-bold uppercase tracking-wider text-[#57534E]", children: [_jsx("svg", { className: "w-3.5 h-3.5 fill-none stroke-current stroke-2 text-[#1C1917]", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.105-2.574-.305-3.8A11.983 11.983 0 0112 2.714z" }) }), "Reputa\u00E7\u00E3o: ", userReputationDisplay, "/100"] }), _jsxs("div", { className: "relative", ref: notificationsRef, children: [_jsxs("button", { type: "button", onClick: () => setShowNotifications(!showNotifications), className: "p-2.5 bg-[#FAF9F6] border-2 border-[#1C1917] rounded-xl hover:bg-[#F5F5F4] transition-all relative flex items-center justify-center outline-none shadow-sm", title: "Notifica\u00E7\u00F5es", children: [_jsx("svg", { className: "w-4 h-4 stroke-current fill-none stroke-2 text-[#1C1917]", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" }) }), unreadCount > 0 && (_jsx("span", { className: "absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-black flex items-center justify-center border border-[#FFFFFF]", children: unreadCount }))] }), showNotifications && (_jsxs("div", { className: "absolute right-0 mt-3 w-80 sm:w-96 bg-[#FFFFFF] border-2 border-[#1C1917] rounded-2xl shadow-[6px_6px_0px_0px_#1C1917] py-3 z-50 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-150", children: [_jsxs("div", { className: "px-4 py-2 border-b-2 border-[#E7E5E4] flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h3", { className: "text-xs font-black uppercase text-[#1C1917]", children: "Notifica\u00E7\u00F5es & Lembretes" }), unreadCount > 0 && (_jsxs("span", { className: "text-[10px] font-black bg-[#1C1917] text-[#FAF9F6] px-2 py-0.5 rounded", children: [unreadCount, " novas"] }))] }), unreadCount > 0 && (_jsx("button", { type: "button", onClick: markAllAsRead, className: "text-[10px] font-black uppercase text-[#78716C] hover:text-[#1C1917] underline", children: "Marcar lidas" }))] }), _jsx("div", { className: "max-h-80 overflow-y-auto flex flex-col divide-y divide-[#E7E5E4]", children: notifications.length > 0 ? (notifications.map((item) => (_jsxs("div", { onClick: () => handleNotificationClick(item), className: `p-3.5 flex items-start justify-between gap-3 transition-colors cursor-pointer hover:bg-[#F5F5F4] ${item.unread ? 'bg-[#FAF9F6]' : 'bg-[#FFFFFF]'}`, children: [_jsxs("div", { className: "flex flex-col gap-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-xs font-black text-[#1C1917] uppercase", children: [item.type === 'reminder' && '🔔 ', item.type === 'goal' && '🎯 ', item.type === 'friend' && '👤 ', item.type === 'badge' && '🏆 ', item.title] }), item.unread && (_jsx("span", { className: "w-2 h-2 rounded-full bg-red-600" }))] }), _jsx("p", { className: "text-xs text-[#57534E] font-medium leading-relaxed", children: item.message }), _jsx("span", { className: "text-[10px] font-bold text-[#A8A29E] uppercase mt-0.5", children: item.time })] }), _jsx("button", { type: "button", onClick: (e) => removeNotification(item.id, e), className: "text-xs font-bold text-[#A8A29E] hover:text-[#1C1917] shrink-0 p-1", title: "Remover", children: "\u2715" })] }, item.id)))) : (_jsx("div", { className: "p-6 text-center text-xs font-bold text-[#78716C] uppercase", children: "Nenhuma notifica\u00E7\u00E3o por enquanto." })) }), _jsx("div", { className: "px-3 pt-2 border-t-2 border-[#E7E5E4]", children: _jsx("button", { type: "button", onClick: () => {
                                                        setShowNotifications(false);
                                                        navigate('/profile');
                                                    }, className: "w-full py-2 bg-[#FAF9F6] border-2 border-[#1C1917] text-[#1C1917] text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-[#1C1917] hover:text-[#FAF9F6] transition-all", children: "Gerenciar Lembretes e Metas" }) })] }))] }), _jsxs("div", { className: "relative", ref: userMenuRef, children: [_jsxs("button", { type: "button", onClick: () => setIsUserMenuOpen(!isUserMenuOpen), className: "flex items-center gap-2.5 border-l border-[#E7E5E4] pl-4 cursor-pointer hover:opacity-80 transition-opacity outline-none", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-[#E7E5E4] overflow-hidden border border-[#D6D3D1]", children: _jsx("img", { src: userAvatarDisplay, alt: userNameDisplay, className: "w-full h-full object-cover" }) }), _jsx("span", { className: "text-xs font-bold text-[#1C1917] hidden md:inline-block", children: userNameDisplay }), _jsx("svg", { className: `w-4 h-4 stroke-[#78716C] fill-none stroke-2 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : 'rotate-0'}`, viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.5 8.25l-7.5 7.5-7.5-7.5" }) })] }), isUserMenuOpen && (_jsxs("div", { className: "absolute right-0 mt-3 w-64 bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl shadow-xl py-2 z-50 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150", children: [_jsxs("div", { className: "px-4 py-2 border-b border-[#E7E5E4] flex flex-col", children: [_jsx("span", { className: "text-xs font-black text-[#1C1917]", children: userNameDisplay }), _jsx("span", { className: "text-[10px] font-bold text-[#78716C] uppercase", children: userEmailDisplay })] }), _jsxs("button", { type: "button", onClick: () => {
                                                    setIsUserMenuOpen(false);
                                                    setIsFriendsOpen(true);
                                                }, className: "px-4 py-2.5 hover:bg-[#FAF9F6] text-left flex items-center justify-between transition-colors group", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("svg", { className: "w-4 h-4 stroke-[#57534E] group-hover:stroke-[#1C1917] fill-none stroke-2", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.75 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" }) }), _jsx("span", { className: "text-xs font-bold text-[#57534E] group-hover:text-[#1C1917]", children: "Lista de Amigos" })] }), friendRequestsCount > 0 && (_jsx("span", { className: "text-[10px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded", children: friendRequestsCount }))] }), _jsxs("button", { type: "button", onClick: () => {
                                                    setIsUserMenuOpen(false);
                                                    setSelectedChatContact(null);
                                                    setIsDirectChatsOpen(true);
                                                }, className: "px-4 py-2.5 hover:bg-[#FAF9F6] text-left flex items-center justify-between transition-colors group", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("svg", { className: "w-4 h-4 stroke-[#57534E] group-hover:stroke-[#1C1917] fill-none stroke-2", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" }) }), _jsx("span", { className: "text-xs font-bold text-[#57534E] group-hover:text-[#1C1917]", children: "Conversas" })] }), _jsx("span", { className: "text-[10px] font-black bg-[#F5F5F4] px-2 py-0.5 rounded text-[#1C1917]", children: "0" })] }), _jsxs("button", { type: "button", onClick: () => {
                                                    setIsUserMenuOpen(false);
                                                    setIsBadgesOpen(true);
                                                }, className: "px-4 py-2.5 hover:bg-[#FAF9F6] text-left flex items-center justify-between transition-colors group", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("svg", { className: "w-4 h-4 stroke-[#57534E] group-hover:stroke-[#1C1917] fill-none stroke-2", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" }) }), _jsx("span", { className: "text-xs font-bold text-[#57534E] group-hover:text-[#1C1917]", children: "Badges & Conquistas" })] }), _jsx("span", { className: "text-[10px] font-black bg-[#F5F5F4] px-2 py-0.5 rounded text-[#1C1917]", children: "0/8" })] }), _jsxs("button", { type: "button", onClick: () => {
                                                    setIsUserMenuOpen(false);
                                                    setActiveModal('reminders');
                                                }, className: "px-4 py-2.5 hover:bg-[#FAF9F6] text-left flex items-center justify-between transition-colors group", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("svg", { className: "w-4 h-4 stroke-[#57534E] group-hover:stroke-[#1C1917] fill-none stroke-2", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" }) }), _jsx("span", { className: "text-xs font-bold text-[#57534E] group-hover:text-[#1C1917]", children: "Lembretes Di\u00E1rios" })] }), _jsx("span", { className: "text-[10px] font-bold text-[#78716C] uppercase", children: reminderEnabled ? reminderTime : 'Off' })] }), _jsx("button", { type: "button", onClick: () => {
                                                    setIsUserMenuOpen(false);
                                                    setIsSupportOpen(true);
                                                }, className: "px-4 py-2.5 hover:bg-[#FAF9F6] text-left flex items-center justify-between transition-colors group", children: _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("svg", { className: "w-4 h-4 stroke-[#57534E] group-hover:stroke-[#1C1917] fill-none stroke-2", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18a.75.75 0 100-1.5.75.75 0 000 1.5z" }) }), _jsx("span", { className: "text-xs font-bold text-[#57534E] group-hover:text-[#1C1917]", children: "Ajuda & Suporte" })] }) }), _jsxs("div", { className: "border-t border-[#E7E5E4] mt-1 pt-1", children: [_jsxs("button", { type: "button", onClick: () => {
                                                            setIsUserMenuOpen(false);
                                                            navigate('/profile');
                                                        }, className: "w-full px-4 py-2.5 hover:bg-[#FAF9F6] text-left flex items-center gap-2.5 transition-colors group", children: [_jsx("svg", { className: "w-4 h-4 stroke-[#57534E] group-hover:stroke-[#1C1917] fill-none stroke-2", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" }) }), _jsx("span", { className: "text-xs font-bold text-[#57534E] group-hover:text-[#1C1917]", children: "Meu Perfil" })] }), _jsxs("button", { type: "button", onClick: handleLogout, className: "w-full px-4 py-2.5 hover:bg-red-50 text-left flex items-center gap-2.5 transition-colors group mt-1", children: [_jsx("svg", { className: "w-4 h-4 stroke-red-600 fill-none stroke-2", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" }) }), _jsx("span", { className: "text-xs font-bold text-red-600", children: "Sair da Conta" })] })] })] }))] })] })] }), _jsxs("main", { className: "flex-1 max-w-5xl w-full mx-auto p-6 lg:p-8 flex flex-col gap-6", children: [_jsxs("section", { className: "bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-2", children: [_jsx("span", { className: "text-[10px] font-bold tracking-widest text-[#78716C] uppercase bg-[#F5F5F4] border border-[#E7E5E4] px-3 py-1 rounded-md w-fit", children: "PAINEL DO ESTUDANTE" }), _jsxs("h1", { className: "text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#1C1917] mt-1", children: ["Ol\u00E1, ", userFirstName, "! Pronto para praticar?"] }), _jsxs("p", { className: "text-xs sm:text-sm text-[#57534E] max-w-2xl leading-relaxed font-medium", children: ["Conecte-se instantaneamente com estudantes de n\u00EDvel ", userLevelDisplay, " de todo o mundo. Suas sess\u00F5es s\u00E3o moderadas ativamente por IA para garantir um ambiente seguro, respeitoso e focado no aprendizado m\u00FAtuo."] })] }), lastSessionFeedback ? (_jsxs("section", { className: "bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 shadow-sm flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-[#E7E5E4] pb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-500" }), _jsx("h2", { className: "text-xs font-black uppercase tracking-wider text-[#1C1917]", children: "Resumo da \u00DAltima Sess\u00E3o" })] }), _jsxs("span", { className: "text-[11px] font-bold text-[#78716C]", children: [lastSessionFeedback.date, " (", lastSessionFeedback.duration, ")"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 items-center", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl overflow-hidden border border-[#D6D3D1] bg-[#E7E5E4] shrink-0", children: _jsx("img", { src: lastSessionFeedback.partnerAvatar, alt: lastSessionFeedback.partnerName, className: "w-full h-full object-cover" }) }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-xs font-bold text-[#1C1917]", children: lastSessionFeedback.partnerName }), _jsxs("span", { className: "text-[10px] font-medium text-[#78716C] uppercase", children: ["Tema: ", lastSessionFeedback.topic] })] })] }), _jsxs("div", { className: "bg-[#FAF9F6] border border-[#E7E5E4] p-3 rounded-xl flex flex-col gap-1", children: [_jsx("span", { className: "text-[10px] font-bold text-[#78716C] uppercase", children: "Sua Nota P\u00F3s-Chamada" }), _jsxs("p", { className: "text-xs text-[#1C1917] font-medium italic line-clamp-2", children: ["\"", lastSessionFeedback.userNote, "\""] })] }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("span", { className: "text-[10px] font-bold text-[#78716C] uppercase", children: "Vocabul\u00E1rio Utilizado" }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: lastSessionFeedback.vocabLearned.map((word, idx) => (_jsx("span", { className: "text-[10px] font-bold px-2 py-0.5 bg-[#F5F5F4] border border-[#E7E5E4] text-[#1C1917] rounded-md", children: word }, idx))) })] })] })] })) : (_jsxs("section", { className: "bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center gap-2", children: [_jsx("span", { className: "text-xs font-bold text-[#78716C] uppercase tracking-wider", children: "Nenhuma sess\u00E3o realizada ainda" }), _jsx("p", { className: "text-xs text-[#57534E]", children: "Participe da sua primeira sala para ver o resumo e o vocabul\u00E1rio por aqui!" })] })), _jsxs("section", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsxs("button", { type: "button", onClick: () => setActiveMetricModal('streak'), className: "w-full text-left group bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:border-[#1C1917] transition-all hover:shadow-md cursor-pointer outline-none", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4] text-[#1C1917] flex items-center justify-center shrink-0 group-hover:bg-[#1C1917] group-hover:text-[#FAF9F6] transition-colors", children: userMetrics.hasPracticedToday ? (_jsxs("svg", { className: "w-6 h-6 fill-none stroke-current stroke-2 group-hover:animate-bounce transition-transform duration-300", viewBox: "0 0 24 24", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.283 0 013.361-6.867 8.21 8.21 0 003 2.48z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" })] })) : (_jsx("svg", { className: "w-6 h-6 fill-none stroke-current stroke-2 text-sky-500 group-hover:text-[#FAF9F6] group-hover:rotate-12 transition-transform duration-300", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 3v18m9-9H3m14.5-6.5l-11 11m11 0l-11-11M12 6.75L14.25 9M12 6.75L9.75 9m2.25 8.25l2.25-2.25m-2.25 2.25l-2.25-2.25M6.75 12L9 14.25M6.75 12L9 9.75m8.25 2.25L15 14.25m2.25-2.25L15 9.75" }) })) }), _jsxs("div", { className: "flex flex-col", children: [_jsxs("span", { className: "text-2xl font-black text-[#1C1917] tracking-tight", children: [userMetrics.currentStreak, " Dias"] }), _jsx("span", { className: "text-xs font-bold text-[#78716C] uppercase tracking-wider", children: userMetrics.hasPracticedToday ? 'Sequência Ativa 🔥' : 'Nenhuma Prática Hoje 🧊' })] })] }), _jsxs("button", { type: "button", onClick: () => setActiveMetricModal('minutes'), className: "w-full text-left group bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:border-[#1C1917] transition-all hover:shadow-md cursor-pointer outline-none", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4] text-[#1C1917] flex items-center justify-center shrink-0 group-hover:bg-[#1C1917] group-hover:text-[#FAF9F6] transition-colors", children: _jsx("svg", { className: "w-6 h-6 fill-none stroke-current stroke-2 group-hover:rotate-[360deg] transition-transform duration-700 ease-in-out", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }), _jsxs("div", { className: "flex flex-col", children: [_jsxs("span", { className: "text-2xl font-black text-[#1C1917] tracking-tight", children: [userMetrics.totalMinutes, " Minutos"] }), _jsx("span", { className: "text-xs font-bold text-[#78716C] uppercase tracking-wider", children: "Praticados na Semana" })] })] }), _jsxs("button", { type: "button", onClick: () => setActiveMetricModal('sessions'), className: "w-full text-left group bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:border-[#1C1917] transition-all hover:shadow-md cursor-pointer outline-none", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4] text-[#1C1917] flex items-center justify-center shrink-0 group-hover:bg-[#1C1917] group-hover:text-[#FAF9F6] transition-colors", children: _jsx("svg", { className: "w-6 h-6 fill-none stroke-current stroke-2 group-hover:scale-125 transition-transform duration-300", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.75 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" }) }) }), _jsxs("div", { className: "flex flex-col", children: [_jsxs("span", { className: "text-2xl font-black text-[#1C1917] tracking-tight", children: [userMetrics.totalSessions, " Conex\u00F5es"] }), _jsx("span", { className: "text-xs font-bold text-[#78716C] uppercase tracking-wider", children: "Sess\u00F5es Realizadas" })] })] })] }), _jsxs("section", { className: "bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-6", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-[#E7E5E4] pb-4", children: [_jsx("h2", { className: "text-base font-black uppercase tracking-tight text-[#1C1917]", children: "T\u00F3picos Recomendados para Hoje" }), _jsx("span", { className: "text-xs font-bold text-[#78716C] uppercase tracking-wider", children: "Atualizado Diariamente" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: dailyTopics.map((topic) => (_jsxs("button", { type: "button", onClick: () => handleTopicCardClick(topic), className: `p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] ${selectedTopic.id === topic.id
                                        ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917] shadow-md'
                                        : 'bg-[#FAF9F6] text-[#1C1917] border-[#E7E5E4] hover:border-[#1C1917]'}`, children: [_jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("span", { className: `text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md w-fit ${selectedTopic.id === topic.id
                                                        ? 'bg-[#292524] text-[#A8A29E]'
                                                        : 'bg-[#E7E5E4] text-[#57534E]'}`, children: topic.category }), _jsx("h3", { className: "text-sm font-bold mt-1 leading-snug", children: topic.title })] }), _jsxs("div", { className: "flex items-center justify-between text-[11px] font-bold uppercase tracking-wider pt-2 border-t border-[#E7E5E4]/40", children: [_jsx("span", { children: "Entrar neste t\u00F3pico" }), _jsx("svg", { className: "w-3.5 h-3.5 fill-none stroke-current stroke-2", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" }) })] })] }, topic.id))) }), _jsxs("div", { className: "bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl p-5 flex flex-col gap-4", children: [_jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest text-[#78716C]", children: "Pergunta Quebra-gelo Sugerida" }), _jsxs("p", { className: "text-sm font-bold text-[#1C1917] italic", children: ["\"", selectedTopic.icebreaker, "\""] })] }), _jsxs("div", { className: "flex flex-col gap-1.5 pt-3 border-t border-[#E7E5E4]", children: [_jsx("span", { className: "text-[10px] font-bold uppercase tracking-widest text-[#78716C]", children: "Vocabul\u00E1rio Recomendado" }), _jsx("div", { className: "flex flex-wrap gap-2", children: selectedTopic.vocabPreview.map((word, idx) => (_jsx("span", { className: "text-xs font-bold px-2.5 py-1 bg-[#FFFFFF] border border-[#E7E5E4] rounded-md text-[#1C1917]", children: word }, idx))) })] })] })] }), _jsxs("section", { className: "bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-6", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-[#E7E5E4] pb-4", children: [_jsx("h2", { className: "text-base font-black uppercase tracking-tight text-[#1C1917]", children: "Configura\u00E7\u00F5es de Conex\u00E3o" }), _jsxs("button", { type: "button", onClick: () => setIsDeviceCheckOpen(true), className: "px-3.5 py-1.5 bg-[#FAF9F6] border-2 border-[#1C1917] rounded-xl text-[11px] font-black uppercase tracking-wider text-[#1C1917] hover:bg-[#1C1917] hover:text-[#FAF9F6] transition-all flex items-center gap-1.5", children: [_jsx("svg", { className: "w-3.5 h-3.5 fill-none stroke-current stroke-2", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.83m0 0a5.99 5.99 0 00-2.003-7.234L10.87 6.44a1.125 1.125 0 00-1.221.22L6.15 10.16a1.125 1.125 0 00-.22 1.221l2.302 2.498a5.99 5.99 0 007.188.291z" }) }), "Testar Equipamento"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("label", { className: "text-xs font-bold text-[#78716C] uppercase tracking-wider", children: "Modo de M\u00EDdia" }), _jsxs("div", { className: "grid grid-cols-2 bg-[#F5F5F4] p-1 rounded-xl border border-[#E7E5E4] text-xs font-bold uppercase tracking-wider", children: [_jsxs("button", { type: "button", onClick: () => setMediaMode('video'), className: `py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${mediaMode === 'video' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-sm' : 'text-[#78716C]'}`, children: [_jsx("svg", { className: "w-4 h-4 fill-none stroke-current stroke-2", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" }) }), "V\u00EDdeo + \u00C1udio"] }), _jsxs("button", { type: "button", onClick: () => setMediaMode('audio'), className: `py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${mediaMode === 'audio' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-sm' : 'text-[#78716C]'}`, children: [_jsx("svg", { className: "w-4 h-4 fill-none stroke-current stroke-2", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 003-3V4.5a3 3 0 00-3-3 3 3 0 00-3 3v8.25a3 3 0 003 3z" }) }), "Apenas \u00C1udio"] })] })] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("label", { className: "text-xs font-bold text-[#78716C] uppercase tracking-wider", children: "Pareamento Ampliado" }), _jsxs("div", { className: "flex items-center justify-between bg-[#F5F5F4] border border-[#E7E5E4] px-4 py-2.5 rounded-xl h-[42px]", children: [_jsx("span", { className: "text-xs font-bold text-[#57534E]", children: "Permitir conectar com n\u00EDveis adjacentes (A2 e B2)" }), _jsx("button", { type: "button", onClick: () => setExpandedMatching(!expandedMatching), className: `w-11 h-6 flex items-center rounded-full p-1 transition-colors ${expandedMatching ? 'bg-[#1C1917]' : 'bg-[#E7E5E4]'}`, children: _jsx("div", { className: `bg-[#FFFFFF] w-4 h-4 rounded-full shadow-md transform transition-transform ${expandedMatching ? 'translate-x-5' : 'translate-x-0'}` }) })] })] })] }), _jsxs(Button, { variant: "primary", onClick: () => setIsMatching(true), className: "w-full py-4 text-xs font-bold uppercase tracking-widest bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] rounded-xl shadow-md flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99]", children: [_jsx("svg", { className: "w-4 h-4 fill-current text-[#FAF9F6]", viewBox: "0 0 24 24", children: _jsx("path", { d: "M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" }) }), "PROCURAR PAR DE CONVERSA"] })] }), _jsxs("section", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 flex items-start gap-4 shadow-sm hover:border-[#1C1917] transition-colors", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4] text-[#1C1917] flex items-center justify-center shrink-0", children: _jsx("svg", { className: "w-5 h-5 fill-none stroke-current stroke-2", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.105-2.574-.305-3.8A11.983 11.983 0 0112 2.714z" }) }) }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("h3", { className: "text-sm font-bold uppercase tracking-tight text-[#1C1917]", children: "Modera\u00E7\u00E3o Segura SideBySide" }), _jsx("p", { className: "text-xs text-[#57534E] leading-relaxed font-medium", children: "Nossa Intelig\u00EAncia Artificial analisa intera\u00E7\u00F5es em tempo real para detectar qualquer comportamento impr\u00F3prio, garantindo respeito e ambiente protegido." })] })] }), _jsxs("div", { className: "bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 flex items-start gap-4 shadow-sm hover:border-[#1C1917] transition-colors", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4] text-[#1C1917] flex items-center justify-center shrink-0", children: _jsx("svg", { className: "w-5 h-5 fill-none stroke-current stroke-2", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" }) }) }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("h3", { className: "text-sm font-bold uppercase tracking-tight text-[#1C1917]", children: "Dicas para destravar a fala" }), _jsx("p", { className: "text-xs text-[#57534E] leading-relaxed font-medium", children: "N\u00E3o tenha vergonha de errar! Seu par est\u00E1 no mesmo n\u00EDvel que voc\u00EA. Use frases de transi\u00E7\u00E3o e respire entre as ideias para manter um fluxo confort\u00E1vel." })] })] })] })] }), _jsx(FriendsManagerModal, { isOpen: isFriendsOpen, onClose: () => setIsFriendsOpen(false), onOpenDirectChat: (friend) => {
                    setSelectedChatContact(friend);
                    setIsDirectChatsOpen(true);
                } }), _jsx(DirectChatsModal, { isOpen: isDirectChatsOpen, onClose: () => setIsDirectChatsOpen(false), selectedContact: selectedChatContact }), _jsx(BadgesModal, { isOpen: isBadgesOpen, onClose: () => setIsBadgesOpen(false) }), _jsx(DeviceCheckModal, { isOpen: isDeviceCheckOpen, onClose: () => setIsDeviceCheckOpen(false), mediaMode: mediaMode }), _jsx(SupportModal, { isOpen: isSupportOpen, onClose: () => setIsSupportOpen(false) }), showTopicConfirmModal && (topicToJoin || selectedTopic) && (_jsx("div", { className: "fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-[#E7E5E4] pb-3", children: [_jsx("span", { className: "text-[10px] font-black uppercase tracking-widest bg-[#F5F5F4] text-[#1C1917] px-2.5 py-1 rounded border border-[#E7E5E4]", children: (topicToJoin || selectedTopic)?.category }), _jsx("button", { type: "button", onClick: () => setShowTopicConfirmModal(false), className: "text-sm font-bold text-[#78716C] hover:text-[#1C1917]", children: "\u2715" })] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("h3", { className: "text-lg font-black uppercase text-[#1C1917]", children: (topicToJoin || selectedTopic)?.title }), _jsx("p", { className: "text-xs text-[#57534E] font-medium leading-relaxed", children: "Deseja entrar na sala de conversa\u00E7\u00E3o com o guia deste t\u00F3pico ativado? Os assuntos e a linha narrativa da sala ser\u00E3o ajustados para esse tema." })] }), _jsxs("div", { className: "bg-[#FAF9F6] border border-[#E7E5E4] p-4 rounded-xl flex flex-col gap-2", children: [_jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-[#78716C]", children: "Pergunta Quebra-gelo Inicial:" }), _jsxs("p", { className: "text-xs font-bold text-[#1C1917] italic", children: ["\"", (topicToJoin || selectedTopic)?.icebreaker, "\""] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { type: "button", onClick: () => setShowTopicConfirmModal(false), className: "flex-1 py-3 bg-[#F5F5F4] hover:bg-[#E7E5E4] text-[#1C1917] font-bold text-xs uppercase tracking-wider rounded-xl transition-all", children: "Cancelar" }), _jsx("button", { type: "button", onClick: confirmJoinRoomWithTopic, className: "flex-1 py-3 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md", children: "Entrar na Sala" })] })] }) })), isMatching && (_jsx("div", { className: "fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-8 sm:p-10 max-w-lg w-full shadow-2xl flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-150", children: [_jsxs("div", { className: "relative flex items-center justify-center", children: [_jsx("div", { className: "w-24 h-24 rounded-full border-4 border-[#F5F5F4] border-t-[#1C1917] animate-spin" }), _jsx("div", { className: "absolute w-12 h-12 rounded-full bg-[#1C1917] text-[#FAF9F6] font-black text-base flex items-center justify-center uppercase", children: "S" })] }), _jsxs("div", { className: "flex flex-col items-center text-center gap-2", children: [_jsx("h3", { className: "text-xl sm:text-2xl font-black uppercase tracking-tight text-[#1C1917]", children: "Buscando Par de Conversa..." }), _jsxs("p", { className: "text-sm font-bold text-[#78716C]", children: ["Procurando estudante no n\u00EDvel ", _jsx("span", { className: "text-[#1C1917] underline", children: userLevelDisplay })] })] }), _jsxs("div", { className: "w-full bg-[#FAF9F6] border border-[#E7E5E4] rounded-2xl p-6 flex flex-col gap-3 text-left", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-[#E7E5E4] pb-3", children: [_jsx("span", { className: "text-xs font-black uppercase tracking-widest text-[#78716C]", children: "Vocabul\u00E1rio para Praticar Hoje" }), _jsx("button", { type: "button", onClick: fetchDynamicVocab, className: "text-xs font-bold text-[#1C1917] hover:underline uppercase flex items-center gap-1", children: "Nova Palavra \u21BB" })] }), isLoadingVocab ? (_jsx("div", { className: "py-4 text-center text-sm font-bold text-[#78716C] animate-pulse", children: "Atualizando sugest\u00E3o de vocabul\u00E1rio..." })) : (_jsxs("div", { className: "flex flex-col gap-2 pt-1", children: [_jsxs("div", { className: "flex items-baseline gap-2", children: [_jsx("span", { className: "text-lg font-black text-[#1C1917] capitalize", children: vocabTip.word }), vocabTip.phonetic && (_jsx("span", { className: "text-xs font-bold text-[#78716C] italic", children: vocabTip.phonetic }))] }), _jsx("p", { className: "text-sm font-medium text-[#57534E] leading-relaxed", children: vocabTip.definition })] }))] }), _jsx("button", { type: "button", onClick: () => setIsMatching(false), className: "w-full py-4 bg-[#F5F5F4] hover:bg-[#E7E5E4] border border-[#E7E5E4] text-[#1C1917] font-bold text-xs uppercase tracking-widest rounded-xl transition-all", children: "Cancelar Busca" })] }) })), activeModal === 'goals' && (_jsx("div", { className: "fixed inset-0 bg-[#1C1917]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-[#E7E5E4] pb-4", children: [_jsx("h3", { className: "text-base font-black uppercase tracking-tight text-[#1C1917]", children: "Meta Semanal de Pr\u00E1tica" }), _jsx("button", { type: "button", onClick: () => setActiveModal(null), className: "text-[#78716C] hover:text-[#1C1917] text-sm font-bold", children: "\u2715" })] }), _jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex justify-between items-center text-xs font-bold text-[#1C1917]", children: [_jsx("span", { children: "Progresso Atual" }), _jsxs("span", { children: [weeklyGoal.completed, " de ", weeklyGoal.target, " conversas (", goalPercentage, "%)"] })] }), _jsx("div", { className: "w-full h-3 bg-[#F5F5F4] border border-[#E7E5E4] rounded-full overflow-hidden p-0.5", children: _jsx("div", { className: "h-full bg-[#1C1917] rounded-full transition-all duration-500 ease-out", style: { width: `${goalPercentage}%` } }) }), _jsx("div", { className: "grid grid-cols-7 gap-2 pt-2", children: weeklyGoal.days.map((item, index) => (_jsxs("div", { className: "flex flex-col items-center gap-1.5", children: [_jsx("div", { className: `w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs transition-colors ${item.completed
                                                    ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]'
                                                    : 'bg-[#FAF9F6] text-[#A8A29E] border-[#E7E5E4]'}`, children: item.completed ? (_jsx("svg", { className: "w-4 h-4 fill-none stroke-current stroke-[3]", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4.5 12.75l6 6 9-13.5" }) })) : ('•') }), _jsx("span", { className: "text-[10px] font-bold text-[#78716C] uppercase", children: item.day })] }, index))) })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "primary", onClick: () => {
                                        setActiveModal(null);
                                        navigate('/profile');
                                    }, className: "flex-1 py-3 text-xs font-bold uppercase tracking-widest bg-[#FAF9F6] border border-[#1C1917] text-[#1C1917] hover:bg-[#F5F5F4] rounded-xl", children: "Ajustar no Perfil" }), _jsx(Button, { variant: "primary", onClick: () => setActiveModal(null), className: "flex-1 py-3 text-xs font-bold uppercase tracking-widest bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] rounded-xl", children: "Fechar" })] })] }) })), activeModal === 'reminders' && (_jsx("div", { className: "fixed inset-0 bg-[#1C1917]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-[#E7E5E4] pb-4", children: [_jsx("h3", { className: "text-base font-black uppercase tracking-tight text-[#1C1917]", children: "Configura\u00E7\u00E3o de Lembretes" }), _jsx("button", { type: "button", onClick: () => setActiveModal(null), className: "text-[#78716C] hover:text-[#1C1917] text-sm font-bold", children: "\u2715" })] }), _jsxs("div", { className: "flex items-center justify-between bg-[#FAF9F6] border border-[#E7E5E4] p-4 rounded-xl", children: [_jsx("span", { className: "text-xs font-bold text-[#1C1917]", children: "Notifica\u00E7\u00F5es Di\u00E1rias" }), _jsx("button", { type: "button", onClick: () => setReminderEnabled(!reminderEnabled), className: `w-11 h-6 flex items-center rounded-full p-1 transition-colors ${reminderEnabled ? 'bg-[#1C1917]' : 'bg-[#E7E5E4]'}`, children: _jsx("div", { className: `bg-[#FFFFFF] w-4 h-4 rounded-full shadow-md transform transition-transform ${reminderEnabled ? 'translate-x-5' : 'translate-x-0'}` }) })] }), reminderEnabled && (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("label", { className: "text-xs font-bold text-[#78716C] uppercase tracking-wider", children: "Hor\u00E1rio Preferencial" }), _jsx("input", { type: "time", value: reminderTime, onChange: (e) => setReminderTime(e.target.value), className: "px-4 py-2.5 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] w-full" })] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("label", { className: "text-xs font-bold text-[#78716C] uppercase tracking-wider", children: "Dias Ativos" }), _jsx("div", { className: "flex gap-1 justify-between", children: weekDaysList.map((day) => {
                                                const isSelected = selectedDays.includes(day);
                                                return (_jsx("button", { type: "button", onClick: () => toggleDaySelection(day), className: `flex-1 py-2 rounded-lg text-[10px] font-bold uppercase border transition-all ${isSelected
                                                        ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]'
                                                        : 'bg-[#FAF9F6] text-[#78716C] border-[#E7E5E4]'}`, children: day }, day));
                                            }) })] })] })), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "primary", onClick: () => {
                                        setActiveModal(null);
                                        navigate('/profile');
                                    }, className: "flex-1 py-3 text-xs font-bold uppercase tracking-widest bg-[#FAF9F6] border border-[#1C1917] text-[#1C1917] hover:bg-[#F5F5F4] rounded-xl", children: "Gerenciar no Perfil" }), _jsx(Button, { variant: "primary", onClick: () => setActiveModal(null), className: "flex-1 py-3 text-xs font-bold uppercase tracking-widest bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] rounded-xl", children: "Salvar Prefer\u00EAncias" })] })] }) })), activeMetricModal && (_jsx("div", { className: "fixed inset-0 bg-[#1C1917]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-[#E7E5E4] pb-4", children: [_jsxs("h3", { className: "text-base font-black uppercase tracking-tight text-[#1C1917]", children: [activeMetricModal === 'streak' && 'Histórico de Ofensiva', activeMetricModal === 'minutes' && 'Minutos Praticados', activeMetricModal === 'sessions' && 'Histórico de Sessões'] }), _jsx("button", { type: "button", onClick: () => setActiveMetricModal(null), className: "text-[#78716C] hover:text-[#1C1917] text-sm font-bold", children: "\u2715" })] }), activeMetricModal === 'streak' && (_jsxs("div", { className: "flex flex-col gap-6", children: [_jsxs("div", { className: "flex items-center justify-between bg-[#FAF9F6] p-4 rounded-xl border border-[#E7E5E4]", children: [_jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("span", { className: "text-[10px] font-bold text-[#78716C] uppercase tracking-wider", children: "Sequ\u00EAncia M\u00E1xima" }), _jsxs("span", { className: "text-xl font-black text-[#1C1917]", children: [userData?.maxStreak || 0, " Dias"] })] }), _jsx("div", { className: "w-px h-8 bg-[#E7E5E4]" }), _jsxs("div", { className: "flex flex-col gap-1 text-right", children: [_jsx("span", { className: "text-[10px] font-bold text-[#78716C] uppercase tracking-wider", children: "Sequ\u00EAncia Atual" }), _jsxs("span", { className: "text-xl font-black text-emerald-600", children: [userMetrics.currentStreak, " Dias \uD83D\uDD25"] })] })] }), _jsxs("div", { className: "flex flex-col gap-3", children: [_jsx("span", { className: "text-[10px] font-black uppercase tracking-widest text-[#1C1917]", children: "\u00DAltimos 7 dias" }), _jsx("div", { className: "grid grid-cols-7 gap-2", children: weeklyGoal.days.map((item, index) => (_jsxs("div", { className: "flex flex-col items-center gap-1.5", children: [_jsx("div", { className: `w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-xs transition-colors ${item.completed
                                                            ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]'
                                                            : 'bg-[#FAF9F6] text-[#A8A29E] border-[#E7E5E4]'}`, children: item.completed ? '🔥' : '🧊' }), _jsx("span", { className: "text-[10px] font-bold text-[#78716C] uppercase", children: item.day })] }, index))) })] })] })), activeMetricModal === 'minutes' && (_jsxs("div", { className: "flex flex-col gap-6", children: [_jsxs("div", { className: "flex items-center justify-between bg-[#FAF9F6] p-4 rounded-xl border border-[#E7E5E4]", children: [_jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("span", { className: "text-[10px] font-bold text-[#78716C] uppercase tracking-wider", children: "Total na Semana" }), _jsxs("span", { className: "text-xl font-black text-[#1C1917]", children: [userMetrics.totalMinutes, " min"] })] }), _jsx("div", { className: "w-px h-8 bg-[#E7E5E4]" }), _jsxs("div", { className: "flex flex-col gap-1 text-right", children: [_jsx("span", { className: "text-[10px] font-bold text-[#78716C] uppercase tracking-wider", children: "M\u00E9dia por Sess\u00E3o" }), _jsxs("span", { className: "text-xl font-black text-[#1C1917]", children: [userMetrics.totalSessions > 0 ? Math.round(userMetrics.totalMinutes / userMetrics.totalSessions) : 0, " min"] })] })] }), _jsxs("div", { className: "flex flex-col gap-3", children: [_jsx("span", { className: "text-[10px] font-black uppercase tracking-widest text-[#1C1917]", children: "Distribui\u00E7\u00E3o Semanal" }), _jsx("div", { className: "flex items-end justify-between h-32 pt-4 border-b border-[#E7E5E4]", children: mockMinutesHistory.map((item, index) => (_jsxs("div", { className: "flex flex-col items-center gap-2 group w-full", children: [_jsxs("div", { className: "relative w-full flex justify-center h-full items-end", children: [_jsx("div", { className: `w-6 sm:w-8 rounded-t-md transition-all duration-300 ${item.min > 0 ? 'bg-[#1C1917] group-hover:bg-[#57534E]' : 'bg-[#E7E5E4]'}`, style: { height: `${item.min === 0 ? 4 : (item.min / 40) * 100}%` } }), item.min > 0 && (_jsxs("span", { className: "absolute -top-6 text-[9px] font-black text-[#1C1917] opacity-0 group-hover:opacity-100 transition-opacity", children: [item.min, "m"] }))] }), _jsx("span", { className: "text-[10px] font-bold text-[#78716C] uppercase mt-1", children: item.day })] }, index))) })] })] })), activeMetricModal === 'sessions' && (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-[10px] font-black uppercase tracking-widest text-[#1C1917]", children: "Sess\u00F5es Recentes" }), _jsxs("span", { className: "text-[10px] font-bold text-[#78716C] uppercase", children: ["Total Realizado: ", userMetrics.totalSessions] })] }), _jsx("div", { className: "flex flex-col gap-3 max-h-60 overflow-y-auto", children: mockSessionsHistory.length > 0 ? (mockSessionsHistory.map((session) => (_jsxs("div", { className: "bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl p-4 flex flex-col gap-3 hover:border-[#1C1917] transition-colors", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex flex-col gap-0.5", children: [_jsx("span", { className: "text-xs font-black text-[#1C1917] uppercase", children: session.partner }), _jsx("span", { className: "text-[10px] font-bold text-[#78716C]", children: session.date })] }), _jsx("div", { className: "flex items-center gap-1 bg-[#FFFFFF] border border-[#E7E5E4] px-2 py-1 rounded-lg", children: _jsx("span", { className: "text-[10px] font-black text-amber-500", children: '★'.repeat(session.rating) }) })] }), _jsxs("div", { className: "flex items-center gap-3 pt-2 border-t border-[#E7E5E4]", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { className: "text-[10px] font-bold text-[#A8A29E] uppercase", children: "Dura\u00E7\u00E3o:" }), _jsxs("span", { className: "text-[10px] font-black text-[#1C1917]", children: [session.duration, " min"] })] }), _jsx("span", { className: "text-[10px] text-[#E7E5E4]", children: "|" }), _jsxs("div", { className: "flex items-center gap-1 truncate", children: [_jsx("span", { className: "text-[10px] font-bold text-[#A8A29E] uppercase", children: "T\u00F3pico:" }), _jsx("span", { className: "text-[10px] font-black text-[#1C1917] truncate", children: session.topic })] })] })] }, session.id)))) : (_jsx("div", { className: "py-8 text-center text-xs font-bold text-[#78716C] uppercase", children: "Nenhuma sess\u00E3o registrada no hist\u00F3rico ainda." })) })] })), _jsx(Button, { variant: "primary", onClick: () => setActiveMetricModal(null), className: "w-full py-3 mt-2 text-xs font-bold uppercase tracking-widest bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] rounded-xl", children: "Fechar Visualiza\u00E7\u00E3o" })] }) }))] }));
};
