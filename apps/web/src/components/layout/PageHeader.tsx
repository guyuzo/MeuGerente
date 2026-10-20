import type { ReactNode } from "react";

interface PageHeaderProps {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}

/** Cabeçalho de página padrão — reaproveitado por todo módulo em vez de recriar título+ação em cada tela. */
export function PageHeader({ titulo, descricao, acao }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-h1 text-neutral-900">{titulo}</h1>
        {descricao && <p className="text-body text-neutral-600 mt-1">{descricao}</p>}
      </div>
      {acao && <div className="shrink-0">{acao}</div>}
    </div>
  );
}
