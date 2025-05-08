import { usePosterDownApi } from "@/api/download-poster/usePosterDownApi";
import AnimatedConfirmButton from "@/components/ui-custom/animated-confirm-button";
import AnimatedImage from "@/components/ui-custom/animated-image";
import Background from "@/components/ui-custom/background";
import { handleDownloadPoster } from "@/utils/image-utils";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator } from "react-native";

export default function Result() {
  const { posterPath } = useLocalSearchParams<{ posterPath: string }>();
  const posterApi = usePosterDownApi({ posterPath: posterPath! });

  if (posterApi.isFetching)
    return (
      <Background className="items-center justify-center px-5 gap-2">
        <ActivityIndicator size="large" />
      </Background>
    );

  return (
    <Background className="items-center justify-center px-5 gap-2">
      <AnimatedImage uri={posterApi.data?.image!} />
      <AnimatedConfirmButton
        floating
        title="Download"
        onPress={() => handleDownloadPoster(posterApi.data?.image!)}
      />
    </Background>
  );
}
