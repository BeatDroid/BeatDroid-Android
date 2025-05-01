import { usePosterDownApi } from "@/api/download-poster/usePosterDownApi";
import AnimatedConfirmButton from "@/components/ui-custom/animated-confirm-button";
import AnimatedImage from "@/components/ui-custom/animated-image";
import Background from "@/components/ui-custom/background";
import { handleDownloadPoster } from "@/utils/image-utils";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator } from "react-native";

export default function Result() {
  const { posterview } = useLocalSearchParams<{ posterview: string }>();
  const posterApi = usePosterDownApi({ posterUrl: posterview! });

  if (posterApi.isLoading)
    return (
      <Background className="items-center justify-center px-5 gap-2">
        <ActivityIndicator size="large" />
      </Background>
    );

  return (
    <Background className="items-center justify-center px-5 gap-2">
      <AnimatedImage uri={posterApi.data} />
      <AnimatedConfirmButton
        floating
        title="Download"
        onPress={() => handleDownloadPoster(posterview)}
        disabled={!posterApi.isSuccess}
      />
    </Background>
  );
}
