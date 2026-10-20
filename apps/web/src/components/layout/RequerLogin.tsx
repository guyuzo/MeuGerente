import type { ReactNode } from "react";
import { useSessao } from "../../hooks/useSessao";
import { LoginPage } from "../../pages/login/LoginPage";
import { ErrorState } from "../ui/ErrorState";
import { Spinner } from "../ui/Spinner";

/** Só mostra o app com sessão válida; sem ela, cai na tela de login. */
export function RequerLogin({ children }: { children: ReactNode }) {
  const sessao = useSessao();

  if (sessao.isLoading) {
    return (
      <div className="min-h-screen bg-neutral-300 flex items-center justify-center">
        <Spinner label="Carregando..." />
      </div>
    );
  }
  if (sessao.isError) {
    return (
      <div className="min-h-screen bg-neutral-300 flex items-center justify-center px-4">
        <ErrorState onTentarNovamente={() => sessao.refetch()} />
      </div>
    );
  }
  if (!sessao.data) return <LoginPage />;

  return <>{children}</>;
}
