import { Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Field, Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { useExcluirConta, useSessao } from "../../hooks/useSessao";
import { ApiError } from "../../lib/api-client";

const classeLink = "text-purple-600 font-medium hover:underline";

export function ContaPage() {
  const sessao = useSessao();
  const excluir = useExcluirConta();
  const [confirmando, setConfirmando] = useState(false);
  const [senha, setSenha] = useState("");

  function fecharConfirmacao() {
    setConfirmando(false);
    setSenha("");
    excluir.reset();
  }

  function handleExcluir(e: FormEvent) {
    e.preventDefault();
    excluir.mutate(senha);
  }

  return (
    <div>
      <PageHeader titulo="Configurações" descricao="Sua conta e seus dados." />

      <div className="flex flex-col gap-4 max-w-xl">
        <Card>
          <h2 className="text-h3 text-neutral-900 mb-1">Conta</h2>
          <p className="text-body text-neutral-600 break-all">{sessao.data?.email}</p>
          <p className="text-caption text-neutral-600 mt-3">
            <Link to="/termos" className={classeLink}>
              Termos de Uso
            </Link>{" "}
            ·{" "}
            <Link to="/privacidade" className={classeLink}>
              Política de Privacidade
            </Link>
          </p>
        </Card>

        <Card>
          <h2 className="text-h3 text-neutral-900 mb-1">Excluir conta</h2>
          <p className="text-body text-neutral-600 mb-4">
            Apaga a conta e todos os dados dela — produtos, amostras, conteúdos, roteiros, metas e vendas. Não dá para
            desfazer.
          </p>
          <Button variant="danger" onClick={() => setConfirmando(true)}>
            <Trash2 size={16} />
            Excluir minha conta
          </Button>
        </Card>
      </div>

      <Modal aberto={confirmando} titulo="Excluir conta" onFechar={fecharConfirmacao}>
        <form onSubmit={handleExcluir} className="space-y-4">
          <p className="text-body text-neutral-600">
            Todos os seus dados serão apagados para sempre. Digite sua senha para confirmar.
          </p>
          <Field label="Senha" htmlFor="senha-exclusao">
            <Input
              id="senha-exclusao"
              type="password"
              autoComplete="current-password"
              autoFocus
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </Field>
          {excluir.isError && (
            <p role="alert" className="text-caption text-error bg-error-bg rounded-sm px-3 py-2">
              {excluir.error instanceof ApiError ? excluir.error.message : "Não foi possível excluir a conta. Tente de novo."}
            </p>
          )}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button type="button" variant="secondary" onClick={fecharConfirmacao}>
              Cancelar
            </Button>
            <Button type="submit" variant="danger" disabled={excluir.isPending || !senha}>
              {excluir.isPending ? "Excluindo..." : "Excluir definitivamente"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
