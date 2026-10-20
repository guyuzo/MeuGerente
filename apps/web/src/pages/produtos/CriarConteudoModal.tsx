import type { ConteudoFormato, Produto } from "@meugerente/shared";
import { type FormEvent, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import { useCriarConteudo } from "../../hooks/useConteudos";

interface CriarConteudoModalProps {
  produto?: Produto;
  onFechar: () => void;
}

/** Ação "Criar conteúdo" do módulo Produtos — agenda o conteúdo, que passa a aparecer no Calendário. */
export function CriarConteudoModal({ produto, onFechar }: CriarConteudoModalProps) {
  const [titulo, setTitulo] = useState("");
  const [formato, setFormato] = useState<ConteudoFormato>("video_curto");
  const [dataPrevista, setDataPrevista] = useState("");
  const criar = useCriarConteudo();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!produto || !titulo.trim()) return;
    await criar.mutateAsync({
      produtoId: produto.id,
      titulo,
      formato,
      dataPrevista: dataPrevista ? new Date(dataPrevista).toISOString() : undefined,
    });
    onFechar();
    setTitulo("");
    setFormato("video_curto");
    setDataPrevista("");
  }

  return (
    <Modal aberto={!!produto} titulo={`Criar conteúdo — ${produto?.nome ?? ""}`} onFechar={onFechar}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Título" htmlFor="titulo">
          <Input id="titulo" required value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </Field>

        <Field label="Formato" htmlFor="formato">
          <Select id="formato" value={formato} onChange={(e) => setFormato(e.target.value as ConteudoFormato)}>
            <option value="video_curto">Vídeo curto</option>
            <option value="live">Live</option>
            <option value="carrossel">Carrossel</option>
            <option value="unboxing">Unboxing</option>
          </Select>
        </Field>

        <Field label="Data prevista" htmlFor="dataPrevista">
          <Input
            id="dataPrevista"
            type="date"
            value={dataPrevista}
            onChange={(e) => setDataPrevista(e.target.value)}
          />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="submit" disabled={criar.isPending}>
            {criar.isPending ? "Salvando..." : "Agendar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
