import { useCustomQuery } from "@/hooks/useCustomQuery";
import { getPoster } from "./getPoster";
import { GetPosterResponse } from "./zod-schema";

export type UsePosterDownApi = ReturnType<
  typeof useCustomQuery<GetPosterResponse, GetPosterResponse>
>;

export function usePosterDownApi({
  posterPath,
}: {
  posterPath: string;
}): UsePosterDownApi {
  return useCustomQuery<GetPosterResponse, GetPosterResponse>({
    queryKey: ["usePosterDownApi"],
    queryFn: () => getPoster(null, posterPath),
  });
}
