import { AlertCircle } from "lucide-react";
import { Button } from "./Button";

interface ErrorStateProps {
  mensagem?: string;
  onTentarNovamente?: () => void;
}

/** Estado de erro obrigatório (PRD seção 10), sempre com saída (tentar de novo). */
export function ErrorState({ mensagem = "Não foi possível carregar os dados.", onTentarNovamente }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-12 h-12 rounded-full bg-error-bg flex items-center justify-center mb-4">
        <AlertCircle size={20} className="text-error" />
      </div>
      <p className="text-h3 text-neutral-900 mb-1">Algo deu errado</p>
      <p className="text-body text-neutral-600 max-w-sm mb-4">{mensagem}</p>
      {onTentarNovamente && (
        <Button variant="secondary" onClick={onTentarNovamente}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
