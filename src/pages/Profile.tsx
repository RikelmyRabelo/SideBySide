import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const Profile: React.FC = () => {
  const navigate = useNavigate();

  // Estados dos Dados Pessoais
  const [name, setName] = useState('Lucas Silva');
  const [email, setEmail] = useState('lucas.silva@email.com');
  const [cefrLevel, setCefrLevel] = useState('B1');
  const [avatarUrl, setAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Informações detalhadas dos níveis CEFR
  const cefrLevelsInfo = [
    { code: 'A1', label: 'Iniciante', desc: 'Compreende frases simples do dia a dia.' },
    { code: 'A2', label: 'Básico', desc: 'Comunica-se em tarefas rotineiras e simples.' },
    { code: 'B1', label: 'Intermediário', desc: 'Mantém conversas sobre temas familiares.' },
    { code: 'B2', label: 'Intermediário Avançado', desc: 'Fala com fluência e espontaneidade.' },
    { code: 'C1', label: 'Avançado', desc: 'Expressa-se de forma fluida e bem estruturada.' },
  ];

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1917] flex flex-col font-sans selection:bg-[#1C1917] selection:text-[#FAF9F6]">
      {/* Header Bar */}
      <header className="bg-[#FFFFFF] border-b border-[#E7E5E4] px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-8 h-8 rounded-md bg-[#1C1917] flex items-center justify-center font-black text-[#FAF9F6] text-base">
            S
          </div>
          <span className="text-lg font-black tracking-tight text-[#1C1917] uppercase">SideBySide</span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-[#F5F5F4] hover:bg-[#E7E5E4] border border-[#E7E5E4] text-[#1C1917] font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
        >
          ← Voltar para Dashboard
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 lg:p-8 flex flex-col gap-6">
        {/* Banner do Perfil */}
        <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-2">
          <span className="text-[10px] font-bold tracking-widest text-[#78716C] uppercase bg-[#F5F5F4] border border-[#E7E5E4] px-3 py-1 rounded-md w-fit">
            CONFIGURAÇÕES DA CONTA
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#1C1917] mt-1">
            Meu Perfil
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E] max-w-xl leading-relaxed font-medium">
            Gerencie suas informações cadastrais e ajuste seu nível de proficiência CEFR para garantir o pareamento ideal durante as práticas.
          </p>
        </section>

        {/* Mensagem de Sucesso */}
        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-150">
            <svg className="w-4 h-4 shrink-0 fill-current text-emerald-600" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            <span>Informações do perfil salvas com sucesso!</span>
          </div>
        )}

        {/* Formulário SBS-34: Dados Pessoais & CEFR */}
        <form onSubmit={handleSubmit} className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-8">
          
          {/* Seção 1: Foto do Perfil */}
          <div className="flex flex-col gap-4 border-b border-[#E7E5E4] pb-6">
            <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
              Foto do Perfil
            </h2>

            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#E7E5E4] bg-[#F5F5F4] shrink-0">
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="px-4 py-2 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all w-fit">
                  Alterar Foto
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
                <span className="text-[11px] font-medium text-[#78716C]">
                  Recomendado: Imagem quadrada em formato JPG ou PNG.
                </span>
              </div>
            </div>
          </div>

          {/* Seção 2: Informações Pessoais */}
          <div className="flex flex-col gap-4 border-b border-[#E7E5E4] pb-6">
            <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
              Informações Pessoais
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] w-full"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-4 py-3 bg-[#FAF9F6] border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] w-full"
                  required
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Nível CEFR */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">
                Nível de Fluência (CEFR)
              </h2>
              <span className="text-xs font-bold text-[#78716C] uppercase">
                Atual: <strong className="text-[#1C1917]">{cefrLevel}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {cefrLevelsInfo.map((item) => {
                const isSelected = cefrLevel === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setCefrLevel(item.code)}
                    className={`p-4 rounded-xl border text-left flex items-center justify-between gap-4 transition-all ${
                      isSelected
                        ? 'bg-[#1C1917] text-[#FAF9F6] border-[#1C1917] shadow-md'
                        : 'bg-[#FAF9F6] text-[#1C1917] border-[#E7E5E4] hover:border-[#1C1917]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-9 h-9 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#292524] text-[#FAF9F6]' : 'bg-[#E7E5E4] text-[#1C1917]'
                        }`}
                      >
                        {item.code}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase">{item.label}</span>
                        <span
                          className={`text-[11px] font-medium leading-snug ${
                            isSelected ? 'text-[#A8A29E]' : 'text-[#78716C]'
                          }`}
                        >
                          {item.desc}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[#FAF9F6] bg-[#FAF9F6]' : 'border-[#D6D3D1]'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-[#1C1917]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            variant="primary"
            type="submit"
            className="w-full py-4 text-xs font-bold uppercase tracking-widest bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] rounded-xl shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            Salvar Alterações
          </Button>
        </form>
      </main>
    </div>
  );
};