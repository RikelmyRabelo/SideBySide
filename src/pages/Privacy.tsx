import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Privacy: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] text-[#1C1917] font-sans selection:bg-[#1C1917] selection:text-[#FAF9F6] relative">
      
      <div className="fixed top-6 left-0 right-0 w-full flex justify-center z-40 px-4">
        <header className="w-full max-w-4xl px-6 py-3.5 flex items-center justify-between bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl shadow-sm">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 bg-[#1C1917] flex items-center justify-center font-black text-[#FAF9F6] text-base rounded-md">
              S
            </div>
            <span className="text-lg font-black tracking-tight text-[#1C1917] uppercase">SideBySide</span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-5 py-2 bg-[#F5F5F4] hover:bg-[#E7E5E4] text-[#1C1917] font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-[#E7E5E4]"
          >
            ← Voltar ao Início
          </button>
        </header>
      </div>

      <main className="max-w-4xl mx-auto pt-36 pb-24 px-6 lg:px-12 flex flex-col gap-10">
        
        <div className="flex flex-col gap-3 border-b border-[#E7E5E4] pb-8">
          <span className="px-3 py-1 bg-[#F5F5F4] border border-[#E7E5E4] text-[#78716C] text-xs font-bold uppercase tracking-widest rounded-md w-fit">
            Documentação Legal
          </span>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-[#1C1917]">
            Política de Privacidade e Dados (LGPD)
          </h1>
          <p className="text-xs font-bold text-[#A8A29E] uppercase tracking-wider">
            Última atualização: 11 de agosto de 2026
          </p>
        </div>

        <article className="flex flex-col gap-8 text-sm sm:text-base text-[#57534E] leading-relaxed">
          
          <p className="font-medium text-[#1C1917]">
            A sua privacidade é fundamental para o <strong className="text-[#1C1917]">SideBySide</strong>. Esta Política de Privacidade descreve como coletamos, usamos, tratamos e protegemos suas informações pessoais em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
          </p>

          <section className="flex flex-col gap-3 bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E7E5E4] shadow-sm">
            <h2 className="text-xl font-black uppercase tracking-tight text-[#1C1917]">
              1. Coleta e Tratamento de Dados Cadastrais
            </h2>
            <div className="flex flex-col gap-2 text-xs sm:text-sm">
              <p>
                Coletamos apenas os dados estritamente necessários para viabilizar a experiência do Serviço:
              </p>
              <ul className="list-disc list-inside flex flex-col gap-1 pl-2">
                <li><strong>Dados de Identificação:</strong> Endereço de e-mail e credenciais de acesso codificadas.</li>
                <li><strong>Perfil de Aprendizado:</strong> Nível autodeclarado do quadro CEFR (A1 a C1).</li>
                <li><strong>Dados Técnicos:</strong> Endereço IP, logs de acesso e informações do dispositivo para garantia de segurança e prevenção de fraudes.</li>
              </ul>
            </div>
          </section>

          <section className="flex flex-col gap-3 bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E7E5E4] shadow-sm">
            <h2 className="text-xl font-black uppercase tracking-tight text-[#1C1917]">
              2. Processamento de Áudio e Vídeo em Tempo Real
            </h2>
            <div className="flex flex-col gap-2 text-xs sm:text-sm">
              <p>
                <strong>2.1. Não Armazenamento das Chamadas:</strong> O SideBySide <strong>NÃO grava, armazena, transmite a terceiros ou comercializa o fluxo de vídeo e áudio</strong> das chamadas privadas mantidas entre os usuários.
              </p>
              <p>
                <strong>2.2. Moderação Automática:</strong> O processamento efetuado pela Inteligência Artificial de moderação ocorre exclusivamente em tempo real (<em>stream processing</em>) com a única finalidade de detectar violações de segurança e conduta ética.
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-3 bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E7E5E4] shadow-sm">
            <h2 className="text-xl font-black uppercase tracking-tight text-[#1C1917]">
              3. Finalidade do Tratamento de Dados
            </h2>
            <div className="flex flex-col gap-2 text-xs sm:text-sm">
              <p>Seus dados são utilizados exclusivamente para:</p>
              <ul className="list-disc list-inside flex flex-col gap-1 pl-2">
                <li>Operar o algoritmo de pareamento por nível de fluência equivalente.</li>
                <li>Garantir a segurança da plataforma e prevenir acessos não autorizados.</li>
                <li>Enviar notificações de serviço cruciais ou atualizações desta documentação legal.</li>
              </ul>
            </div>
          </section>

          <section className="flex flex-col gap-3 bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E7E5E4] shadow-sm">
            <h2 className="text-xl font-black uppercase tracking-tight text-[#1C1917]">
              4. Seus Direitos como Titular (LGPD)
            </h2>
            <div className="flex flex-col gap-2 text-xs sm:text-sm">
              <p>Nos termos do artigo 18 da LGPD, você possui o direito de solicitar a qualquer momento:</p>
              <ul className="list-disc list-inside flex flex-col gap-1 pl-2">
                <li>Confirmação da existência de tratamento e acesso aos seus dados.</li>
                <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
                <li>Eliminação definitiva dos dados pessoais armazenados em nossos servidores.</li>
                <li>Revogação do consentimento para tratamento de dados.</li>
              </ul>
            </div>
          </section>

          <section className="flex flex-col gap-3 bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E7E5E4] shadow-sm">
            <h2 className="text-xl font-black uppercase tracking-tight text-[#1C1917]">
              5. Compartilhamento e Segurança da Informação
            </h2>
            <div className="flex flex-col gap-2 text-xs sm:text-sm">
              <p>
                <strong>5.1. Não Comercialização:</strong> O SideBySide não vende, aluga nem compartilha dados pessoais com terceiros para fins publicitários ou comerciais.
              </p>
              <p>
                <strong>5.2. Segurança:</strong> Adotamos criptografia de ponta a ponta nas transmissões P2P e práticas rígidas de cibersegurança na infraestrutura do banco de dados.
              </p>
            </div>
          </section>

          <div className="bg-[#1C1917] text-[#FAF9F6] p-6 sm:p-8 rounded-2xl flex flex-col gap-2 mt-4">
            <h3 className="text-lg font-black uppercase tracking-tight text-[#FAF9F6]">
              Contato do Encarregado de Dados (DPO)
            </h3>
            <p className="text-xs text-[#A8A29E] leading-relaxed">
              Para exercer seus direitos de titular de dados ou esclarecer dúvidas sobre privacidade, envie um e-mail para o nosso DPO: <strong className="text-[#FAF9F6]">privacidade@sidebyside.app</strong>
            </p>
          </div>

        </article>
      </main>

      <footer className="w-full bg-[#1C1917] border-t border-[#292524] py-8 px-6 text-center text-xs text-[#A8A29E]">
        <p>© 2026 SideBySide. Todos os direitos reservados.</p>
      </footer>

    </div>
  );
};