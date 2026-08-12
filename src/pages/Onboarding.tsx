import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Estados do Onboarding
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  );
  const [cefrLevel, setCefrLevel] = useState('B1');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const topicsList = [
    'Tecnologia', 'Carreira & Negócios', 'Viagens', 'Cinema & Séries',
    'Música', 'Inteligência Artificial', 'Startups', 'Esportes', 'Gastronomia', 'Idiomas'
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
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1917] flex flex-col font-sans selection:bg-[#1C1917] selection:text-[#FAF9F6] relative">
      <header className="bg-[#FFFFFF] border-b border-[#E7E5E4] px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[#1C1917] flex items-center justify-center font-black text-[#FAF9F6] text-base">
            S
          </div>
          <span className="text-lg font-black tracking-tight text-[#1C1917] uppercase">SideBySide</span>
        </div>
        <div className="text-xs font-bold uppercase tracking-wider text-[#78716C]">
          Etapa {step} de 3
        </div>
      </header>

      <main className="flex-1 max-w-xl w-full mx-auto p-6 flex flex-col justify-center">
        <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-8 shadow-sm flex flex-col gap-6">
          {step === 1 && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-150">
              <div className="flex flex-col gap-1 text-center">
                <span className="text-[10px] font-bold tracking-widest text-[#78716C] uppercase bg-[#F5F5F4] border border-[#E7E5E4] px-3 py-1 rounded-md w-fit mx-auto">
                  PASSO 01
                </span>
                <h1 className="text-2xl font-black uppercase tracking-tight text-[#1C1917] mt-1">
                  Seu Perfil
                </h1>
                <p className="text-xs text-[#57534E]">Como os outros estudantes vão te ver nas salas.</p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="relative group w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#E7E5E4] bg-[#F5F5F4]">
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  <label className="absolute inset-0 bg-[#1C1917]/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    <span className="text-white text-[10px] font-bold uppercase">Alterar</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Nome de Exibição</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ex: Lucas Silva"
                  className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-150">
              <div className="flex flex-col gap-1 text-center">
                <span className="text-[10px] font-bold tracking-widest text-[#78716C] uppercase bg-[#F5F5F4] border border-[#E7E5E4] px-3 py-1 rounded-md w-fit mx-auto">
                  PASSO 02
                </span>
                <h1 className="text-2xl font-black uppercase tracking-tight text-[#1C1917] mt-1">
                  Nível de Fluência
                </h1>
                <p className="text-xs text-[#57534E]">Selecione o nível CEFR que melhor descreve seu momento atual.</p>
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

          {step === 3 && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-150">
              <div className="flex flex-col gap-1 text-center">
                <span className="text-[10px] font-bold tracking-widest text-[#78716C] uppercase bg-[#F5F5F4] border border-[#E7E5E4] px-3 py-1 rounded-md w-fit mx-auto">
                  PASSO 03
                </span>
                <h1 className="text-2xl font-black uppercase tracking-tight text-[#1C1917] mt-1">
                  Tópicos de Interesse
                </h1>
                <p className="text-xs text-[#57534E]">Escolha até 5 assuntos para personalizar suas salas de conversa.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {topicsList.map((topic) => {
                  const isSelected = selectedInterests.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleInterest(topic)}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917]'
                          : 'bg-[#FAF9F6] text-[#78716C] border-[#E7E5E4] hover:border-[#1C1917]'
                      }`}
                    >
                      {isSelected ? `✓ ${topic}` : `+ ${topic}`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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