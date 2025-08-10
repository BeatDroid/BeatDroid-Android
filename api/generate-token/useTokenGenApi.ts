import { useCustomQuery } from "@/hooks/useCustomQuery";
import { genToken } from "./genToken";
import type { GenTokenResponse } from "./zod-schema";

export type UseTokenGenApi = ReturnType<
  typeof useCustomQuery<GenTokenResponse, GenTokenResponse>
>;

export function useTokenGenApi(): UseTokenGenApi {
  const genTokenApi = useCustomQuery<GenTokenResponse, GenTokenResponse>({
    queryKey: ["genTokenApi"],
    queryFn: genToken,
    retry: 3,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
  
  return genTokenApi;
}
