import { Text } from "@/components/ui/text";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import NetInfo from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";
import { cssInterop } from "nativewind";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useDialog } from "../dialog-context/dialog-context";

const FontawesomeIcon = cssInterop(FontAwesome, {
  className: {
    target: "style",
    nativeStyleToProp: { color: true },
  },
});

interface NetworkContextType {
  isOnline: boolean;
}

const NetworkContext = createContext<NetworkContextType | null>(null);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const { setVisible, setContent } = useDialog();

  useEffect(() => {
    // Initial check
    NetInfo.fetch().then((state) => {
      const isConnected = !!state.isInternetReachable;
      setIsOnline(isConnected);
      onlineManager.setOnline(isConnected);
    });

    // Subscribe to updates
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
    if (!isOnline) {
      setVisible(true);
      setContent({
        content: (
          <>
            <Text className="mt-5 text-2xl font-ui-bold text-center text-foreground">
              No internet connection
            </Text>
            <Text className="text-base text-center text-foreground">
              Please check your internet connection and try again. This app
              requires an active internet connection to function properly.
            </Text>
          </>
        ),
        icon: (
          <FontawesomeIcon
            className="text-destructive"
            name="chain-broken"
            size={50}
          />
        ),
      });
    } else {
      setVisible(false);
    }
  }, [isOnline, setContent, setVisible]);

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
