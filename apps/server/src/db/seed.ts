import "dotenv/config";
import { db } from "./client.js";
import { amostras, categorias, conteudos, produtos } from "./schema.js";

function diasOffset(n: number): string {
  const data = new Date();
  data.setDate(data.getDate() + n);
  return data.toISOString();
}

/** Popula um catálogo de exemplo (mesmo cenário da Fase 1) para haver algo pra ver assim que o banco conecta. */
async function seed() {
  console.log("Semeando banco...");

  const [catBeleza, catCasa, catSaude] = await db
    .insert(categorias)
    .values([
      { nome: "Beleza", cor: "pink", emoji: "💄" },
      { nome: "Casa", cor: "amber", emoji: "🏠" },
      { nome: "Saúde", cor: "teal", emoji: "💊" },
    ])
    .returning();

  const [escova, organizador, , luminaria, pinceis] = await db
    .insert(produtos)
    .values([
      {
        nome: "Escova secadora 3 em 1",
        emoji: "💇",
        loja: "Bela Casa Store",
        categoriaId: catBeleza.id,
        preco: 189.9,
        comissaoPct: 20,
        comissaoValor: 37.98,
        status: "ativo",
        notaPotencial: 82,
      },
      {
        nome: "Organizador de gaveta modular",
        emoji: "🗄️",
        loja: "Casa Prática",
        categoriaId: catCasa.id,
        preco: 59.9,
        comissaoPct: 15,
        comissaoValor: 8.99,
        status: "radar",
        notaPotencial: 64,
      },
      {
        nome: "Mini massageador portátil",
        emoji: "💆",
        loja: "Vida Leve",
        categoriaId: catSaude.id,
        preco: 79.9,
        comissaoPct: 25,
        comissaoValor: 19.98,
        status: "radar",
      },
      {
        nome: "Luminária de mesa dobrável",
        emoji: "💡",
        loja: "Luz & Cia",
        categoriaId: catCasa.id,
        preco: 99.9,
        comissaoPct: 18,
        comissaoValor: 17.98,
        status: "ativo",
        notaPotencial: 71,
      },
      {
        nome: "Kit pincéis de maquiagem",
        emoji: "💄",
        loja: "Bela Casa Store",
        categoriaId: catBeleza.id,
        preco: 45,
        comissaoPct: 22,
        comissaoValor: 9.9,
        status: "pausado",
        notaPotencial: 38,
      },
    ])
    .returning();

  const [amostraEscova, amostraLuminaria] = await db
    .insert(amostras)
    .values([
      {
        produtoId: escova.id,
        status: "para_publicar",
        origem: "gratuita",
        custo: 0,
        dataSolicitacao: diasOffset(-12),
        dataRecebimento: diasOffset(-6),
        prazoConteudo: diasOffset(-1),
      },
      {
        produtoId: luminaria.id,
        status: "para_publicar",
        origem: "gratuita",
        custo: 0,
        dataSolicitacao: diasOffset(-8),
        dataRecebimento: diasOffset(-3),
        prazoConteudo: diasOffset(3),
      },
      {
        produtoId: organizador.id,
        status: "publicado",
        origem: "gratuita",
        custo: 0,
        dataSolicitacao: diasOffset(-4),
        publicadoEm: diasOffset(-2),
      },
      {
        produtoId: pinceis.id,
        status: "vendida",
        origem: "comprada",
        custo: 45,
        dataSolicitacao: diasOffset(-15),
        publicadoEm: diasOffset(-10),
      },
    ])
    .returning();

  await db.insert(conteudos).values([
    {
      produtoId: escova.id,
      amostraId: amostraEscova.id,
      titulo: "Unboxing escova secadora 3 em 1",
      formato: "unboxing",
      status: "gravado",
      dataPrevista: diasOffset(1),
    },
    {
      produtoId: luminaria.id,
      amostraId: amostraLuminaria.id,
      titulo: "3 usos da luminária dobrável",
      formato: "video_curto",
      status: "ideia",
      dataPrevista: diasOffset(4),
    },
    {
      produtoId: escova.id,
      titulo: "Resenha 7 dias depois",
      formato: "video_curto",
      status: "publicado",
      dataPrevista: diasOffset(-5),
      dataPublicacao: diasOffset(-5),
    },
  ]);

  console.log("Banco semeado.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
