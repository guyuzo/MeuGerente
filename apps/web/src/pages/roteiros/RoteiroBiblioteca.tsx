import type { Roteiro, RoteiroPublico } from "@meugerente/shared";
import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Select } from "../../components/ui/Select";

interface RoteiroBibliotecaProps {
  roteiros: Roteiro[];
}

/** Biblioteca filtrável por público (PRD seção 8.5). Filtro por produto já é feito na página, ao escolher o produto. */
export function RoteiroBiblioteca({ roteiros }: RoteiroBibliotecaProps) {
  const [filtroPublico, setFiltroPublico] = useState<RoteiroPublico | "todos">("todos");

  const filtrados = useMemo(
    () =>
      [...roteiros]
        .filter((r) => filtroPublico === "todos" || r.publico === filtroPublico)
        .sort((a, b) => b.versao - a.versao),
    [roteiros, filtroPublico],
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-h2 text-neutral-900">Biblioteca de roteiros</h2>
        <Select className="w-auto" value={filtroPublico} onChange={(e) => setFiltroPublico(e.target.value as RoteiroPublico | "todos")}>
          <option value="todos">Todos os públicos</option>
          <option value="frio">Frio</option>
          <option value="morno">Morno</option>
          <option value="quente">Quente</option>
        </Select>
      </div>

      {filtrados.length === 0 && (
        <EmptyState icon={Sparkles} titulo="Nenhum roteiro salvo para este produto" />
      )}

      <div className="flex flex-col gap-2">
        {filtrados.map((roteiro) => (
          <Card key={roteiro.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge tone="neutral">v{roteiro.versao}</Badge>
                <Badge tone="neutral" className="capitalize">
                  {roteiro.publico}
                </Badge>
                {roteiro.geradoPorIa && <Badge tone="accent">Gemini</Badge>}
              </div>
            </div>
            <p className="text-body-strong font-medium mb-1">{roteiro.gancho}</p>
            <p className="text-body text-neutral-600 line-clamp-2">{roteiro.corpo}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
