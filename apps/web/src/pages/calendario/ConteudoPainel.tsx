import type { Conteudo, Produto } from "@meugerente/shared";
import { useEffect, useState } from "react";
import { conteudoStatusMap, ProductThumb, StatusPill } from "../../components/shared";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { useAtualizarConteudo, useMudarStatusConteudo } from "../../hooks/useConteudos";

interface ConteudoPainelProps {
  conteudo?: Conteudo;
  produto?: Produto;
  onFechar: () => void;
}

/**
 * Painel de detalhe do conteúdo (PRD seção 8.4). Reaproveita o Modal — no mobile já abre como
 * folha de baixo pra cima, cumprindo o mesmo papel do painel lateral do desktop.
 */
export function ConteudoPainel({ conteudo, produto, onFechar }: ConteudoPainelProps) {
  const [dataPrevista, setDataPrevista] = useState("");
  const [linkPublicacao, setLinkPublicacao] = useState("");
  const atualizar = useAtualizarConteudo();
  const mudarStatus = useMudarStatusConteudo();

  useEffect(() => {
    setDataPrevista(conteudo?.dataPrevista ? conteudo.dataPrevista.slice(0, 10) : "");
    setLinkPublicacao(conteudo?.linkPublicacao ?? "");
  }, [conteudo]);

  if (!conteudo) return null;

  async function handleReagendar() {
    if (!conteudo || !dataPrevista) return;
    await atualizar.mutateAsync({ id: conteudo.id, input: { dataPrevista: new Date(dataPrevista).toISOString() } });
  }

  async function handleMarcarPublicado() {
    if (!conteudo) return;
    await atualizar.mutateAsync({ id: conteudo.id, input: { linkPublicacao: linkPublicacao || undefined } });
    await mudarStatus.mutateAsync({ id: conteudo.id, status: "publicado" });
    onFechar();
  }

  return (
    <Modal aberto={!!conteudo} titulo={conteudo.titulo} onFechar={onFechar}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <ProductThumb emoji={produto?.emoji} imagemUrl={produto?.imagemUrl} nome={produto?.nome ?? "Produto"} />
          <div>
            <p className="text-body-strong font-medium">{produto?.nome ?? "Produto removido"}</p>
            <StatusPill {...conteudoStatusMap[conteudo.status]} />
          </div>
        </div>

        <Field label="Data prevista" htmlFor="dataPrevista">
          <div className="flex gap-2">
            <Input
              id="dataPrevista"
              type="date"
              value={dataPrevista}
              onChange={(e) => setDataPrevista(e.target.value)}
            />
            <Button variant="secondary" onClick={handleReagendar} disabled={atualizar.isPending}>
              Salvar
            </Button>
          </div>
        </Field>

        {conteudo.status !== "publicado" && (
          <div className="pt-2 border-t border-neutral-200 space-y-3">
            <Field label="Link de publicação (opcional)" htmlFor="linkPublicacao">
              <Input
                id="linkPublicacao"
                value={linkPublicacao}
                onChange={(e) => setLinkPublicacao(e.target.value)}
                placeholder="https://tiktok.com/..."
              />
            </Field>
            <Button onClick={handleMarcarPublicado} disabled={mudarStatus.isPending} className="w-full justify-center">
              Marcar como publicado
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
