import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cefrLevel, setCefrLevel] = useState('B1 (Intermediário - Consigo me expressar em conversas simples)');
  const [agreeTerms, setAgreeTerms] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#0B1120] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col gap-6 text-white px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-slate-900">
              S
            </div>
            <span className="text-xl font-bold tracking-tight">SideBySide</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">
            Conecte-se com pessoas reais no seu nível de inglês.
          </h1>

          <p className="text-slate-400 text-base leading-relaxed">
            A melhor forma de destravar a conversação é praticando de igual para igual. O SideBySide conecta você com quem compartilha das suas mesmas metas, sob moderação ativa e segura.
          </p>

          <div className="flex flex-col gap-3 mt-2 text-sm text-slate-300">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Pareamento preciso por níveis do CEFR (A1-C2)</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Moderação ativa de áudio e vídeo por inteligência artificial</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Comunidade focada em suporte mútuo e respeito</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-xl text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>B1 - São Paulo</span>
            </div>
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-xl text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>B1 - Madrid</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col gap-6 text-slate-900">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight">
              Aprenda inglês conversando, lado a lado
            </h2>
            <p className="text-xs text-slate-500">
              Faça parte da maior comunidade segura de prática de inglês do mundo.
            </p>
          </div>

          <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`py-2 rounded-lg transition-all ${isLogin ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`py-2 rounded-lg transition-all ${!isLogin ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
            >
              Criar Conta
            </button>
          </div>

          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <Input
              label="Endereço de e-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Crie uma senha"
              type="password"
              placeholder="No mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Qual é o seu nível CEFR?
                </label>
                <select
                  value={cefrLevel}
                  onChange={(e) => setCefrLevel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 text-slate-900 text-xs rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="A1">A1 (Iniciante)</option>
                  <option value="A2">A2 (Básico)</option>
                  <option value="B1 (Intermediário - Consigo me expressar em conversas simples)">
                    B1 (Intermediário - Consigo me expressar em conversas simples)
                  </option>
                  <option value="B2">B2 (Intermediário Avançado)</option>
                  <option value="C1">C1 (Avançado)</option>
                </select>
              </div>
            )}

            {!isLogin && (
              <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  Concordo com os <a href="#" className="text-blue-600 underline">Termos de Uso</a> e com a <a href="#" className="text-blue-600 underline">Moderação de Vídeo Ativa</a>.
                </span>
              </label>
            )}

            <Button variant="primary" className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700">
              {isLogin ? 'Entrar na Conta' : 'Criar Minha Conta'}
            </Button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-xs text-slate-400 uppercase">ou</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};