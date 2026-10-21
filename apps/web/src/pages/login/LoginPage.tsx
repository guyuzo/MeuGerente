import { type FormEvent, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Input";
import { useEntrar } from "../../hooks/useSessao";
import { AuthLayout, LinkAuth, MensagemErro } from "./AuthLayout";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const entrar = useEntrar();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    entrar.mutate({ email, senha });
  }

  return (
    <AuthLayout
      titulo="Entrar"
      rodape={
        <>
          Ainda não tem conta? <LinkAuth to="/cadastro">Criar conta</LinkAuth>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="E-mail" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="username"
            autoFocus
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Senha" htmlFor="senha">
          <Input
            id="senha"
            type="password"
            autoComplete="current-password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </Field>
        <div className="text-right text-caption -mt-2">
          <LinkAuth to="/esqueci-senha">Esqueci a senha</LinkAuth>
        </div>

        <MensagemErro erro={entrar.error} padrao="Não foi possível entrar. Tente de novo." />

        <Button type="submit" disabled={entrar.isPending} className="w-full justify-center">
          {entrar.isPending ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </AuthLayout>
  );
}
