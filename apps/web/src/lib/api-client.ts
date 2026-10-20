// Em produção (Vercel) a API mora no mesmo domínio, em /api — por isso o padrão é caminho relativo.
const BASE_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:3001" : "");

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function tratarResposta<T>(resposta: Response): Promise<T> {
  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => undefined);
    throw new ApiError(corpo?.mensagem ?? corpo?.erro ?? `Erro ${resposta.status}`, resposta.status);
  }
  if (resposta.status === 204) return undefined as T;
  return resposta.json() as Promise<T>;
}

/** O cookie de sessão viaja em toda chamada (credentials: include) — o servidor responde 401 sem ele. */
function requisitar<T>(caminho: string, init: RequestInit = {}): Promise<T> {
  return fetch(`${BASE_URL}${caminho}`, { ...init, credentials: "include" }).then((r) => tratarResposta<T>(r));
}

function comJson(metodo: string, corpo: unknown): RequestInit {
  return { method: metodo, headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) };
}

/** Cliente HTTP fino para a API do apps/server — todo repositório da Fase 2 fala com o banco só por aqui. */
export const apiClient = {
  get<T>(caminho: string): Promise<T> {
    return requisitar<T>(caminho);
  },
  post<T>(caminho: string, corpo: unknown): Promise<T> {
    return requisitar<T>(caminho, comJson("POST", corpo));
  },
  /** Sem Content-Type manual de propósito — o navegador define o boundary do multipart sozinho. */
  postForm<T>(caminho: string, formData: FormData): Promise<T> {
    return requisitar<T>(caminho, { method: "POST", body: formData });
  },
  patch<T>(caminho: string, corpo: unknown): Promise<T> {
    return requisitar<T>(caminho, comJson("PATCH", corpo));
  },
  delete<T>(caminho: string): Promise<T> {
    return requisitar<T>(caminho, { method: "DELETE" });
  },
};
