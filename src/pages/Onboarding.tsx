import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Efeito de Cursor de Mouse Solido Neutro
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

  // Estados Form Passo 1: Informações Pessoais Completa
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState<number | string>(24);
  const [gender, setGender] = useState('Masculino');
  const [pronouns, setPronouns] = useState('ele/dele (he/him)');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  );

  // Estados Form Passo 2: Nível CEFR
  const [cefrLevel, setCefrLevel] = useState('B1');

  // Estados Form Passo 3: Tópicos de Interesse
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const topicsLibrary = [
    { category: 'Tecnologia & Carreira', items: ['Tecnologia', 'Carreira & Negócios', 'Inteligência Artificial', 'Startups', 'Programação', 'Marketing Digital'] },
    { category: 'Cultura & Entretenimento', items: ['Cinema & Séries', 'Música', 'Leitura', 'Jogos & eSports', 'Arte & Design', 'Fotografia'] },
    { category: 'Estilo de Vida & Hobbies', items: ['Viagens', 'Esportes', 'Culinária', 'Saúde & Fitness', 'Gastronomia', 'Idiomas'] },
  ];

  const toggleInterest = (topic: string) => {
    if (selectedInterests.includes(topic)) {
      setSelectedInterests(selectedInterests.filter((t) => t !== topic));
    } else {
      if (selectedInterests.length >= 5) {
        alert('Selecione no máximo 5 tópicos.');
        return;
      }
      setSelectedInterests([...selectedInterests, topic]);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleNext = () => {
    if (step === 1 && !displayName.trim()) {
      alert('Por favor, informe seu nome de exibição.');
      return;
    }
    if (step < 3) {
      setStep((prev) => prev + 1);
    } else {
      navigate('/dashboard');
    }
  };

  const cefrLevelsInfo = [
    { code: 'A1', label: 'Iniciante', desc: 'Compreende frases simples do dia a dia.' },
    { code: 'A2', label: 'Básico', desc: 'Comunica-se em tarefas rotineiras.' },
    { code: 'B1', label: 'Intermediário', desc: 'Mantém conversas sobre temas familiares.' },
    { code: 'B2', label: 'Intermediário Avançado', desc: 'Fala com fluência e espontaneidade.' },
    { code: 'C1', label: 'Avançado', desc: 'Expressa-se de forma fluida e bem estruturada.' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1917] flex flex-col font-sans selection:bg-[#1C1917] selection:text-[#FAF9F6] relative overflow-x-hidden">
      
      {/* Cursor Solido Neutro */}
      <div
        className="pointer-events-none fixed z-50 w-3.5 h-3.5 rounded-full bg-[#1C1917] transition-opacity duration-300 ease-out -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{
          left: `${followerPos.x}px`,
          top: `${followerPos.y}px`,
          opacity: cursorOpacity,
        }}
      />

      {/* Header Bar */}
      <header className="bg-[#FFFFFF] border-b border-[#E7E5E4] px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[#1C1917] flex items-center justify-center font-black text-[#FAF9F6] text-base">
            S
          </div>
          <span className="text-lg font-black tracking-tight text-[#1C1917] uppercase">SideBySide</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase text-[#1C1917]">Etapa {step} de 3</span>
        </div>
      </header>

      {/* Progress Bar Topo */}
      <div className="w-full bg-[#E7E5E4] h-1.5">
        <div
          className="bg-[#1C1917] h-full transition-all duration-300 ease-out"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <main className="flex-1 max-w-2xl w-full mx-auto p-6 lg:p-8 flex flex-col justify-center my-auto">
        <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-10 shadow-sm flex flex-col gap-6">
          
          {/* PASSO 1: DADOS PESSOAIS */}
          {step === 1 && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-150">
              <div className="flex flex-col gap-1 text-center">
                <span className="text-[10px] font-black tracking-widest text-[#78716C] uppercase bg-[#F5F5F4] border border-[#E7E5E4] px-3 py-1 rounded-md w-fit mx-auto">
                  PASSO 01 / 03
                </span>
                <h1 className="text-2xl font-black uppercase tracking-tight text-[#1C1917] mt-1">
                  Monte seu Perfil
                </h1>
                <p className="text-xs text-[#57534E] font-medium">
                  Preencha as informações para apresentarmos você à comunidade das salas.
                </p>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="relative group w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#E7E5E4] bg-[#F5F5F4] shrink-0">
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  <label className="absolute inset-0 bg-[#1C1917]/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-center p-1">
                    <svg className="w-4 h-4 stroke-[#FAF9F6] fill-none stroke-2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    </svg>
                    <span className="text-[#FAF9F6] text-[9px] font-bold uppercase mt-1">Alterar Foto</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
                    Nome Completo / Exibição *
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ex: Lucas Silva"
                    className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Idade</label>
                  <input
                    type="number"
                    min={18}
                    max={100}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Gênero</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Não-binário">Não-binário</option>
                    <option value="Prefiro não dizer">Prefiro não dizer</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Pronomes</label>
                  <select
                    value={pronouns}
                    onChange={(e) => setPronouns(e.target.value)}
                    className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
                  >
                    <option value="ele/dele (he/him)">ele/dele (he/him)</option>
                    <option value="ela/dela (she/her)">ela/dela (she/her)</option>
                    <option value="elu/delu (they/them)">elu/delu (they/them)</option>
                    <option value="Qualquer pronome (any pronouns)">Qualquer pronome (any pronouns)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Mini Biografia</label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Conte um pouco sobre suas metas de prática..."
                    className="w-full p-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PASSO 2: CEFR LEVEL */}
          {step === 2 && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-150">
              <div className="flex flex-col gap-1 text-center">
                <span className="text-[10px] font-black tracking-widest text-[#78716C] uppercase bg-[#F5F5F4] border border-[#E7E5E4] px-3 py-1 rounded-md w-fit mx-auto">
                  PASSO 02 / 03
                </span>
                <h1 className="text-2xl font-black uppercase tracking-tight text-[#1C1917] mt-1">
                  Nível de Fluência
                </h1>
                <p className="text-xs text-[#57534E] font-medium">
                  Usaremos este nível para parear você com pares equivalentes.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                {cefrLevelsInfo.map((item) => {
                  const isSelected = cefrLevel === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setCefrLevel(item.code)}
                      className={`p-3.5 rounded-xl border text-left flex items-center justify-between gap-4 transition-all ${
                        isSelected
                          ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]'
                          : 'bg-[#FAF9F6] text-[#1C1917] border-[#E7E5E4] hover:border-[#1C1917]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-lg font-black text-xs flex items-center justify-center ${isSelected ? 'bg-[#292524] text-[#FAF9F6]' : 'bg-[#E7E5E4] text-[#1C1917]'}`}>
                          {item.code}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold uppercase">{item.label}</span>
                          <span className={`text-[11px] font-medium ${isSelected ? 'text-[#A8A29E]' : 'text-[#78716C]'}`}>
                            {item.desc}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PASSO 3: TÓPICOS DE INTERESSE */}
          {step === 3 && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-150">
              <div className="flex flex-col gap-1 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[10px] font-black tracking-widest text-[#78716C] uppercase bg-[#F5F5F4] border border-[#E7E5E4] px-3 py-1 rounded-md">
                    PASSO 03 / 03
                  </span>
                  <span className="text-[10px] font-black uppercase bg-[#1C1917] text-[#FAF9F6] px-2 py-0.5 rounded">
                    {selectedInterests.length}/5
                  </span>
                </div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-[#1C1917] mt-1">
                  Interesses de Conversa
                </h1>
                <p className="text-xs text-[#57534E] font-medium">
                  Selecione até 5 tópicos principais para personalização.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {topicsLibrary.map((cat) => (
                  <div key={cat.category} className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#78716C]">
                      {cat.category}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.items.map((item) => {
                        const isSelected = selectedInterests.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleInterest(item)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]'
                                : 'bg-[#FAF9F6] text-[#78716C] border-[#E7E5E4] hover:border-[#1C1917]'
                            }`}
                          >
                            {isSelected ? `✓ ${item}` : `+ ${item}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BARRA DE BOTÕES INFERIOR */}
          <div className="flex gap-3 pt-4 border-t border-[#E7E5E4]">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((prev) => prev - 1)}
                className="flex-1 py-3 bg-[#F5F5F4] hover:bg-[#E7E5E4] text-[#1C1917] font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Voltar
              </button>
            )}
            <Button
              variant="primary"
              onClick={handleNext}
              className="flex-1 py-3 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
            >
              {step === 3 ? 'Concluir e Entrar' : 'Continuar'}
            </Button>
          </div>

        </div>
      </main>
    </div>
  );
};