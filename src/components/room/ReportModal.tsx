import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const REPORT_REASONS = [
  'Conteúdo impróprio ou ofensivo',
  'Assédio ou comportamento inadequado',
  'Spam ou propaganda',
  'Problemas técnicos graves',
  'Outro motivo'
];

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [customDetail, setCustomDetail] = useState('');
  const [step, setStep] = useState<'form' | 'success'>('form');

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setSelectedReason(REPORT_REASONS[0]);
      setCustomDetail('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('success');
  };

  const handleConfirmSuccess = () => {
    const finalReason = selectedReason === 'Outro motivo' ? customDetail.trim() || 'Outro motivo' : selectedReason;
    onConfirm(finalReason);
  };

  return (
    <div className="fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-[130] flex items-center justify-center p-4 animate-in fade-in duration-150">
      {step === 'form' ? (
        <div className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[8px_8px_0px_0px_#1C1917] flex flex-col gap-6">
          
          <div className="flex items-center justify-between border-b-2 border-[#E7E5E4] pb-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest bg-[#FAF9F6] border-2 border-[#1C1917] text-[#1C1917] px-2.5 py-0.5 rounded-xl w-fit">
                SEGURANÇA DA SESSÃO
              </span>
              <h3 className="text-base font-black uppercase tracking-tight text-[#1C1917] mt-1">
                Denunciar Conduta
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-black text-[#78716C] hover:text-[#1C1917]"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <p className="text-xs text-[#57534E] font-medium leading-relaxed">
              Selecione o motivo da denúncia. Nossa equipe de moderação analisará o histórico e as evidências da sala.
            </p>

            <div className="flex flex-col gap-2.5">
              {REPORT_REASONS.map((reason) => {
                const isSelected = selectedReason === reason;
                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSelectedReason(reason)}
                    className={`w-full p-3.5 rounded-2xl border-2 text-left text-xs font-black uppercase tracking-wider transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917] shadow-xs'
                        : 'bg-[#FAF9F6] text-[#1C1917] border-[#E7E5E4] hover:border-[#1C1917]'
                    }`}
                  >
                    <span>{reason}</span>
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#FAF9F6] bg-[#FAF9F6]' : 'border-[#A8A29E]'}`}>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-[#1C1917]" />}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedReason === 'Outro motivo' && (
              <div className="flex flex-col gap-2 animate-in fade-in duration-200">
                <label className="text-xs font-black text-[#1C1917] uppercase tracking-wider">Especifique o motivo:</label>
                <textarea
                  rows={3}
                  value={customDetail}
                  onChange={(e) => setCustomDetail(e.target.value)}
                  placeholder="Descreva detalhadamente o ocorrido..."
                  className="w-full p-3.5 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-2xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] resize-none transition-all"
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 bg-[#FAF9F6] hover:bg-[#F5F5F4] border-2 border-[#1C1917] text-[#1C1917] font-black text-xs uppercase tracking-wider rounded-2xl transition-all"
              >
                Cancelar
              </button>
              <Button
                variant="primary"
                type="submit"
                className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all border-2 border-red-600 shadow-[2px_2px_0px_0px_#991B1B]"
              >
                Enviar Denúncia
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 max-w-sm w-full flex flex-col gap-5 shadow-[8px_8px_0px_0px_#1C1917] animate-in fade-in zoom-in-95 duration-200 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border-2 border-[#1C1917] text-emerald-700 flex items-center justify-center mx-auto text-lg font-black shadow-xs">
            ✓
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="text-base font-black uppercase tracking-tight text-[#1C1917]">Denúncia Registrada</h3>
            <p className="text-xs text-[#57534E] font-medium leading-relaxed">
              Recebemos seu reporte. A equipe de moderação avaliará a interação em breve. O usuário não será notificado.
            </p>
          </div>
          <button
            type="button"
            onClick={handleConfirmSuccess}
            className="w-full py-3.5 bg-[#1C1917] text-[#FAF9F6] text-xs font-black uppercase tracking-wider rounded-2xl border-2 border-[#1C1917] hover:bg-[#292524] transition-all shadow-sm"
          >
            Concluir e Sair
          </button>
        </div>
      )}
    </div>
  );
};