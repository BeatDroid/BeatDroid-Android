import React, { useEffect } from "react";
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

interface AnimatedOverlayProps {
  visible: boolean;
  onClose: () => void;
  icon?: React.ReactNode;
  content?: React.ReactNode;
}

const AnimatedOverlay = ({
  visible = false,
  onClose,
  icon = null,
  content = null,
}: AnimatedOverlayProps) => {
  const [isDialogVisible, setIsDialogVisible] = React.useState(false);
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(-50);
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
      opacity: interpolate(
        slideAnim.value,
        [0, 50],
        [1, 0],
        Extrapolation.CLAMP,
      ),
    };
  });

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotateAnim.value}deg` }],
    };
  });

  useEffect(() => {
    if (visible) {
      setIsDialogVisible(true);
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
            withTiming(0, { duration: 80, easing: Easing.in(Easing.quad) }),
          );
        },
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
          runOnJS(setIsDialogVisible)(false);
          runOnJS(onClose)();
          isMounted.value = false;
        },
      );
    }
  }, [fadeAnim, isMounted, rotateAnim, slideAnim, onClose, visible]);

  useEffect(() => {
    if (!visible && !isDialogVisible) {
      slideAnim.value = -50;
    }
  }, [visible, isDialogVisible, slideAnim]);

  if (!isDialogVisible) {
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
        {icon && (
          <Animated.View style={animatedIconStyle}>{icon}</Animated.View>
        )}
        {content}
      </Animated.View>
    </>
  );
};

export default AnimatedOverlay;
