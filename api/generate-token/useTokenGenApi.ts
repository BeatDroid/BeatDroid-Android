import { useCustomQuery } from "@/hooks/useCustomQuery";
import { genToken } from "./genToken";
import type { genTokenResponse } from "./types";

export type UseTokenGenApi = ReturnType<
  typeof useCustomQuery<genTokenResponse>
>;

export function useTokenGenApi(): UseTokenGenApi {
  const genTokenApi = useCustomQuery({
    queryKey: ["genTokenApi"],
    queryFn: genToken,
  });
  return genTokenApi;
}
