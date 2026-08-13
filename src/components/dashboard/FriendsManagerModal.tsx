import React, { useState } from 'react';

interface Friend {
  id: string;
  name: string;
  avatar: string;
  level: string;
  isOnline: boolean;
}

interface FriendRequest {
  id: string;
  name: string;
  avatar: string;
  level: string;
  time: string;
}

interface FriendsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDirectChat?: (friend: Friend) => void;
}

export const FriendsManagerModal: React.FC<FriendsManagerModalProps> = ({
  isOpen,
  onClose,
  onOpenDirectChat,
}) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');

  const [friendsList, setFriendsList] = useState<Friend[]>([
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

  const [requestsList, setRequestsList] = useState<FriendRequest[]>([
    {
      id: 'req-1',
      name: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      level: 'B1',
      time: 'Há 2 horas',
    },
  ]);

  if (!isOpen) return null;

  const handleAcceptRequest = (req: FriendRequest) => {
    setFriendsList((prev) => [
      ...prev,
      { id: req.id, name: req.name, avatar: req.avatar, level: req.level, isOnline: true },
    ]);
    setRequestsList((prev) => prev.filter((r) => r.id !== req.id));
  };

  const handleDeclineRequest = (id: string) => {
    setRequestsList((prev) => prev.filter((r) => r.id !== id));
  };

  const handleRemoveFriend = (id: string) => {
    setFriendsList((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 max-w-md w-full shadow-[8px_8px_0px_0px_#1C1917] flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between border-b-2 border-[#E7E5E4] pb-3">
          <h2 className="text-base font-black uppercase text-[#1C1917]">
            Gerenciamento de Amizades
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-black text-[#78716C] hover:text-[#1C1917]"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 bg-[#F5F5F4] p-1 border-2 border-[#1C1917] rounded-xl text-xs font-black uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setActiveTab('friends')}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'friends' ? 'bg-[#1C1917] text-[#FAF9F6]' : 'text-[#78716C]'
            }`}
          >
            Amigos ({friendsList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'requests' ? 'bg-[#1C1917] text-[#FAF9F6]' : 'text-[#78716C]'
            }`}
          >
            Solicitações
            {requestsList.length > 0 && (
              <span className="w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                {requestsList.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1">
          {activeTab === 'friends' ? (
            friendsList.length > 0 ? (
              friendsList.map((friend) => (
                <div
                  key={friend.id}
                  className="bg-[#FAF9F6] border-2 border-[#E7E5E4] p-3 rounded-2xl flex items-center justify-between gap-3 hover:border-[#1C1917] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-[#1C1917] bg-[#E7E5E4] shrink-0">
                      <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                      <span
                        className={`absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-[#FFFFFF] ${
                          friend.isOnline ? 'bg-emerald-500' : 'bg-gray-400'
                        }`}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-[#1C1917]">{friend.name}</span>
                      <span className="text-[10px] font-bold text-[#78716C] uppercase">
                        Nível {friend.level} • {friend.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onOpenDirectChat && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenDirectChat(friend);
                          onClose();
                        }}
                        className="p-2 bg-[#1C1917] text-[#FAF9F6] rounded-xl hover:bg-[#292524] transition-all text-xs font-black"
                        title="Enviar Mensagem Direta"
                      >
                        💬
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveFriend(friend.id)}
                      className="p-2 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-all text-xs font-black"
                      title="Remover Amigo"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs font-bold text-[#78716C] uppercase">
                Sua lista de amigos está vazia.
              </div>
            )
          ) : requestsList.length > 0 ? (
            requestsList.map((req) => (
              <div
                key={req.id}
                className="bg-[#FAF9F6] border-2 border-[#E7E5E4] p-3 rounded-2xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={req.avatar}
                    alt={req.name}
                    className="w-10 h-10 rounded-xl object-cover border-2 border-[#1C1917]"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-[#1C1917]">{req.name}</span>
                    <span className="text-[10px] font-bold text-[#78716C] uppercase">
                      Nível {req.level} • {req.time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAcceptRequest(req)}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase hover:bg-emerald-700 transition-all"
                  >
                    Aceitar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeclineRequest(req.id)}
                    className="px-2.5 py-1.5 bg-[#FAF9F6] border border-[#E7E5E4] text-[#78716C] rounded-xl font-black text-xs uppercase hover:text-[#1C1917] transition-all"
                  >
                    Recusar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs font-bold text-[#78716C] uppercase">
              Nenhuma solicitação pendente.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};