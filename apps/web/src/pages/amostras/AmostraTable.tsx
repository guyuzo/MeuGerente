import type { Amostra, Produto } from "@meugerente/shared";
import { ProductThumb, StatusPill, amostraStatusMap } from "../../components/shared";
import { DeadlineTag } from "../../components/shared/DeadlineTag";
import { Table, Tbody, Td, Th, Thead, Tr } from "../../components/ui/Table";
import { diasDesde, formatarData } from "../../lib/utils";

interface AmostraTableProps {
  amostras: Amostra[];
  produtosPorId: Map<string, Produto>;
}

export function AmostraTable({ amostras, produtosPorId }: AmostraTableProps) {
  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Produto</Th>
          <Th>Status</Th>
          <Th>Origem</Th>
          <Th>Solicitada em</Th>
          <Th>Prazo / dias publicado</Th>
        </Tr>
      </Thead>
      <Tbody>
        {amostras.map((amostra) => {
          const produto = produtosPorId.get(amostra.produtoId);
          return (
            <Tr key={amostra.id}>
              <Td>
                <div className="flex items-center gap-3">
                  <ProductThumb emoji={produto?.emoji} imagemUrl={produto?.imagemUrl} nome={produto?.nome ?? "Produto"} size="sm" />
                  <span className="text-body-strong font-medium">{produto?.nome ?? "Produto removido"}</span>
                </div>
              </Td>
              <Td>
                <StatusPill {...amostraStatusMap[amostra.status]} />
              </Td>
              <Td className="capitalize">{amostra.origem}</Td>
              <Td className="text-neutral-600">{formatarData(amostra.dataSolicitacao)}</Td>
              <Td>
                {amostra.status === "para_publicar" && <DeadlineTag prazoConteudo={amostra.prazoConteudo} />}
                {amostra.status === "publicado" && amostra.publicadoEm && (
                  <span className="text-blue-700 font-medium">
                    {diasDesde(amostra.publicadoEm)} {diasDesde(amostra.publicadoEm) === 1 ? "dia" : "dias"} publicado
                  </span>
                )}
                {amostra.status !== "para_publicar" && amostra.status !== "publicado" && (
                  <span className="text-neutral-600">—</span>
                )}
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
}
