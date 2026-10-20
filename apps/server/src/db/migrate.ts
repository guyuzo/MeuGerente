import "dotenv/config";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./client.js";

console.log("Rodando migrations...");
await migrate(db, { migrationsFolder: "./src/db/migrations" });
console.log("Migrations aplicadas.");
process.exit(0);
