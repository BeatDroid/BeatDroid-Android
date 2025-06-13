import migration from "@/drizzle/migrations";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import * as SQLite from "expo-sqlite";

const expo = SQLite.openDatabaseSync("db.db");
const db = drizzle(expo);

export default function useDatabase() {
  const { success, error } = useMigrations(db, migration);
  return { success, error, db };
}