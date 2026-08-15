import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
export const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    // Efeito de Cursor Sólido Neutro
    const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
    const [followerPos, setFollowerPos] = useState({ x: -100, y: -100 });
    const [cursorOpacity, setCursorOpacity] = useState(1);
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
            const padding = 40;
            const isNearEdge = e.clientX < padding ||
                e.clientY < padding ||
                e.clientX > window.innerWidth - padding ||
                e.clientY > window.innerHeight - padding;
            setCursorOpacity(isNearEdge ? 0 : 1);
        };
        const handleMouseLeave = () => setCursorOpacity(0);
        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);
    useEffect(() => {
        let animationFrameId;
        const updateFollower = () => {
            setFollowerPos((prev) => {
                const dx = mousePos.x - prev.x;
                const dy = mousePos.y - prev.y;
                return { x: prev.x + dx * 0.12, y: prev.y + dy * 0.12 };
            });
            animationFrameId = requestAnimationFrame(updateFollower);
        };
        animationFrameId = requestAnimationFrame(updateFollower);
        return () => cancelAnimationFrame(animationFrameId);
    }, [mousePos]);
    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage(null);
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setErrorMessage('Por favor, informe um e-mail válido.');
            return;
        }
        navigate('/reset-password', { state: { email } });
    };
    return (_jsxs("div", { className: "min-h-screen bg-[#FAF9F6] text-[#1C1917] flex flex-col font-sans selection:bg-[#1C1917] selection:text-[#FAF9F6] relative overflow-x-hidden", children: [_jsx("div", { className: "pointer-events-none fixed z-50 w-3.5 h-3.5 rounded-full bg-[#1C1917] transition-opacity duration-300 ease-out -translate-x-1/2 -translate-y-1/2 hidden md:block", style: {
                    left: `${followerPos.x}px`,
                    top: `${followerPos.y}px`,
                    opacity: cursorOpacity,
                } }), _jsx("header", { className: "bg-[#FFFFFF] border-b border-[#E7E5E4] px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm", children: _jsxs("div", { className: "flex items-center gap-3 cursor-pointer", onClick: () => navigate('/'), children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-[#1C1917] flex items-center justify-center font-black text-[#FAF9F6] text-base shadow-sm", children: "S" }), _jsx("span", { className: "text-lg font-black tracking-tight text-[#1C1917] uppercase", children: "SideBySide" })] }) }), _jsx("main", { className: "flex-1 max-w-md w-full mx-auto p-6 flex flex-col justify-center my-auto", children: _jsxs("div", { className: "bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-6 relative", children: [_jsxs("div", { className: "flex flex-col gap-1 text-center border-b border-[#E7E5E4] pb-4", children: [_jsx("span", { className: "text-[10px] font-black tracking-widest text-[#1C1917] uppercase bg-[#FAF9F6] border border-[#1C1917] px-3 py-1 rounded-lg w-fit mx-auto shadow-sm", children: "RECUPERA\u00C7\u00C3O DE CONTA" }), _jsx("h1", { className: "text-2xl font-black uppercase tracking-tight text-[#1C1917] mt-2", children: "Esqueceu a senha?" }), _jsx("p", { className: "text-xs text-[#57534E] font-medium", children: "Informe seu e-mail cadastrado para enviarmos o c\u00F3digo de redefini\u00E7\u00E3o." })] }), errorMessage && (_jsx("div", { className: "p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2.5", children: _jsx("p", { className: "flex-1 leading-snug", children: errorMessage }) })), _jsxs("form", { className: "flex flex-col gap-4", onSubmit: handleSubmit, children: [_jsx(Input, { label: "E-mail Cadastrado", type: "email", placeholder: "seu@email.com", value: email, className: "bg-[#FAF9F6] border-2 border-[#E7E5E4] text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#1C1917]", onChange: (e) => {
                                        setEmail(e.target.value);
                                        if (errorMessage)
                                            setErrorMessage(null);
                                    } }), _jsx(Button, { variant: "primary", type: "submit", className: "w-full py-3.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-black text-xs uppercase tracking-widest rounded-xl transition-all border-2 border-[#1C1917] shadow-md", children: "Enviar C\u00F3digo de Seguran\u00E7a" }), _jsx("button", { type: "button", onClick: () => navigate('/'), className: "w-full text-center text-xs font-black text-[#78716C] hover:text-[#1C1917] transition-colors mt-1 uppercase tracking-wider", children: "Voltar ao Login" })] })] }) })] }));
};
