import { GoogleGenAI } from "@google/genai";

// Confira o identificador atual na documentação do Google antes de ir pra produção — muda com frequência (PRD seção 9.2).
const MODELO_RAPIDO = process.env.GEMINI_MODEL_RAPIDO ?? "gemini-2.5-flash";

let cliente: GoogleGenAI | undefined;

export function geminiDisponivel(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

function obterCliente(): GoogleGenAI {
  if (!geminiDisponivel()) {
    throw new Error("GEMINI_API_KEY não configurada em apps/server/.env");
  }
  cliente ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return cliente;
}

/** Chamada ao modelo rápido com saída JSON forçada pelo schema — nunca texto corrido (PRD seção 9.3, regra 2). */
export async function gerarJson<T>(params: {
  systemInstruction: string;
  prompt: string;
  responseSchema: object;
}): Promise<T> {
  const resposta = await obterCliente().models.generateContent({
    model: MODELO_RAPIDO,
    contents: params.prompt,
    config: {
      systemInstruction: params.systemInstruction,
      responseMimeType: "application/json",
      responseSchema: params.responseSchema,
    },
  });

  const texto = resposta.text;
  if (!texto) throw new Error("Gemini não retornou conteúdo");
  return JSON.parse(texto) as T;
}
