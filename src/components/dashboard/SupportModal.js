import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export const SupportModal = ({ isOpen, onClose }) => {
    const [category, setCategory] = useState('bug');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsRatingSuccess] = useState(false);
    if (!isOpen)
        return null;
    const handleSubmit = (e) => {
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
    return (_jsx("div", { className: "fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-[100] flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[8px_8px_0px_0px_#1C1917] flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150", children: [_jsxs("div", { className: "flex items-center justify-between border-b-2 border-[#E7E5E4] pb-3", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-[10px] font-black uppercase tracking-widest text-[#78716C]", children: "CENTRAL DE AJUDA" }), _jsx("h2", { className: "text-base font-black uppercase text-[#1C1917]", children: "Suporte & Reporte de Bugs" })] }), _jsx("button", { type: "button", onClick: onClose, className: "text-sm font-black text-[#78716C] hover:text-[#1C1917]", children: "\u2715" })] }), isSuccess ? (_jsxs("div", { className: "py-8 flex flex-col items-center justify-center gap-3 text-center", children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-emerald-100 border-2 border-emerald-600 text-emerald-800 font-black text-xl flex items-center justify-center", children: "\u2713" }), _jsx("h3", { className: "text-sm font-black uppercase text-[#1C1917]", children: "Chamado Enviado com Sucesso!" }), _jsx("p", { className: "text-xs text-[#57534E] font-medium", children: "Sua solicita\u00E7\u00E3o foi recebida. Nossa equipe retornar\u00E1 no seu e-mail cadastrado em breve." })] })) : (_jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("label", { className: "text-[10px] font-black uppercase text-[#78716C]", children: "Categoria do Chamado" }), _jsxs("select", { value: category, onChange: (e) => setCategory(e.target.value), className: "px-3.5 py-2.5 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]", children: [_jsx("option", { value: "bug", children: "Reportar Erro / Bug T\u00E9cnico" }), _jsx("option", { value: "account", children: "Problemas de Conta e Perfil" }), _jsx("option", { value: "moderation", children: "D\u00FAvidas sobre Modera\u00E7\u00E3o" }), _jsx("option", { value: "other", children: "Outros Assuntos" })] })] }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("label", { className: "text-[10px] font-black uppercase text-[#78716C]", children: "Assunto" }), _jsx("input", { type: "text", required: true, placeholder: "Ex.: C\u00E2mera travando no teste pr\u00E9vio", value: subject, onChange: (e) => setSubject(e.target.value), className: "px-3.5 py-2.5 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]" })] }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("label", { className: "text-[10px] font-black uppercase text-[#78716C]", children: "Descri\u00E7\u00E3o Detalhada" }), _jsx("textarea", { required: true, rows: 4, placeholder: "Descreva o que aconteceu ou a sua d\u00FAvida...", value: description, onChange: (e) => setDescription(e.target.value), className: "px-3.5 py-2.5 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] resize-none" })] }), _jsx("button", { type: "submit", disabled: isSubmitting, className: "w-full py-3.5 bg-[#1C1917] text-[#FAF9F6] rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#292524] transition-all mt-2 disabled:opacity-50", children: isSubmitting ? 'Enviando...' : 'Enviar Chamado' })] }))] }) }));
};
