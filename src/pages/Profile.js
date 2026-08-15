import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
export const Profile = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('general');
    const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
    const [followerPos, setFollowerPos] = useState({ x: -100, y: -100 });
    const [cursorOpacity, setCursorOpacity] = useState(1);
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
    const [showPublicPreview, setShowPublicPreview] = useState(false);
    const [friendRequestSent, setFriendRequestSent] = useState(false);
    const [recentConversations, setRecentConversations] = useState([]);
    const [friendsList, setFriendsList] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [showTopicsModal, setShowTopicsModal] = useState(false);
    const [topicSearch, setTopicSearch] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [showAgeInProfile, setShowAgeInProfile] = useState(true);
    const fileToDataUrl = (file) => new Promise((resolve, reject) => {
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
    const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80');
    const [bio, setBio] = useState('');
    const [selectedInterests, setSelectedInterests] = useState([]);
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
                    if (data.avatar)
                        setAvatarUrl(data.avatar);
                    if (data.bio)
                        setBio(data.bio);
                    if (data.birthDate)
                        setBirthDate(data.birthDate);
                    if (data.gender)
                        setGender(data.gender);
                    if (data.pronouns)
                        setPronouns(data.pronouns);
                    if (data.interests)
                        setSelectedInterests(data.interests);
                    if (data.showAgeInProfile !== undefined)
                        setShowAgeInProfile(data.showAgeInProfile);
                    if (data.notifyEmail !== undefined)
                        setNotifyEmail(data.notifyEmail);
                    if (data.notifyPush !== undefined)
                        setNotifyPush(data.notifyPush);
                    if (data.notifyAdvance !== undefined)
                        setNotifyAdvance(data.notifyAdvance);
                }
            }
            catch (err) {
                console.error('Erro ao carregar perfil', err);
            }
        };
        fetchProfile();
    }, []);
    const [receivedFeedback, setReceivedFeedback] = useState([]);
    const topicsLibrary = [
        { category: 'Tecnologia & Carreira', items: ['Tecnologia', 'Carreira & Negócios', 'Inteligência Artificial', 'Startups', 'Programação', 'Marketing Digital'] },
        { category: 'Cultura & Entretenimento', items: ['Cinema & Séries', 'Música', 'Leitura', 'Jogos & eSports', 'Arte & Design', 'Fotografia'] },
        { category: 'Estilo de Vida & Hobbies', items: ['Viagens', 'Esportes', 'Culinária', 'Saúde & Fitness', 'Gastronomia', 'Idiomas'] },
        { category: 'Sociedade & Atualidades', items: ['Economia', 'Meio Ambiente', 'Psicologia', 'História', 'Filosofia', 'Moda'] },
    ];
    const toggleInterest = (interest) => {
        if (selectedInterests.includes(interest)) {
            setSelectedInterests(selectedInterests.filter((i) => i !== interest));
        }
        else {
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
    const [badgesList, setBadgesList] = useState([]);
    const evolutionStats = {
        reputationScore: '98/100',
    };
    const calculateAge = (dob) => {
        if (!dob)
            return '';
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
    const [selectedAvailability, setSelectedAvailability] = useState([
        'Seg-Noite (18h - 22h)',
        'Qua-Noite (18h - 22h)',
        'Sex-Noite (18h - 22h)',
    ]);
    const toggleAvailabilitySlot = (slotKey) => {
        if (selectedAvailability.includes(slotKey)) {
            setSelectedAvailability(selectedAvailability.filter((item) => item !== slotKey));
        }
        else {
            setSelectedAvailability([...selectedAvailability, slotKey]);
        }
    };
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [passwordError, setPasswordError] = useState(null);
    const [passwordSuccess, setPasswordSuccess] = useState(null);
    const cefrLevelsInfo = [
        { code: 'A1', label: 'Iniciante', desc: 'Compreende frases simples do dia a dia.' },
        { code: 'A2', label: 'Básico', desc: 'Comunica-se em tarefas rotineiras.' },
        { code: 'B1', label: 'Intermediário', desc: 'Mantém conversas sobre temas familiares.' },
        { code: 'B2', label: 'Intermediário Avançado', desc: 'Fala com fluência e espontaneidade.' },
        { code: 'C1', label: 'Avançado', desc: 'Expressa-se de forma fluida e bem estruturada.' },
    ];
    const goalProgressPercentage = Math.min(100, Math.round((weeklyGoalCompleted / weeklyGoalTarget) * 100));
    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        try {
            const dataUrl = await fileToDataUrl(file);
            setAvatarUrl(dataUrl);
        }
        catch (error) {
            console.error('Erro ao converter imagem para data URL:', error);
            alert('Não foi possível carregar a imagem do perfil.');
        }
    };
    const handleSubmit = async (e) => {
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
        }
        catch (err) {
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
            }
            else {
                const data = await response.json();
                setPasswordError(data.error || 'Erro ao enviar código.');
            }
        }
        catch (err) {
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
            }
            else {
                setPasswordError('Código inválido ou expirado.');
            }
        }
        catch (err) {
            setPasswordError('Erro ao verificar o código.');
        }
    };
    const handlePasswordChange = async (e) => {
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
            }
            else {
                setPasswordError('Erro ao redefinir a senha.');
            }
        }
        catch (err) {
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
            }
            else {
                const data = await response.json();
                alert(data.error || 'Erro ao excluir a conta.');
            }
        }
        catch (err) {
            alert('Erro de conexão ao excluir a conta.');
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-[#FAF9F6] text-[#1C1917] flex flex-col font-sans selection:bg-[#1C1917] selection:text-[#FAF9F6] relative overflow-x-hidden", children: [_jsx("div", { className: "pointer-events-none fixed z-50 w-3.5 h-3.5 rounded-full bg-[#1C1917] transition-opacity duration-300 ease-out -translate-x-1/2 -translate-y-1/2 hidden md:block", style: {
                    left: `${followerPos.x}px`,
                    top: `${followerPos.y}px`,
                    opacity: cursorOpacity,
                } }), _jsxs("header", { className: "bg-[#FFFFFF] border-b border-[#E7E5E4] px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm", children: [_jsxs("div", { className: "flex items-center gap-3 cursor-pointer", onClick: () => navigate('/dashboard'), children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-[#1C1917] flex items-center justify-center font-black text-[#FAF9F6] text-base shadow-sm", children: "S" }), _jsx("span", { className: "text-lg font-black tracking-tight text-[#1C1917] uppercase", children: "SideBySide" })] }), _jsxs("button", { type: "button", onClick: () => navigate('/dashboard'), className: "px-4 py-2 bg-[#FAF9F6] hover:bg-[#F5F5F4] border-2 border-[#1C1917] text-[#1C1917] font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-sm", children: [_jsx("svg", { className: "w-3.5 h-3.5 fill-none stroke-current stroke-[2.5]", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" }) }), "Voltar"] })] }), _jsxs("main", { className: "flex-1 max-w-4xl w-full mx-auto p-6 lg:p-8 flex flex-col gap-6", children: [_jsxs("section", { className: "bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "relative group w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#1C1917] bg-[#F5F5F4] shrink-0 shadow-sm", children: [_jsx("img", { src: avatarUrl, alt: name, className: "w-full h-full object-cover" }), _jsxs("label", { className: "absolute inset-0 bg-[#1C1917]/80 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity", children: [_jsx("svg", { className: "w-5 h-5 stroke-[#FAF9F6] fill-none stroke-2", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" }) }), _jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: handleAvatarChange })] })] }), _jsxs("div", { className: "flex flex-col", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h1", { className: "text-xl font-black uppercase text-[#1C1917]", children: name }), _jsx("span", { className: "px-2 py-0.5 bg-[#1C1917] text-[#FAF9F6] font-black text-[10px] rounded uppercase", children: cefrLevel })] }), _jsx("span", { className: "text-xs font-bold text-[#78716C]", children: email })] })] }), _jsxs("div", { className: "flex items-center gap-2 w-full sm:w-auto", children: [_jsxs("button", { type: "button", onClick: () => setShowPublicPreview(true), className: "py-2.5 px-4 bg-[#FAF9F6] hover:bg-[#F5F5F4] border-2 border-[#1C1917] text-[#1C1917] font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2", children: [_jsxs("svg", { className: "w-4 h-4 stroke-current fill-none stroke-2", viewBox: "0 0 24 24", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })] }), "Ver Perfil P\u00FAblico"] }), _jsx(Button, { variant: "primary", onClick: handleSubmit, className: "py-2.5 px-5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-black text-xs uppercase tracking-wider rounded-xl transition-all border-2 border-[#1C1917] shadow-sm", children: "Salvar Perfil" })] })] }), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 bg-[#FFFFFF] border-2 border-[#1C1917] p-1.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#1C1917]", children: [_jsx("button", { type: "button", onClick: () => setActiveTab('general'), className: `py-3 rounded-xl transition-all ${activeTab === 'general' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-sm' : 'text-[#78716C] hover:text-[#1C1917]'}`, children: "Geral & Bio" }), _jsx("button", { type: "button", onClick: () => setActiveTab('social'), className: `py-3 rounded-xl transition-all ${activeTab === 'social' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-sm' : 'text-[#78716C] hover:text-[#1C1917]'}`, children: "Agenda & Alertas" }), _jsx("button", { type: "button", onClick: () => setActiveTab('stats'), className: `py-3 rounded-xl transition-all ${activeTab === 'stats' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-sm' : 'text-[#78716C] hover:text-[#1C1917]'}`, children: "Metas & Evolu\u00E7\u00E3o" }), _jsx("button", { type: "button", onClick: () => setActiveTab('security'), className: `py-3 rounded-xl transition-all ${activeTab === 'security' ? 'bg-[#1C1917] text-[#FAF9F6] shadow-sm' : 'text-[#78716C] hover:text-[#1C1917]'}`, children: "Seguran\u00E7a" })] }), saveSuccess && (_jsxs("div", { className: "p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-600 text-emerald-800 text-xs font-black flex items-center gap-2.5 animate-in fade-in duration-150 shadow-sm", children: [_jsx("svg", { className: "w-4 h-4 shrink-0 fill-current text-emerald-600", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z", clipRule: "evenodd" }) }), _jsx("span", { children: "Altera\u00E7\u00F5es salvas com sucesso!" })] })), activeTab === 'general' && (_jsxs("div", { className: "flex flex-col gap-6 animate-in fade-in duration-150", children: [_jsxs("section", { className: "bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-6", children: [_jsx("h2", { className: "text-base font-black uppercase tracking-tight text-[#1C1917] border-b-2 border-[#E7E5E4] pb-3", children: "Informa\u00E7\u00F5es Pessoais" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { className: "text-xs font-black text-[#1C1917] uppercase tracking-wider", children: "Nome Completo" }), _jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), className: "px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]" })] }), _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { className: "text-xs font-black text-[#1C1917] uppercase tracking-wider", children: "E-mail" }), _jsx("input", { type: "email", value: email, disabled: true, className: "px-4 py-3 bg-[#F5F5F4] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#78716C] cursor-not-allowed outline-none select-none" })] }), _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("label", { className: "text-xs font-black text-[#1C1917] uppercase tracking-wider", children: "Data de Nascimento" }), _jsx("button", { type: "button", onClick: () => setShowAgeInProfile(!showAgeInProfile), className: "text-[10px] font-black uppercase text-[#1C1917] hover:underline flex items-center gap-1.5 bg-[#FAF9F6] px-2 py-0.5 rounded border border-[#E7E5E4]", children: showAgeInProfile ? (_jsxs(_Fragment, { children: [_jsxs("svg", { className: "w-3.5 h-3.5 fill-none stroke-current stroke-2", viewBox: "0 0 24 24", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })] }), "Vis\u00EDvel"] })) : (_jsxs(_Fragment, { children: [_jsx("svg", { className: "w-3.5 h-3.5 fill-none stroke-current stroke-2 text-[#78716C]", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" }) }), "Oculta"] })) })] }), _jsx("input", { type: "date", value: birthDate, onChange: (e) => setBirthDate(e.target.value), className: "px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]" })] }), _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { className: "text-xs font-black text-[#1C1917] uppercase tracking-wider", children: "G\u00EAnero" }), _jsxs("select", { value: gender, onChange: (e) => setGender(e.target.value), className: "px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]", children: [_jsx("option", { value: "Masculino", children: "Masculino" }), _jsx("option", { value: "Feminino", children: "Feminino" }), _jsx("option", { value: "N\u00E3o-bin\u00E1rio", children: "N\u00E3o-bin\u00E1rio" }), _jsx("option", { value: "Prefiro n\u00E3o dizer", children: "Prefiro n\u00E3o dizer" })] })] }), _jsxs("div", { className: "flex flex-col gap-1.5 sm:col-span-2", children: [_jsx("label", { className: "text-xs font-black text-[#1C1917] uppercase tracking-wider", children: "Pronomes" }), _jsxs("select", { value: pronouns, onChange: (e) => setPronouns(e.target.value), className: "px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]", children: [_jsx("option", { value: "ele/dele (he/him)", children: "ele/dele (he/him)" }), _jsx("option", { value: "ela/dela (she/her)", children: "ela/dela (she/her)" }), _jsx("option", { value: "elu/delu (they/them)", children: "elu/delu (they/them)" }), _jsx("option", { value: "Qualquer pronome (any pronouns)", children: "Qualquer pronome (any pronouns)" })] })] })] }), _jsxs("div", { className: "flex flex-col gap-1.5 pt-2", children: [_jsx("label", { className: "text-xs font-black text-[#1C1917] uppercase tracking-wider", children: "Mini Biografia" }), _jsx("textarea", { rows: 3, value: bio, onChange: (e) => setBio(e.target.value), className: "w-full p-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] resize-none" })] }), _jsxs("div", { className: "flex flex-col gap-3 pt-2 border-t-2 border-[#E7E5E4]", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { className: "text-xs font-black text-[#1C1917] uppercase tracking-wider", children: "T\u00F3picos de Interesse" }), _jsxs("span", { className: "text-[10px] font-black uppercase bg-[#1C1917] text-[#FAF9F6] px-2 py-0.5 rounded", children: [selectedInterests.length, "/5"] })] }), _jsxs("button", { type: "button", onClick: () => setShowTopicsModal(true), className: "text-xs font-black uppercase text-[#1C1917] hover:underline flex items-center gap-1", children: [_jsx("span", { children: "+" }), " Explorar T\u00F3picos"] })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [selectedInterests.map((interest) => (_jsxs("button", { type: "button", onClick: () => toggleInterest(interest), className: "px-3 py-1.5 rounded-xl border-2 text-xs font-black transition-all bg-[#1C1917] text-[#FAF9F6] border-[#1C1917] flex items-center gap-1.5 shadow-xs", children: [_jsxs("span", { children: ["\u2713 ", interest] }), _jsx("span", { className: "text-[10px] opacity-70", children: "\u2715" })] }, interest))), selectedInterests.length < 5 && (_jsx("button", { type: "button", onClick: () => setShowTopicsModal(true), className: "px-3 py-1.5 rounded-xl border-2 border-dashed border-[#1C1917] text-xs font-black text-[#1C1917] hover:bg-[#F5F5F4] transition-all", children: "+ Adicionar T\u00F3picos" }))] })] })] }), _jsxs("section", { className: "bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-4", children: [_jsx("h2", { className: "text-base font-black uppercase tracking-tight text-[#1C1917] border-b-2 border-[#E7E5E4] pb-3", children: "N\u00EDvel de Flu\u00EAncia (CEFR)" }), _jsx("div", { className: "grid grid-cols-1 gap-2.5", children: cefrLevelsInfo.map((item) => {
                                            const isSelected = cefrLevel === item.code;
                                            return (_jsx("button", { type: "button", onClick: () => setCefrLevel(item.code), className: `p-3.5 rounded-2xl border-2 text-left flex items-center justify-between gap-4 transition-all ${isSelected
                                                    ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917] shadow-[2px_2px_0px_0px_#78716C]'
                                                    : 'bg-[#FAF9F6] text-[#1C1917] border-[#E7E5E4] hover:border-[#1C1917]'}`, children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: `w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center border-2 ${isSelected ? 'bg-[#FAF9F6] text-[#1C1917] border-[#FAF9F6]' : 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]'}`, children: item.code }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-xs font-black uppercase", children: item.label }), _jsx("span", { className: `text-[11px] font-medium ${isSelected ? 'text-[#D6D3D1]' : 'text-[#78716C]'}`, children: item.desc })] })] }) }, item.code));
                                        }) })] })] })), activeTab === 'social' && (_jsxs("div", { className: "flex flex-col gap-6 animate-in fade-in duration-150", children: [_jsxs("section", { className: "bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-6", children: [_jsxs("div", { className: "flex justify-between items-center border-b-2 border-[#E7E5E4] pb-3", children: [_jsx("h2", { className: "text-base font-black uppercase tracking-tight text-[#1C1917]", children: "Agenda de Disponibilidade" }), _jsx("span", { className: "text-[10px] font-black uppercase bg-[#FAF9F6] text-[#1C1917] px-2.5 py-1 rounded-lg border-2 border-[#1C1917]", children: "Pico: Noite (18h-22h)" })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("div", { className: "min-w-[480px] flex flex-col gap-2", children: [_jsxs("div", { className: "grid grid-cols-8 gap-2 text-center text-[10px] font-black uppercase text-[#1C1917] pb-1 border-b-2 border-[#E7E5E4]", children: [_jsx("span", { children: "Turno" }), weekDays.map((day) => _jsx("span", { children: day }, day))] }), timeSlots.map((slot) => (_jsxs("div", { className: "grid grid-cols-8 gap-2 items-center", children: [_jsx("span", { className: "text-[10px] font-black text-[#1C1917] uppercase", children: slot.split(' ')[0] }), weekDays.map((day) => {
                                                            const slotKey = `${day}-${slot}`;
                                                            const isSelected = selectedAvailability.includes(slotKey);
                                                            return (_jsx("button", { type: "button", onClick: () => toggleAvailabilitySlot(slotKey), className: `py-2 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${isSelected ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]' : 'bg-[#FAF9F6] text-[#A8A29E] border-[#E7E5E4]'}`, children: isSelected ? '✓' : '+' }, slotKey));
                                                        })] }, slot)))] }) })] }), _jsxs("section", { className: "bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-5", children: [_jsxs("div", { className: "flex justify-between items-center border-b-2 border-[#E7E5E4] pb-3", children: [_jsx("h2", { className: "text-base font-black uppercase tracking-tight text-[#1C1917]", children: "Lembretes de Pr\u00E1tica" }), _jsx("span", { className: "text-[10px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg", children: "Ativo" })] }), _jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("label", { className: "flex items-center justify-between cursor-pointer", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-xs font-black uppercase text-[#1C1917]", children: "Notifica\u00E7\u00F5es Push" }), _jsx("span", { className: "text-[10px] font-bold text-[#78716C]", children: "Receba alertas r\u00E1pidos do sistema" })] }), _jsx("div", { className: `w-11 h-6 rounded-full border-2 border-[#1C1917] flex items-center p-0.5 transition-all ${notifyPush ? 'bg-[#1C1917]' : 'bg-[#FAF9F6]'}`, children: _jsx("div", { className: `w-4 h-4 rounded-full bg-[#FAF9F6] border-2 border-[#1C1917] transition-all ${notifyPush ? 'translate-x-5 border-[#FAF9F6]' : 'translate-x-0'}` }) }), _jsx("input", { type: "checkbox", className: "hidden", checked: notifyPush, onChange: (e) => setNotifyPush(e.target.checked) })] }), _jsxs("label", { className: "flex items-center justify-between cursor-pointer border-t-2 border-[#F5F5F4] pt-4", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-xs font-black uppercase text-[#1C1917]", children: "Alertas por E-mail" }), _jsx("span", { className: "text-[10px] font-bold text-[#78716C]", children: "Lembretes direto na sua caixa de entrada" })] }), _jsx("div", { className: `w-11 h-6 rounded-full border-2 border-[#1C1917] flex items-center p-0.5 transition-all ${notifyEmail ? 'bg-[#1C1917]' : 'bg-[#FAF9F6]'}`, children: _jsx("div", { className: `w-4 h-4 rounded-full bg-[#FAF9F6] border-2 border-[#1C1917] transition-all ${notifyEmail ? 'translate-x-5 border-[#FAF9F6]' : 'translate-x-0'}` }) }), _jsx("input", { type: "checkbox", className: "hidden", checked: notifyEmail, onChange: (e) => setNotifyEmail(e.target.checked) })] }), _jsxs("div", { className: "flex flex-col gap-1.5 border-t-2 border-[#F5F5F4] pt-4", children: [_jsx("label", { className: "text-xs font-black text-[#1C1917] uppercase tracking-wider", children: "Avisar com anteced\u00EAncia de:" }), _jsxs("select", { value: notifyAdvance, onChange: (e) => setNotifyAdvance(e.target.value), className: "px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]", children: [_jsx("option", { value: "5", children: "5 minutos antes da sess\u00E3o agendada" }), _jsx("option", { value: "15", children: "15 minutos antes da sess\u00E3o agendada" }), _jsx("option", { value: "30", children: "30 minutos antes da sess\u00E3o agendada" }), _jsx("option", { value: "60", children: "1 hora antes da sess\u00E3o agendada" })] })] })] })] }), _jsxs("section", { className: "bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-5", children: [_jsxs("div", { className: "flex justify-between items-center border-b-2 border-[#E7E5E4] pb-3", children: [_jsx("h2", { className: "text-base font-black uppercase tracking-tight text-[#1C1917]", children: "Conversas & Chats" }), _jsx("span", { className: "text-[10px] font-black uppercase bg-[#FAF9F6] text-[#1C1917] px-2.5 py-1 rounded-lg border border-[#1C1917]", children: recentConversations.length })] }), recentConversations.length === 0 ? (_jsx("div", { className: "rounded-2xl border-2 border-dashed border-[#E7E5E4] bg-[#FAF9F6] p-5 text-center text-xs font-black uppercase tracking-wider text-[#78716C]", children: "Nenhuma conversa registrada ainda." })) : (_jsx("div", { className: "flex flex-col gap-3", children: recentConversations.map((conversation) => (_jsxs("div", { className: "p-3 rounded-2xl border-2 border-[#E7E5E4] bg-[#FAF9F6] flex justify-between items-center gap-3", children: [_jsxs("div", { children: [_jsx("span", { className: "block text-xs font-black text-[#1C1917] uppercase", children: conversation.name }), _jsx("span", { className: "block text-[10px] font-bold text-[#78716C]", children: conversation.lastMessage })] }), _jsx("span", { className: "text-[10px] font-black text-[#78716C] uppercase", children: conversation.time })] }, conversation.id))) }))] }), _jsxs("section", { className: "bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-5", children: [_jsxs("div", { className: "flex justify-between items-center border-b-2 border-[#E7E5E4] pb-3", children: [_jsx("h2", { className: "text-base font-black uppercase tracking-tight text-[#1C1917]", children: "Amigos & Solicita\u00E7\u00F5es" }), _jsx("span", { className: "text-[10px] font-black uppercase bg-[#FAF9F6] text-[#1C1917] px-2.5 py-1 rounded-lg border border-[#1C1917]", children: friendsList.length + friendRequests.length })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("span", { className: "text-[10px] font-black uppercase tracking-wider text-[#78716C]", children: "Lista de amigos" }), friendsList.length === 0 ? (_jsx("div", { className: "rounded-2xl border-2 border-dashed border-[#E7E5E4] bg-[#FAF9F6] p-4 text-center text-[10px] font-black uppercase tracking-wider text-[#78716C]", children: "Ainda sem amigos." })) : (friendsList.map((friend) => (_jsx("div", { className: "p-3 rounded-2xl border-2 border-[#E7E5E4] bg-[#FAF9F6] text-xs font-black text-[#1C1917] uppercase", children: friend.name }, friend.id))))] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("span", { className: "text-[10px] font-black uppercase tracking-wider text-[#78716C]", children: "Solicita\u00E7\u00F5es" }), friendRequests.length === 0 ? (_jsx("div", { className: "rounded-2xl border-2 border-dashed border-[#E7E5E4] bg-[#FAF9F6] p-4 text-center text-[10px] font-black uppercase tracking-wider text-[#78716C]", children: "Nenhuma solicita\u00E7\u00E3o pendente." })) : (friendRequests.map((request) => (_jsx("div", { className: "p-3 rounded-2xl border-2 border-[#E7E5E4] bg-[#FAF9F6] text-xs font-black text-[#1C1917] uppercase", children: request.name }, request.id))))] })] })] })] })), activeTab === 'stats' && (_jsxs("div", { className: "flex flex-col gap-6 animate-in fade-in duration-150", children: [_jsxs("section", { className: "bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-6", children: [_jsxs("div", { className: "flex justify-between items-center border-b-2 border-[#E7E5E4] pb-3", children: [_jsx("h2", { className: "text-base font-black uppercase tracking-tight text-[#1C1917]", children: "Meta Semanal de Pr\u00E1tica" }), _jsxs("span", { className: "text-xs font-black text-[#1C1917]", children: [weeklyGoalCompleted, "/", weeklyGoalTarget, " Conclu\u00EDdas"] })] }), _jsx("div", { className: "grid grid-cols-3 gap-3", children: [3, 5, 7].map((num) => (_jsxs("button", { type: "button", onClick: () => setWeeklyGoalTarget(num), className: `py-3 rounded-xl border-2 font-black text-xs uppercase ${weeklyGoalTarget === num ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]' : 'bg-[#FAF9F6] border-[#E7E5E4]'}`, children: [num, " Sess\u00F5es"] }, num))) }), _jsx("div", { className: "w-full h-4 bg-[#F5F5F4] rounded-full overflow-hidden p-0.5 border-2 border-[#1C1917]", children: _jsx("div", { className: "h-full bg-[#1C1917] rounded-full transition-all", style: { width: `${goalProgressPercentage}%` } }) })] }), _jsxs("section", { className: "bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-4", children: [_jsx("h2", { className: "text-base font-black uppercase tracking-tight text-[#1C1917] border-b-2 border-[#E7E5E4] pb-3", children: "Conquistas & Badges" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: badgesList.map((badge) => (_jsxs("div", { className: "p-3.5 rounded-2xl border-2 bg-[#FAF9F6] border-[#E7E5E4] flex items-center gap-3", children: [_jsx("span", { className: "text-2xl", children: badge.icon }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-xs font-black text-[#1C1917] uppercase", children: badge.title }), _jsx("span", { className: "text-[11px] text-[#78716C] font-bold", children: badge.desc })] })] }, badge.id))) })] })] })), activeTab === 'security' && (_jsxs("div", { className: "flex flex-col gap-6 animate-in fade-in duration-150", children: [_jsxs("form", { onSubmit: handlePasswordChange, className: "bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-5", children: [_jsxs("div", { className: "flex flex-col gap-1 border-b-2 border-[#E7E5E4] pb-3", children: [_jsx("span", { className: "text-[10px] font-black uppercase tracking-widest text-[#FAF9F6] bg-[#1C1917] px-2.5 py-0.5 rounded w-fit", children: "VERIFICA\u00C7\u00C3O VIA E-MAIL" }), _jsx("h2", { className: "text-base font-black uppercase tracking-tight text-[#1C1917] mt-1", children: "Alterar Senha de Acesso" })] }), passwordError && _jsx("div", { className: "p-3 rounded-xl bg-red-50 border-2 border-red-600 text-red-700 text-xs font-black", children: passwordError }), passwordSuccess && _jsx("div", { className: "p-3 rounded-xl bg-emerald-50 border-2 border-emerald-600 text-emerald-800 text-xs font-black", children: passwordSuccess }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsxs("label", { className: "text-xs font-black text-[#1C1917] uppercase tracking-wider flex items-center gap-2", children: [_jsx("span", { className: `w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${isEmailCodeVerified ? 'bg-emerald-600 text-white' : 'bg-[#1C1917] text-[#FAF9F6]'}`, children: isEmailCodeVerified ? '✓' : '1' }), "1. Solicitar C\u00F3digo para: ", _jsx("span", { className: "text-[#78716C]", children: email })] }), !emailCodeSent ? (_jsx("button", { type: "button", onClick: handleSendEmailCode, className: "py-3 px-5 bg-[#1C1917] text-[#FAF9F6] font-black text-xs uppercase rounded-xl border-2 border-[#1C1917] hover:bg-[#292524] transition-all w-fit", children: "Enviar C\u00F3digo de Confirma\u00E7\u00E3o por E-mail" })) : (_jsxs("div", { className: "flex flex-col gap-2 pt-1", children: [_jsx("span", { className: "text-[11px] font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200", children: "\u2709\uFE0F C\u00F3digo enviado! Verifique sua caixa de entrada." }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", maxLength: 6, disabled: isEmailCodeVerified, placeholder: "Digite o c\u00F3digo de 6 d\u00EDgitos...", value: verificationCode, onChange: (e) => setVerificationCode(e.target.value), className: "flex-1 px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold outline-none focus:border-[#1C1917] disabled:opacity-75" }), !isEmailCodeVerified ? (_jsx("button", { type: "button", onClick: handleVerifyEmailCode, className: "px-5 py-3 bg-[#1C1917] text-[#FAF9F6] font-black text-xs uppercase rounded-xl border-2 border-[#1C1917] hover:bg-[#292524] transition-all", children: "Validar C\u00F3digo" })) : (_jsx("button", { type: "button", onClick: () => {
                                                                    setIsEmailCodeVerified(false);
                                                                    setVerificationCode('');
                                                                }, className: "px-4 py-3 bg-[#FAF9F6] text-[#78716C] hover:text-[#1C1917] font-black text-xs uppercase rounded-xl border-2 border-[#E7E5E4]", children: "Alterar" }))] })] }))] }), isEmailCodeVerified && (_jsxs("div", { className: "flex flex-col gap-3 pt-2 animate-in fade-in slide-in-from-top-4 duration-300 border-t-2 border-[#E7E5E4]", children: [_jsxs("label", { className: "text-xs font-black text-[#1C1917] uppercase tracking-wider flex items-center gap-2", children: [_jsx("span", { className: "w-5 h-5 rounded-full bg-[#1C1917] text-[#FAF9F6] flex items-center justify-center text-[10px] font-black", children: "2" }), "2. Digite e Confirme a Nova Senha"] }), _jsx("input", { type: "password", placeholder: "Nova Senha (M\u00EDnimo 6 caracteres)", value: newPassword, onChange: (e) => setNewPassword(e.target.value), className: "px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold outline-none focus:border-[#1C1917]" }), _jsx("input", { type: "password", placeholder: "Confirmar Nova Senha", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), className: "px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold outline-none focus:border-[#1C1917]" }), _jsx(Button, { type: "submit", variant: "primary", className: "py-3.5 text-xs font-black uppercase tracking-wider bg-[#1C1917] text-[#FAF9F6] rounded-xl border-2 border-[#1C1917] mt-2 shadow-md", children: "Salvar Nova Senha" })] }))] }), _jsxs("section", { className: "bg-[#FFFFFF] border-2 border-red-600 rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#DC2626] flex flex-col gap-3", children: [_jsx("span", { className: "text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-2.5 py-0.5 rounded border border-red-200 w-fit", children: "ZONA CR\u00CDTICA" }), _jsx("h2", { className: "text-base font-black uppercase text-red-600", children: "Exclus\u00E3o Definitiva da Conta" }), _jsx("p", { className: "text-xs text-[#57534E] font-medium", children: "A\u00E7\u00E3o irrevers\u00EDvel de remo\u00E7\u00E3o permanente de todos os seus dados cadastrais, hist\u00F3rico e conquistas." }), _jsx("button", { type: "button", onClick: () => setShowDeleteModal(true), className: "w-fit px-5 py-2.5 bg-red-50 text-red-600 border-2 border-red-600 font-black text-xs uppercase rounded-xl hover:bg-red-600 hover:text-white transition-all mt-1", children: "Iniciar Processo de Exclus\u00E3o" })] })] }))] }), showDeleteModal && (_jsx("div", { className: "fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-[#FFFFFF] border-2 border-red-600 rounded-3xl p-6 sm:p-8 max-w-md w-full flex flex-col gap-5 shadow-[8px_8px_0px_0px_#DC2626] animate-in fade-in zoom-in-95 duration-200", children: [_jsxs("div", { className: "flex items-center justify-between border-b-2 border-red-200 pb-3", children: [_jsxs("h3", { className: "text-base font-black uppercase text-red-600 flex items-center gap-2", children: [_jsx("span", { children: "\u26A0\uFE0F" }), " Confirmar Exclus\u00E3o"] }), _jsx("button", { type: "button", onClick: () => setShowDeleteModal(false), className: "text-sm font-black text-[#78716C] hover:text-[#1C1917]", children: "\u2715" })] }), _jsx("p", { className: "text-xs text-[#57534E] font-medium leading-relaxed", children: "Esta a\u00E7\u00E3o remover\u00E1 permanentemente seu hist\u00F3rico de conversas, badges, amizades e estat\u00EDsticas." }), _jsxs("div", { className: "flex flex-col gap-3 border-t-2 border-[#E7E5E4] pt-4", children: [_jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("label", { className: "text-[11px] font-black text-[#1C1917] uppercase", children: "1. Digite sua Senha do Perfil *" }), _jsx("input", { type: "password", value: deletePasswordConfirm, onChange: (e) => setDeletePasswordConfirm(e.target.value), placeholder: "Sua senha atual...", className: "px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-red-600" })] }), _jsxs("label", { className: "flex items-start gap-2.5 cursor-pointer bg-[#FAF9F6] p-3 rounded-xl border-2 border-[#E7E5E4]", children: [_jsx("input", { type: "checkbox", checked: agreeDeleteTerms, onChange: (e) => setAgreeDeleteTerms(e.target.checked), className: "mt-0.5 rounded border-2 border-[#1C1917] text-red-600 focus:ring-red-600" }), _jsx("span", { className: "text-[11px] font-bold text-[#1C1917] leading-snug", children: "Estou ciente de que a remo\u00E7\u00E3o \u00E9 irrevers\u00EDvel e n\u00E3o poderei recuperar este perfil." })] }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("label", { className: "text-[11px] font-black text-[#1C1917] uppercase", children: "2. Digite \"EXCLUIR PERMANENTEMENTE\" *" }), _jsx("input", { type: "text", value: deleteConfirmationText, onChange: (e) => setDeleteConfirmationText(e.target.value), placeholder: "EXCLUIR PERMANENTEMENTE", className: "px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-red-600" })] })] }), _jsxs("div", { className: "flex gap-2 pt-2", children: [_jsx("button", { type: "button", onClick: () => setShowDeleteModal(false), className: "flex-1 py-3 bg-[#FAF9F6] border-2 border-[#1C1917] text-xs font-black uppercase rounded-xl", children: "Cancelar" }), _jsx("button", { type: "button", disabled: !deletePasswordConfirm ||
                                        !agreeDeleteTerms ||
                                        deleteConfirmationText !== 'EXCLUIR PERMANENTEMENTE', onClick: handleDeleteAccount, className: "flex-1 py-3 bg-red-600 text-white text-xs font-black uppercase rounded-xl border-2 border-red-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm", children: "Apagar Conta" })] })] }) })), showTopicsModal && (_jsx("div", { className: "fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[8px_8px_0px_0px_#1C1917] flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto", children: [_jsxs("div", { className: "flex items-center justify-between border-b-2 border-[#E7E5E4] pb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h3", { className: "text-base font-black uppercase text-[#1C1917]", children: "Explorar T\u00F3picos" }), _jsxs("span", { className: "text-[10px] font-black uppercase bg-[#1C1917] text-[#FAF9F6] px-2 py-0.5 rounded", children: [selectedInterests.length, "/5"] })] }), _jsx("button", { type: "button", onClick: () => setShowTopicsModal(false), className: "text-sm font-black text-[#78716C] hover:text-[#1C1917]", children: "\u2715" })] }), _jsx("input", { type: "text", placeholder: "Buscar t\u00F3pico...", value: topicSearch, onChange: (e) => setTopicSearch(e.target.value), className: "px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]" }), _jsx("div", { className: "flex flex-col gap-5", children: topicsLibrary.map((cat) => {
                                const filteredItems = cat.items.filter((item) => item.toLowerCase().includes(topicSearch.toLowerCase()));
                                if (filteredItems.length === 0)
                                    return null;
                                return (_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("span", { className: "text-[10px] font-black uppercase tracking-wider text-[#78716C]", children: cat.category }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: filteredItems.map((item) => {
                                                const isSelected = selectedInterests.includes(item);
                                                return (_jsx("button", { type: "button", onClick: () => toggleInterest(item), className: `px-3.5 py-2 rounded-xl border-2 text-xs font-black transition-all ${isSelected
                                                        ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]'
                                                        : 'bg-[#FAF9F6] text-[#78716C] border-[#E7E5E4] hover:border-[#1C1917]'}`, children: isSelected ? `✓ ${item}` : `+ ${item}` }, item));
                                            }) })] }, cat.category));
                            }) }), _jsxs("button", { type: "button", onClick: () => setShowTopicsModal(false), className: "w-full py-3.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-black text-xs uppercase tracking-widest rounded-xl transition-all border-2 border-[#1C1917]", children: ["Concluir Sele\u00E7\u00E3o (", selectedInterests.length, "/5)"] })] }) })), showPublicPreview && (_jsx("div", { className: "fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[8px_8px_0px_0px_#1C1917] flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "flex items-center justify-between border-b-2 border-[#E7E5E4] pb-3", children: [_jsx("span", { className: "text-[10px] font-black uppercase tracking-widest bg-[#FAF9F6] border border-[#1C1917] text-[#1C1917] px-2.5 py-1 rounded-lg", children: "COMO OS OUTROS TE VEEM" }), _jsx("button", { type: "button", onClick: () => setShowPublicPreview(false), className: "text-sm font-black text-[#78716C] hover:text-[#1C1917]", children: "\u2715" })] }), _jsxs("div", { className: "flex flex-col items-center text-center gap-3", children: [_jsx("div", { className: "w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#1C1917] bg-[#F5F5F4] shadow-sm", children: _jsx("img", { src: avatarUrl, alt: name, className: "w-full h-full object-cover" }) }), _jsxs("div", { className: "flex flex-col items-center gap-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h3", { className: "text-lg font-black uppercase text-[#1C1917]", children: name }), _jsx("span", { className: "px-2 py-0.5 bg-[#1C1917] text-[#FAF9F6] font-black text-[10px] rounded uppercase", children: cefrLevel })] }), _jsxs("div", { className: "flex items-center gap-2 text-xs font-bold text-[#78716C]", children: [showAgeInProfile && birthDate && _jsxs("span", { children: [calculateAge(birthDate), " anos"] }), showAgeInProfile && birthDate && _jsx("span", { children: "\u2022" }), _jsx("span", { children: gender }), _jsx("span", { children: "\u2022" }), _jsx("span", { className: "italic", children: pronouns })] }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsxs("span", { className: "text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200", children: ["Reputa\u00E7\u00E3o: ", evolutionStats.reputationScore] }), _jsxs("span", { className: "text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200", children: ["\uD83D\uDD25 ", currentStreak, " Dias de Ofensiva"] })] })] }), _jsx("button", { type: "button", onClick: () => setFriendRequestSent(!friendRequestSent), className: `w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all border-2 border-[#1C1917] flex items-center justify-center gap-2 ${friendRequestSent
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-600'
                                        : 'bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6]'}`, children: friendRequestSent ? (_jsxs(_Fragment, { children: [_jsx("span", { children: "\u2713" }), " Solicita\u00E7\u00E3o Enviada"] })) : (_jsxs(_Fragment, { children: [_jsx("span", { children: "\uD83D\uDC64+" }), " Enviar Solicita\u00E7\u00E3o de Amizade"] })) }), _jsxs("p", { className: "text-xs text-[#57534E] font-medium leading-relaxed italic bg-[#FAF9F6] p-3 rounded-2xl border-2 border-[#E7E5E4] w-full text-left", children: ["\"", bio || 'Sem biografia informada.', "\""] }), _jsxs("div", { className: "flex flex-col gap-2 w-full pt-1 text-left border-t-2 border-[#E7E5E4] mt-1", children: [_jsxs("span", { className: "text-[10px] font-black uppercase text-[#78716C] tracking-wider", children: ["Avalia\u00E7\u00F5es e Coment\u00E1rios da Comunidade (", receivedFeedback.length, "):"] }), receivedFeedback.length === 0 ? (_jsx("div", { className: "rounded-2xl border-2 border-dashed border-[#E7E5E4] bg-[#FAF9F6] p-3 text-center text-[10px] font-black uppercase tracking-wider text-[#78716C]", children: "Ainda n\u00E3o h\u00E1 avalia\u00E7\u00F5es registradas." })) : (_jsx("div", { className: "flex flex-col gap-2", children: receivedFeedback.map((fb) => (_jsxs("div", { className: "bg-[#FAF9F6] p-3 rounded-2xl border-2 border-[#E7E5E4] flex flex-col gap-1.5", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-[11px] font-black text-[#1C1917]", children: fb.author }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-[10px] font-black text-amber-600", children: '★'.repeat(fb.rating) }), _jsx("span", { className: "text-[9px] font-bold text-[#A8A29E] uppercase", children: fb.date })] })] }), _jsxs("p", { className: "text-xs text-[#57534E] font-medium italic leading-relaxed", children: ["\"", fb.comment, "\""] })] }, fb.id))) }))] }), _jsxs("div", { className: "flex flex-col gap-1.5 w-full pt-1 text-left", children: [_jsx("span", { className: "text-[10px] font-black uppercase text-[#78716C]", children: "Conquistas Desbloqueadas:" }), badgesList.filter((b) => b.unlocked).length === 0 ? (_jsx("div", { className: "rounded-2xl border-2 border-dashed border-[#E7E5E4] bg-[#FAF9F6] p-3 text-center text-[10px] font-black uppercase tracking-wider text-[#78716C]", children: "Ainda n\u00E3o h\u00E1 conquistas desbloqueadas." })) : (_jsx("div", { className: "grid grid-cols-2 gap-2", children: badgesList.filter((b) => b.unlocked).map((badge) => (_jsxs("div", { className: "p-2 rounded-xl bg-[#FAF9F6] border-2 border-[#E7E5E4] flex items-center gap-2", children: [_jsx("span", { className: "text-base", children: badge.icon }), _jsx("span", { className: "text-[10px] font-black text-[#1C1917] uppercase truncate", children: badge.title })] }, badge.id))) }))] }), selectedInterests.length > 0 && (_jsxs("div", { className: "flex flex-col gap-1.5 w-full pt-1 text-left", children: [_jsx("span", { className: "text-[10px] font-black uppercase text-[#78716C]", children: "Interesses de Conversa:" }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: selectedInterests.map((interest) => (_jsx("span", { className: "text-[10px] font-black px-2.5 py-1 bg-[#FAF9F6] border-2 border-[#1C1917] text-[#1C1917] rounded-lg", children: interest }, interest))) })] }))] }), _jsx("button", { type: "button", onClick: () => setShowPublicPreview(false), className: "w-full py-3 bg-[#FAF9F6] hover:bg-[#F5F5F4] border-2 border-[#1C1917] text-[#1C1917] font-black text-xs uppercase tracking-widest rounded-xl transition-all", children: "Fechar Visualiza\u00E7\u00E3o" })] }) }))] }));
};
