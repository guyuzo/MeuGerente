import { Card } from '../Card'

/**
 * Moldura comum dos graficos: titulo, subtitulo, area de desenho e uma
 * tabela equivalente atras de um <details>.
 *
 * A tabela nao e enfeite. O tooltip nunca pode ser o unico caminho ate um
 * valor — quem navega por teclado ou leitor de tela nao tem hover — entao
 * todo grafico carrega o mesmo dado tambem em texto.
 */
export function ChartCard({
  titulo,
  subtitulo,
  children,
  colunas = [],
  linhas = [],
  className = '',
}) {
  // `min-w-0` e obrigatorio: como item de grid/flex, o minimo padrao e
  // `auto` (min-content), entao o SVG desenhado na largura anterior segura a
  // coluna aberta, o ResizeObserver nunca observa a largura menor e o
  // grafico trava largo demais ao encolher a janela.
  return (
    <Card className={`flex min-w-0 flex-col gap-3 ${className}`}>
      <div className="flex flex-col gap-0.5">
        <h3 className="text-md font-semibold">{titulo}</h3>
        {subtitulo && <span className="text-xs text-[var(--text-secondary)]">{subtitulo}</span>}
      </div>

      {children}

      {linhas.length > 0 && (
        <details>
          <summary className="cursor-pointer text-xs text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
            Ver dados em tabela
          </summary>
          <div className="overflow-x-auto">
            <table className="mt-2 w-full min-w-[220px] text-left text-xs">
              <thead>
                <tr className="text-[var(--text-tertiary)]">
                  {colunas.map((coluna) => (
                    <th key={coluna} className="py-1 font-medium">
                      {coluna}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="[font-variant-numeric:tabular-nums]">
                {linhas.map((linha) => (
                  <tr key={linha[0]} className="border-t border-[var(--border-subtle)]">
                    {linha.map((celula, indice) => (
                      <td
                        key={colunas[indice] ?? indice}
                        className="py-1 text-[var(--text-secondary)]"
                      >
                        {celula}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </Card>
  )
}
