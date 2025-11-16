import { supabase } from "@/config/supabase";
import { useNetwork } from "@/contexts/network-context";
import { NewSearchHistory, searchHistoryTable } from "@/db/schema";
import useDatabase from "@/hooks/useDatabase";
import { SupabaseRecord } from "@/lib/types";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import * as Sentry from "@sentry/react-native";
import { eq, inArray, sql } from "drizzle-orm";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner-native";

export default function useSupabase() {
  const network = useNetwork();
  const { db, success, error } = useDatabase();
  const [loading, setLoading] = useState(true);
  const isLoggedInRef = useRef<boolean>(false);

  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIEND_ID || "",
  });

  const syncToSupabase = useCallback(async () => {
    if (!network || !isLoggedInRef.current) return;
    try {
      const unsyncedRecords = await db
        .select()
        .from(searchHistoryTable)
        .where(eq(searchHistoryTable.synced, false));

      if (unsyncedRecords.length === 0) return;

      Sentry.addBreadcrumb({
        type: "debug",
        category: "Supabase push",
        level: "info",
        message: `Pushing ${unsyncedRecords.length} local database entries to supabase`,
      });

      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      // Validate authentication before proceeding
      if (authError || !authData?.user?.id) {
        const errorMsg = "User not authenticated or session expired";
        console.warn(errorMsg, authError);
        toast.error("Error syncing history", {
          description:
            "There was an issue with your authentication. Please try logging in again..",
        });

        Sentry.addBreadcrumb({
          type: "warning",
          category: "Supabase push",
          level: "warning",
          message: errorMsg,
          data: { authError: authError?.message },
        });

        // Update login status and exit gracefully
        supabaseLogout();
        return;
      }

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
            user_id: authData.user.id, // Now guaranteed to be valid
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
      Sentry.captureException(e, {
        tags: {
          operation: "syncToSupabase",
        },
        contexts: {
          database: {
            operation: "sync_to_supabase",
            table: "search_history",
          },
        },
      });
    }
  }, [db, network, supabaseLogout]);

  const syncFromSupabase = useCallback(async () => {
    if (!network || !isLoggedInRef.current) return;
    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData?.user?.id) {
        isLoggedInRef.current = false;
        return;
      }

      const { error, data } = await supabase
        .from("search_history")
        .select("*")
        .eq("user_id", authData.user.id);

      if (error) throw error;

      Sentry.addBreadcrumb({
        type: "debug",
        category: "Supabase pull",
        level: "info",
        message: `Pulling ${data.length} entries from supabase to local database`,
      });

      if (data) {
        const newRecords = data
          .filter((record: SupabaseRecord) => {
            // Filter out invalid records missing required fields
            return (
              record.search_param &&
              record.artist_name &&
              record.search_type &&
              record.theme
            );
          })
          .map(
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

        if (newRecords.length > 0) {
          try {
            await db
              .insert(searchHistoryTable)
              .values(newRecords)
              .onConflictDoUpdate({
                target: searchHistoryTable.id,
                set: {
                  searchType: sql`excluded.search_type`,
                  searchParam: sql`excluded.search_param`,
                  artistName: sql`excluded.artist_name`,
                  theme: sql`excluded.theme`,
                  accentLine: sql`excluded.accent_line`,
                  blurhash: sql`excluded.blurhash`,
                  createdAt: sql`excluded.created_at`,
                  synced: true,
                },
              });
          } catch (error) {
            console.error("Error inserting records to local database:", error);
            Sentry.captureException(error, {
              tags: {
                operation: "syncFromSupabase",
                dbOperation: "insert",
              },
              contexts: {
                database: {
                  operation: "insert_with_conflict_update",
                  table: "search_history",
                  recordCount: newRecords.length,
                },
              },
            });
          }
        }

        const remoteIds = new Set<number>(
          data.map((r: SupabaseRecord) => r.local_id),
        );

        const localSynced = await db
          .select({ id: searchHistoryTable.id })
          .from(searchHistoryTable)
          .where(eq(searchHistoryTable.synced, true));

        const toDelete = localSynced
          .map((r) => r.id)
          .filter((id) => !remoteIds.has(id));

        if (toDelete.length > 0) {
          Sentry.addBreadcrumb({
            type: "debug",
            category: "Supabase pull",
            level: "info",
            message: `Deleting ${toDelete.length} local records absent on remote`,
          });

          await db
            .delete(searchHistoryTable)
            .where(inArray(searchHistoryTable.id, toDelete));
        }
      }
    } catch (e) {
      console.log("Error syncing from Supabase:", e);
      Sentry.captureException(e, {
        tags: {
          operation: "syncFromSupabase",
        },
        contexts: {
          database: {
            operation: "sync_from_supabase",
            table: "search_history",
          },
        },
      });
    }
  }, [db, network]);

  const deleteFromSupabase = useCallback(
    async (localId: number) => {
      console.log(
        "Deleting from Supabase:",
        localId,
        network,
        isLoggedInRef.current,
      );
      try {
        if (!network || !isLoggedInRef.current) {
          throw new Error("Network unavailable or user not logged in");
        }

        const { data: authData } = await supabase.auth.getUser();
        if (!authData?.user?.id) {
          throw new Error("User not authenticated");
        }

        Sentry.addBreadcrumb({
          type: "debug",
          category: "Supabase delete",
          level: "info",
          message: `Deleting record with local_id: ${localId}`,
        });

        const { error } = await supabase
          .from("search_history")
          .delete()
          .eq("local_id", localId)
          .eq("user_id", authData.user.id);

        if (error) throw error;

        Sentry.addBreadcrumb({
          type: "debug",
          category: "Supabase delete",
          level: "info",
          message: `Successfully deleted record with local_id: ${localId}`,
        });
      } catch (e) {
        console.log("Error deleting from Supabase:", e);
        Sentry.captureException(e, {
          tags: {
            operation: "deleteFromSupabase",
          },
          contexts: {
            database: {
              operation: "delete_from_supabase",
              table: "search_history",
              local_id: localId,
            },
          },
        });
        throw e;
      }
    },
    [network],
  );

  const supabaseLogout = useCallback(async () => {
    if (!network) return;
    setLoading(true);
    await supabase.auth.signOut();
    await GoogleSignin.signOut();
    await supabaseLoginCheck();
    setLoading(false);
    Sentry.addBreadcrumb({
      type: "debug",
      category: "Supabase login check",
      level: "info",
      message: `User has logged out of Supabase`,
    });
    toast.success("Log out successful", {
      description: "Search history will no longer be synced across devices.",
    });
  }, [network]);

  const supabaseLogin = useCallback(async () => {
    if (!network) return;
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      Sentry.addBreadcrumb({
        type: "debug",
        category: "Google sign in",
        level: "info",
        message: `Play services available, attempting to sign in with Google`,
      });
      setLoading(true);
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        let { error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: response.data.idToken!,
        });
        if (error) {
          Sentry.addBreadcrumb({
            type: "error",
            category: "Google sign in",
            level: "error",
            message: `Error caused by Supabase: ${error.message}`,
          });
          throw { ...error, source: "supabase" };
        }
        isLoggedInRef.current = true;
        toast.success("Log in successful", {
          description: "Search history will be synced across devices.",
        });
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
            Sentry.captureException(error, {
              tags: {
                operation: "supabaseLogin",
              },
              contexts: {
                tags: {
                  operation: "google_sign_in_failure",
                },
              },
            });
        }
      } else {
        console.log("Error signing in:", error);
        // an error that's not related to google sign in occurred
      }
    } finally {
      setLoading(false);
    }
  }, [network, syncFromSupabase]);

  const supabaseLoginCheck = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user !== null) {
      isLoggedInRef.current = true;
      Sentry.addBreadcrumb({
        type: "debug",
        category: "Supabase login check",
        level: "info",
        message: `User is logged in with Supabase`,
      });
    } else {
      isLoggedInRef.current = false;
      Sentry.addBreadcrumb({
        type: "debug",
        category: "Supabase login check",
        level: "info",
        message: `User is not logged in with Supabase`,
      });
    }
    setLoading(false);
    return authData?.user !== null;
  };

  return {
    syncToSupabase,
    syncFromSupabase,
    deleteFromSupabase,
    supabaseLogin,
    supabaseLoginCheck,
    supabaseLogout,
    isLoggedIn: isLoggedInRef.current,
    loading,
    success,
    error,
  };
}
