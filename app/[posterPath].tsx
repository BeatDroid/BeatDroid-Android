import { usePosterDownApi } from "@/api/download-poster/usePosterDownApi";
import AnimatedConfirmButton from "@/components/ui-custom/animated-confirm-button";
import AnimatedImage from "@/components/ui-custom/animated-image";
import Background from "@/components/ui-custom/background";
import { handleDownloadPoster } from "@/utils/image-utils";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

export default function Result() {
  const { posterPath, blurhash } = useLocalSearchParams<{
    posterPath: string;
    blurhash: string;
  }>();
  const [isLoaded, setIsLoaded] = useState(false);

  const posterApi = usePosterDownApi({ posterPath: posterPath! });

  useEffect(() => {
    if (posterApi.isFetched) {
    }
  }, [posterApi.isFetched]);

  return (
    <Background className="items-center justify-center px-5 gap-2">
      <AnimatedImage
        loading={posterApi.isFetching}
        uri={posterApi.data?.image!}
        blurhash={blurhash!}
        onPress={() => {
          setIsLoaded(true);
        }}
      />
      <AnimatedConfirmButton
        floating
        title="Download"
        disabled={!isLoaded}
        onPress={() => handleDownloadPoster(posterApi.data?.image!)}
      />
    </Background>
  );
}
