import { useStartupTask } from "@/api/startup-task/useStartupTask";
import React, { createContext, useContext, useMemo } from "react";

interface StartupContextType {
  hasServerInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
}

const StartupContext = createContext<StartupContextType | null>(null);

export function StartupProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, error } = useStartupTask();

  const value = useMemo(
    () => ({
      hasServerInitialized: data?.status === "ok",
      isLoading,
      error: error as Error | null,
    }),
    [data?.status, isLoading, error],
  );

  return (
    <StartupContext.Provider value={value}>{children}</StartupContext.Provider>
  );
}

export function useStartup() {
  const context = useContext(StartupContext);
  if (context === null) {
    throw new Error("useStartup must be used within a StartupProvider");
  }
  return context;
}
