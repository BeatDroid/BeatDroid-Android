import AnimatedImageContainer from "@/components/AnimatedImageContainer";
import Background from "@/components/Background";

export default function Result() {
  return (
    <Background className="flex-1 items-center justify-center px-5 gap-2">
      <AnimatedImageContainer uri="https://github.com/TrueMyst/BeatPrints/blob/main/examples/here_with_me_by_d4vd_237.png?raw=true" />
    </Background>
  );
}
