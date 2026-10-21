/**
 * E-mail transacional (hoje só o "esqueci a senha") pela API HTTP do Resend — sem SDK, é um POST.
 * RESEND_API_KEY e EMAIL_REMETENTE ficam só em apps/server/.env (e na Vercel), nunca no apps/web.
 * Sem configuração, quem chama responde 503 explícito — nunca finge que mandou.
 */

export function emailDisponivel(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_REMETENTE);
}

/**
 * Endereço público do app pros links do e-mail. Vem de variável de ambiente e nunca do cabeçalho
 * Host da requisição — senão um atacante forjaria o Host e receberia o link de redefinição.
 */
export function urlDoApp(): string | undefined {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return process.env.WEB_ORIGIN ?? "http://localhost:5173";
  return undefined;
}

export async function enviarEmail(mensagem: { para: string; assunto: string; texto: string; html: string }): Promise<void> {
  const resposta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_REMETENTE,
      to: [mensagem.para],
      subject: mensagem.assunto,
      text: mensagem.texto,
      html: mensagem.html,
    }),
  });
  if (!resposta.ok) {
    throw new Error(`Falha ao enviar e-mail (Resend ${resposta.status}): ${await resposta.text()}`);
  }
}
