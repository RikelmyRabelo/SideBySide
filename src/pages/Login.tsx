import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cefrLevel, setCefrLevel] = useState('B1 (Intermediário - Consigo me expressar em conversas simples)');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

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

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              label="Endereço de e-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />

            <Input
              label="Crie uma senha"
              type="password"
              placeholder="No mínimo 8 caracteres"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />

            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Qual é o seu nível CEFR?
                </label>
                <select
                  value={cefrLevel}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCefrLevel(e.target.value)}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgreeTerms(e.target.checked)}
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

          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              E-mail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};