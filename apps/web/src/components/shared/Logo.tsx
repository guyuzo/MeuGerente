import { cn } from "../../lib/utils";

/**
 * Wordmark "Meu GERENTE". O arquivo negativo tem o "GERENTE" quase branco (só lê em fundo escuro),
 * então cada tema mostra a sua versão — a troca é por CSS (ver `.logo-*` em index.css).
 */
export function Logo({ className }: { className?: string }) {
  return (
    <>
      <img src="/logo-claro.png" alt="Meu Gerente" width={900} height={124} className={cn("logo-claro w-auto", className)} />
      <img src="/logo-negativo.png" alt="Meu Gerente" width={900} height={124} className={cn("logo-escuro w-auto", className)} />
    </>
  );
}
