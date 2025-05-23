import * as Haptics from "expo-haptics";
import { Vibration } from "react-native";

export const selectionHaptic = () => {
    return Vibration.vibrate(1);
};

export const notificationHaptic = () => {
    return Haptics.notificationAsync();
};