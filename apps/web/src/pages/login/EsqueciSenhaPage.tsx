import { type FormEvent, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Input";
import { usePedirRedefinicaoSenha } from "../../hooks/useSessao";
import { AuthLayout, LinkAuth, MensagemErro } from "./AuthLayout";

export function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const pedir = usePedirRedefinicaoSenha();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    pedir.mutate(email);
  }

  return (
    <AuthLayout titulo="Esqueci a senha" rodape={<LinkAuth to="/">Voltar para entrar</LinkAuth>}>
      {pedir.isSuccess ? (
        <div className="space-y-2">
          <p className="text-body text-neutral-900">{pedir.data.mensagem}</p>
          <p className="text-caption text-neutral-600">
            O link vale por 1 hora. Se não chegar em alguns minutos, confira a caixa de spam.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-body text-neutral-600">Informe o e-mail da conta e enviaremos um link para criar uma nova senha.</p>
          <Field label="E-mail" htmlFor="email">
            <Input id="email" type="email" autoComplete="email" autoFocus required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>

          <MensagemErro erro={pedir.error} padrao="Não foi possível enviar o link. Tente de novo." />

          <Button type="submit" disabled={pedir.isPending} className="w-full justify-center">
            {pedir.isPending ? "Enviando..." : "Enviar link"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
