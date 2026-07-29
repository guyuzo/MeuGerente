/**
 * Balao de leitura posicionado sobre a marca em foco. Fica ancorado pelo
 * centro-inferior e nunca captura ponteiro (`pointer-events-none`), senao
 * ele mesmo tiraria o hover da marca que o abriu.
 */
export function ChartTooltip({ x, y, titulo, valor, largura }) {
  const margem = 60
  const xLimitado = Math.min(Math.max(x, margem), Math.max(margem, largura - margem))

  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface-raised)] px-2 py-1 whitespace-nowrap shadow-[var(--shadow-elevation-2)]"
      style={{ left: xLimitado, top: y - 10 }}
    >
      <div className="text-[11px] text-[var(--text-secondary)]">{titulo}</div>
      <div className="text-xs font-semibold [font-variant-numeric:tabular-nums]">{valor}</div>
    </div>
  )
}
