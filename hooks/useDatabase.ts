import migration from "@/drizzle/migrations";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import * as SQLite from "expo-sqlite";
import * as schema from "@/db/schema";
import {useDrizzleStudio} from "expo-drizzle-studio-plugin";

const expo = SQLite.openDatabaseSync("db.db");
const db = drizzle(expo, { schema });

export default function useDatabase() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  __DEV__ && useDrizzleStudio(expo);
  const { success, error } = useMigrations(db, migration);
  return { success, error, db };
}