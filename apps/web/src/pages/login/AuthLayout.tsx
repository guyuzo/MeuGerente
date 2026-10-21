import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Logo } from "../../components/shared";
import { Card } from "../../components/ui/Card";
import { ApiError } from "../../lib/api-client";

/** Moldura das telas de acesso (entrar, criar conta, esqueci/redefinir senha): logo + cartão centralizado. */
export function AuthLayout({ titulo, children, rodape }: { titulo: string; children: ReactNode; rodape?: ReactNode }) {
  return (
    <main className="min-h-screen bg-neutral-300 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Logo className="h-10" />
        </div>

        <Card className="p-6">
          <h1 className="text-h2 text-neutral-900 mb-4">{titulo}</h1>
          {children}
        </Card>

        {rodape && <div className="mt-4 text-center text-body text-neutral-600">{rodape}</div>}
      </div>
    </main>
  );
}

export function LinkAuth({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="text-purple-600 font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 rounded-sm">
      {children}
    </Link>
  );
}

export function MensagemErro({ erro, padrao }: { erro: unknown; padrao: string }) {
  if (!erro) return null;
  return (
    <p role="alert" className="text-caption text-error bg-error-bg rounded-sm px-3 py-2">
      {erro instanceof ApiError ? erro.message : padrao}
    </p>
  );
}
