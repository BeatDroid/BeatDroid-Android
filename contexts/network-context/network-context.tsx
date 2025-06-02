import NetInfo from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";
import React, { createContext, useContext, useState, useEffect } from "react";

interface NetworkContextType {
  isOnline: boolean;
}

const NetworkContext = createContext<NetworkContextType | null>(null);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // Initial check
    NetInfo.fetch().then(state => {
      const isConnected = !!state.isConnected;
      setIsOnline(isConnected);
      onlineManager.setOnline(isConnected);
    });

    // Subscribe to updates
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      const isConnected = !!state.isConnected;
      setIsOnline(isConnected);
      onlineManager.setOnline(isConnected);
    });

    return () => {
      unsubscribeNetInfo();
    };
  }, []);

  const value = React.useMemo(() => ({
    isOnline
  }), [isOnline]);

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === null) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context.isOnline;
}
