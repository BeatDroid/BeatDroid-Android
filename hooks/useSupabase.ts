import { useNetwork } from "@/contexts/network-context";
import useDatabase from "@/hooks/useDatabase";
import { useCallback, useState } from "react";
import { NewSearchHistory, searchHistoryTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { supabase } from "@/config/supabase";
import { ThemeTypes } from "@/lib/types";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";

interface SupabaseRecord {
  id: number;
  search_type: "Track" | "Album";
  search_param: string;
  artist_name: string;
  theme: ThemeTypes;
  accent_line: boolean;
  created_at: number;
  blurhash: string | null;
  synced: boolean;
  local_id: number;
  user_id: string;
}

export default function useSupabase() {
  const network = useNetwork();
  const { db, success, error } = useDatabase();
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIEND_ID || "",
  });

  const syncToSupabase = useCallback(async () => {
    if (!network) return;
    try {
      const unsyncedRecords = await db
        .select()
        .from(searchHistoryTable)
        .where(eq(searchHistoryTable.synced, false));

      if (unsyncedRecords.length === 0) return;

      const { data: authData } = await supabase.auth.getUser();
      const { error } = await supabase.from("search_history").upsert(
        unsyncedRecords.map(
          (record): SupabaseRecord => ({
            id: record.id,
            search_type: record.searchType,
            search_param: record.searchParam,
            artist_name: record.artistName,
            theme: record.theme,
            accent_line: record.accentLine,
            created_at: record.createdAt.getTime(),
            blurhash: record.blurhash,
            synced: true,
            local_id: record.id,
            user_id: authData?.user?.id || "",
          }),
        ),
      );

      if (error) throw error;

      await db
        .update(searchHistoryTable)
        .set({ synced: true })
        .where(eq(searchHistoryTable.synced, false));
    } catch (e) {
      console.log("Error syncing to Supabase:", e);
    }
  }, [db, network]);

  const syncFromSupabase = useCallback(async () => {
    try {
      const { error, data } = await supabase.from("search_history").select("*");

      if (error) throw error;

      if (data.length === 0) return;

      if (data) {
        const newRecords = data.map(
          (record: SupabaseRecord): NewSearchHistory => ({
            id: record.local_id,
            searchType: record.search_type,
            searchParam: record.search_param,
            artistName: record.artist_name,
            accentLine: record.accent_line,
            blurhash: record.blurhash,
            theme: record.theme,
            createdAt: new Date(record.created_at),
            synced: true,
          }),
        );

        await db
          .insert(searchHistoryTable)
          .values(newRecords)
          .onConflictDoNothing();
      }
    } catch (e) {
      console.log("Error syncing from Supabase:", e);
    }
  }, [db]);

  const supabaseLogin = useCallback(async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      setLoading(true);
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        let { error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: response.data.idToken!,
        });
        if (error) throw { ...error, source: "supabase" };
        setIsLoggedIn(true);
        await syncFromSupabase();
      } else {
        // sign in was cancelled by user
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            // operation (eg. sign in) already in progress
            console.log("Sign in in progress");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // Android only, play services not available or outdated
            console.log("Play services not available or outdated");
            break;
          default:
            // some other error happened
            console.log("Error signing in with Google:", error.message);
        }
      } else {
        console.log("Error signing in:", error);
        // an error that's not related to google sign in occurred
      }
    } finally {
      setLoading(false);
    }
  }, [syncFromSupabase]);

  const supabaseLoginCheck = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user !== null) setIsLoggedIn(true);
    else setIsLoggedIn(false);
    setLoading(false);
  };

  const supabaseLogout = useCallback(async () => {
    setLoading(true);
    await supabase.auth.signOut();
    await GoogleSignin.signOut();
    await supabaseLoginCheck();
    setLoading(false);
  }, []);

  return {
    syncToSupabase,
    syncFromSupabase,
    supabaseLogin,
    supabaseLoginCheck,
    supabaseLogout,
    isLoggedIn,
    loading,
    success,
    error,
  };
}
