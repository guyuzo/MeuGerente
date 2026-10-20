const DIA_MS = 24 * 60 * 60 * 1000;

export function inicioDoDia(data: Date): Date {
  const copia = new Date(data);
  copia.setHours(0, 0, 0, 0);
  return copia;
}

export function mesmoDia(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

export function chaveDia(data: Date): string {
  return inicioDoDia(data).toISOString().slice(0, 10);
}

export function inicioDaSemana(data: Date): Date {
  const copia = inicioDoDia(data);
  copia.setDate(copia.getDate() - copia.getDay());
  return copia;
}

export function somarDias(data: Date, dias: number): Date {
  return new Date(data.getTime() + dias * DIA_MS);
}

/** Matriz de semanas (6x7) cobrindo o mês, com dias do mês anterior/seguinte para completar a grade. */
export function matrizDoMes(referencia: Date): Date[][] {
  const primeiroDiaMes = new Date(referencia.getFullYear(), referencia.getMonth(), 1);
  const inicioGrade = inicioDaSemana(primeiroDiaMes);

  const semanas: Date[][] = [];
  let cursor = inicioGrade;
  for (let semana = 0; semana < 6; semana++) {
    const dias: Date[] = [];
    for (let dia = 0; dia < 7; dia++) {
      dias.push(cursor);
      cursor = somarDias(cursor, 1);
    }
    semanas.push(dias);
  }
  return semanas;
}

export function diasDaSemana(referencia: Date): Date[] {
  const inicio = inicioDaSemana(referencia);
  return Array.from({ length: 7 }, (_, i) => somarDias(inicio, i));
}

export const NOMES_MES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export const NOMES_DIA_CURTO = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
