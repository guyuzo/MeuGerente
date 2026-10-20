import type { Conteudo, ConteudoFormato, Produto, RoteiroPublico } from "@meugerente/shared";
import { Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { ErrorState } from "../../components/ui/ErrorState";
import { Field, Input, Textarea } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { ApiError } from "../../lib/api-client";
import { useCriarRoteiro, useGerarGanchos, useGerarRoteiro } from "../../hooks/useRoteiros";

interface RoteiroFormProps {
  produto: Produto;
  conteudosDoProduto: Conteudo[];
  onSalvo: () => void;
}

const PUBLICOS: { value: RoteiroPublico; label: string }[] = [
  { value: "frio", label: "Frio — nunca viu o produto" },
  { value: "morno", label: "Morno — já viu antes" },
  { value: "quente", label: "Quente — já demonstrou interesse" },
];

const FORMATOS: { value: ConteudoFormato; label: string }[] = [
  { value: "video_curto", label: "Vídeo curto" },
  { value: "live", label: "Abertura de live" },
  { value: "carrossel", label: "Carrossel" },
  { value: "unboxing", label: "Unboxing" },
];

/** Fluxo do PRD seção 8.5: escolher público/formato → gerar → editar (gancho/corpo/cta separados) → salvar. */
export function RoteiroForm({ produto, conteudosDoProduto, onSalvo }: RoteiroFormProps) {
  const [publico, setPublico] = useState<RoteiroPublico>("frio");
  const [formato, setFormato] = useState<ConteudoFormato>("video_curto");
  const [duracaoSegundos, setDuracaoSegundos] = useState<number | undefined>(30);
  const [conteudoId, setConteudoId] = useState(conteudosDoProduto[0]?.id ?? "");

  const [gancho, setGancho] = useState("");
  const [corpo, setCorpo] = useState("");
  const [cta, setCta] = useState("");
  const [geradoPorIa, setGeradoPorIa] = useState(false);
  const [modeloIa, setModeloIa] = useState<string | undefined>();
  const [opcoesGancho, setOpcoesGancho] = useState<string[]>([]);

  const gerar = useGerarRoteiro();
  const gerarGanchosMutation = useGerarGanchos();
  const salvar = useCriarRoteiro();

  async function handleGerar() {
    setOpcoesGancho([]);
    try {
      const resultado = await gerar.mutateAsync({ produtoId: produto.id, publico, formato, duracaoSegundos });
      setGancho(resultado.gancho);
      setCorpo(resultado.corpo);
      setCta(resultado.cta);
      setGeradoPorIa(true);
      setModeloIa(resultado.modeloIa);
    } catch {
      // Erro já fica disponível em gerar.error/gerar.isError e é exibido pelo ErrorState abaixo.
    }
  }

  async function handleGerarGanchos() {
    try {
      const resultado = await gerarGanchosMutation.mutateAsync({ produtoId: produto.id, publico, corpo });
      setOpcoesGancho(resultado.ganchos);
    } catch {
      // Erro já fica disponível em gerarGanchosMutation.error/isError.
    }
  }

  async function handleSalvar() {
    if (!conteudoId || !gancho || !corpo || !cta) return;
    try {
      await salvar.mutateAsync({ conteudoId, produtoId: produto.id, publico, gancho, corpo, cta, geradoPorIa, modeloIa });
      onSalvo();
    } catch {
      // Erro já fica disponível em salvar.error/isError e é exibido abaixo do botão.
    }
  }

  const erroGerar = gerar.error instanceof ApiError ? gerar.error : undefined;
  const temRascunho = !!(gancho || corpo || cta);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Público" htmlFor="publico">
          <Select id="publico" value={publico} onChange={(e) => setPublico(e.target.value as RoteiroPublico)}>
            {PUBLICOS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Formato" htmlFor="formato">
          <Select id="formato" value={formato} onChange={(e) => setFormato(e.target.value as ConteudoFormato)}>
            {FORMATOS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Duração (segundos)" htmlFor="duracao">
          <Input
            id="duracao"
            type="number"
            min={5}
            value={duracaoSegundos ?? ""}
            onChange={(e) => setDuracaoSegundos(e.target.value ? Number(e.target.value) : undefined)}
          />
        </Field>
      </div>

      <Button variant="brand" onClick={handleGerar} disabled={gerar.isPending}>
        <Wand2 size={16} />
        {gerar.isPending ? "Gerando..." : "Gerar roteiro"}
      </Button>

      {erroGerar && (
        <ErrorState
          mensagem={
            erroGerar.status === 503
              ? erroGerar.message
              : "Não foi possível gerar o roteiro. Tente novamente."
          }
          onTentarNovamente={handleGerar}
        />
      )}

      {temRascunho && (
        <div className="space-y-4 pt-2 border-t border-neutral-200">
          <Field label="Gancho (os 3 primeiros segundos)" htmlFor="gancho">
            <Textarea id="gancho" value={gancho} onChange={(e) => setGancho(e.target.value)} className="min-h-16" />
          </Field>

          {opcoesGancho.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-caption text-neutral-600">Variações geradas — clique para usar:</span>
              {opcoesGancho.map((opcao, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setGancho(opcao)}
                  className="text-left px-3 py-2 rounded-md bg-neutral-100 hover:bg-neutral-150 text-body"
                >
                  {opcao}
                </button>
              ))}
            </div>
          )}

          <Button
            variant="brand"
            onClick={handleGerarGanchos}
            disabled={!corpo || gerarGanchosMutation.isPending}
          >
            <Sparkles size={16} />
            {gerarGanchosMutation.isPending ? "Gerando..." : "Gerar 3 variações de gancho"}
          </Button>

          <Field label="Corpo" htmlFor="corpo">
            <Textarea id="corpo" value={corpo} onChange={(e) => setCorpo(e.target.value)} className="min-h-32" />
          </Field>

          <Field label="CTA" htmlFor="cta">
            <Textarea id="cta" value={cta} onChange={(e) => setCta(e.target.value)} className="min-h-16" />
          </Field>

          <Field label="Vincular ao conteúdo" htmlFor="conteudoId">
            <Select id="conteudoId" value={conteudoId} onChange={(e) => setConteudoId(e.target.value)}>
              <option value="">Selecione um conteúdo</option>
              {conteudosDoProduto.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.titulo}
                </option>
              ))}
            </Select>
          </Field>

          <Button onClick={handleSalvar} disabled={!conteudoId || salvar.isPending} className="w-full justify-center">
            {salvar.isPending ? "Salvando..." : "Salvar e vincular ao conteúdo"}
          </Button>
          {salvar.isError && <p className="text-caption text-error">Não foi possível salvar. Tente de novo.</p>}
        </div>
      )}
    </div>
  );
}
