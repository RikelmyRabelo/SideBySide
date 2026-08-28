import React, { useState, useEffect, useRef, memo } from 'react';
import { io, Socket } from 'socket.io-client';
import { Friend } from './FriendsManagerModal';

interface Message {
  id: string | number;
  text: string;
  sender: 'me' | 'them';
  time: string;
}

export interface DirectChatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContact: Friend | null;
  friendsList: Friend[];
}

export const DirectChatsModal: React.FC<DirectChatsModalProps> = memo(({ isOpen, onClose, selectedContact, friendsList }) => {
  const [activeContact, setActiveContact] = useState<Friend | null>(selectedContact);
  const [viewingProfile, setViewingProfile] = useState<Friend | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  
  const socketRef = useRef<Socket | null>(null);
  const activeContactRef = useRef<Friend | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeContactRef.current = activeContact;
  }, [activeContact]);

  useEffect(() => {
    if (isOpen && activeContact) {
      fetch(`http://localhost:3000/api/messages/${activeContact.id}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const formatted: Message[] = data.map((m: any) => {
              const d = new Date(m.createdAt);
              const timeString = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
              return {
                id: m.id,
                text: m.text,
                sender: (m.senderId === activeContact.id ? 'them' : 'me') as 'me' | 'them',
                time: timeString
              };
            });
            setMessages(formatted);
          }
        })
        .catch(console.error);
    } else {
      setMessages([]);
    }
  }, [isOpen, activeContact]);

  useEffect(() => {
    if (isOpen) {
      const newSocket = io('http://localhost:3000', { withCredentials: true });
      socketRef.current = newSocket;

      newSocket.on('direct_message', (data: { id: string; senderId: string; text: string; timestamp: number }) => {
        if (activeContactRef.current && data.senderId === activeContactRef.current.id) {
          const d = new Date(data.timestamp);
          const timeString = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
          setMessages((prev) => [...prev, { id: data.id || data.timestamp, text: data.text, sender: 'them', time: timeString }]);
        }
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && selectedContact) {
      setActiveContact(selectedContact);
    }
  }, [isOpen, selectedContact]);

  useEffect(() => {
    if (!isOpen) {
      setViewingProfile(null);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeContact]);

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeContact) return;

    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newMessage: Message = { id: Date.now(), text: inputMessage, sender: 'me', time: timeString };
    setMessages((prev) => [...prev, newMessage]);
    setInputMessage('');

    fetch('http://localhost:3000/api/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        recipientId: activeContact.id,
        text: newMessage.text
      })
    }).catch(console.error);
  };

  const hasFriends = friendsList && friendsList.length > 0;

  return (
    <div className="fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl overflow-hidden max-w-4xl w-full shadow-[8px_8px_0px_0px_#1C1917] flex h-[600px] max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 relative">
        
        {!hasFriends ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4 relative">
            <button type="button" onClick={onClose} className="absolute top-6 right-6 text-sm font-black text-[#78716C] hover:text-[#1C1917]">✕</button>
            <div className="w-16 h-16 rounded-2xl bg-[#F5F5F4] border-2 border-[#E7E5E4] flex items-center justify-center">
              <svg className="w-8 h-8 stroke-[#A8A29E] fill-none stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
            </div>
            <div className="flex flex-col gap-2 max-w-sm">
              <h2 className="text-xl font-black uppercase text-[#1C1917]">Chat Bloqueado</h2>
              <p className="text-xs font-medium text-[#78716C] leading-relaxed">
                Você só pode conversar diretamente com usuários que aceitaram sua solicitação de amizade. Adicione parceiros durante as salas temáticas ou pelo menu de contatos.
              </p>
            </div>
            <button type="button" onClick={onClose} className="px-6 py-3 bg-[#1C1917] text-[#FAF9F6] font-black text-xs uppercase tracking-widest rounded-xl hover:bg-[#292524] transition-all mt-2">
              Voltar ao Painel
            </button>
          </div>
        ) : (
          <>
            <div className={`w-full md:w-80 bg-[#FAF9F6] border-r-2 border-[#1C1917] flex-col shrink-0 ${activeContact ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-6 border-b-2 border-[#E7E5E4] flex items-center justify-between">
                <h2 className="text-base font-black uppercase text-[#1C1917]">Conversas</h2>
                <button type="button" onClick={onClose} className="md:hidden text-sm font-black text-[#78716C] hover:text-[#1C1917]">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                {friendsList.map((friend) => (
                  <button
                    key={friend.id}
                    type="button"
                    onClick={() => { setActiveContact(friend); setMessages([]); }}
                    className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left border-2 ${activeContact?.id === friend.id ? 'bg-[#1C1917] border-[#1C1917] text-[#FAF9F6] shadow-md' : 'bg-[#FFFFFF] border-[#E7E5E4] hover:border-[#1C1917] text-[#1C1917]'}`}
                  >
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-[#E7E5E4] border-2 border-current">
                      <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-current rounded-full ${friend.isOnline ? 'bg-emerald-500' : 'bg-[#A8A29E]'}`} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-xs font-black uppercase truncate">{friend.name}</span>
                      <span className={`text-[10px] font-bold truncate ${activeContact?.id === friend.id ? 'text-[#D6D3D1]' : 'text-[#78716C]'}`}>{friend.tag}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className={`flex-1 bg-[#FFFFFF] flex-col relative ${!activeContact ? 'hidden md:flex' : 'flex'}`}>
              {activeContact ? (
                <>
                  <div className="p-4 sm:p-6 border-b-2 border-[#E7E5E4] flex items-center justify-between bg-[#FAF9F6]">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <button type="button" onClick={() => setActiveContact(null)} className="md:hidden p-2 bg-[#E7E5E4] rounded-xl text-[#1C1917]">
                        <svg className="w-4 h-4 fill-none stroke-current stroke-[3]" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                      </button>
                      
                      <button type="button" onClick={() => setViewingProfile(activeContact)} className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden border-2 border-[#1C1917] bg-[#E7E5E4] shrink-0 hover:opacity-80 transition-opacity" title="Ver Perfil">
                        <img src={activeContact.avatar} alt={activeContact.name} className="w-full h-full object-cover" />
                      </button>
                      <div className="flex flex-col text-left">
                        <button type="button" onClick={() => setViewingProfile(activeContact)} className="text-sm sm:text-base font-black uppercase text-[#1C1917] leading-tight hover:underline text-left">
                          {activeContact.name}
                        </button>
                        <span className="text-[10px] font-bold text-[#78716C]">{activeContact.isOnline ? 'Online agora' : 'Offline'}</span>
                      </div>
                    </div>
                    <button type="button" onClick={onClose} className="hidden md:block text-sm font-black text-[#78716C] hover:text-[#1C1917]">✕</button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 bg-[#FFFFFF]">
                    <div className="text-center my-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#A8A29E] bg-[#F5F5F4] px-2 py-1 rounded-md border border-[#E7E5E4]">
                        Início da conversa
                      </span>
                    </div>

                    {messages.map((msg) => {
                      const isMe = msg.sender === 'me';
                      return (
                        <div key={msg.id} className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                          <div className={`p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed border-2 ${isMe ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917] rounded-br-sm' : 'bg-[#FAF9F6] text-[#1C1917] border-[#E7E5E4] rounded-bl-sm'}`}>
                            {msg.text}
                          </div>
                          <span className="text-[9px] font-bold text-[#A8A29E] mt-1 uppercase">{msg.time}</span>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-4 sm:p-6 border-t-2 border-[#E7E5E4] bg-[#FAF9F6]">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-3">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Escreva sua mensagem..."
                        className="flex-1 bg-[#FFFFFF] border-2 border-[#E7E5E4] rounded-xl px-4 py-3.5 text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] transition-all"
                      />
                      <button
                        type="submit"
                        disabled={!inputMessage.trim()}
                        className="p-3.5 bg-[#1C1917] text-[#FAF9F6] rounded-xl border-2 border-[#1C1917] disabled:opacity-50 hover:bg-[#292524] transition-all shadow-sm shrink-0"
                      >
                        <svg className="w-4 h-4 fill-none stroke-current stroke-[3]" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
                  <button type="button" onClick={onClose} className="absolute top-6 right-6 text-sm font-black text-[#78716C] hover:text-[#1C1917]">✕</button>
                  <div className="w-16 h-16 rounded-2xl bg-[#F5F5F4] border-2 border-[#E7E5E4] flex items-center justify-center">
                    <svg className="w-8 h-8 stroke-[#D6D3D1] fill-none stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                  </div>
                  <h3 className="text-sm font-black uppercase text-[#A8A29E]">Seu espaço de conversas</h3>
                  <p className="text-[11px] font-bold text-[#D6D3D1] max-w-[200px]">Escolha um contato na barra lateral para iniciar o chat.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
});

DirectChatsModal.displayName = 'DirectChatsModal';