import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL não definida. Copie apps/server/.env.example para apps/server/.env e preencha.");
}

// Supabase (pooler) exige SSL e não expõe prepared statements no modo transaction pooling.
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
