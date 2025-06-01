import { usePosterDownApi } from "@/api/download-poster/usePosterDownApi";
import AnimatedConfirmButton from "@/components/ui-custom/animated-confirm-button";
import AnimatedHeader from "@/components/ui-custom/animated-header";
import AnimatedImage from "@/components/ui-custom/animated-image";
import Background from "@/components/ui-custom/background";
import { selectionHaptic } from "@/utils/haptic-utils";
import { handleDownloadPoster } from "@/utils/image-utils";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

export default function Result() {
  const { posterPath, blurhash } = useLocalSearchParams<{
    posterPath: string;
    blurhash: string;
  }>();
  const [isLoaded, setIsLoaded] = useState(false);

  const posterApi = usePosterDownApi({ posterPath: posterPath! });

  useEffect(() => {
    const startAnimations = async () => {
      setTimeout(() => {
        setIsLoaded(true);
      }, 2000);
    };

    if (!posterApi.isFetching) {
      startAnimations();
    }
  }, [posterApi.isFetching]);

  return (
    <Background>
      <AnimatedHeader
        duration={500}
        offset={50}
        disabled={!isLoaded}
        title={`Your poster is ready!`}
        description="Tap to zoom in"
      />
      <View className="flex-1">
        <AnimatedImage
          loading={posterApi.isFetching}
          uri={posterApi.data?.image!}
          blurhash={blurhash!}
          onPress={() => {
            setIsLoaded(true);
          }}
          onZoom={(isPressed) => {
            selectionHaptic();
            setIsLoaded(isPressed);
          }}
        />
      </View>
      <AnimatedConfirmButton
        title="Download"
        disabled={!isLoaded}
        onPress={() => handleDownloadPoster(posterApi.data?.image!)}
      />
    </Background>
  );
}
