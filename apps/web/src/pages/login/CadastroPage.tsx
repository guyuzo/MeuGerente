import { type FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Checkbox } from "../../components/ui/Checkbox";
import { Field, Input } from "../../components/ui/Input";
import { useCadastrar, useSessao } from "../../hooks/useSessao";
import { AuthLayout, LinkAuth, MensagemErro } from "./AuthLayout";

const SENHA_MINIMA = 8;

export function CadastroPage() {
  const sessao = useSessao();
  const navigate = useNavigate();
  const cadastrar = useCadastrar();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [erroLocal, setErroLocal] = useState("");

  if (sessao.data) return <Navigate to="/" replace />;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErroLocal("");
    if (senha.length < SENHA_MINIMA) return setErroLocal(`A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`);
    if (senha !== confirmacao) return setErroLocal("As senhas não conferem.");
    if (!aceitouTermos) return setErroLocal("Para criar a conta, aceite os Termos de Uso e a Política de Privacidade.");
    cadastrar.mutate({ email, senha, aceitouTermos }, { onSuccess: () => navigate("/", { replace: true }) });
  }

  return (
    <AuthLayout
      titulo="Criar conta"
      rodape={
        <>
          Já tem conta? <LinkAuth to="/">Entrar</LinkAuth>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="E-mail" htmlFor="email">
          <Input id="email" type="email" autoComplete="email" autoFocus required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label={`Senha (mínimo ${SENHA_MINIMA} caracteres)`} htmlFor="senha">
          <Input
            id="senha"
            type="password"
            autoComplete="new-password"
            required
            minLength={SENHA_MINIMA}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </Field>
        <Field label="Confirme a senha" htmlFor="confirmacao">
          <Input
            id="confirmacao"
            type="password"
            autoComplete="new-password"
            required
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
          />
        </Field>

        <Checkbox
          id="termos"
          checked={aceitouTermos}
          onChange={setAceitouTermos}
          className="items-start"
          label={
            <span className="text-caption text-neutral-600">
              Li e aceito os <LinkAuth to="/termos">Termos de Uso</LinkAuth> e a{" "}
              <LinkAuth to="/privacidade">Política de Privacidade</LinkAuth>.
            </span>
          }
        />

        {erroLocal ? (
          <p role="alert" className="text-caption text-error bg-error-bg rounded-sm px-3 py-2">
            {erroLocal}
          </p>
        ) : (
          <MensagemErro erro={cadastrar.error} padrao="Não foi possível criar a conta. Tente de novo." />
        )}

        <Button type="submit" disabled={cadastrar.isPending} className="w-full justify-center">
          {cadastrar.isPending ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>
    </AuthLayout>
  );
}
