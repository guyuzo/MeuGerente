import { ChevronLeft, ChevronRight } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ErrorState } from "../../components/ui/ErrorState";
import { Field, Input } from "../../components/ui/Input";
import { Spinner } from "../../components/ui/Spinner";
import { useConteudos } from "../../hooks/useConteudos";
import { useMeta, useSalvarMeta } from "../../hooks/useMetas";
import { useResumoVendas } from "../../hooks/useVendas";
import { NOMES_MES } from "../../lib/calendar-utils";
import { formatarMoeda } from "../../lib/utils";

const formatadorDecimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

function chaveMes(data: Date): string {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
}

/** Dias que ainda dá pra usar no mês: mês futuro = todos, mês passado = zero, mês atual = de hoje até o fim. */
function diasRestantes(referencia: Date): { restantes: number; total: number } {
  const hoje = new Date();
  const total = new Date(referencia.getFullYear(), referencia.getMonth() + 1, 0).getDate();
  const diferenca = referencia.getFullYear() * 12 + referencia.getMonth() - (hoje.getFullYear() * 12 + hoje.getMonth());
  if (diferenca < 0) return { restantes: 0, total };
  if (diferenca > 0) return { restantes: total, total };
  return { restantes: total - hoje.getDate() + 1, total };
}

interface ProgressoMetaProps {
  titulo: string;
  feito: number;
  meta: number;
  formatar: (valor: number) => string;
  /** Texto do cálculo automático, ex.: "3,2 vídeos por dia". Vazio quando não há meta ou o mês acabou. */
  ritmo?: string;
}

