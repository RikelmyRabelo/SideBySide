import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
export const VerifyCode = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState(Array(6).fill(''));
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const inputRefs = useRef([]);
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
                return {
                    x: prev.x + dx * 0.12,
                    y: prev.y + dy * 0.12,
                };
            });
            animationFrameId = requestAnimationFrame(updateFollower);
        };
        animationFrameId = requestAnimationFrame(updateFollower);
        return () => cancelAnimationFrame(animationFrameId);
    }, [mousePos]);
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = window.setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        else {
            setCanResend(true);
        }
        return () => {
            if (interval !== undefined) {
                clearInterval(interval);
            }
        };
    }, [timer]);
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);
    const handleChange = (index, value) => {
        if (isNaN(Number(value)))
            return;
        const newCode = [...code];
        newCode[index] = value.substring(value.length - 1);
        setCode(newCode);
        setError(null);
        if (value && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus();
        }
    };
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        if (!/^\d+$/.test(pastedData))
            return;
        const digits = pastedData.slice(0, 6).split('');
        const newCode = [...code];
        digits.forEach((digit, i) => {
            newCode[i] = digit;
            if (inputRefs.current[i]) {
                inputRefs.current[i].value = digit;
            }
        });
        setCode(newCode);
        const focusIndex = Math.min(digits.length, 5);
        inputRefs.current[focusIndex]?.focus();
    };
    const handleVerify = async (e) => {
        e.preventDefault();
        const fullCode = code.join('');
        if (fullCode.length < 6) {
            setError('Por favor, preencha o código completo de 6 dígitos.');
            return;
        }
        const pendingEmail = localStorage.getItem('sidebyside_pending_email') || localStorage.getItem('sidebyside_last_email');
        if (!pendingEmail) {
            setError('E-mail da conta não encontrado. Volte ao cadastro e tente novamente.');
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:3000/api/auth/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: pendingEmail, code: fullCode }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Código inválido ou expirado.');
            }
            const data = await response.json();
            if (data?.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('sidebyside_user', JSON.stringify(data.user || { email: pendingEmail }));
            }
            localStorage.removeItem('sidebyside_pending_email');
            localStorage.removeItem('sidebyside_pending_name');
            navigate('/onboarding');
        }
        catch (err) {
            setError(err.message || 'Erro ao conectar com o servidor.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleResendCode = async () => {
        if (!canResend)
            return;
        try {
            const response = await fetch('http://localhost:3000/api/auth/resend-code', {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('Erro ao reenviar o código.');
            }
            setTimer(60);
            setCanResend(false);
            setCode(Array(6).fill(''));
            setError(null);
            if (inputRefs.current[0]) {
                inputRefs.current[0].focus();
            }
        }
        catch (err) {
            setError(err.message || 'Erro ao reenviar código.');
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-[#FAF9F6] text-[#1C1917] flex flex-col font-sans relative overflow-hidden selection:bg-[#1C1917] selection:text-[#FAF9F6]", children: [_jsx("div", { className: "pointer-events-none fixed z-50 w-3.5 h-3.5 rounded-full bg-[#1C1917] transition-opacity duration-300 ease-out -translate-x-1/2 -translate-y-1/2 hidden md:block", style: {
                    left: `${followerPos.x}px`,
                    top: `${followerPos.y}px`,
                    opacity: cursorOpacity,
                } }), _jsx("header", { className: "bg-[#FFFFFF] border-b border-[#E7E5E4] px-6 py-4 flex items-center justify-between z-30 shadow-sm", children: _jsxs("div", { className: "flex items-center gap-3 cursor-pointer", onClick: () => navigate('/'), children: [_jsx("div", { className: "w-8 h-8 rounded-md bg-[#1C1917] flex items-center justify-center font-black text-[#FAF9F6] text-base", children: "S" }), _jsx("span", { className: "text-lg font-black tracking-tight text-[#1C1917] uppercase", children: "SideBySide" })] }) }), _jsx("main", { className: "flex-1 flex items-center justify-center p-6", children: _jsxs("div", { className: "bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-8 sm:p-10 max-w-md w-full shadow-sm flex flex-col gap-6", children: [_jsxs("div", { className: "flex flex-col gap-2 text-center", children: [_jsx("span", { className: "text-[10px] font-bold tracking-widest text-[#78716C] uppercase bg-[#F5F5F4] border border-[#E7E5E4] px-3 py-1 rounded-md w-fit mx-auto", children: "VERIFICA\u00C7\u00C3O DE SEGURAN\u00C7A" }), _jsx("h1", { className: "text-2xl font-black uppercase tracking-tight text-[#1C1917] mt-1", children: "Confirme seu e-mail" }), _jsx("p", { className: "text-xs text-[#57534E] leading-relaxed font-medium", children: "Enviamos um c\u00F3digo de 6 d\u00EDgitos para o seu e-mail. Digite-o abaixo para ativar sua conta." })] }), _jsxs("form", { onSubmit: handleVerify, className: "flex flex-col gap-6", children: [_jsx("div", { className: "flex justify-between gap-2", children: code.map((digit, index) => (_jsx("input", { ref: (el) => (inputRefs.current[index] = el), type: "text", inputMode: "numeric", maxLength: 1, value: digit, onChange: (e) => handleChange(index, e.target.value), onKeyDown: (e) => handleKeyDown(index, e), onPaste: handlePaste, className: "w-12 h-14 text-center text-xl font-black bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-[#1C1917] outline-none focus:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917] transition-all" }, index))) }), error && (_jsx("span", { className: "text-xs font-bold text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-xl text-center", children: error })), _jsx(Button, { type: "submit", disabled: isSubmitting, className: "w-full py-4 text-xs font-bold uppercase tracking-widest bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] rounded-xl shadow-md transition-all", children: isSubmitting ? 'Verificando...' : 'Confirmar Código' })] }), _jsxs("div", { className: "flex flex-col items-center gap-2 border-t border-[#E7E5E4] pt-4 text-center", children: [_jsx("span", { className: "text-xs font-medium text-[#78716C]", children: "N\u00E3o recebeu o c\u00F3digo?" }), _jsx("button", { type: "button", onClick: handleResendCode, disabled: !canResend, className: `text-xs font-black uppercase tracking-wider transition-all ${canResend
                                        ? 'text-[#1C1917] hover:underline cursor-pointer'
                                        : 'text-[#A8A29E] cursor-not-allowed'}`, children: canResend ? 'Reenviar Código' : `Reenviar em ${timer}s` })] })] }) })] }));
};
