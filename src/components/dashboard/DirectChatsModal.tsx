import React, { useState } from 'react';

interface DirectMessage {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
}

interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  messages: DirectMessage[];
}

interface DirectChatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContact?: { id: string; name: string; avatar: string } | null;
}

export const DirectChatsModal: React.FC<DirectChatsModalProps> = ({
  isOpen,
  onClose,
  selectedContact,
}) => {
  const [chats, setChats] = useState<ChatContact[]>([
    {
      id: 'f-1',
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      lastMessage: 'Muito obrigado pela prática de hoje!',
      time: '11:45',
      unread: true,
      messages: [
        { id: 'm1', sender: 'them', text: 'Hey Lucas! How are you feeling about our last topic?', time: '11:30' },
        { id: 'm2', sender: 'me', text: 'Hey Elena! It went really well, thanks for the tips!', time: '11:40' },
        { id: 'm3', sender: 'them', text: 'Muito obrigado pela prática de hoje!', time: '11:45' },
      ],
    },
    {
      id: 'f-2',
      name: 'Mateo Rossi',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      lastMessage: 'Vamos agendar outra sessão no final de semana?',
      time: 'Ontem',
      unread: false,
      messages: [
        { id: 'm10', sender: 'them', text: 'Vamos agendar outra sessão no final de semana?', time: 'Ontem' },
      ],
    },
  ]);

  const [activeChatId, setActiveChatId] = useState<string>(
    selectedContact?.id || chats[0]?.id || ''
  );
  const [newMessageText, setNewMessageText] = useState('');

  if (!isOpen) return null;

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeChat) return;

    const newMsg: DirectMessage = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text: newMessageText,
      time: 'Agora',
    };

    setChats((prev) =>
      prev.map((c) => {
        if (c.id === activeChat.id) {
          return {
            ...c,
            lastMessage: newMessageText,
            time: 'Agora',
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setNewMessageText('');
  };

  return (
    <div className="fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl max-w-2xl w-full h-[520px] shadow-[8px_8px_0px_0px_#1C1917] flex overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="w-1/3 border-r-2 border-[#E7E5E4] bg-[#FAF9F6] flex flex-col">
          <div className="p-4 border-b-2 border-[#E7E5E4] flex items-center justify-between bg-[#FFFFFF]">
            <h3 className="text-xs font-black uppercase text-[#1C1917]">Chats Diretos</h3>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col divide-y divide-[#E7E5E4]">
            {chats.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveChatId(c.id)}
                className={`p-3.5 text-left flex items-center gap-3 transition-colors ${
                  c.id === activeChat?.id ? 'bg-[#FFFFFF] font-black' : 'hover:bg-[#F5F5F4]'
                }`}
              >
                <img
                  src={c.avatar}
                  alt={c.name}
                  className="w-9 h-9 rounded-xl object-cover border-2 border-[#1C1917] shrink-0"
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-black text-[#1C1917] truncate">{c.name}</span>
                    <span className="text-[9px] font-bold text-[#A8A29E] uppercase">{c.time}</span>
                  </div>
                  <span className="text-[10px] text-[#78716C] truncate font-medium">{c.lastMessage}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-[#FFFFFF]">
          <div className="p-4 border-b-2 border-[#E7E5E4] flex items-center justify-between">
            {activeChat ? (
              <div className="flex items-center gap-2.5">
                <img
                  src={activeChat.avatar}
                  alt={activeChat.name}
                  className="w-8 h-8 rounded-lg object-cover border-2 border-[#1C1917]"
                />
                <span className="text-xs font-black uppercase text-[#1C1917]">{activeChat.name}</span>
              </div>
            ) : (
              <span className="text-xs font-black uppercase text-[#78716C]">Selecione uma conversa</span>
            )}

            <button
              type="button"
              onClick={onClose}
              className="text-sm font-black text-[#78716C] hover:text-[#1C1917]"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2.5 bg-[#FAF9F6]">
            {activeChat?.messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[75%] p-3 rounded-2xl text-xs font-medium ${
                  m.sender === 'me'
                    ? 'bg-[#1C1917] text-[#FAF9F6] self-end rounded-br-none'
                    : 'bg-[#FFFFFF] border-2 border-[#E7E5E4] text-[#1C1917] self-start rounded-bl-none'
                }`}
              >
                <p>{m.text}</p>
                <span
                  className={`text-[8px] font-bold uppercase mt-1 block text-right ${
                    m.sender === 'me' ? 'text-[#A8A29E]' : 'text-[#78716C]'
                  }`}
                >
                  {m.time}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t-2 border-[#E7E5E4] flex gap-2">
            <input
              type="text"
              placeholder="Digite uma mensagem privada..."
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#1C1917] text-[#FAF9F6] font-black text-xs uppercase rounded-xl border-2 border-[#1C1917]"
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DirectChatsModal;