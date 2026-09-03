import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || localStorage.getItem('sidebyside_pending_email') || '';

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isCodeConfirmed, setIsCodeConfirmed] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [followerPos, setFollowerPos] = useState({ x: -100, y: -100 });
  const [cursorOpacity, setCursorOpacity] = useState(1);

  useEffect(() => {
    if (!emailFromState) {
      navigate('/forgot-password');
    }
  }, [emailFromState, navigate]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      const padding = 40;
      const isNearEdge =
        e.clientX < padding ||
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
    let animationFrameId: number;
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

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
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

    if (!emailFromState) {
      setErrorMessage('E-mail não encontrado. Por favor, volte e tente novamente.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await api.post('/api/auth/verify-reset-code', { 
        email: emailFromState, 
        code: fullCode 
      });

      setIsCodeConfirmed(true);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } }; message?: string };
      setErrorMessage(errorObj.response?.data?.error || errorObj.message || 'Código inválido ou expirado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (!emailFromState) {
      setErrorMessage('E-mail não encontrado. Por favor, reinicie o processo.');
      return;
    }

    setIsSubmitting(true);

    try {
      const fullCode = code.join('');
      await api.post('/api/auth/reset-password', { 
        email: emailFromState, 
        code: fullCode,
        newPassword: password 
      });

      localStorage.removeItem('sidebyside_pending_email');
      alert('Senha alterada com sucesso!');
      navigate('/');
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } }; message?: string };
      setErrorMessage(errorObj.response?.data?.error || errorObj.message || 'Erro ao conectar com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1917] flex flex-col font-sans selection:bg-[#1C1917] selection:text-[#FAF9F6] relative overflow-x-hidden">
      <div
        className="pointer-events-none fixed z-50 w-3.5 h-3.5 rounded-full bg-[#1C1917] transition-opacity duration-300 ease-out -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{
          left: `${followerPos.x}px`,
          top: `${followerPos.y}px`,
          opacity: cursorOpacity,
        }}
      />

      <header className="bg-[#FFFFFF] border-b border-[#E7E5E4] px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-lg bg-[#1C1917] flex items-center justify-center font-black text-[#FAF9F6] text-base shadow-sm">
            S
          </div>
          <span className="text-lg font-black tracking-tight text-[#1C1917] uppercase">SideBySide</span>
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto p-6 flex flex-col justify-center my-auto">
        <div className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-6 relative">
          
          <div className="flex flex-col gap-1 text-center border-b border-[#E7E5E4] pb-4">
            <span className="text-[10px] font-black tracking-widest text-[#1C1917] uppercase bg-[#FAF9F6] border border-[#1C1917] px-3 py-1 rounded-lg w-fit mx-auto shadow-sm">
              CRIAR NOVA SENHA
            </span>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#1C1917] mt-2">
              Redefinição de Senha
            </h1>
            <p className="text-xs text-[#57534E] font-medium">
              {!isCodeConfirmed
                ? `Insira o código enviado para ${emailFromState}.`
                : 'Crie sua nova senha para acessar a plataforma.'}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2.5">
              <p className="flex-1 leading-snug">{errorMessage}</p>
            </div>
          )}

          {!isCodeConfirmed && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-[#1C1917] uppercase tracking-wider text-center">
                  Código de Segurança
                </label>
                <div className="flex justify-between gap-1.5">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-11 h-12 text-center text-lg font-black bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-[#1C1917] outline-none focus:border-[#1C1917] transition-all"
                    />
                  ))}
                </div>
              </div>

              <Button
                disabled={isSubmitting}
                variant="primary"
                type="button"
                onClick={handleVerifyCode}
                className="w-full py-3 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-black text-xs uppercase tracking-widest rounded-xl transition-all border-2 border-[#1C1917]"
              >
                {isSubmitting ? 'Validando...' : 'Validar Código'}
              </Button>
            </div>
          )}

          {isCodeConfirmed && (
            <form className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-500 ease-out" onSubmit={handleSubmit}>
              <div className="relative w-full">
                <Input
                  label="Nova Senha"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  className="bg-[#FAF9F6] border-2 border-[#E7E5E4] text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#1C1917]"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-[38px] text-[#78716C] hover:text-[#1C1917] transition-colors p-0.5"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>

              <Input
                label="Confirmar Nova Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite novamente a senha"
                value={confirmPassword}
                className="bg-[#FAF9F6] border-2 border-[#E7E5E4] text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#1C1917]"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              />

              <Button
                disabled={isSubmitting}
                variant="primary"
                type="submit"
                className="w-full py-3.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-black text-xs uppercase tracking-widest rounded-xl transition-all border-2 border-[#1C1917] shadow-md mt-2"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Nova Senha'}
              </Button>
            </form>
          )}

        </div>
      </main>
    </div>
  );
};