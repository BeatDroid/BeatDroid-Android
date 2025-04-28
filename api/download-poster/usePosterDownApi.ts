import { useCustomQuery } from "@/hooks/useCustomQuery";
import { getPoster } from "./getPoster";
import { useAuth } from "@/contexts/auth-context";
import { binaryToImageUri } from "@/utils/image-utils";

export type UsePosterDownApi = ReturnType<typeof useCustomQuery<string>>;

export function usePosterDownApi({
  posterUrl,
}: {
  posterUrl: string;
}): UsePosterDownApi {
  const { token } = useAuth();
  const getPosterApi = useCustomQuery({
    queryKey: ["usePosterDownApi"],
    queryFn: async () => {
      const blob = await getPoster(token, posterUrl);
      // Convert the blob to a data URI that can be used with Expo Image
      return binaryToImageUri(blob);
    },
  });
  return getPosterApi;
}
