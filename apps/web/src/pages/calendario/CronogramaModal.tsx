import type { Produto } from "@meugerente/shared";
import { useMemo, useState } from "react";
import { ProductThumb } from "../../components/shared";
import { Button } from "../../components/ui/Button";
import { Checkbox } from "../../components/ui/Checkbox";
import { Field, Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { useCriarConteudo } from "../../hooks/useConteudos";
import { inicioDoDia, NOMES_DIA_CURTO, somarDias } from "../../lib/calendar-utils";

interface CronogramaModalProps {
  aberto: boolean;
  onFechar: () => void;
  produtos: Produto[];
}

interface ConfigProduto {
  produtoId: string;
  todoDia: boolean;
  vezesPorSemana: number;
}

type Etapa = "selecao" | "checklist";

/** Sugestão de distribuição pros próximos 7 dias — round-robin simples, não é otimizador de verdade. */
function gerarSugestao(configs: ConfigProduto[], produtosPorId: Map<string, Produto>, hoje: Date) {
  const dias = Array.from({ length: 7 }, (_, i) => somarDias(inicioDoDia(hoje), i));
  const porDia: ConfigProduto[][] = dias.map(() => []);

  configs.forEach((config, posicao) => {
    if (config.todoDia) {
      porDia.forEach((lista) => lista.push(config));
      return;
    }
    const n = Math.max(0, Math.min(config.vezesPorSemana, 7));
    if (n === 0) return;
    const passo = 7 / n;
    // Cada produto começa num dia diferente — senão todos caem nos mesmos dias e sobra dia vazio.
    for (let k = 0; k < n; k++) {
      const idx = (Math.round(k * passo) + posicao) % 7;
      porDia[idx].push(config);
    }
  });

  return dias.map((data, i) => ({
    data,
    itens: porDia[i].map((config) => produtosPorId.get(config.produtoId)).filter((p): p is Produto => !!p),
  }));
}

export function CronogramaModal({ aberto, onFechar, produtos }: CronogramaModalProps) {
  const [etapa, setEtapa] = useState<Etapa>("selecao");
  const [metaDiaria, setMetaDiaria] = useState(2);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [configs, setConfigs] = useState<Record<string, ConfigProduto>>({});
  const criar = useCriarConteudo();
  const [criando, setCriando] = useState(false);

  const produtosPorId = useMemo(() => new Map(produtos.map((p) => [p.id, p])), [produtos]);

  function fecharTudo() {
    onFechar();
    setEtapa("selecao");
    setSelecionados(new Set());
    setConfigs({});
    setMetaDiaria(2);
  }

  function alternarProduto(id: string) {
    setSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  function irParaChecklist() {
    if (selecionados.size === 0) return;
    setConfigs((atual) => {
      const novo = { ...atual };
      for (const id of selecionados) {
        if (!novo[id]) novo[id] = { produtoId: id, todoDia: false, vezesPorSemana: 2 };
      }
      return novo;
    });
    setEtapa("checklist");
  }

  const configsSelecionados = [...selecionados].map((id) => configs[id]).filter((c): c is ConfigProduto => !!c);
  const sugestao = useMemo(
    () => gerarSugestao(configsSelecionados, produtosPorId, new Date()),
    [configs, selecionados, produtosPorId],
  );

  async function handleConfirmar() {
    setCriando(true);
    try {
      const tarefas = sugestao.flatMap(({ data, itens }) =>
        itens.map((produto) =>
          criar.mutateAsync({
            produtoId: produto.id,
            titulo: `Vídeo — ${produto.nome}`,
            formato: "video_curto",
            dataPrevista: data.toISOString(),
          }),
        ),
      );
      await Promise.all(tarefas);
      fecharTudo();
    } finally {
      setCriando(false);
    }
  }

  return (
    <Modal aberto={aberto} titulo="Montar cronograma" onFechar={fecharTudo} largura="larga">
      {etapa === "selecao" && (
        <div className="space-y-4">
          <Field label="Quantos vídeos por dia você quer postar, no total?" htmlFor="metaDiaria" className="max-w-xs">
            <Input
              id="metaDiaria"
              type="number"
              min={1}
              max={20}
              value={metaDiaria}
              onChange={(e) => setMetaDiaria(Number(e.target.value) || 1)}
            />
          </Field>

          <div>
            <p className="text-caption text-neutral-600 mb-2">
              Quais produtos entram no cronograma? {selecionados.size > 0 && `(${selecionados.size} selecionado(s))`}
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 max-h-[50vh] overflow-y-auto scroll-fino pr-1">
              {produtos.map((produto) => (
                <Checkbox
                  key={produto.id}
                  id={`produto-${produto.id}`}
                  className="h-11 px-2 rounded-md hover:bg-neutral-150 w-full"
                  checked={selecionados.has(produto.id)}
                  onChange={() => alternarProduto(produto.id)}
                  label={
                    <span className="flex items-center gap-3">
                      <ProductThumb emoji={produto.emoji} imagemUrl={produto.imagemUrl} nome={produto.nome} size="sm" />
                      <span className="text-body">{produto.nome}</span>
                    </span>
                  }
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={fecharTudo}>
              Cancelar
            </Button>
            <Button type="button" onClick={irParaChecklist} disabled={selecionados.size === 0}>
              Continuar
            </Button>
          </div>
        </div>
      )}

      {etapa === "checklist" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <p className="text-caption text-neutral-600 mb-2">Quantas vezes cada produto entra por semana</p>
          <div className="space-y-3 lg:max-h-[52vh] overflow-y-auto scroll-fino pr-1">
            {configsSelecionados.map((config) => {
              const produto = produtosPorId.get(config.produtoId);
              if (!produto) return null;
              return (
                <div key={config.produtoId} className="p-3 rounded-md bg-neutral-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <ProductThumb emoji={produto.emoji} imagemUrl={produto.imagemUrl} nome={produto.nome} size="sm" />
                    <span className="text-body-strong font-medium">{produto.nome}</span>
                  </div>
                  <Checkbox
                    id={`todo-dia-${config.produtoId}`}
                    checked={config.todoDia}
                    onChange={(todoDia) =>
                      setConfigs((atual) => ({
                        ...atual,
                        [config.produtoId]: { ...config, todoDia },
                      }))
                    }
                    label="Precisa ser postado todo dia?"
                  />
                  {!config.todoDia && (
                    <div className="flex items-center gap-2">
                      <span className="text-caption text-neutral-600">Vezes por semana:</span>
                      <input
                        type="number"
                        min={1}
                        max={7}
                        value={config.vezesPorSemana}
                        onChange={(e) =>
                          setConfigs((atual) => ({
                            ...atual,
                            [config.produtoId]: { ...config, vezesPorSemana: Number(e.target.value) || 1 },
                          }))
                        }
                        className="w-16 h-8 px-2 rounded-md bg-neutral-150 text-body text-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          </div>

          <div className="lg:border-l lg:border-neutral-200 lg:pl-6">
            <p className="text-caption text-neutral-600 mb-2">Sugestão pros próximos 7 dias (meta: {metaDiaria} por dia)</p>
            <div className="space-y-2 lg:max-h-[52vh] overflow-y-auto scroll-fino pr-1">
              {sugestao.map(({ data, itens }) => {
                const acimaDaMeta = itens.length > metaDiaria;
                return (
                  <div key={data.toISOString()} className="p-3 rounded-md bg-neutral-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-body-strong font-medium text-neutral-900">
                        {NOMES_DIA_CURTO[data.getDay()]}, {data.getDate()}
                      </span>
                      <span className={`text-caption ${acimaDaMeta ? "text-warning" : "text-neutral-600"}`}>
                        {itens.length} {itens.length === 1 ? "vídeo" : "vídeos"}
                        {acimaDaMeta ? " — acima da meta" : ""}
                      </span>
                    </div>
                    {itens.length === 0 ? (
                      <p className="text-caption text-neutral-500">Nada nesse dia</p>
                    ) : (
                      <ul className="space-y-0.5">
                        {itens.map((p, i) => (
                          <li key={`${p.id}-${i}`} className="text-body text-neutral-900">
                            {p.nome}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          </div>

          <div className="flex justify-between gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEtapa("selecao")}>
              Voltar
            </Button>
            <Button type="button" onClick={handleConfirmar} disabled={criando}>
              {criando ? "Criando..." : "Confirmar e criar"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
