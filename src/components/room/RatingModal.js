import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from '../ui/Button';
export const RatingModal = ({ isOpen, onClose, onSubmit, partnerName, }) => {
    const [partnerRating, setPartnerRating] = useState(0);
    const [platformRating, setPlatformRating] = useState(0);
    const [comment, setComment] = useState('');
    if (!isOpen)
        return null;
    const handleSubmit = (e) => {
        e.preventDefault();
        if (partnerRating === 0 || platformRating === 0) {
            alert('Por favor, selecione uma nota para ambos os quesitos.');
            return;
        }
        onSubmit({ partnerRating, platformRating, comment });
    };
    return (_jsx("div", { className: "fixed inset-0 bg-[#1C1917]/70 backdrop-blur-md z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[8px_8px_0px_0px_#1C1917] flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200", children: [_jsxs("div", { className: "flex flex-col gap-1 border-b-2 border-[#E7E5E4] pb-3 text-center", children: [_jsx("span", { className: "text-[10px] font-black uppercase tracking-widest text-[#FAF9F6] bg-[#1C1917] px-2.5 py-0.5 rounded w-fit mx-auto", children: "FIM DA SESS\u00C3O" }), _jsx("h2", { className: "text-xl font-black uppercase text-[#1C1917] mt-1", children: "Como foi sua experi\u00EAncia?" }), _jsx("p", { className: "text-xs text-[#57534E] font-medium", children: "Sua avalia\u00E7\u00E3o ajuda a manter nossa comunidade segura e em constante evolu\u00E7\u00E3o." })] }), _jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-5", children: [_jsxs("div", { className: "flex flex-col gap-2", children: [_jsxs("label", { className: "text-xs font-black text-[#1C1917] uppercase tracking-wider", children: ["1. Avalie o conversante (", partnerName, ") *"] }), _jsx("div", { className: "flex justify-between gap-1", children: [1, 2, 3, 4, 5].map((star) => (_jsx("button", { type: "button", onClick: () => setPartnerRating(star), className: `flex-1 py-2.5 rounded-xl border-2 text-base font-black transition-all ${partnerRating >= star
                                            ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]'
                                            : 'bg-[#FAF9F6] text-[#A8A29E] border-[#E7E5E4] hover:border-[#1C1917]'}`, children: "\u2605" }, star))) })] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("label", { className: "text-xs font-black text-[#1C1917] uppercase tracking-wider", children: "2. Avalie a qualidade da chamada e da plataforma *" }), _jsx("div", { className: "flex justify-between gap-1", children: [1, 2, 3, 4, 5].map((star) => (_jsx("button", { type: "button", onClick: () => setPlatformRating(star), className: `flex-1 py-2.5 rounded-xl border-2 text-base font-black transition-all ${platformRating >= star
                                            ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]'
                                            : 'bg-[#FAF9F6] text-[#A8A29E] border-[#E7E5E4] hover:border-[#1C1917]'}`, children: "\u2605" }, star))) })] }), _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("label", { className: "text-xs font-black text-[#1C1917] uppercase tracking-wider", children: "Coment\u00E1rio P\u00FAblico no Perfil (Opcional)" }), _jsxs("span", { className: "text-[10px] font-bold text-[#78716C] uppercase", children: [comment.length, "/140"] })] }), _jsx("textarea", { rows: 3, maxLength: 140, value: comment, onChange: (e) => setComment(e.target.value), placeholder: "Deixe uma nota positiva no perfil do usu\u00E1rio ou sugest\u00E3o sobre a chamada...", className: "w-full p-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] resize-none" })] }), _jsxs("div", { className: "flex gap-2 pt-2", children: [_jsx("button", { type: "button", onClick: onClose, className: "flex-1 py-3 bg-[#FAF9F6] border-2 border-[#1C1917] text-xs font-black uppercase rounded-xl hover:bg-[#F5F5F4]", children: "Pular" }), _jsx(Button, { type: "submit", variant: "primary", className: "flex-1 py-3 bg-[#1C1917] text-[#FAF9F6] text-xs font-black uppercase rounded-xl border-2 border-[#1C1917] shadow-sm", children: "Enviar Avalia\u00E7\u00E3o" })] })] })] }) }));
};
