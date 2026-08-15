import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export const ReportModal = ({ isOpen, onClose, onConfirm, }) => {
    const [selectedReason, setSelectedReason] = useState('Assédio, Discriminação ou Linguagem Ofensiva');
    if (!isOpen)
        return null;
    const reasons = [
        'Conteúdo / Imagem Inadequada ou Imprópria',
        'Assédio, Discriminação ou Linguagem Ofensiva',
        'Usuário Ausente / Câmera Apontada para Parede',
        'Idioma / Nível Incompatível',
    ];
    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(selectedReason);
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-3xl p-8 max-w-lg w-full flex flex-col gap-6 shadow-2xl text-slate-900 animate-in fade-in zoom-in duration-150", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center shrink-0 text-xl font-bold", children: "\u26A0\uFE0F" }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("h2", { className: "text-xl font-extrabold text-slate-900 tracking-tight", children: "Denunciar Parceiro" }), _jsx("p", { className: "text-xs text-slate-500 leading-relaxed", children: "O \u00E1udio e v\u00EDdeo do parceiro foram pausados por seguran\u00E7a." })] })] }), _jsx("div", { className: "w-full border-t border-slate-100" }), _jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-5", children: [_jsxs("div", { className: "flex flex-col gap-3", children: [_jsx("label", { className: "text-[11px] font-bold text-slate-400 uppercase tracking-wider", children: "SELECIONE O MOTIVO DA DEN\u00DANCIA:" }), _jsx("div", { className: "flex flex-col gap-2.5", children: reasons.map((reason) => {
                                        const isSelected = selectedReason === reason;
                                        return (_jsxs("label", { onClick: () => setSelectedReason(reason), className: `flex items-center gap-3 p-3.5 rounded-2xl border text-xs font-semibold cursor-pointer transition-all ${isSelected
                                                ? 'border-blue-500 bg-blue-50/50 text-blue-700 shadow-sm'
                                                : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'}`, children: [_jsx("div", { className: `w-4 h-4 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`, children: isSelected && _jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-white" }) }), _jsx("span", { children: reason })] }, reason));
                                    }) })] }), _jsxs("div", { className: "flex flex-col gap-2.5 mt-2", children: [_jsx("button", { type: "submit", className: "w-full py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-xs transition-all shadow-md shadow-red-500/20", children: "Confirmar Den\u00FAncia e Desconectar" }), _jsx("button", { type: "button", onClick: onClose, className: "w-full py-3.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl font-bold text-xs transition-all", children: "Cancelar" })] })] })] }) }));
};
