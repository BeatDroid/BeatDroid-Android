import AnimatedOverlay from "@/components/ui-custom/animated-overlay";
import { Text } from "@/components/ui/text";
import React, { useState } from "react";
import { DialogContentProps, DialogContextProps, DialogContextType } from "./dialog-types";

const DialogContext = React.createContext<DialogContextProps | undefined>(
  undefined
);

export function DialogProvider({ children }: DialogContextType) {
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState<DialogContentProps>({
    content: (
      <>
        <Text className="mt-5 text-2xl font-bold text-center text-foreground">
          Dialog Title
        </Text>
        <Text className="text-base text-center text-foreground">
          Dialog Content
        </Text>
      </>
    ),
    icon: null,
  });

  const value = {
    visible,
    setVisible,
    content,
    setContent,
  };

  return (
    <DialogContext.Provider value={value}>
      {children}
      <AnimatedOverlay
        visible={visible}
        onClose={() => setVisible(false)}
        content={content.content}
        icon={content.icon}
      />
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
}
