import Database from "@tauri-apps/plugin-sql";
import { runMigrations } from "./migrations";
import { DATABASE_URL } from "./schema";

let connection: Database | undefined;

export async function initDatabase() {
  if (connection) return connection;

  connection = await Database.load(DATABASE_URL);
  await runMigrations(connection);

  return connection;
}
