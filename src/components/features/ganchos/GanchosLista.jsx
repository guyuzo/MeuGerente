import { GanchoCard } from './GanchoCard'

// Visao flat: todos os ganchos empilhados, sem agrupar por status.
export function GanchosLista({ ganchos, nomeSubcategoria, onDefinirStatus, onRemover }) {
  if (ganchos.length === 0) {
    return <p className="text-sm text-[var(--text-tertiary)]">Nenhum gancho cadastrado ainda.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {ganchos.map((gancho) => (
        <GanchoCard
          key={gancho.id}
          gancho={gancho}
          nomeSubcategoria={nomeSubcategoria(gancho.subcategoriaId)}
          onDefinirStatus={onDefinirStatus}
          onRemover={onRemover}
        />
      ))}
    </div>
  )
}
