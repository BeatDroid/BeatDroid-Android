import NetInfo from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";
import { WifiOff } from "lucide-react-native";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { DialogPriority, useDialog } from "../dialog-context";

interface NetworkContextType {
  isOnline: boolean;
}

const NetworkContext = createContext<NetworkContextType | null>(null);
const NETWORK_DIALOG_ID = "network-error";

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const { showError, hideDialog } = useDialog();
  const dialogIdRef = useRef<string | null>(null);

  useEffect(() => {
    NetInfo.fetch().then((state) => {
      const isConnected = !!state.isInternetReachable;
      setIsOnline(isConnected);
      onlineManager.setOnline(isConnected);
    });

    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      const isConnected = !!state.isInternetReachable;
      setIsOnline(isConnected);
      onlineManager.setOnline(isConnected);
    });

    return () => {
      unsubscribeNetInfo();
    };
  }, []);

  useEffect(() => {
    if (!isOnline && !dialogIdRef.current) {
      dialogIdRef.current = showError(
        "Please check your internet connection and try again. This app requires an active internet connection to function properly.",
        {
          id: NETWORK_DIALOG_ID,
          title: "No Internet Connection",
          icon: () => <WifiOff size={50} color="#ef4444" />,
          priority: DialogPriority.HIGH,
          dismissible: false,
        },
      );
    } else if (isOnline && dialogIdRef.current) {
      hideDialog(NETWORK_DIALOG_ID);
      dialogIdRef.current = null;
    }
  }, [hideDialog, isOnline, showError]);

  const value = React.useMemo(
    () => ({
      isOnline,
    }),
    [isOnline],
  );

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === null) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context.isOnline;
}