function ProgressoMeta({ titulo, feito, meta, formatar, ritmo }: ProgressoMetaProps) {
  const percentual = meta > 0 ? Math.min(100, (feito / meta) * 100) : 0;
  return (
    <Card className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-h3 font-sans text-neutral-900">{titulo}</h2>
        <span className="text-caption text-neutral-600 tabular-nums">
          {formatar(feito)} de {formatar(meta)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-neutral-200">
        <div className="h-full rounded-full bg-purple-400" style={{ width: `${percentual}%` }} />
      </div>
      <p className="text-body text-neutral-900">{meta > 0 ? (ritmo ?? "—") : "Defina uma meta acima pra ver o ritmo."}</p>
    </Card>
  );
}

export function MetaPage() {
  const [referencia, setReferencia] = useState(new Date());
  const mes = chaveMes(referencia);

  const periodo = useMemo(() => {
    const inicio = new Date(referencia.getFullYear(), referencia.getMonth(), 1);
    const fim = new Date(referencia.getFullYear(), referencia.getMonth() + 1, 1);
    return { inicio: inicio.toISOString(), fim: fim.toISOString() };
  }, [referencia]);

  const metaQuery = useMeta(mes);
  const salvar = useSalvarMeta(mes);
  const conteudosQuery = useConteudos();
  const resumoQuery = useResumoVendas(periodo);

  const [videos, setVideos] = useState("");
  const [faturamento, setFaturamento] = useState("");
  const [lives, setLives] = useState("");
  const [nivel, setNivel] = useState("");

  useEffect(() => {
    const meta = metaQuery.data ?? undefined;
    setVideos(meta ? String(meta.videos) : "");
    setFaturamento(meta ? String(meta.faturamento) : "");
    setLives(meta ? String(meta.lives) : "");
    setNivel(meta ? String(meta.nivel) : "");
  }, [metaQuery.data, mes]);

  function navegar(direcao: -1 | 0 | 1) {
    if (direcao === 0) return setReferencia(new Date());
    setReferencia((atual) => new Date(atual.getFullYear(), atual.getMonth() + direcao, 1));
  }

  function handleSalvar(e: FormEvent) {
    e.preventDefault();
    salvar.mutate({
      videos: Number(videos) || 0,
      faturamento: Number(faturamento.replace(",", ".")) || 0,
      lives: Number(lives) || 0,
      nivel: Number(nivel) || 0,
    });
  }

  const publicadosNoMes = useMemo(
    () =>
      (conteudosQuery.data ?? []).filter((c) => {
        if (c.status !== "publicado" || !c.dataPublicacao) return false;
        const data = new Date(c.dataPublicacao);
        return data >= new Date(periodo.inicio) && data < new Date(periodo.fim);
      }),
    [conteudosQuery.data, periodo],
  );
  const videosFeitos = publicadosNoMes.filter((c) => c.formato !== "live").length;
  const livesFeitas = publicadosNoMes.filter((c) => c.formato === "live").length;
  const gmvDoMes = resumoQuery.data?.gmvTotal ?? 0;

  const meta = metaQuery.data ?? undefined;
  const { restantes, total } = diasRestantes(referencia);
  const mesEncerrado = restantes === 0;
  const semanasRestantes = restantes / 7;

  const faltamVideos = Math.max(0, (meta?.videos ?? 0) - videosFeitos);
  const faltaFaturar = Math.max(0, (meta?.faturamento ?? 0) - gmvDoMes);
  const faltamLives = Math.max(0, (meta?.lives ?? 0) - livesFeitas);

  function ritmo(falta: number, unidade: (valor: string) => string, porSemana = false): string {
    if (falta === 0) return "Meta batida.";
    if (mesEncerrado) return `Mês encerrado — faltaram ${unidade(formatadorDecimal.format(falta))}.`;
    const divisor = porSemana ? semanasRestantes : restantes;
    return `${unidade(formatadorDecimal.format(Math.ceil((falta / divisor) * 10) / 10))} ${porSemana ? "por semana" : "por dia"}`;
  }

  const carregando = metaQuery.isLoading || conteudosQuery.isLoading;
  const comErro = metaQuery.isError || conteudosQuery.isError;

  return (
    <div>
      <PageHeader titulo="Meta" descricao="Defina as metas do mês — o app calcula quanto falta por dia." />

      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          aria-label="Mês anterior"
          onClick={() => navegar(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-150"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-h3 text-neutral-900 w-40 text-center">
          {NOMES_MES[referencia.getMonth()]} {referencia.getFullYear()}
        </span>
        <button
          type="button"
          aria-label="Próximo mês"
          onClick={() => navegar(1)}
          className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-150"
        >
          <ChevronRight size={16} />
        </button>
        <Button variant="secondary" onClick={() => navegar(0)}>
          Mês atual
        </Button>
      </div>

      {carregando && <Spinner label="Carregando metas..." />}
      {comErro && <ErrorState onTentarNovamente={() => metaQuery.refetch()} />}

      {!carregando && !comErro && (
        <div className="space-y-6">
          <form onSubmit={handleSalvar}>
            <Card className="space-y-4">
              <h2 className="text-h2">Metas do mês</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Field label="Meta de vídeos" htmlFor="metaVideos">
                  <Input id="metaVideos" type="number" min={0} inputMode="numeric" value={videos} onChange={(e) => setVideos(e.target.value)} />
                </Field>
                <Field label="Meta de faturamento (R$)" htmlFor="metaFaturamento">
                  <Input id="metaFaturamento" type="number" min={0} step="0.01" inputMode="decimal" value={faturamento} onChange={(e) => setFaturamento(e.target.value)} />
                </Field>
                <Field label="Meta de lives" htmlFor="metaLives">
                  <Input id="metaLives" type="number" min={0} inputMode="numeric" value={lives} onChange={(e) => setLives(e.target.value)} />
                </Field>
                <Field label="Meta de nível" htmlFor="metaNivel">
                  <Input id="metaNivel" type="number" min={0} inputMode="numeric" value={nivel} onChange={(e) => setNivel(e.target.value)} />
                </Field>
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={salvar.isPending}>
                  {salvar.isPending ? "Salvando..." : "Salvar metas"}
                </Button>
                {salvar.isSuccess && <span className="text-caption text-neutral-600">Metas salvas.</span>}
                {salvar.isError && <span className="text-caption text-error">Não foi possível salvar. Tente de novo.</span>}
              </div>
            </Card>
          </form>

          <p className="text-caption text-neutral-600">
            {mesEncerrado
              ? "Mês encerrado."
              : `Faltam ${restantes} de ${total} dias no mês (contando hoje).`}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ProgressoMeta
              titulo="Vídeos"
              feito={videosFeitos}
              meta={meta?.videos ?? 0}
              formatar={(v) => String(v)}
              ritmo={ritmo(faltamVideos, (v) => `${v} ${v === "1" ? "vídeo" : "vídeos"}`)}
            />
            <ProgressoMeta
              titulo="Faturamento (GMV)"
              feito={gmvDoMes}
              meta={meta?.faturamento ?? 0}
              formatar={formatarMoeda}
              ritmo={ritmo(faltaFaturar, (v) => `R$ ${v}`)}
            />
            <ProgressoMeta
              titulo="Lives"
              feito={livesFeitas}
              meta={meta?.lives ?? 0}
              formatar={(v) => String(v)}
              ritmo={ritmo(faltamLives, (v) => `${v} ${v === "1" ? "live" : "lives"}`, true)}
            />
            <Card className="space-y-3">
              <h2 className="text-h3 font-sans text-neutral-900">Nível</h2>
              <p className="text-display tabular-nums text-neutral-900">{meta?.nivel ? `Nível ${meta.nivel}` : "—"}</p>
              <p className="text-body text-neutral-600">Meta de nível do mês — o acompanhamento é manual.</p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
