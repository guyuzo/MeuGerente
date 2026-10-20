import { type FormEvent, useState } from "react";
import { Logo } from "../../components/shared";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Field, Input } from "../../components/ui/Input";
import { useEntrar } from "../../hooks/useSessao";
import { ApiError } from "../../lib/api-client";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const entrar = useEntrar();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    entrar.mutate({ email, senha });
  }

  const erro =
    entrar.error instanceof ApiError
      ? entrar.error.message
      : entrar.isError
        ? "Não foi possível entrar. Tente de novo."
        : undefined;

  return (
    <main className="min-h-screen bg-neutral-300 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Logo className="h-10" />
        </div>

        <Card className="p-6">
          <h1 className="text-h2 text-neutral-900 mb-4">Entrar</h1>
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

            {erro && (
              <p role="alert" className="text-caption text-error bg-error-bg rounded-sm px-3 py-2">
                {erro}
              </p>
            )}

            <Button type="submit" disabled={entrar.isPending} className="w-full justify-center">
              {entrar.isPending ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
