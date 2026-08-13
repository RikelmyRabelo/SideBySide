import React, { useState } from 'react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [category, setCategory] = useState<'bug' | 'account' | 'moderation' | 'other'>('bug');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsRatingSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulação de envio para a API de Suporte
    setTimeout(() => {
      setIsSubmitting(false);
      setIsRatingSuccess(true);
      setTimeout(() => {
        setIsRatingSuccess(false);
        setSubject('');
        setDescription('');
        onClose();
      }, 1800);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[8px_8px_0px_0px_#1C1917] flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#E7E5E4] pb-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#78716C]">
              CENTRAL DE AJUDA
            </span>
            <h2 className="text-base font-black uppercase text-[#1C1917]">
              Suporte & Reporte de Bugs
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

        {isSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-emerald-600 text-emerald-800 font-black text-xl flex items-center justify-center">
              ✓
            </div>
            <h3 className="text-sm font-black uppercase text-[#1C1917]">
              Chamado Enviado com Sucesso!
            </h3>
            <p className="text-xs text-[#57534E] font-medium">
              Sua solicitação foi recebida. Nossa equipe retornará no seu e-mail cadastrado em breve.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-[#78716C]">
                Categoria do Chamado
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="px-3.5 py-2.5 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
              >
                <option value="bug">Reportar Erro / Bug Técnico</option>
                <option value="account">Problemas de Conta e Perfil</option>
                <option value="moderation">Dúvidas sobre Moderação</option>
                <option value="other">Outros Assuntos</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-[#78716C]">
                Assunto
              </label>
              <input
                type="text"
                required
                placeholder="Ex.: Câmera travando no teste prévio"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="px-3.5 py-2.5 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-[#78716C]">
                Descrição Detalhada
              </label>
              <textarea
                required
                rows={4}
                placeholder="Descreva o que aconteceu ou a sua dúvida..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="px-3.5 py-2.5 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#1C1917] text-[#FAF9F6] rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#292524] transition-all mt-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Chamado'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};