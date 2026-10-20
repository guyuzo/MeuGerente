import { app } from "./app.js";

const porta = process.env.PORT ?? 3001;

app.listen(porta, () => {
  console.log(`apps/server rodando em http://localhost:${porta}`);
});
