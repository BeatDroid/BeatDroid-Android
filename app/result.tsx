import AnimatedImageContainer from "@/components/AnimatedImageContainer";
import Background from "@/components/Background";
import { StyleSheet } from "react-native";

export default function Result() {
  return (
    <Background style={styles.titleContainer}>
      <AnimatedImageContainer uri="https://github.com/TrueMyst/BeatPrints/blob/main/examples/here_with_me_by_d4vd_237.png?raw=true" />
    </Background>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
