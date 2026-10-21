import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Logo } from "../../components/shared";
import { Card } from "../../components/ui/Card";

// RASCUNHO — revisar com um advogado antes de divulgar o cadastro aberto.
const ATUALIZADO_EM = "21 de outubro de 2026";
const CONTATO = "gustavoyuzo39@gmail.com";

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-h3 text-neutral-900">{titulo}</h2>
      <div className="text-body text-neutral-600 space-y-2">{children}</div>
    </section>
  );
}

function Termos() {
  return (
    <>
      <Secao titulo="O que é o MEU GERENTE">
        <p>
          Ferramenta para afiliados do TikTok Shop organizarem produtos, amostras, calendário de conteúdo, roteiros e
          análise de vendas. Cada conta é individual e vê apenas os próprios dados.
        </p>
      </Secao>
      <Secao titulo="Sua conta">
        <p>
          Você é responsável por manter sua senha em segredo e pelas informações que cadastra. Uma conta é de uso
          pessoal; não compartilhe o acesso.
        </p>
      </Secao>
      <Secao titulo="Uso aceitável">
        <p>
          Não é permitido tentar acessar dados de outras contas, sobrecarregar o serviço, automatizar cadastros ou usar o
          gerador de roteiros com IA para conteúdo ilegal, enganoso ou que viole as regras do TikTok Shop. O uso da IA
          tem limite diário por conta.
        </p>
      </Secao>
      <Secao titulo="Conteúdo gerado por IA">
        <p>
          Roteiros e ganchos sugeridos pela IA são sugestões. Revise antes de publicar: a responsabilidade pelo que for ao
          ar é de quem publica.
        </p>
      </Secao>
      <Secao titulo="Disponibilidade">
        <p>
          O serviço é oferecido "como está", sem garantia de funcionamento contínuo. Podemos mudar ou encerrar recursos,
          avisando com antecedência sempre que possível.
        </p>
      </Secao>
      <Secao titulo="Encerramento">
        <p>
          Você pode excluir sua conta a qualquer momento em Configurações; todos os seus dados são apagados. Contas que
          violarem estes termos podem ser suspensas.
        </p>
      </Secao>
    </>
  );
}

function Privacidade() {
  return (
    <>
      <Secao titulo="Quais dados guardamos">
        <p>
          E-mail e senha (guardada só como hash, nunca em texto), e o que você cadastra ou importa: produtos, categorias,
          amostras, conteúdos, roteiros, metas e as vendas das planilhas do TikTok Shop que você escolher importar (pedido,
          produto, valor, comissão e status).
        </p>
        <p>A "análise sem salvar" de planilhas não grava nenhum dado.</p>
      </Secao>
      <Secao titulo="Para que usamos">
        <p>
          Só para fazer o sistema funcionar para você: mostrar seus painéis e relatórios, gerar roteiros quando você pede e
          enviar e-mails de recuperação de senha. Não vendemos nem compartilhamos seus dados para publicidade.
        </p>
      </Secao>
      <Secao titulo="Com quem compartilhamos">
        <p>Fornecedores que operam o serviço, apenas no necessário:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Supabase — banco de dados.</li>
          <li>Vercel — hospedagem.</li>
          <li>Google (Gemini) — recebe dados do produto escolhido quando você pede um roteiro.</li>
          <li>Resend — envio do e-mail de recuperação de senha.</li>
        </ul>
      </Secao>
      <Secao titulo="Seus direitos (LGPD)">
        <p>
          Você pode acessar e corrigir seus dados no próprio sistema e excluir a conta em Configurações — a exclusão apaga
          todos os seus dados de forma definitiva. Para outros pedidos, escreva para {CONTATO}.
        </p>
      </Secao>
      <Secao titulo="Segurança">
        <p>
          Cada conta só acessa os próprios registros, a comunicação é criptografada (HTTPS) e há limite de tentativas de
          login.
        </p>
      </Secao>
    </>
  );
}

const PAGINAS = {
  termos: { titulo: "Termos de Uso", conteudo: <Termos /> },
  privacidade: { titulo: "Política de Privacidade", conteudo: <Privacidade /> },
};

/** Termos e Política de Privacidade — públicas, porque a tela de criar conta aponta pra elas. */
export function LegalPage({ pagina }: { pagina: keyof typeof PAGINAS }) {
  const { titulo, conteudo } = PAGINAS[pagina];

  return (
    <main className="min-h-screen bg-neutral-300 px-4 py-8">
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex justify-center mb-6">
          <Link to="/" aria-label="Início">
            <Logo className="h-10" />
          </Link>
        </div>
        <Card className="p-6 space-y-6">
          <div>
            <h1 className="text-h1 text-neutral-900">{titulo}</h1>
            <p className="text-caption text-neutral-600 mt-1">Última atualização: {ATUALIZADO_EM}</p>
          </div>
          {conteudo}
          <p className="text-caption text-neutral-600">Dúvidas: {CONTATO}</p>
        </Card>
      </div>
    </main>
  );
}
