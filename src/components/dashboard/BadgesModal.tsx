import React, { useState } from 'react';
import { BADGES_CATALOG, Badge } from '../../data/badgesData';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({ isOpen, onClose }) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  if (!isOpen) return null;

  const unlockedCount = BADGES_CATALOG.filter((b) => b.unlocked).length;
  const totalCount = BADGES_CATALOG.length;
  const overallPercentage = Math.round((unlockedCount / totalCount) * 100);

  const filteredBadges = BADGES_CATALOG.filter((badge) => {
    if (filter === 'unlocked') return badge.unlocked;
    if (filter === 'locked') return !badge.unlocked;
    return true;
  });

  const renderBadgeIcon = (iconType: string, unlocked: boolean) => {
    const strokeClass = unlocked ? 'stroke-[#1C1917]' : 'stroke-[#A8A29E]';
    switch (iconType) {
      case 'fire':
        return (
          <svg className={`w-6 h-6 fill-none ${strokeClass} stroke-2`} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.283 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
          </svg>
        );
      case 'clock':
        return (
          <svg className={`w-6 h-6 fill-none ${strokeClass} stroke-2`} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'compass':
        return (
          <svg className={`w-6 h-6 fill-none ${strokeClass} stroke-2`} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 9.192-9.192 3.536 3.536-9.192 9.192-3.536z" />
          </svg>
        );
      case 'star':
        return (
          <svg className={`w-6 h-6 fill-none ${strokeClass} stroke-2`} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385c.116.488-.415.862-.835.611L12 18.002l-4.719 2.539c-.42.226-.951-.123-.835-.611l1.285-5.385a.563.563 0 00-.182-.557l-4.204-3.602c-.38-.325-.178-.948.32-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        );
      default:
        return (
          <svg className={`w-6 h-6 fill-none ${strokeClass} stroke-2`} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 003-3V8.25a3 3 0 00-3-3h-9a3 3 0 00-3 3v7.5a3 3 0 003 3m9 0v-1.5a2.25 2.25 0 00-2.25-2.25h-4.5A2.25 2.25 0 007.5 17.25v1.5" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-[8px_8px_0px_0px_#1C1917] flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-hidden">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b-2 border-[#E7E5E4] pb-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#78716C]">
              SISTEMA DE GAMIFICAÇÃO
            </span>
            <h2 className="text-xl font-black uppercase text-[#1C1917]">
              Galeria de Badges & Conquistas
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-black text-[#78716C] hover:text-[#1C1917]"
          >
            ✕
          </button>
        </div>

        {/* Card de Progresso Geral */}
        <div className="bg-[#FAF9F6] border-2 border-[#1C1917] p-4 rounded-2xl flex flex-col gap-3">
          <div className="flex justify-between items-center text-xs font-black text-[#1C1917] uppercase">
            <span>Progresso Geral da Conta</span>
            <span>{unlockedCount} de {totalCount} Conquistas ({overallPercentage}%)</span>
          </div>
          <div className="w-full h-3 bg-[#E7E5E4] rounded-full overflow-hidden border border-[#1C1917]">
            <div
              className="h-full bg-[#1C1917] transition-all duration-500"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-3 bg-[#F5F5F4] p-1 border-2 border-[#1C1917] rounded-xl text-xs font-black uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`py-2 rounded-lg transition-all ${filter === 'all' ? 'bg-[#1C1917] text-[#FAF9F6]' : 'text-[#78716C]'}`}
          >
            Todas ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unlocked')}
            className={`py-2 rounded-lg transition-all ${filter === 'unlocked' ? 'bg-[#1C1917] text-[#FAF9F6]' : 'text-[#78716C]'}`}
          >
            Desbloqueadas ({unlockedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('locked')}
            className={`py-2 rounded-lg transition-all ${filter === 'locked' ? 'bg-[#1C1917] text-[#FAF9F6]' : 'text-[#78716C]'}`}
          >
            Bloqueadas ({totalCount - unlockedCount})
          </button>
        </div>

        {/* Lista de Badges Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 pr-1">
          {filteredBadges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border-2 flex items-start gap-3.5 transition-all ${
                badge.unlocked
                  ? 'bg-[#FFFFFF] border-[#1C1917] shadow-[4px_4px_0px_0px_#1C1917]'
                  : 'bg-[#FAF9F6] border-[#E7E5E4] opacity-60'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center shrink-0 ${
                  badge.unlocked ? 'bg-[#FAF9F6] border-[#1C1917]' : 'bg-[#E7E5E4] border-[#D6D3D1]'
                }`}
              >
                {renderBadgeIcon(badge.icon, badge.unlocked)}
              </div>

              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-xs font-black text-[#1C1917] uppercase truncate">
                    {badge.title}
                  </h3>
                  {badge.unlocked ? (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                      Ativa
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-[#E7E5E4] text-[#78716C] rounded">
                      Bloqueada
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-[#57534E] font-medium leading-snug">
                  {badge.description}
                </p>

                {/* Barra de Progresso Individual */}
                {!badge.unlocked && (
                  <div className="mt-2 flex flex-col gap-1">
                    <div className="flex justify-between text-[9px] font-black text-[#78716C] uppercase">
                      <span>Progresso</span>
                      <span>{badge.progress} / {badge.maxProgress}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E7E5E4] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1C1917]"
                        style={{ width: `${Math.min(100, (badge.progress / badge.maxProgress) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {badge.unlockedAt && (
                  <span className="text-[9px] font-bold text-[#A8A29E] uppercase mt-1">
                    Desbloqueado: {badge.unlockedAt}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};