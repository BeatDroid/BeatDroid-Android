import { useNetwork } from "@/contexts/network-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { cssInterop } from "nativewind";
import React, { useEffect } from "react";
import { Text } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const FontawesomeIcon = cssInterop(FontAwesome, {
  className: {
    target: "style",
    nativeStyleToProp: { color: true },
  },
});

const NetworkOverlay = () => {
  const isOnline = useNetwork();
  const [isVisible, setIsVisible] = React.useState(false);

  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);
  const rotateAnim = useSharedValue(0);
  const isMounted = useSharedValue(false);

  const animatedOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
    };
  });

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: slideAnim.value }],
      opacity: interpolate(slideAnim.value, [0, 50], [1, 0], Extrapolation.CLAMP),
    };
  });

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotateAnim.value}deg` }],
    };
  });

  useEffect(() => {
    if (!isOnline) {
      setIsVisible(true);
      isMounted.value = true;

      fadeAnim.value = withTiming(0.7, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      });

      slideAnim.value = withTiming(
        0,
        {
          duration: 400,
          easing: Easing.out(Easing.quad),
        },
        () => {
          rotateAnim.value = withSequence(
            withTiming(-25, { duration: 80, easing: Easing.out(Easing.quad) }),
            withTiming(25, { duration: 80, easing: Easing.inOut(Easing.quad) }),
            withTiming(-25, {
              duration: 80,
              easing: Easing.inOut(Easing.quad),
            }),
            withTiming(25, { duration: 80, easing: Easing.inOut(Easing.quad) }),
            withTiming(0, { duration: 80, easing: Easing.in(Easing.quad) })
          );
        }
      );
    } else if (isMounted.value) {
      fadeAnim.value = withTiming(0, {
        duration: 200,
        easing: Easing.in(Easing.quad),
      });

      slideAnim.value = withTiming(
        50,
        {
          duration: 200,
          easing: Easing.in(Easing.quad),
        },
        () => {
          runOnJS(setIsVisible)(false);
          isMounted.value = false;
        }
      );
    }
  }, [fadeAnim, isMounted, isOnline, rotateAnim, slideAnim]);

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <Animated.View
        className="absolute h-full w-full bg-gray-500 items-center justify-center"
        style={animatedOverlayStyle}
      />
      <Animated.View
        className="absolute bg-background px-7 py-10 rounded-2xl items-center self-center max-w-[75%]"
        style={[
          animatedContainerStyle,
          {
            top: "40%",
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
            elevation: 8,
          },
        ]}
      >
        <Animated.View style={animatedIconStyle}>
          <FontawesomeIcon
            className="text-destructive"
            name="chain-broken"
            size={50}
          />
        </Animated.View>
        <Text className="mt-5 text-2xl font-bold text-center text-foreground">
          No internet connection
        </Text>
        <Text className="text-base text-center text-foreground">
          Please check your internet connection and try again. This app requires
          an active internet connection to function properly.
        </Text>
      </Animated.View>
    </>
  );
};

export default NetworkOverlay;
