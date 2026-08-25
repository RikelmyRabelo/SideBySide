import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3000/api/notifications', {
          credentials: 'include', // Usa o cookie HTTP-Only para autenticar
        });
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/40 backdrop-blur-sm">
      <div className="bg-[#FAF9F6] border-2 border-[#1C1917] rounded-2xl w-full max-w-md shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header do Modal */}
        <div className="flex items-center justify-between border-b-2 border-[#1C1917] p-4 bg-[#FFFFFF]">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black uppercase tracking-tight text-[#1C1917]">Notificações</h2>
            <span className="text-[10px] font-bold bg-[#1C1917] text-[#FAF9F6] px-2 py-0.5 rounded-full">
              {notifications.filter(n => !n.read).length} novas
            </span>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F5F4] transition-colors"
          >
            <span className="text-[#1C1917] font-bold text-xl leading-none">&times;</span>
          </button>
        </div>

        {/* Lista de Notificações */}
        <div className="p-4 max-h-[60vh] overflow-y-auto flex flex-col gap-3">
          {loading ? (
            <p className="text-xs font-bold text-[#78716C] text-center py-8 uppercase tracking-widest">Buscando...</p>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 flex flex-col items-center gap-2">
              <svg 
                className="w-10 h-10 text-[#D6D3D1] stroke-current fill-none stroke-2 mb-1" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
                />
              </svg>
              <p className="text-xs font-bold text-[#78716C] uppercase tracking-widest">Caixa vazia</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div 
                key={item.id} 
                className={`p-4 rounded-xl border-2 transition-all flex flex-col gap-2 ${
                  item.read ? 'bg-[#FAF9F6] border-[#E7E5E4]' : 'bg-[#FFFFFF] border-[#1C1917] shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-[#1C1917]">
                    {item.title}
                  </span>
                  {!item.read && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />}
                </div>
                <p className="text-xs text-[#57534E] leading-relaxed font-medium">
                  {item.message}
                </p>
                <span className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider mt-1">
                  {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};