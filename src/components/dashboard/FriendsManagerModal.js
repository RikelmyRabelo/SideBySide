import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export const FriendsManagerModal = ({ isOpen, onClose, onOpenDirectChat, }) => {
    const [activeTab, setActiveTab] = useState('friends');
    const [selectedUserProfile, setSelectedUserProfile] = useState(null);
    const [friendsList, setFriendsList] = useState([
        {
            id: 'f-1',
            name: 'Elena Rostova',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
            level: 'B1',
            isOnline: true,
        },
        {
            id: 'f-2',
            name: 'Mateo Rossi',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
            level: 'B2',
            isOnline: false,
        },
    ]);
    const [requestsList, setRequestsList] = useState([
        {
            id: 'req-1',
            name: 'Sarah Jenkins',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
            level: 'B1',
            time: 'Há 2 horas',
            bio: 'Estudante de engenharia praticando inglês para entrevistas de trabalho remoto.',
            gender: 'Feminino',
            pronouns: 'ela/dela',
        },
    ]);
    if (!isOpen)
        return null;
    const handleAcceptRequest = (req) => {
        setFriendsList((prev) => [
            ...prev,
            { id: req.id, name: req.name, avatar: req.avatar, level: req.level, isOnline: true },
        ]);
        setRequestsList((prev) => prev.filter((r) => r.id !== req.id));
        if (selectedUserProfile?.id === req.id) {
            setSelectedUserProfile(null);
        }
    };
    const handleDeclineRequest = (id) => {
        setRequestsList((prev) => prev.filter((r) => r.id !== id));
        if (selectedUserProfile?.id === id) {
            setSelectedUserProfile(null);
        }
    };
    const handleRemoveFriend = (id) => {
        setFriendsList((prev) => prev.filter((f) => f.id !== id));
        if (selectedUserProfile?.id === id) {
            setSelectedUserProfile(null);
        }
    };
    return (_jsxs("div", { className: "fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-[100] flex items-center justify-center p-4", children: [_jsxs("div", { className: "bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 max-w-md w-full shadow-[8px_8px_0px_0px_#1C1917] flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-hidden relative", children: [_jsxs("div", { className: "flex items-center justify-between border-b-2 border-[#E7E5E4] pb-3", children: [_jsx("h2", { className: "text-base font-black uppercase text-[#1C1917]", children: "Gerenciamento de Amizades" }), _jsx("button", { type: "button", onClick: onClose, className: "text-sm font-black text-[#78716C] hover:text-[#1C1917]", children: "\u2715" })] }), _jsxs("div", { className: "grid grid-cols-2 bg-[#F5F5F4] p-1 border-2 border-[#1C1917] rounded-xl text-xs font-black uppercase tracking-wider", children: [_jsxs("button", { type: "button", onClick: () => setActiveTab('friends'), className: `py-2 rounded-lg transition-all ${activeTab === 'friends' ? 'bg-[#1C1917] text-[#FAF9F6]' : 'text-[#78716C]'}`, children: ["Amigos (", friendsList.length, ")"] }), _jsxs("button", { type: "button", onClick: () => setActiveTab('requests'), className: `py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'requests' ? 'bg-[#1C1917] text-[#FAF9F6]' : 'text-[#78716C]'}`, children: ["Solicita\u00E7\u00F5es", requestsList.length > 0 && (_jsx("span", { className: "w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-black flex items-center justify-center", children: requestsList.length }))] })] }), _jsx("div", { className: "flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1", children: activeTab === 'friends' ? (friendsList.length > 0 ? (friendsList.map((friend) => (_jsxs("div", { className: "bg-[#FAF9F6] border-2 border-[#E7E5E4] p-3 rounded-2xl flex items-center justify-between gap-3 hover:border-[#1C1917] transition-all", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("button", { type: "button", onClick: () => setSelectedUserProfile(friend), className: "relative w-10 h-10 rounded-xl overflow-hidden border-2 border-[#1C1917] bg-[#E7E5E4] shrink-0 cursor-pointer hover:opacity-80 transition-opacity", title: "Ver Perfil", children: [_jsx("img", { src: friend.avatar, alt: friend.name, className: "w-full h-full object-cover" }), _jsx("span", { className: `absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-[#FFFFFF] ${friend.isOnline ? 'bg-emerald-500' : 'bg-gray-400'}` })] }), _jsxs("div", { className: "flex flex-col text-left", children: [_jsx("button", { type: "button", onClick: () => setSelectedUserProfile(friend), className: "text-xs font-black text-[#1C1917] hover:underline text-left", children: friend.name }), _jsxs("span", { className: "text-[10px] font-bold text-[#78716C] uppercase", children: ["N\u00EDvel ", friend.level, " \u2022 ", friend.isOnline ? 'Online' : 'Offline'] })] })] }), _jsxs("div", { className: "flex items-center gap-1.5", children: [onOpenDirectChat && (_jsx("button", { type: "button", onClick: () => {
                                                onOpenDirectChat(friend);
                                                onClose();
                                            }, className: "p-2.5 bg-[#1C1917] text-[#FAF9F6] rounded-xl hover:bg-[#292524] transition-all", title: "Enviar Mensagem Direta", children: _jsx("svg", { className: "w-3.5 h-3.5 fill-none stroke-current stroke-2", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" }) }) })), _jsx("button", { type: "button", onClick: () => handleRemoveFriend(friend.id), className: "p-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-all", title: "Remover Amigo", children: _jsx("svg", { className: "w-3.5 h-3.5 fill-none stroke-current stroke-2", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.10 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" }) }) })] })] }, friend.id)))) : (_jsx("div", { className: "py-8 text-center text-xs font-bold text-[#78716C] uppercase", children: "Sua lista de amigos est\u00E1 vazia." }))) : requestsList.length > 0 ? (requestsList.map((req) => (_jsxs("div", { className: "bg-[#FAF9F6] border-2 border-[#E7E5E4] p-3 rounded-2xl flex items-center justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { type: "button", onClick: () => setSelectedUserProfile(req), className: "w-10 h-10 rounded-xl overflow-hidden border-2 border-[#1C1917] bg-[#E7E5E4] shrink-0 cursor-pointer hover:opacity-80 transition-opacity", title: "Ver Perfil", children: _jsx("img", { src: req.avatar, alt: req.name, className: "w-full h-full object-cover" }) }), _jsxs("div", { className: "flex flex-col text-left", children: [_jsx("button", { type: "button", onClick: () => setSelectedUserProfile(req), className: "text-xs font-black text-[#1C1917] hover:underline text-left", children: req.name }), _jsxs("span", { className: "text-[10px] font-bold text-[#78716C] uppercase", children: ["N\u00EDvel ", req.level, " \u2022 ", req.time] })] })] }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("button", { type: "button", onClick: () => handleAcceptRequest(req), className: "px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase hover:bg-emerald-700 transition-all", children: "Aceitar" }), _jsx("button", { type: "button", onClick: () => handleDeclineRequest(req.id), className: "px-2.5 py-1.5 bg-[#FAF9F6] border border-[#E7E5E4] text-[#78716C] rounded-xl font-black text-xs uppercase hover:text-[#1C1917] transition-all", children: "Recusar" })] })] }, req.id)))) : (_jsx("div", { className: "py-8 text-center text-xs font-bold text-[#78716C] uppercase", children: "Nenhuma solicita\u00E7\u00E3o pendente." })) })] }), selectedUserProfile && (_jsx("div", { className: "fixed inset-0 bg-[#1C1917]/80 backdrop-blur-md z-[110] flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 max-w-sm w-full shadow-[8px_8px_0px_0px_#1C1917] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 text-center", children: [_jsxs("div", { className: "flex justify-between items-center border-b-2 border-[#E7E5E4] pb-2", children: [_jsx("span", { className: "text-[10px] font-black uppercase tracking-wider bg-[#1C1917] text-[#FAF9F6] px-2 py-0.5 rounded", children: "PERFIL DO USU\u00C1RIO" }), _jsx("button", { type: "button", onClick: () => setSelectedUserProfile(null), className: "text-xs font-black text-[#78716C] hover:text-[#1C1917]", children: "\u2715" })] }), _jsx("div", { className: "w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#1C1917] bg-[#E7E5E4] mx-auto", children: _jsx("img", { src: selectedUserProfile.avatar, alt: selectedUserProfile.name, className: "w-full h-full object-cover" }) }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx("h3", { className: "text-base font-black uppercase text-[#1C1917]", children: selectedUserProfile.name }), _jsx("span", { className: "px-2 py-0.5 bg-[#1C1917] text-[#FAF9F6] font-black text-[10px] rounded uppercase", children: selectedUserProfile.level })] }), _jsx("span", { className: "text-[11px] font-bold text-[#78716C] uppercase", children: 'gender' in selectedUserProfile && selectedUserProfile.gender ? selectedUserProfile.gender : 'Usuário Comunidade' })] }), _jsxs("p", { className: "text-xs text-[#57534E] font-medium italic bg-[#FAF9F6] p-3 rounded-xl border-2 border-[#E7E5E4] text-left", children: ["\"", 'bio' in selectedUserProfile && selectedUserProfile.bio ? selectedUserProfile.bio : 'Estudante ativo praticando conversação P2P no SideBySide.', "\""] }), 'time' in selectedUserProfile ? (_jsxs("div", { className: "flex gap-2 pt-2", children: [_jsx("button", { type: "button", onClick: () => handleAcceptRequest(selectedUserProfile), className: "flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase", children: "Aceitar Amizade" }), _jsx("button", { type: "button", onClick: () => handleDeclineRequest(selectedUserProfile.id), className: "flex-1 py-2.5 bg-[#FAF9F6] border-2 border-[#E7E5E4] text-[#78716C] rounded-xl font-black text-xs uppercase", children: "Recusar" })] })) : (_jsx("button", { type: "button", onClick: () => setSelectedUserProfile(null), className: "w-full py-2.5 bg-[#1C1917] text-[#FAF9F6] rounded-xl font-black text-xs uppercase mt-2", children: "Fechar Perfil" }))] }) }))] }));
};
