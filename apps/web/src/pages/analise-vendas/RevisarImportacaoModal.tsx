import type { ProdutoOverrideImportacao, ProdutoSugeridoImportacao } from "@meugerente/shared";
import { useEffect, useState } from "react";
import { CategoriaPicker } from "../../components/shared";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";

interface RevisarImportacaoModalProps {
  aberto: boolean;
  produtosNovos: ProdutoSugeridoImportacao[];
  confirmando: boolean;
  erro?: string;
  onFechar: () => void;
  onConfirmar: (overrides: Record<string, ProdutoOverrideImportacao>) => void;
}

/** Antes de criar produto novo a partir da planilha, o usuário revisa/edita nome e categoria aqui. */
export function RevisarImportacaoModal({
  aberto,
  produtosNovos,
  confirmando,
  erro,
  onFechar,
  onConfirmar,
}: RevisarImportacaoModalProps) {
  const [edicoes, setEdicoes] = useState<Record<string, ProdutoOverrideImportacao>>({});

  useEffect(() => {
    if (!aberto) return;
    setEdicoes(
      Object.fromEntries(produtosNovos.map((p) => [p.nomeImportado, { nome: p.nomeSugerido, categoriaId: undefined }])),
    );
  }, [aberto, produtosNovos]);

  function atualizarNome(nomeImportado: string, nome: string) {
    setEdicoes((atual) => ({ ...atual, [nomeImportado]: { ...atual[nomeImportado], nome } }));
  }

  function atualizarCategoria(nomeImportado: string, categoriaId: string | undefined) {
    setEdicoes((atual) => ({ ...atual, [nomeImportado]: { ...atual[nomeImportado], categoriaId } }));
  }

  return (
    <Modal aberto={aberto} titulo={`${produtosNovos.length} produto(s) novo(s) na planilha`} onFechar={onFechar}>
      <div className="space-y-4">
        <p className="text-caption text-neutral-600">
          Confira o nome e escolha a categoria antes de criar. O nome exato da planilha fica guardado por baixo dos
          panos, então reimportar depois não duplica mesmo se você renomear aqui.
        </p>

        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
          {produtosNovos.map((produto) => {
            const edicao = edicoes[produto.nomeImportado] ?? { nome: produto.nomeSugerido, categoriaId: undefined };
            return (
              <div key={produto.nomeImportado} className="p-3 rounded-md bg-neutral-100 space-y-3">
                <p className="text-micro text-neutral-600 truncate" title={produto.nomeImportado}>
                  Na planilha: {produto.nomeImportado} · {produto.linhas} pedido(s)
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Field label="Nome" htmlFor={`nome-${produto.nomeImportado}`} className="flex-1 min-w-0">
                    <Input
                      id={`nome-${produto.nomeImportado}`}
                      value={edicao.nome ?? ""}
                      onChange={(e) => atualizarNome(produto.nomeImportado, e.target.value)}
                    />
                  </Field>
                  <div className="sm:w-48 shrink-0">
                    <Field label="Categoria" htmlFor={`categoria-${produto.nomeImportado}`}>
                      <CategoriaPicker
                        value={edicao.categoriaId}
                        onChange={(categoriaId) => atualizarCategoria(produto.nomeImportado, categoriaId)}
                      />
                    </Field>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {erro && <p className="text-caption text-error">{erro}</p>}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1 justify-center" onClick={onFechar} disabled={confirmando}>
            Cancelar
          </Button>
          <Button className="flex-1 justify-center" onClick={() => onConfirmar(edicoes)} disabled={confirmando}>
            {confirmando ? "Importando..." : "Confirmar e importar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
