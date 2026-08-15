import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
export const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const emailFromState = location.state?.email || 'seu e-mail';
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isCodeConfirmed, setIsCodeConfirmed] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRefs = useRef([]);
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
    const handleCodeChange = (index, value) => {
        if (!/^\d*$/.test(value))
            return;
        const newCode = [...code];
        newCode[index] = value.slice(-1);
        setCode(newCode);
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };
    const handleVerifyCode = async () => {
        setErrorMessage(null);
        const fullCode = code.join('');
        if (fullCode.length < 6) {
            setErrorMessage('Por favor, preencha o código de segurança completo (6 dígitos).');
            return;
        }
        if (!location.state?.email) {
            setErrorMessage('E-mail não encontrado. Por favor, volte e tente novamente.');
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch('http://localhost:3000/api/auth/verify-reset-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: location.state.email,
                    code: fullCode
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Código inválido ou expirado.');
            }
            setIsCodeConfirmed(true);
        }
        catch (err) {
            setErrorMessage(err.message || 'Erro ao verificar o código.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(null);
        if (password.length < 6) {
            setErrorMessage('A nova senha deve ter no mínimo 6 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            setErrorMessage('As senhas não coincidem. Digite novamente.');
            return;
        }
        if (!location.state?.email) {
            setErrorMessage('E-mail não encontrado. Por favor, reinicie o processo.');
            return;
        }
        setIsSubmitting(true);
        try {
            const fullCode = code.join('');
            const response = await fetch('http://localhost:3000/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: location.state.email,
                    code: fullCode,
                    newPassword: password
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Erro ao redefinir a senha.');
            }
            alert('Senha alterada com sucesso!');
            navigate('/');
        }
        catch (err) {
            setErrorMessage(err.message || 'Erro ao conectar com o servidor.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-[#FAF9F6] text-[#1C1917] flex flex-col font-sans selection:bg-[#1C1917] selection:text-[#FAF9F6] relative overflow-x-hidden", children: [_jsx("div", { className: "pointer-events-none fixed z-50 w-3.5 h-3.5 rounded-full bg-[#1C1917] transition-opacity duration-300 ease-out -translate-x-1/2 -translate-y-1/2 hidden md:block", style: {
                    left: `${followerPos.x}px`,
                    top: `${followerPos.y}px`,
                    opacity: cursorOpacity,
                } }), _jsx("header", { className: "bg-[#FFFFFF] border-b border-[#E7E5E4] px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm", children: _jsxs("div", { className: "flex items-center gap-3 cursor-pointer", onClick: () => navigate('/'), children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-[#1C1917] flex items-center justify-center font-black text-[#FAF9F6] text-base shadow-sm", children: "S" }), _jsx("span", { className: "text-lg font-black tracking-tight text-[#1C1917] uppercase", children: "SideBySide" })] }) }), _jsx("main", { className: "flex-1 max-w-md w-full mx-auto p-6 flex flex-col justify-center my-auto", children: _jsxs("div", { className: "bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-6 relative", children: [_jsxs("div", { className: "flex flex-col gap-1 text-center border-b border-[#E7E5E4] pb-4", children: [_jsx("span", { className: "text-[10px] font-black tracking-widest text-[#1C1917] uppercase bg-[#FAF9F6] border border-[#1C1917] px-3 py-1 rounded-lg w-fit mx-auto shadow-sm", children: "CRIAR NOVA SENHA" }), _jsx("h1", { className: "text-2xl font-black uppercase tracking-tight text-[#1C1917] mt-2", children: "Redefini\u00E7\u00E3o de Senha" }), _jsx("p", { className: "text-xs text-[#57534E] font-medium", children: !isCodeConfirmed
                                        ? `Insira o código enviado para ${emailFromState}.`
                                        : 'Crie sua nova senha para acessar a plataforma.' })] }), errorMessage && (_jsx("div", { className: "p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2.5", children: _jsx("p", { className: "flex-1 leading-snug", children: errorMessage }) })), !isCodeConfirmed && (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { className: "text-xs font-black text-[#1C1917] uppercase tracking-wider text-center", children: "C\u00F3digo de Seguran\u00E7a" }), _jsx("div", { className: "flex justify-between gap-1.5", children: code.map((digit, index) => (_jsx("input", { ref: (el) => (inputRefs.current[index] = el), type: "text", maxLength: 1, value: digit, onChange: (e) => handleCodeChange(index, e.target.value), onKeyDown: (e) => handleKeyDown(index, e), className: "w-11 h-12 text-center text-lg font-black bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-[#1C1917] outline-none focus:border-[#1C1917] transition-all" }, index))) })] }), _jsx(Button, { disabled: isSubmitting, variant: "primary", type: "button", onClick: handleVerifyCode, className: "w-full py-3 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-black text-xs uppercase tracking-widest rounded-xl transition-all border-2 border-[#1C1917]", children: isSubmitting ? 'Validando...' : 'Validar Código' })] })), isCodeConfirmed && (_jsxs("form", { className: "flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-500 ease-out", onSubmit: handleSubmit, children: [_jsxs("div", { className: "relative w-full", children: [_jsx(Input, { label: "Nova Senha", type: showPassword ? 'text' : 'password', placeholder: "M\u00EDnimo 6 caracteres", value: password, className: "bg-[#FAF9F6] border-2 border-[#E7E5E4] text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#1C1917]", onChange: (e) => setPassword(e.target.value) }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3.5 top-[38px] text-[#78716C] hover:text-[#1C1917] transition-colors p-0.5", children: showPassword ? (_jsx("svg", { className: "w-4 h-4 fill-none stroke-current stroke-2", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" }) })) : (_jsxs("svg", { className: "w-4 h-4 fill-none stroke-current stroke-2", viewBox: "0 0 24 24", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })] })) })] }), _jsx(Input, { label: "Confirmar Nova Senha", type: showPassword ? 'text' : 'password', placeholder: "Digite novamente a senha", value: confirmPassword, className: "bg-[#FAF9F6] border-2 border-[#E7E5E4] text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#1C1917]", onChange: (e) => setConfirmPassword(e.target.value) }), _jsx(Button, { disabled: isSubmitting, variant: "primary", type: "submit", className: "w-full py-3.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-black text-xs uppercase tracking-widest rounded-xl transition-all border-2 border-[#1C1917] shadow-md mt-2", children: isSubmitting ? 'Salvando...' : 'Salvar Nova Senha' })] }))] }) })] }));
};
