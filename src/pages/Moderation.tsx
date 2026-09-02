import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Moderation: React.FC = () => {
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
            Política de Moderação e Convivência
          </h1>
          <p className="text-xs font-bold text-[#A8A29E] uppercase tracking-wider">
            Última atualização: 11 de agosto de 2026
          </p>
        </div>

        <article className="flex flex-col gap-8 text-sm sm:text-base text-[#57534E] leading-relaxed">
          
          <p className="font-medium text-[#1C1917]">
            Bem-vindo ao SideBySide. Nossa plataforma foi criada para oferecer um ambiente seguro, respeitoso e colaborativo para a prática de inglês P2P. Esta Política de Moderação e Convivência ("Política") detalha as condutas que esperamos de todos os usuários e as medidas que tomamos para garantir a integridade da comunidade.
          </p>

          <section className="flex flex-col gap-3 bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E7E5E4] shadow-sm">
            <h2 className="text-xl font-black uppercase tracking-tight text-[#1C1917]">
              1. Objetivo e Princípios
            </h2>
            <div className="flex flex-col gap-2 text-xs sm:text-sm">
              <p>
                <strong>1.1. Comunidade Global:</strong> O SideBySide é um espaço que conecta pessoas de diferentes origens e culturas. O pilar fundamental de nossa moderação é garantir a <strong>segurança e o respeito mútuo</strong>.
              </p>
              <p>
                <strong>1.2. Tolerância Zero:</strong> Adotamos uma política de tolerância zero contra comportamentos abusivos, discriminatórios ou ilegais.
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-3 bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E7E5E4] shadow-sm">
            <h2 className="text-xl font-black uppercase tracking-tight text-[#1C1917]">
              2. Condutas Proibidas e Vedações Éticas
            </h2>
            <p className="text-xs sm:text-sm font-medium text-[#1C1917]">É terminantemente proibido e resultará em banimento imediato:</p>
            <ul className="list-disc list-inside flex flex-col gap-1 text-xs sm:text-sm pl-2">
              <li><strong>Discurso de Ódio:</strong> Qualquer manifestação de racismo, misoginia, homofobia, transfobia, intolerância religiosa, capacitismo ou xenofobia.</li>
              <li><strong>Assédio e Bullying:</strong> Intimidação, ameaças, perseguição, bullying moral ou assédio sexual contra outros usuários.</li>
              <li><strong>Conteúdo Sexualmente Explícito:</strong> Nudez parcial ou total, atos sexuais de qualquer natureza ou abordagens de cunho romântico/sexual inapropriadas.</li>
              <li><strong>Apologia ao Crime ou Violência:</strong> Incentivo a atos criminosos, exibição de armas, uso de substâncias ilícitas ou ameaças de violência física.</li>
              <li><strong>Gravação Não Autorizada:</strong> Captura de tela (print screen) ou gravação de áudio e vídeo de chamadas <strong>sem consentimento prévio explícito</strong> de todos os participantes.</li>
              <li><strong>Promoção e Spam:</strong> Uso da plataforma para vendas, marketing multinível, propaganda política/religiosa ou solicitação de dados pessoais de terceiros.</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3 bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E7E5E4] shadow-sm">
            <h2 className="text-xl font-black uppercase tracking-tight text-[#1C1917]">
              3. Sistema de Moderação Ativa (IA)
            </h2>
            <div className="flex flex-col gap-2 text-xs sm:text-sm">
              <p>
                <strong>3.1. Monitoramento em Tempo Real:</strong> As salas de chamada são monitoradas ativamente por sistemas de Inteligência Artificial para identificar padrões de comportamento que violem estas diretrizes de segurança.
              </p>
              <p>
                <strong>3.2. Privacidade das Transmissões:</strong> Conforme nossa Política de Privacidade, este monitoramento é realizado <strong>ao vivo para segurança</strong> e o conteúdo audiovisual das chamadas privadas <strong>NÃO é gravado ou armazenado de forma sequencial</strong>, sendo apenas processado temporariamente para análise de conformidade.
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-3 bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E7E5E4] shadow-sm">
            <h2 className="text-xl font-black uppercase tracking-tight text-[#1C1917]">
              4. Ferramentas do Usuário e Mecanismos de Denúncia
            </h2>
            <div className="flex flex-col gap-2 text-xs sm:text-sm">
              <p>
                <strong>4.1. Denúncia Instantânea (Report):</strong> A plataforma oferece um botão de denúncia de fácil acesso durante todas as chamadas. Encorajamos os usuários a relatar imediatamente qualquer comportamento inadequado.
              </p>
              <p>
                <strong>4.2. Trocar Parceiro/Encerrar Chamada:</strong> O usuário tem autonomia total para desconectar-se de uma chamada a qualquer momento, sem necessidade de justificativa, caso se sinta desconfortável.
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-3 bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E7E5E4] shadow-sm">
            <h2 className="text-xl font-black uppercase tracking-tight text-[#1C1917]">
              5. Sanções e Aplicação das Regras
            </h2>
            <div className="flex flex-col gap-2 text-xs sm:text-sm">
              <p>
                <strong>5.1. Penalidades Progressivas:</strong> Dependendo da gravidade, as sanções podem incluir suspensão preventiva temporária ou <strong>banimento permanente</strong> da conta.
              </p>
              <p>
                <strong>5.2. Banimento Sem Aviso Prévio:</strong> O SideBySide reserva-se o direito de encerrar contas que violem gravemente as diretrizes de ética, sem necessidade de aviso prévio e sem direito a compensações.
              </p>
              <p>
                <strong>5.3. Bloqueio de IP/Hardware:</strong> Em casos graves, a plataforma bloqueará o acesso por IP e identificadores de hardware para impedir novos cadastros do infrator.
              </p>
            </div>
          </section>

          <div className="bg-[#1C1917] text-[#FAF9F6] p-6 sm:p-8 rounded-2xl flex flex-col gap-2 mt-4 shadow-xl">
            <h3 className="text-lg font-black uppercase tracking-tight text-[#FAF9F6]">
              Relatar Violência ou Conteúdo Grave?
            </h3>
            <p className="text-xs text-[#A8A29E] leading-relaxed">
              Caso você tenha sido vítima ou testemunha de um comportamento inaceitável e queira fornecer mais detalhes, entre em contato direto com a nossa equipe de ética através do e-mail: <strong className="text-[#FAF9F6]">etica@sidebyside.app</strong>
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