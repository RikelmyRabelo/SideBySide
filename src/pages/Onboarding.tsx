import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();

  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [followerPos, setFollowerPos] = useState({ x: -100, y: -100 });
  const [cursorOpacity, setCursorOpacity] = useState(1);

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

  const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatar);
  const [skipPhoto, setSkipPhoto] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [nameError, setNameError] = useState('');
  
  const [birthDate, setBirthDate] = useState('');
  const [birthDateError, setBirthDateError] = useState('');
  const [showAgeInProfile, setShowAgeInProfile] = useState(true);
  
  const [gender, setGender] = useState('Masculino');
  const [pronouns, setPronouns] = useState('ele/dele (he/him)');

  const [bio, setBio] = useState('');
  const [cefrLevel, setCefrLevel] = useState('');

  const [photoConfirmed, setPhotoConfirmed] = useState(false);
  const [personalConfirmed, setPersonalConfirmed] = useState(false);
  const [bioConfirmed, setBioConfirmed] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarUrl(URL.createObjectURL(file));
      setSkipPhoto(false);
    }
  };

  const calculateAge = (dob: string) => {
    const birthDateObj = new Date(dob);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
      calculatedAge--;
    }
    return calculatedAge;
  };

  const cefrLevelsInfo = [
    { code: 'A1', label: 'Iniciante', desc: 'Compreende frases simples e expressões cotidianas.' },
    { code: 'A2', label: 'Básico', desc: 'Comunica-se em tarefas rotineiras e diretas.' },
    { code: 'B1', label: 'Intermediário', desc: 'Mantém conversas sobre temas familiares de interesse.' },
    { code: 'B2', label: 'Intermediário Avançado', desc: 'Fala com fluência e espontaneidade sem esforço.' },
    { code: 'C1', label: 'Avançado', desc: 'Expressa-se de forma fluida, natural e estruturada.' },
  ];

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
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1C1917] flex items-center justify-center font-black text-[#FAF9F6] text-base shadow-sm">
            S
          </div>
          <span className="text-lg font-black tracking-tight text-[#1C1917] uppercase">SideBySide</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto p-6 lg:p-8 flex flex-col justify-center my-auto">
        <div className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-10 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-8 relative">
          
          <div className="flex flex-col gap-1 text-center border-b border-[#E7E5E4] pb-4">
            <span className="text-[10px] font-black tracking-widest text-[#1C1917] uppercase bg-[#FAF9F6] border border-[#1C1917] px-3 py-1 rounded-lg w-fit mx-auto shadow-sm">
              ONBOARDING PROGRESSIVO
            </span>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#1C1917] mt-2">
              Identidade do Estudo
            </h1>
            <p className="text-xs text-[#57534E] font-medium">
              Confirme cada seção para liberar a etapa seguinte.
            </p>
          </div>

          {/* DIVISÃO 1: FOTO DE PERFIL */}
          <div className="flex flex-col items-center gap-4 border-b border-[#E7E5E4] pb-6">
            <span className="text-xs font-black text-[#1C1917] uppercase tracking-wider flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${photoConfirmed ? 'bg-emerald-600 text-white' : 'bg-[#1C1917] text-[#FAF9F6]'}`}>
                {photoConfirmed ? '✓' : '1'}
              </span>
              1. FOTO DE PERFIL
            </span>

            <div className="relative group w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#1C1917] bg-[#F5F5F4] shrink-0 shadow-sm">
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              {!photoConfirmed && (
                <label className="absolute inset-0 bg-[#1C1917]/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all text-center p-1">
                  <svg className="w-5 h-5 stroke-[#FAF9F6] fill-none stroke-2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  </svg>
                  <span className="text-[#FAF9F6] text-[9px] font-black uppercase mt-1">Alterar Foto</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              )}
            </div>

            {!photoConfirmed && (
              <label className="flex items-center gap-2 cursor-pointer bg-[#FAF9F6] border border-[#E7E5E4] px-3 py-1.5 rounded-xl hover:border-[#1C1917] transition-all">
                <input
                  type="checkbox"
                  checked={skipPhoto}
                  onChange={(e) => {
                    setSkipPhoto(e.target.checked);
                    if (e.target.checked) setAvatarUrl(defaultAvatar);
                  }}
                  className="rounded border-[#E7E5E4] text-[#1C1917] focus:ring-[#1C1917]"
                />
                <span className="text-xs font-bold text-[#1C1917] uppercase">Usar foto padrão</span>
              </label>
            )}

            {!photoConfirmed ? (
              <Button
                variant="primary"
                onClick={() => setPhotoConfirmed(true)}
                className="py-2.5 px-6 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-black text-xs uppercase tracking-wider rounded-xl transition-all border-2 border-[#1C1917]"
              >
                Confirmar Foto
              </Button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setPhotoConfirmed(false);
                  setPersonalConfirmed(false);
                  setBioConfirmed(false);
                }}
                className="text-[10px] font-black uppercase text-[#78716C] underline hover:text-[#1C1917]"
              >
                Alterar Foto
              </button>
            )}
          </div>

          {/* DIVISÃO 2: DADOS PESSOAIS */}
          {photoConfirmed && (
            <div className="flex flex-col gap-4 border-b border-[#E7E5E4] pb-6 animate-in fade-in slide-in-from-top-4 duration-500 ease-out">
              <span className="text-xs font-black text-[#1C1917] uppercase tracking-wider flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${personalConfirmed ? 'bg-emerald-600 text-white' : 'bg-[#1C1917] text-[#FAF9F6]'}`}>
                  {personalConfirmed ? '✓' : '2'}
                </span>
                2. DADOS PESSOAIS
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-black text-[#1C1917] uppercase">
                    Nome Completo / Exibição *
                  </label>
                  <input
                    type="text"
                    maxLength={50}
                    disabled={personalConfirmed}
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      setNameError('');
                    }}
                    placeholder="Digite seu nome completo..."
                    className={`px-4 py-3 bg-[#FAF9F6] border-2 rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] disabled:opacity-75 ${nameError ? 'border-red-500' : 'border-[#E7E5E4]'}`}
                  />
                  {nameError && (
                    <span className="text-[10px] font-bold text-red-500 uppercase mt-1">{nameError}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-[#1C1917] uppercase">Data de Nascimento *</label>
                    <button
                      type="button"
                      disabled={personalConfirmed}
                      onClick={() => setShowAgeInProfile(!showAgeInProfile)}
                      className="text-[10px] font-black uppercase text-[#1C1917] hover:underline flex items-center gap-1.5 bg-[#FAF9F6] px-2 py-0.5 rounded border border-[#E7E5E4]"
                    >
                      {showAgeInProfile ? (
                        <>
                          <svg className="w-3.5 h-3.5 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Visível</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                          <span>Oculta</span>
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type="date"
                    disabled={personalConfirmed}
                    value={birthDate}
                    onChange={(e) => {
                      setBirthDate(e.target.value);
                      setBirthDateError('');
                    }}
                    className={`px-4 py-3 bg-[#FAF9F6] border-2 rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] disabled:opacity-75 ${birthDateError ? 'border-red-500' : 'border-[#E7E5E4]'}`}
                  />
                  {birthDateError && (
                    <span className="text-[10px] font-bold text-red-500 uppercase mt-1">{birthDateError}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-[#1C1917] uppercase">Gênero</label>
                  <select
                    disabled={personalConfirmed}
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] disabled:opacity-75"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Não-binário">Não-binário</option>
                    <option value="Prefiro não dizer">Prefiro não dizer</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-black text-[#1C1917] uppercase">Pronomes de Tratamento</label>
                  <select
                    disabled={personalConfirmed}
                    value={pronouns}
                    onChange={(e) => setPronouns(e.target.value)}
                    className="px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] disabled:opacity-75"
                  >
                    <option value="ele/dele (he/him)">ele/dele (he/him)</option>
                    <option value="ela/dela (she/her)">ela/dela (she/her)</option>
                    <option value="elu/delu (they/them)">elu/delu (they/them)</option>
                    <option value="Qualquer pronome (any pronouns)">Qualquer pronome (any pronouns)</option>
                  </select>
                </div>
              </div>

              {!personalConfirmed ? (
                <Button
                  variant="primary"
                  onClick={() => {
                    let hasError = false;
                    const trimmedName = displayName.trim();
                    
                    if (trimmedName.length < 1) {
                      setNameError('O nome não pode ficar vazio.');
                      hasError = true;
                    } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(trimmedName)) {
                      setNameError('O nome deve conter apenas letras.');
                      hasError = true;
                    } else {
                      setNameError('');
                    }

                    if (!birthDate) {
                      setBirthDateError('A data de nascimento é obrigatória.');
                      hasError = true;
                    } else if (calculateAge(birthDate) < 18) {
                      setBirthDateError('Você deve ter pelo menos 18 anos.');
                      hasError = true;
                    } else {
                      setBirthDateError('');
                    }

                    if (!hasError) {
                      setPersonalConfirmed(true);
                    }
                  }}
                  className="py-2.5 px-6 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-black text-xs uppercase tracking-wider rounded-xl transition-all border-2 border-[#1C1917] mt-2 self-start"
                >
                  Salvar Dados Pessoais
                </Button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setPersonalConfirmed(false);
                    setBioConfirmed(false);
                  }}
                  className="text-[10px] font-black uppercase text-[#78716C] underline hover:text-[#1C1917] self-start"
                >
                  Editar Dados Pessoais
                </button>
              )}
            </div>
          )}

          {/* DIVISÃO 3: MINI BIOGRAFIA */}
          {personalConfirmed && (
            <div className="flex flex-col gap-4 border-b border-[#E7E5E4] pb-6 animate-in fade-in slide-in-from-top-4 duration-500 ease-out">
              <span className="text-xs font-black text-[#1C1917] uppercase tracking-wider flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${bioConfirmed ? 'bg-emerald-600 text-white' : 'bg-[#1C1917] text-[#FAF9F6]'}`}>
                  {bioConfirmed ? '✓' : '3'}
                </span>
                3. MINI BIOGRAFIA
              </span>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-[#1C1917] uppercase">Conte sobre você (Opcional)</label>
                  <span className="text-[10px] font-bold text-[#78716C] uppercase">{bio.length}/140</span>
                </div>
                <textarea
                  rows={2}
                  maxLength={140}
                  disabled={bioConfirmed}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Conte um pouco sobre suas metas de conversa..."
                  className="w-full p-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] resize-none disabled:opacity-75"
                />
              </div>

              {!bioConfirmed ? (
                <Button
                  variant="primary"
                  onClick={() => setBioConfirmed(true)}
                  className="py-2.5 px-6 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-black text-xs uppercase tracking-wider rounded-xl transition-all border-2 border-[#1C1917] self-start"
                >
                  Confirmar Biografia
                </Button>
              ) : (
                <button
                  type="button"
                  onClick={() => setBioConfirmed(false)}
                  className="text-[10px] font-black uppercase text-[#78716C] underline hover:text-[#1C1917] self-start"
                >
                  Editar Biografia
                </button>
              )}
            </div>
          )}

          {/* DIVISÃO 4: NÍVEL DE INGLÊS */}
          {bioConfirmed && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-500 ease-out">
              <span className="text-xs font-black text-[#1C1917] uppercase tracking-wider flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${cefrLevel !== '' ? 'bg-emerald-600 text-white' : 'bg-[#1C1917] text-[#FAF9F6]'}`}>
                  {cefrLevel !== '' ? '✓' : '4'}
                </span>
                4. NÍVEL DE INGLÊS (CEFR) *
              </span>

              <div className="flex flex-col gap-2.5">
                {cefrLevelsInfo.map((item) => {
                  const isSelected = cefrLevel === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setCefrLevel(item.code)}
                      className={`p-3.5 rounded-2xl border-2 text-left flex items-center justify-between gap-4 transition-all ${
                        isSelected
                          ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917] shadow-sm'
                          : 'bg-[#FAF9F6] text-[#1C1917] border-[#E7E5E4] hover:border-[#1C1917]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center border-2 ${
                          isSelected ? 'bg-[#FAF9F6] text-[#1C1917] border-[#FAF9F6]' : 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]'
                        }`}>
                          {item.code}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase">{item.label}</span>
                          <span className={`text-[11px] font-medium ${isSelected ? 'text-[#D6D3D1]' : 'text-[#78716C]'}`}>
                            {item.desc}
                          </span>
                        </div>
                      </div>
                      {isSelected && <span className="text-xs font-black">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* BOTÃO FINALIZAR */}
          {bioConfirmed && cefrLevel !== '' && (
            <div className="pt-4 border-t border-[#E7E5E4] animate-in fade-in slide-in-from-top-4 duration-500 ease-out">
              <Button
                variant="primary"
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token');
                    const response = await fetch('http://localhost:3000/api/user/profile', {
                      method: 'PUT',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        name: displayName.trim(),
                        birthDate,
                        showAgeInProfile,
                        gender,
                        pronouns,
                        cefrLevel,
                        bio: bio.trim(),
                        avatar: avatarUrl,
                      }),
                    });

                    if (!response.ok) {
                      const errorData = await response.json().catch(() => ({}));
                      throw new Error(errorData.error || 'Erro ao salvar dados do onboarding.');
                    }

                    navigate('/auth-success');
                  } catch (error: any) {
                    alert(error.message || 'Erro ao salvar o onboarding.');
                  }
                }}
                className="w-full py-4 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-black text-xs uppercase tracking-widest rounded-xl transition-all border-2 border-[#1C1917] shadow-lg"
              >
                Concluir Onboarding e Entrar
              </Button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};