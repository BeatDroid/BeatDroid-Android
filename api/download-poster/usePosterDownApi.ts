import { useAuth } from "@/contexts/auth-context";
import { useCustomQuery } from "@/hooks/useCustomQuery";
import { getPoster } from "./getPoster";
import { GetPosterResponse } from "./zod-schema";

export type UsePosterDownApi = ReturnType<
  typeof useCustomQuery<GetPosterResponse>
>;

export function usePosterDownApi({
  posterPath,
}: {
  posterPath: string;
}): UsePosterDownApi {
  const { token } = useAuth();
  const getPosterApi = useCustomQuery({
    queryKey: ["usePosterDownApi"],
    queryFn: () => getPoster(token, posterPath),
  });
  return getPosterApi;
}
