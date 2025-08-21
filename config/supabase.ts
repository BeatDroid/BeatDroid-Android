// lib/supabase.ts
import { createClient, processLock } from "@supabase/supabase-js";
import { SearchHistory } from "@/db/schema";
import { mmkvStorage } from "@/utils/storage-utils";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

export const supabase = createClient<SearchHistory>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: mmkvStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  },
);
