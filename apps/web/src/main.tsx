import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ApiError } from "./lib/api-client";
import { CHAVE_SESSAO } from "./hooks/useSessao";
import "./index.css";
import { router } from "./router";

const queryClient: QueryClient = new QueryClient({
  queryCache: new QueryCache({
    // Sessão expirou no meio do uso: volta pra tela de login em vez de mostrar erro em cada tela.
    onError: (erro, query) => {
      if (erro instanceof ApiError && erro.status === 401 && query.queryKey[0] !== CHAVE_SESSAO[0]) {
        queryClient.setQueryData(CHAVE_SESSAO, null);
      }
    },
  }),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
