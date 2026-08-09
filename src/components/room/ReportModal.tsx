import React, { useState } from 'react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('Assédio, Discriminação ou Linguagem Ofensiva');

  if (!isOpen) return null;

  const reasons = [
    'Conteúdo / Imagem Inadequada ou Imprópria',
    'Assédio, Discriminação ou Linguagem Ofensiva',
    'Usuário Ausente / Câmera Apontada para Parede',
    'Idioma / Nível Incompatível',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(selectedReason);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full flex flex-col gap-6 shadow-2xl text-slate-900 animate-in fade-in zoom-in duration-150">
        
        {/* Cabeçalho do Modal */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center shrink-0 text-xl font-bold">
            ⚠️
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Denunciar Parceiro
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              O áudio e vídeo do parceiro foram pausados por segurança.
            </p>
          </div>
        </div>

        <div className="w-full border-t border-slate-100" />

        {/* Formulário de Seleção do Motivo */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              SELECIONE O MOTIVO DA DENÚNCIA:
            </label>

            <div className="flex flex-col gap-2.5">
              {reasons.map((reason) => {
                const isSelected = selectedReason === reason;
                return (
                  <label
                    key={reason}
                    onClick={() => setSelectedReason(reason)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border text-xs font-semibold cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 text-blue-700 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span>{reason}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col gap-2.5 mt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-xs transition-all shadow-md shadow-red-500/20"
            >
              Confirmar Denúncia e Desconectar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl font-bold text-xs transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};