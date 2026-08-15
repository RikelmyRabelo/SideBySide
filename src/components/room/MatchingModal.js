import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
export const MatchingModal = ({ isOpen, onCancel, userLevel = 'B1', }) => {
    const navigate = useNavigate();
    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        let timer;
        if (isOpen) {
            setSeconds(0);
            timer = setInterval(() => {
                setSeconds((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isOpen]);
    if (!isOpen)
        return null;
    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-[#111827] border border-slate-800 rounded-3xl p-8 max-w-lg w-full flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden", children: [_jsxs("div", { className: "relative flex items-center justify-center my-6", children: [_jsx("div", { className: "absolute w-44 h-44 rounded-full border border-emerald-500/20 animate-ping" }), _jsx("div", { className: "absolute w-32 h-32 rounded-full border border-emerald-500/40 animate-pulse" }), _jsx("div", { className: "w-20 h-20 rounded-full bg-blue-600/20 border border-blue-500/50 flex items-center justify-center z-10 shadow-lg shadow-blue-500/20", children: _jsx("span", { className: "text-3xl", children: "\uD83C\uDF10" }) })] }), _jsxs("div", { className: "flex flex-col items-center gap-1 text-center", children: [_jsxs("h2", { className: "text-xl font-extrabold text-white", children: ["Buscando um parceiro de n\u00EDvel ", userLevel, "..."] }), _jsxs("div", { className: "flex items-center gap-2 text-xs font-semibold text-emerald-400 mt-1", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" }), _jsxs("span", { children: ["Tempo decorrido: ", formatTime(seconds)] })] })] }), _jsxs("div", { className: "w-full bg-white rounded-2xl p-5 text-slate-900 flex flex-col gap-2 shadow-lg", children: [_jsxs("div", { className: "flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider", children: [_jsx("span", { children: "\uD83D\uDCA1" }), " DICA DE VOCABUL\u00C1RIO ENQUANTO ESPERA"] }), _jsx("h3", { className: "text-base font-extrabold text-slate-900", children: "\"To cut to the chase\"" }), _jsx("span", { className: "text-xs text-slate-500 italic", children: "Pron\u00FAncia: /k\u028Ct tu\u02D0 \u00F0\u0259 t\u0283e\u026As/" }), _jsxs("p", { className: "text-xs text-slate-700 font-medium pt-1 border-t border-slate-100 mt-1", children: [_jsx("strong", { children: "Tradu\u00E7\u00E3o:" }), " Ir direto ao ponto, direto ao assunto de forma objetiva."] })] }), _jsxs("div", { className: "w-full flex flex-col gap-3 mt-2", children: [_jsx("button", { type: "button", onClick: () => navigate('/room'), className: "w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition-all shadow-md", children: "Simular Par Encontrado (Ir para Chamada)" }), _jsxs("button", { type: "button", onClick: onCancel, className: "w-full py-3 border border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2", children: [_jsx("span", { children: "\u2715" }), " Cancelar Busca"] })] })] }) }));
};
