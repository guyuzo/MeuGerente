import { type FormEvent, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Input";
import { useRedefinirSenha } from "../../hooks/useSessao";
import { AuthLayout, LinkAuth, MensagemErro } from "./AuthLayout";

const SENHA_MINIMA = 8;

export function RedefinirSenhaPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const redefinir = useRedefinirSenha();
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erroLocal, setErroLocal] = useState("");

  if (!token) {
    return (
      <AuthLayout titulo="Link inválido" rodape={<LinkAuth to="/">Voltar para entrar</LinkAuth>}>
        <p className="text-body text-neutral-600">
          Esse link está incompleto. Peça um novo em <LinkAuth to="/esqueci-senha">Esqueci a senha</LinkAuth>.
        </p>
      </AuthLayout>
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErroLocal("");
    if (senha.length < SENHA_MINIMA) return setErroLocal(`A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`);
    if (senha !== confirmacao) return setErroLocal("As senhas não conferem.");
    redefinir.mutate({ token, senha }, { onSuccess: () => navigate("/", { replace: true }) });
  }

  return (
    <AuthLayout titulo="Criar nova senha" rodape={<LinkAuth to="/">Voltar para entrar</LinkAuth>}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label={`Nova senha (mínimo ${SENHA_MINIMA} caracteres)`} htmlFor="senha">
          <Input
            id="senha"
            type="password"
            autoComplete="new-password"
            autoFocus
            required
            minLength={SENHA_MINIMA}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </Field>
        <Field label="Confirme a nova senha" htmlFor="confirmacao">
          <Input
            id="confirmacao"
            type="password"
            autoComplete="new-password"
            required
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
          />
        </Field>

        {erroLocal ? (
          <p role="alert" className="text-caption text-error bg-error-bg rounded-sm px-3 py-2">
            {erroLocal}
          </p>
        ) : (
          <MensagemErro erro={redefinir.error} padrao="Não foi possível trocar a senha. Tente de novo." />
        )}

        <p className="text-caption text-neutral-600">Ao trocar a senha, você sai de todos os outros aparelhos conectados.</p>

        <Button type="submit" disabled={redefinir.isPending} className="w-full justify-center">
          {redefinir.isPending ? "Salvando..." : "Salvar nova senha"}
        </Button>
      </form>
    </AuthLayout>
  );
}
