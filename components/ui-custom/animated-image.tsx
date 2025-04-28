import { binaryToImageUri } from "@/utils/image-utils";
import { Image } from "expo-image";
import { cssInterop } from "nativewind";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface Props {
  uri?: string;
  binaryData?: ArrayBuffer | Uint8Array | Blob;
  mimeType?: string;
}

const maxVerticalAngle = 70;
const maxHorizontalAngle = 50;

const ExpoImage = cssInterop(Image, {
  className: {
    target: "style",
    nativeStyleToProp: { height: true, width: true },
  },
});

const AnimatedImage = ({ uri, binaryData, mimeType = "image/png" }: Props) => {
  const imageRef = React.useRef<Image>(null);
  const rotateY = useSharedValue<string>("0deg");
  const rotateX = useSharedValue<string>("0deg");
  const isPressed = useSharedValue<boolean>(false);
  const [imageUri, setImageUri] = useState<string | undefined>(uri);
  const [isLoading, setIsLoading] = useState<boolean>(!!binaryData && !uri);

  const resetImage = useCallback(
    (data: string) => {
      if (imageUri === data) return;
      Image.clearDiskCache();
      Image.clearMemoryCache();
      setImageUri(data);
    },
    [imageUri]
  );

  // Convert binary data to URI if provided
  useEffect(() => {
    if (binaryData) {
      setIsLoading(true);
      binaryToImageUri(binaryData, mimeType)
        .then((dataUri) => {
          resetImage(dataUri);
        })
        .catch((error) => {
          console.error("Failed to convert binary data to image URI:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (uri) {
      resetImage(uri);
    }
  }, [binaryData, uri, mimeType, resetImage]);

  const pan = Gesture.Pan()
    .onBegin(() => {
      isPressed.value = true;
    })
    .onChange((event) => {
      rotateY.value = `${Math.min(
        Math.max(event.translationX, -maxVerticalAngle),
        maxVerticalAngle
      )}deg`;
      rotateX.value = `${Math.min(
        Math.max(-event.translationY, -maxHorizontalAngle),
        maxHorizontalAngle
      )}deg`;
    })
    .onFinalize(() => {
      rotateY.value = withSpring("0deg");
      rotateX.value = withSpring("0deg");
      isPressed.value = false;
    });

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { rotateY: rotateY.value },
      { rotateX: rotateX.value },
      { scale: withTiming(isPressed.value ? 0.95 : 1) },
    ],
  }));

  const blurHash = `LKJbT+Mx-po#1MaKs.kC~UofM{WB`;

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        className={`bg-transparent w-full h-auto overflow-hidden`}
        style={animatedStyles}
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size={"large"} />
          </View>
        ) : imageUri ? (
          <ExpoImage
            ref={imageRef}
            source={{
              uri: imageUri,
            }}
            contentFit="contain"
            placeholder={{ blurHash }}
            transition={2000}
            className={"h-full w-full"}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size={"large"} />
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
};

export default AnimatedImage;
