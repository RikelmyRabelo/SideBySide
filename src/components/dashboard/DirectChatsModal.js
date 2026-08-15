import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useMemo, memo } from 'react';
export const DirectChatsModal = memo(({ isOpen, onClose, selectedContact, }) => {
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(selectedContact?.id || chats[0]?.id || '');
    const [newMessageText, setNewMessageText] = useState('');
    const activeChat = useMemo(() => {
        return chats.find((c) => c.id === activeChatId) || chats[0];
    }, [chats, activeChatId]);
    const handleSendMessage = useCallback((e) => {
        e.preventDefault();
        if (!newMessageText.trim() || !activeChat)
            return;
        const newMsg = {
            id: `msg-${Date.now()}`,
            sender: 'me',
            text: newMessageText,
            time: 'Agora',
        };
        setChats((prev) => prev.map((c) => {
            if (c.id === activeChat.id) {
                return {
                    ...c,
                    lastMessage: newMessageText,
                    time: 'Agora',
                    messages: [...c.messages, newMsg],
                };
            }
            return c;
        }));
        setNewMessageText('');
    }, [newMessageText, activeChat]);
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-[100] flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl max-w-2xl w-full h-[520px] shadow-[8px_8px_0px_0px_#1C1917] flex overflow-hidden animate-in fade-in zoom-in-95 duration-150", children: [_jsxs("div", { className: "w-1/3 border-r-2 border-[#E7E5E4] bg-[#FAF9F6] flex flex-col", children: [_jsx("div", { className: "p-4 border-b-2 border-[#E7E5E4] flex items-center justify-between bg-[#FFFFFF]", children: _jsx("h3", { className: "text-xs font-black uppercase text-[#1C1917]", children: "Chats Diretos" }) }), _jsx("div", { className: "flex-1 overflow-y-auto flex flex-col divide-y divide-[#E7E5E4]", children: chats.map((c) => (_jsxs("button", { type: "button", onClick: () => setActiveChatId(c.id), className: `p-3.5 text-left flex items-center gap-3 transition-colors ${c.id === activeChat?.id ? 'bg-[#FFFFFF] font-black' : 'hover:bg-[#F5F5F4]'}`, children: [_jsx("img", { src: c.avatar, alt: c.name, className: "w-9 h-9 rounded-xl object-cover border-2 border-[#1C1917] shrink-0" }), _jsxs("div", { className: "flex flex-col min-w-0 flex-1", children: [_jsxs("div", { className: "flex justify-between items-baseline", children: [_jsx("span", { className: "text-xs font-black text-[#1C1917] truncate", children: c.name }), _jsx("span", { className: "text-[9px] font-bold text-[#A8A29E] uppercase", children: c.time })] }), _jsx("span", { className: "text-[10px] text-[#78716C] truncate font-medium", children: c.lastMessage })] })] }, c.id))) })] }), _jsxs("div", { className: "flex-1 flex flex-col bg-[#FFFFFF]", children: [_jsxs("div", { className: "p-4 border-b-2 border-[#E7E5E4] flex items-center justify-between", children: [activeChat ? (_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("img", { src: activeChat.avatar, alt: activeChat.name, className: "w-8 h-8 rounded-lg object-cover border-2 border-[#1C1917]" }), _jsx("span", { className: "text-xs font-black uppercase text-[#1C1917]", children: activeChat.name })] })) : (_jsx("span", { className: "text-xs font-black uppercase text-[#78716C]", children: "Selecione uma conversa" })), _jsx("button", { type: "button", onClick: onClose, className: "text-sm font-black text-[#78716C] hover:text-[#1C1917]", children: "\u2715" })] }), _jsx("div", { className: "flex-1 p-4 overflow-y-auto flex flex-col gap-2.5 bg-[#FAF9F6]", children: activeChat?.messages.map((m) => (_jsxs("div", { className: `max-w-[75%] p-3 rounded-2xl text-xs font-medium ${m.sender === 'me'
                                    ? 'bg-[#1C1917] text-[#FAF9F6] self-end rounded-br-none'
                                    : 'bg-[#FFFFFF] border-2 border-[#E7E5E4] text-[#1C1917] self-start rounded-bl-none'}`, children: [_jsx("p", { children: m.text }), _jsx("span", { className: `text-[8px] font-bold uppercase mt-1 block text-right ${m.sender === 'me' ? 'text-[#A8A29E]' : 'text-[#78716C]'}`, children: m.time })] }, m.id))) }), _jsxs("form", { onSubmit: handleSendMessage, className: "p-3 border-t-2 border-[#E7E5E4] flex gap-2", children: [_jsx("input", { type: "text", placeholder: "Digite uma mensagem privada...", value: newMessageText, onChange: (e) => setNewMessageText(e.target.value), className: "flex-1 px-3.5 py-2.5 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]" }), _jsx("button", { type: "submit", className: "px-4 py-2.5 bg-[#1C1917] text-[#FAF9F6] font-black text-xs uppercase rounded-xl border-2 border-[#1C1917]", children: "Enviar" })] })] })] }) }));
});
DirectChatsModal.displayName = 'DirectChatsModal';
export default DirectChatsModal;
