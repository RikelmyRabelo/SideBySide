import React, { useState, useCallback, memo } from 'react';

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
  bio?: string;
  gender?: string;
  pronouns?: string;
}

interface FriendsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDirectChat?: (friend: Friend) => void;
}

export const FriendsManagerModal: React.FC<FriendsManagerModalProps> = memo(({
  isOpen,
  onClose,
  onOpenDirectChat,
}) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [selectedUserProfile, setSelectedUserProfile] = useState<FriendRequest | Friend | null>(null);

  const [friendsList, setFriendsList] = useState<Friend[]>([]);
  const [requestsList, setRequestsList] = useState<FriendRequest[]>([]);

  const handleAcceptRequest = useCallback((req: FriendRequest) => {
    setFriendsList((prev) => [
      ...prev,
      { id: req.id, name: req.name, avatar: req.avatar, level: req.level, isOnline: true },
    ]);
    setRequestsList((prev) => prev.filter((r) => r.id !== req.id));
    if (selectedUserProfile?.id === req.id) {
      setSelectedUserProfile(null);
    }
  }, [selectedUserProfile?.id]);

  const handleDeclineRequest = useCallback((id: string) => {
    setRequestsList((prev) => prev.filter((r) => r.id !== id));
    if (selectedUserProfile?.id === id) {
      setSelectedUserProfile(null);
    }
  }, [selectedUserProfile?.id]);

  const handleRemoveFriend = useCallback((id: string) => {
    setFriendsList((prev) => prev.filter((f) => f.id !== id));
    if (selectedUserProfile?.id === id) {
      setSelectedUserProfile(null);
    }
  }, [selectedUserProfile?.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 max-w-md w-full shadow-[8px_8px_0px_0px_#1C1917] flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-hidden relative">
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
                    <button
                      type="button"
                      onClick={() => setSelectedUserProfile(friend)}
                      className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-[#1C1917] bg-[#E7E5E4] shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                      title="Ver Perfil"
                    >
                      <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                      <span
                        className={`absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-[#FFFFFF] ${
                          friend.isOnline ? 'bg-emerald-500' : 'bg-gray-400'
                        }`}
                      />
                    </button>
                    <div className="flex flex-col text-left">
                      <button
                        type="button"
                        onClick={() => setSelectedUserProfile(friend)}
                        className="text-xs font-black text-[#1C1917] hover:underline text-left"
                      >
                        {friend.name}
                      </button>
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
                        className="p-2.5 bg-[#1C1917] text-[#FAF9F6] rounded-xl hover:bg-[#292524] transition-all"
                        title="Enviar Mensagem Direta"
                      >
                        <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                        </svg>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveFriend(friend.id)}
                      className="p-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-all"
                      title="Remover Amigo"
                    >
                      <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.10 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
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
                  <button
                    type="button"
                    onClick={() => setSelectedUserProfile(req)}
                    className="w-10 h-10 rounded-xl overflow-hidden border-2 border-[#1C1917] bg-[#E7E5E4] shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    title="Ver Perfil"
                  >
                    <img
                      src={req.avatar}
                      alt={req.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                  <div className="flex flex-col text-left">
                    <button
                      type="button"
                      onClick={() => setSelectedUserProfile(req)}
                      className="text-xs font-black text-[#1C1917] hover:underline text-left"
                    >
                      {req.name}
                    </button>
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

      {selectedUserProfile && (
        <div className="fixed inset-0 bg-[#1C1917]/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 max-w-sm w-full shadow-[8px_8px_0px_0px_#1C1917] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 text-center">
            <div className="flex justify-between items-center border-b-2 border-[#E7E5E4] pb-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#1C1917] text-[#FAF9F6] px-2 py-0.5 rounded">
                PERFIL DO USUÁRIO
              </span>
              <button
                type="button"
                onClick={() => setSelectedUserProfile(null)}
                className="text-xs font-black text-[#78716C] hover:text-[#1C1917]"
              >
                ✕
              </button>
            </div>

            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#1C1917] bg-[#E7E5E4] mx-auto">
              <img
                src={selectedUserProfile.avatar}
                alt={selectedUserProfile.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-base font-black uppercase text-[#1C1917]">
                  {selectedUserProfile.name}
                </h3>
                <span className="px-2 py-0.5 bg-[#1C1917] text-[#FAF9F6] font-black text-[10px] rounded uppercase">
                  {selectedUserProfile.level}
                </span>
              </div>
              <span className="text-[11px] font-bold text-[#78716C] uppercase">
                {'gender' in selectedUserProfile && selectedUserProfile.gender ? selectedUserProfile.gender : 'Usuário Comunidade'}
              </span>
            </div>

            <p className="text-xs text-[#57534E] font-medium italic bg-[#FAF9F6] p-3 rounded-xl border-2 border-[#E7E5E4] text-left">
              "{'bio' in selectedUserProfile && selectedUserProfile.bio ? selectedUserProfile.bio : 'Estudante ativo praticando conversação P2P no SideBySide.'}"
            </p>

            {'time' in selectedUserProfile ? (
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleAcceptRequest(selectedUserProfile as FriendRequest)}
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase"
                >
                  Aceitar Amizade
                </button>
                <button
                  type="button"
                  onClick={() => handleDeclineRequest(selectedUserProfile.id)}
                  className="flex-1 py-2.5 bg-[#FAF9F6] border-2 border-[#E7E5E4] text-[#78716C] rounded-xl font-black text-xs uppercase"
                >
                  Recusar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSelectedUserProfile(null)}
                className="w-full py-2.5 bg-[#1C1917] text-[#FAF9F6] rounded-xl font-black text-xs uppercase mt-2"
              >
                Fechar Perfil
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

FriendsManagerModal.displayName = 'FriendsManagerModal';