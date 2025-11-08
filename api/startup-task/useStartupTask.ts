import { useCustomQuery } from "@/hooks/useCustomQuery";
import { executeStartupTask } from "./startupTask";
import type { StartupTaskResponse } from "./zod-schema";

export type UseStartupTask = ReturnType<
  typeof useCustomQuery<StartupTaskResponse, StartupTaskResponse>
>;

export function useStartupTask(): UseStartupTask {
  return useCustomQuery<StartupTaskResponse, StartupTaskResponse>({
    queryKey: ["startupTask"],
    queryFn: executeStartupTask,
    retry: 3,
    staleTime: 1000 * 60 * 30,
  });
}
