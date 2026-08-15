import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
export const Onboarding = () => {
    const navigate = useNavigate();
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
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [cefrLevel, setCefrLevel] = useState('');
    const [photoConfirmed, setPhotoConfirmed] = useState(false);
    const [personalConfirmed, setPersonalConfirmed] = useState(false);
    const [bioConfirmed, setBioConfirmed] = useState(false);
    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarUrl(URL.createObjectURL(file));
            setSkipPhoto(false);
        }
    };
    const calculateAge = (dob) => {
        const birthDateObj = new Date(dob);
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDateObj.getFullYear();
        const m = today.getMonth() - birthDateObj.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
            calculatedAge--;
        }
        return calculatedAge;
    };
    const topicsLibrary = [
        { category: 'Tecnologia & Carreira', items: ['Tecnologia', 'Carreira & Negócios', 'Inteligência Artificial', 'Startups', 'Programação', 'Marketing Digital'] },
        { category: 'Cultura & Entretenimento', items: ['Cinema & Séries', 'Música', 'Leitura', 'Jogos & eSports', 'Arte & Design', 'Fotografia'] },
        { category: 'Estilo de Vida & Hobbies', items: ['Viagens', 'Esportes', 'Culinária', 'Saúde & Fitness', 'Gastronomia', 'Idiomas'] },
        { category: 'Sociedade & Atualidades', items: ['Economia', 'Meio Ambiente', 'Psicologia', 'História', 'Filosofia', 'Moda'] },
    ];
    const toggleInterest = (interest) => {
        setSelectedInterests((prev) => {
            if (prev.includes(interest)) {
                return prev.filter((item) => item !== interest);
            }
            if (prev.length >= 5) {
                alert('Você só pode selecionar até 5 tópicos de interesse.');
                return prev;
            }
            return [...prev, interest];
        });
    };
    const cefrLevelsInfo = [
        { code: 'A1', label: 'Iniciante', desc: 'Compreende frases simples e expressões cotidianas.' },
        { code: 'A2', label: 'Básico', desc: 'Comunica-se em tarefas rotineiras e diretas.' },
        { code: 'B1', label: 'Intermediário', desc: 'Mantém conversas sobre temas familiares de interesse.' },
        { code: 'B2', label: 'Intermediário Avançado', desc: 'Fala com fluência e espontaneidade sem esforço.' },
        { code: 'C1', label: 'Avançado', desc: 'Expressa-se de forma fluida, natural e estruturada.' },
    ];
    return (_jsxs("div", { className: "min-h-screen bg-[#FAF9F6] text-[#1C1917] flex flex-col font-sans selection:bg-[#1C1917] selection:text-[#FAF9F6] relative overflow-x-hidden", children: [_jsx("div", { className: "pointer-events-none fixed z-50 w-3.5 h-3.5 rounded-full bg-[#1C1917] transition-opacity duration-300 ease-out -translate-x-1/2 -translate-y-1/2 hidden md:block", style: {
                    left: `${followerPos.x}px`,
                    top: `${followerPos.y}px`,
                    opacity: cursorOpacity,
                } }), _jsx("header", { className: "bg-[#FFFFFF] border-b border-[#E7E5E4] px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-[#1C1917] flex items-center justify-center font-black text-[#FAF9F6] text-base shadow-sm", children: "S" }), _jsx("span", { className: "text-lg font-black tracking-tight text-[#1C1917] uppercase", children: "SideBySide" })] }) }), _jsx("main", { className: "flex-1 max-w-2xl w-full mx-auto p-6 lg:p-8 flex flex-col justify-center my-auto", children: _jsxs("div", { className: "bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-10 shadow-[6px_6px_0px_0px_#1C1917] flex flex-col gap-8 relative", children: [_jsxs("div", { className: "flex flex-col gap-1 text-center border-b border-[#E7E5E4] pb-4", children: [_jsx("span", { className: "text-[10px] font-black tracking-widest text-[#1C1917] uppercase bg-[#FAF9F6] border border-[#1C1917] px-3 py-1 rounded-lg w-fit mx-auto shadow-sm", children: "ONBOARDING PROGRESSIVO" }), _jsx("h1", { className: "text-2xl font-black uppercase tracking-tight text-[#1C1917] mt-2", children: "Identidade do Estudo" }), _jsx("p", { className: "text-xs text-[#57534E] font-medium", children: "Confirme cada se\u00E7\u00E3o para liberar a etapa seguinte." })] }), _jsxs("div", { className: "flex flex-col items-center gap-4 border-b border-[#E7E5E4] pb-6", children: [_jsxs("span", { className: "text-xs font-black text-[#1C1917] uppercase tracking-wider flex items-center gap-2", children: [_jsx("span", { className: `w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${photoConfirmed ? 'bg-emerald-600 text-white' : 'bg-[#1C1917] text-[#FAF9F6]'}`, children: photoConfirmed ? '✓' : '1' }), "1. FOTO DE PERFIL"] }), _jsxs("div", { className: "relative group w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#1C1917] bg-[#F5F5F4] shrink-0 shadow-sm", children: [_jsx("img", { src: avatarUrl, alt: "Avatar", className: "w-full h-full object-cover" }), !photoConfirmed && (_jsxs("label", { className: "absolute inset-0 bg-[#1C1917]/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all text-center p-1", children: [_jsx("svg", { className: "w-5 h-5 stroke-[#FAF9F6] fill-none stroke-2", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" }) }), _jsx("span", { className: "text-[#FAF9F6] text-[9px] font-black uppercase mt-1", children: "Alterar Foto" }), _jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: handleAvatarChange })] }))] }), !photoConfirmed && (_jsxs("label", { className: "flex items-center gap-2 cursor-pointer bg-[#FAF9F6] border border-[#E7E5E4] px-3 py-1.5 rounded-xl hover:border-[#1C1917] transition-all", children: [_jsx("input", { type: "checkbox", checked: skipPhoto, onChange: (e) => {
                                                setSkipPhoto(e.target.checked);
                                                if (e.target.checked)
                                                    setAvatarUrl(defaultAvatar);
                                            }, className: "rounded border-[#E7E5E4] text-[#1C1917] focus:ring-[#1C1917]" }), _jsx("span", { className: "text-xs font-bold text-[#1C1917] uppercase", children: "Usar foto padr\u00E3o" })] })), !photoConfirmed ? (_jsx(Button, { variant: "primary", onClick: () => setPhotoConfirmed(true), className: "py-2.5 px-6 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-black text-xs uppercase tracking-wider rounded-xl transition-all border-2 border-[#1C1917]", children: "Confirmar Foto" })) : (_jsx("button", { type: "button", onClick: () => {
                                        setPhotoConfirmed(false);
                                        setPersonalConfirmed(false);
                                        setBioConfirmed(false);
                                    }, className: "text-[10px] font-black uppercase text-[#78716C] underline hover:text-[#1C1917]", children: "Alterar Foto" }))] }), photoConfirmed && (_jsxs("div", { className: "flex flex-col gap-4 border-b border-[#E7E5E4] pb-6 animate-in fade-in slide-in-from-top-4 duration-500 ease-out", children: [_jsxs("span", { className: "text-xs font-black text-[#1C1917] uppercase tracking-wider flex items-center gap-2", children: [_jsx("span", { className: `w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${personalConfirmed ? 'bg-emerald-600 text-white' : 'bg-[#1C1917] text-[#FAF9F6]'}`, children: personalConfirmed ? '✓' : '2' }), "2. DADOS PESSOAIS"] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex flex-col gap-1.5 sm:col-span-2", children: [_jsx("label", { className: "text-xs font-black text-[#1C1917] uppercase", children: "Nome Completo / Exibi\u00E7\u00E3o *" }), _jsx("input", { type: "text", maxLength: 50, disabled: personalConfirmed, value: displayName, onChange: (e) => {
                                                        setDisplayName(e.target.value);
                                                        setNameError('');
                                                    }, placeholder: "Digite seu nome completo...", className: `px-4 py-3 bg-[#FAF9F6] border-2 rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] disabled:opacity-75 ${nameError ? 'border-red-500' : 'border-[#E7E5E4]'}` }), nameError && (_jsx("span", { className: "text-[10px] font-bold text-red-500 uppercase mt-1", children: nameError }))] }), _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("label", { className: "text-xs font-black text-[#1C1917] uppercase", children: "Data de Nascimento *" }), _jsx("button", { type: "button", disabled: personalConfirmed, onClick: () => setShowAgeInProfile(!showAgeInProfile), className: "text-[10px] font-black uppercase text-[#1C1917] hover:underline flex items-center gap-1.5 bg-[#FAF9F6] px-2 py-0.5 rounded border border-[#E7E5E4]", children: showAgeInProfile ? (_jsxs(_Fragment, { children: [_jsxs("svg", { className: "w-3.5 h-3.5 stroke-current fill-none stroke-2", viewBox: "0 0 24 24", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })] }), _jsx("span", { children: "Vis\u00EDvel" })] })) : (_jsxs(_Fragment, { children: [_jsx("svg", { className: "w-3.5 h-3.5 stroke-current fill-none stroke-2", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" }) }), _jsx("span", { children: "Oculta" })] })) })] }), _jsx("input", { type: "date", disabled: personalConfirmed, value: birthDate, onChange: (e) => {
                                                        setBirthDate(e.target.value);
                                                        setBirthDateError('');
                                                    }, className: `px-4 py-3 bg-[#FAF9F6] border-2 rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] disabled:opacity-75 ${birthDateError ? 'border-red-500' : 'border-[#E7E5E4]'}` }), birthDateError && (_jsx("span", { className: "text-[10px] font-bold text-red-500 uppercase mt-1", children: birthDateError }))] }), _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsx("label", { className: "text-xs font-black text-[#1C1917] uppercase", children: "G\u00EAnero" }), _jsxs("select", { disabled: personalConfirmed, value: gender, onChange: (e) => setGender(e.target.value), className: "px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] disabled:opacity-75", children: [_jsx("option", { value: "Masculino", children: "Masculino" }), _jsx("option", { value: "Feminino", children: "Feminino" }), _jsx("option", { value: "N\u00E3o-bin\u00E1rio", children: "N\u00E3o-bin\u00E1rio" }), _jsx("option", { value: "Prefiro n\u00E3o dizer", children: "Prefiro n\u00E3o dizer" })] })] }), _jsxs("div", { className: "flex flex-col gap-1.5 sm:col-span-2", children: [_jsx("label", { className: "text-xs font-black text-[#1C1917] uppercase", children: "Pronomes de Tratamento" }), _jsxs("select", { disabled: personalConfirmed, value: pronouns, onChange: (e) => setPronouns(e.target.value), className: "px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] disabled:opacity-75", children: [_jsx("option", { value: "ele/dele (he/him)", children: "ele/dele (he/him)" }), _jsx("option", { value: "ela/dela (she/her)", children: "ela/dela (she/her)" }), _jsx("option", { value: "elu/delu (they/them)", children: "elu/delu (they/them)" }), _jsx("option", { value: "Qualquer pronome (any pronouns)", children: "Qualquer pronome (any pronouns)" })] })] })] }), !personalConfirmed ? (_jsx(Button, { variant: "primary", onClick: () => {
                                        let hasError = false;
                                        const trimmedName = displayName.trim();
                                        if (trimmedName.length < 1) {
                                            setNameError('O nome não pode ficar vazio.');
                                            hasError = true;
                                        }
                                        else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(trimmedName)) {
                                            setNameError('O nome deve conter apenas letras.');
                                            hasError = true;
                                        }
                                        else {
                                            setNameError('');
                                        }
                                        if (!birthDate) {
                                            setBirthDateError('A data de nascimento é obrigatória.');
                                            hasError = true;
                                        }
                                        else if (calculateAge(birthDate) < 18) {
                                            setBirthDateError('Você deve ter pelo menos 18 anos.');
                                            hasError = true;
                                        }
                                        else {
                                            setBirthDateError('');
                                        }
                                        if (!hasError) {
                                            setPersonalConfirmed(true);
                                        }
                                    }, className: "py-2.5 px-6 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-black text-xs uppercase tracking-wider rounded-xl transition-all border-2 border-[#1C1917] mt-2 self-start", children: "Salvar Dados Pessoais" })) : (_jsx("button", { type: "button", onClick: () => {
                                        setPersonalConfirmed(false);
                                        setBioConfirmed(false);
                                    }, className: "text-[10px] font-black uppercase text-[#78716C] underline hover:text-[#1C1917] self-start", children: "Editar Dados Pessoais" }))] })), personalConfirmed && (_jsxs("div", { className: "flex flex-col gap-4 border-b border-[#E7E5E4] pb-6 animate-in fade-in slide-in-from-top-4 duration-500 ease-out", children: [_jsxs("span", { className: "text-xs font-black text-[#1C1917] uppercase tracking-wider flex items-center gap-2", children: [_jsx("span", { className: `w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${bioConfirmed ? 'bg-emerald-600 text-white' : 'bg-[#1C1917] text-[#FAF9F6]'}`, children: bioConfirmed ? '✓' : '3' }), "3. MINI BIOGRAFIA"] }), _jsxs("div", { className: "flex flex-col gap-1.5", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("label", { className: "text-xs font-black text-[#1C1917] uppercase", children: "Conte sobre voc\u00EA (Opcional)" }), _jsxs("span", { className: "text-[10px] font-bold text-[#78716C] uppercase", children: [bio.length, "/140"] })] }), _jsx("textarea", { rows: 2, maxLength: 140, disabled: bioConfirmed, value: bio, onChange: (e) => setBio(e.target.value), placeholder: "Conte um pouco sobre suas metas de conversa...", className: "w-full p-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] resize-none disabled:opacity-75" })] }), !bioConfirmed ? (_jsx(Button, { variant: "primary", onClick: () => setBioConfirmed(true), className: "py-2.5 px-6 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-black text-xs uppercase tracking-wider rounded-xl transition-all border-2 border-[#1C1917] self-start", children: "Confirmar Biografia" })) : (_jsx("button", { type: "button", onClick: () => setBioConfirmed(false), className: "text-[10px] font-black uppercase text-[#78716C] underline hover:text-[#1C1917] self-start", children: "Editar Biografia" }))] })), bioConfirmed && (_jsxs("div", { className: "flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-500 ease-out", children: [_jsxs("span", { className: "text-xs font-black text-[#1C1917] uppercase tracking-wider flex items-center gap-2", children: [_jsx("span", { className: `w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${selectedInterests.length > 0 ? 'bg-emerald-600 text-white' : 'bg-[#1C1917] text-[#FAF9F6]'}`, children: selectedInterests.length > 0 ? '✓' : '4' }), "4. T\u00D3PICOS DE INTERESSE"] }), _jsxs("div", { className: "flex flex-col gap-4 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-2xl p-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-[10px] font-black uppercase tracking-wider text-[#78716C]", children: "Selecione at\u00E9 5" }), _jsxs("span", { className: "text-[10px] font-black bg-[#1C1917] text-[#FAF9F6] px-2 py-0.5 rounded-full", children: [selectedInterests.length, "/5"] })] }), topicsLibrary.map((group) => (_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("span", { className: "text-[10px] font-black uppercase tracking-wider text-[#78716C]", children: group.category }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: group.items.map((item) => {
                                                        const isSelected = selectedInterests.includes(item);
                                                        return (_jsx("button", { type: "button", onClick: () => toggleInterest(item), className: `px-3 py-1.5 rounded-xl border-2 text-[10px] font-black transition-all ${isSelected
                                                                ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]'
                                                                : 'bg-[#FFFFFF] text-[#78716C] border-[#E7E5E4] hover:border-[#1C1917]'}`, children: isSelected ? `✓ ${item}` : `+ ${item}` }, item));
                                                    }) })] }, group.category)))] })] })), bioConfirmed && selectedInterests.length > 0 && (_jsxs("div", { className: "flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-500 ease-out", children: [_jsxs("span", { className: "text-xs font-black text-[#1C1917] uppercase tracking-wider flex items-center gap-2", children: [_jsx("span", { className: `w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${cefrLevel !== '' ? 'bg-emerald-600 text-white' : 'bg-[#1C1917] text-[#FAF9F6]'}`, children: cefrLevel !== '' ? '✓' : '5' }), "5. N\u00CDVEL DE INGL\u00CAS (CEFR) *"] }), _jsx("div", { className: "flex flex-col gap-2.5", children: cefrLevelsInfo.map((item) => {
                                        const isSelected = cefrLevel === item.code;
                                        return (_jsxs("button", { type: "button", onClick: () => setCefrLevel(item.code), className: `p-3.5 rounded-2xl border-2 text-left flex items-center justify-between gap-4 transition-all ${isSelected
                                                ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917] shadow-sm'
                                                : 'bg-[#FAF9F6] text-[#1C1917] border-[#E7E5E4] hover:border-[#1C1917]'}`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: `w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center border-2 ${isSelected ? 'bg-[#FAF9F6] text-[#1C1917] border-[#FAF9F6]' : 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]'}`, children: item.code }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-xs font-black uppercase", children: item.label }), _jsx("span", { className: `text-[11px] font-medium ${isSelected ? 'text-[#D6D3D1]' : 'text-[#78716C]'}`, children: item.desc })] })] }), isSelected && _jsx("span", { className: "text-xs font-black", children: "\u2713" })] }, item.code));
                                    }) })] })), bioConfirmed && selectedInterests.length > 0 && cefrLevel !== '' && (_jsx("div", { className: "pt-4 border-t border-[#E7E5E4] animate-in fade-in slide-in-from-top-4 duration-500 ease-out", children: _jsx(Button, { variant: "primary", onClick: async () => {
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
                                                interests: selectedInterests,
                                                avatar: avatarUrl,
                                            }),
                                        });
                                        if (!response.ok) {
                                            const errorData = await response.json().catch(() => ({}));
                                            throw new Error(errorData.error || 'Erro ao salvar dados do onboarding.');
                                        }
                                        navigate('/auth-success');
                                    }
                                    catch (error) {
                                        alert(error.message || 'Erro ao salvar o onboarding.');
                                    }
                                }, className: "w-full py-4 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-black text-xs uppercase tracking-widest rounded-xl transition-all border-2 border-[#1C1917] shadow-lg", children: "Concluir Onboarding e Entrar" }) }))] }) })] }));
};
