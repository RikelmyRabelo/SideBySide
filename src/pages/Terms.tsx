import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Terms: React.FC = () => {
  const navigate = useNavigate();

  // Garante que a página abra no topo
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] text-[#1C1917] font-sans selection:bg-[#1C1917] selection:text-[#FAF9F6] relative">
      
      {/* Header Fixo / Navegação de Volta */}
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

      {/* Conteúdo Principal dos Termos de Uso */}
      <main className="max-w-4xl mx-auto pt-36 pb-24 px-6 lg:px-12 flex flex-col gap-10">
        
        {/* Cabeçalho do Documento */}
        <div className="flex flex-col gap-3 border-b border-[#E7E5E4] pb-8">
          <span className="px-3 py-1 bg-[#F5F5F4] border border-[#E7E5E4] text-[#78716C] text-xs font-bold uppercase tracking-widest rounded-md w-fit">
            Documentação Legal
          </span>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-[#1C1917]">
            Termos de Uso e Serviço
          </h1>
          <p className="text-xs font-bold text-[#A8A29E] uppercase tracking-wider">
            Última atualização: 11 de agosto de 2026
          </p>
        </div>

        {/* Artigo / Texto Jurídico Estruturado */}
        <article className="flex flex-col gap-8 text-sm sm:text-base text-[#57534E] leading-relaxed">
          
          <p className="font-medium text-[#1C1917]">
            Este Termo de Uso e Serviço ("Termo") rege o contrato vinculante entre a plataforma <strong className="text-[#1C1917]">SideBySide</strong> ("Plataforma" ou "Serviço") e o usuário ("Usuário") que acessa, cadastra-se ou utiliza nossos serviços de prática de conversação.
          </p>

          <section className="flex flex-col gap-3 bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E7E5E4] shadow-sm">
            <h2 className="text-xl font-black uppercase tracking-tight text-[#1C1917]">
              1. Aceitação e Elegibilidade
            </h2>
            <div className="flex flex-col gap-2 text-xs sm:text-sm">
              <p>
                <strong>1.1. Aceitação Contratual:</strong> Ao criar uma conta ou utilizar o SideBySide, o Usuário concorda expressamente com todos os termos e condições deste instrumento. A não aceitação impede o uso da Plataforma.
              </p>
              <p>
                <strong>1.2. Idade Mínima:</strong> O uso do Serviço é permitido exclusivamente a pessoas físicas com <strong>idade mínima de 18 (dezoito) anos completos</strong> e em plena capacidade civil. É terminantemente proibido o cadastro de menores de idade, mesmo que assistidos por responsáveis legais.
              </p>
              <p>
                <strong>1.3. Veracidade das Informações:</strong> O Usuário compromete-se a fornecer dados reais, exatos e atualizados no momento do cadastro (e-mail e nível CEFR). O uso de dados falsos sujeitará a conta ao cancelamento imediato.
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-3 bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E7E5E4] shadow-sm">
            <h2 className="text-xl font-black uppercase tracking-tight text-[#1C1917]">
              2. Natureza do Serviço e Isenção Pedagógica
            </h2>
            <div className="flex flex-col gap-2 text-xs sm:text-sm">
              <p>
                <strong>2.1. Objetivo da Plataforma:</strong> O SideBySide é uma ferramenta tecnológica de conexão pessoa para pessoa (<em>Peer-to-Peer</em> ou P2P) para prática livre de escuta e fala no idioma inglês.
              </p>
              <p>
                <strong>2.2. Ausência de Tutoria:</strong> O SideBySide <strong>não é uma escola de idiomas e não fornece professores, aulas ou tutores de gramática</strong>. As conexões ocorrem exclusivamente entre estudantes em estágios de aprendizado equivalentes.
              </p>
              <p>
                <strong>2.3. Inexistência de Garantia de Fluência:</strong> O SideBySide não garante evolução acadêmica, alcance de fluência linguística ou aprovação em testes formais de proficiência, sendo a prática de responsabilidade exclusiva do empenho do Usuário.
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-3 bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E7E5E4] shadow-sm">
            <h2 className="text-xl font-black uppercase tracking-tight text-[#1C1917]">
              3. Conta e Segurança das Credenciais
            </h2>
            <div className="flex flex-col gap-2 text-xs sm:text-sm">
              <p>
                <strong>3.1. Uso Pessoal:</strong> A conta é pessoal e intransferível. É proibida a venda, cessão, aluguel ou compartilhamento de acessos com terceiros.
              </p>
              <p>
                <strong>3.2. Responsabilidade pelas Ações:</strong> O Usuário responde integralmente por todas as atividades realizadas utilizando suas credenciais de acesso (e-mail e senha).
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-3 bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E7E5E4] shadow-sm">
            <h2 className="text-xl font-black uppercase tracking-tight text-[#1C1917]">
              4. Limitação de Responsabilidade Civil
            </h2>
            <div className="flex flex-col gap-2 text-xs sm:text-sm">
              <p>
                <strong>4.1. Conduta de Terceiros:</strong> Nos termos do artigo 19 do Marco Civil da Internet (Lei nº 12.965/2014), o SideBySide não responde civilmente por declarações, opiniões, condutas ilícitas ou danos causados individualmente por outros Usuários durante as chamadas ao vivo.
              </p>
              <p>
                <strong>4.2. Autoproteção do Usuário:</strong> O Usuário é o único responsável pela sua própria segurança de dados, sendo <strong>fortemente recomendado que não compartilhe dados sensíveis, endereço residencial, redes sociais privadas ou informações financeiras</strong> durante as conversas.
              </p>
              <p>
                <strong>4.3. Disponibilidade do Serviço:</strong> A Plataforma é fornecida no estado em que se encontra (<em>"as is"</em>), podendo passar por manutenções ou instabilidades temporárias de sistema sem que isso gere direito a indenização.
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-3 bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E7E5E4] shadow-sm">
            <h2 className="text-xl font-black uppercase tracking-tight text-[#1C1917]">
              5. Propriedade Intelectual
            </h2>
            <div className="flex flex-col gap-2 text-xs sm:text-sm">
              <p>
                <strong>5.1. Titularidade:</strong> Todos os direitos sobre a marca SideBySide, logotipo, código-fonte, layout visual, algoritmo de pareamento e interfaces pertencem exclusivamente à titular da Plataforma.
              </p>
              <p>
                <strong>5.2. Licença de Uso:</strong> É concedida ao Usuário uma licença limitada, revogável, não exclusiva e intransferível apenas para uso pessoal do Serviço, sendo proibida qualquer tentativa de engenharia reversa ou exploração comercial.
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-3 bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E7E5E4] shadow-sm">
            <h2 className="text-xl font-black uppercase tracking-tight text-[#1C1917]">
              6. Alterações dos Termos e Foro
            </h2>
            <div className="flex flex-col gap-2 text-xs sm:text-sm">
              <p>
                <strong>6.1. Atualizações:</strong> O SideBySide reserva-se o direito de alterar este Termo a qualquer momento. Modificações relevantes serão notificadas via e-mail ou aviso na Plataforma.
              </p>
              <p>
                <strong>6.2. Legislação Aplicável:</strong> Este instrumento é regido pelas leis da República Federativa do Brasil, elegendo-se o Foro da Comarca da sede da administradora para dirimir controvérsias.
              </p>
            </div>
          </section>

          {/* Contato */}
          <div className="bg-[#1C1917] text-[#FAF9F6] p-6 sm:p-8 rounded-2xl flex flex-col gap-2 mt-4">
            <h3 className="text-lg font-black uppercase tracking-tight text-[#FAF9F6]">
              Dúvidas sobre os Termos?
            </h3>
            <p className="text-xs text-[#A8A29E] leading-relaxed">
              Entre em contato direto com o nosso suporte jurídico através do e-mail: <strong className="text-[#FAF9F6]">suporte@sidebyside.app</strong>
            </p>
          </div>

        </article>
      </main>

      {/* Footer Simples */}
      <footer className="w-full bg-[#1C1917] border-t border-[#292524] py-8 px-6 text-center text-xs text-[#A8A29E]">
        <p>© 2026 SideBySide. Todos os direitos reservados.</p>
      </footer>

    </div>
  );
};