import { GlobalDialog } from "@/components/ui-custom/global-dialog";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { DialogQueue } from "./dialog-queue";
import {
  DialogConfig,
  DialogContextValue,
  DialogPriority,
  PersistentDialogConfig,
  PersistentDialogController,
} from "./dialog-types";

const DialogContext = React.createContext<DialogContextValue | undefined>(
  undefined,
);

/**
 * Dialog provider component for the global dialog system
 * @description Must be placed at the root of your app to enable dialog functionality
 * @param {React.ReactNode} children - Your app components
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <DialogProvider>
 *       <YourAppContent />
 *     </DialogProvider>
 *   );
 * }
 * ```
 */
export function DialogProvider({ children }: { children: React.ReactNode }) {
  const queueRef = useRef(new DialogQueue());
  const [activeDialog, setActiveDialog] = useState<DialogConfig | null>(null);
  const timerRef = useRef<number | null>(null);
  const activeDialogIdRef = useRef<string | null>(null);

  const processQueue = useCallback(() => {
    const next = queueRef.current.getNext();
    setActiveDialog(next);
    activeDialogIdRef.current = next?.id || null;

    if (next?.autoHideDuration && next.autoHideDuration > 0) {
      timerRef.current = setTimeout(() => {
        if (next?.id) {
          const dialog = queueRef.current.get(next.id);
          queueRef.current.removeById(next.id);
          dialog?.onDismiss?.();
        }
        activeDialogIdRef.current = null;
        processQueue();
      }, next.autoHideDuration);
    }
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const showDialog = useCallback(
    (config: Partial<DialogConfig>): string => {
      const fullConfig: DialogConfig = {
        priority: DialogPriority.MEDIUM,
        type: "custom",
        dismissible: true,
        autoHideDuration: null,
        timestamp: Date.now(),
        ...config,
      };

      const id = queueRef.current.enqueue(fullConfig);
      processQueue();
      return id;
    },
    [processQueue],
  );

  const showAlert = useCallback(
    (message: string, options?: Partial<DialogConfig>): string => {
      return showDialog({
        type: "alert",
        message,
        dismissible: true,
        ...options,
      });
    },
    [showDialog],
  );

  const showConfirm = useCallback(
    (config: {
      title?: string;
      message: string;
      onConfirm: () => void;
      onCancel?: () => void;
    }): string => {
      return showDialog({
        type: "confirm",
        title: config.title,
        message: config.message,
        dismissible: true,
        actions: [
          {
            label: "Cancel",
            onPress: () => {
              config.onCancel?.();
              hideDialog();
            },
            variant: "default",
          },
          {
            label: "Confirm",
            onPress: () => {
              config.onConfirm();
              hideDialog();
            },
            variant: "destructive",
          },
        ],
      });
    },
    [showDialog],
  );

  const showError = useCallback(
    (message: string, options?: Partial<DialogConfig>): string => {
      return showDialog({
        type: "error",
        message,
        priority: DialogPriority.HIGH,
        dismissible: true,
        ...options,
      });
    },
    [showDialog],
  );

  const showSuccess = useCallback(
    (message: string, options?: Partial<DialogConfig>): string => {
      return showDialog({
        type: "success",
        message,
        autoHideDuration: 3000,
        dismissible: true,
        ...options,
      });
    },
    [showDialog],
  );

  const showInfo = useCallback(
    (message: string, options?: Partial<DialogConfig>): string => {
      return showDialog({
        type: "info",
        message,
        priority: DialogPriority.LOW,
        autoHideDuration: 5000,
        dismissible: true,
        ...options,
      });
    },
    [showDialog],
  );

  const showPersistent = useCallback(
    (config: Partial<PersistentDialogConfig>): PersistentDialogController => {
      const controllerId = config.controllerId || `persistent-${Date.now()}`;

      const fullConfig: PersistentDialogConfig = {
        priority: DialogPriority.PERSISTENT,
        type: "custom",
        persistent: true,
        dismissible: false,
        controllerId,
        timestamp: Date.now(),
        ...config,
      };

      const id = queueRef.current.enqueue(fullConfig);
      processQueue();

      return {
        id,
        updateContent: (updates: Partial<DialogConfig>) => {
          queueRef.current.update(id, updates);
          processQueue();
        },
        updateProgress: (progress: number) => {
          const msg = `${config.message || "Processing"}... ${progress}%`;
          queueRef.current.update(id, { message: msg });
          processQueue();
        },
        complete: () => {
          clearTimer();
          const dialog = queueRef.current.get(id);
          queueRef.current.removeById(id);
          dialog?.onDismiss?.();
          processQueue();
        },
      };
    },
    [processQueue, clearTimer],
  );

  const hideDialog = useCallback(
    (id?: string) => {
      clearTimer();

      const targetId = id || activeDialogIdRef.current;
      if (targetId) {
        const dialog = queueRef.current.get(targetId);
        queueRef.current.removeById(targetId);
        dialog?.onDismiss?.();
        if (targetId === activeDialogIdRef.current) {
          activeDialogIdRef.current = null;
        }
      }

      processQueue();
    },
    [clearTimer, processQueue],
  );

  const clearDialogsByIds = useCallback(
    (ids: string[]) => {
      clearTimer();
      queueRef.current.removeByIds(ids);
      processQueue();
    },
    [clearTimer, processQueue],
  );

  const clearDialogsByPriority = useCallback(
    (priority: DialogPriority) => {
      clearTimer();
      queueRef.current.removeByPriority(priority);
      processQueue();
    },
    [clearTimer, processQueue],
  );

  const clearQueuedDialogs = useCallback(() => {
    clearTimer();
    queueRef.current.clearQueued(activeDialog?.id);
  }, [activeDialog, clearTimer]);

  const clearAllDialogs = useCallback(() => {
    clearTimer();
    queueRef.current.clearAll();
    setActiveDialog(null);
  }, [clearTimer]);

  const hasDialog = useCallback((id: string): boolean => {
    return queueRef.current.has(id);
  }, []);

  const updateDialog = useCallback(
    (id: string, updates: Partial<DialogConfig>) => {
      queueRef.current.update(id, updates);
      if (activeDialog?.id === id) {
        processQueue();
      }
    },
    [activeDialog, processQueue],
  );

  const getQueueLength = useCallback((): number => {
    return queueRef.current.size();
  }, []);

  const isDialogActive = useCallback((): boolean => {
    return activeDialog !== null;
  }, [activeDialog]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const value: DialogContextValue = {
    showDialog,
    showAlert,
    showConfirm,
    showError,
    showSuccess,
    showInfo,
    showPersistent,
    hideDialog,
    clearDialogsByIds,
    clearDialogsByPriority,
    clearQueuedDialogs,
    clearAllDialogs,
    hasDialog,
    updateDialog,
    getQueueLength,
    isDialogActive,
  };

  return (
    <DialogContext.Provider value={value}>
      {children}
      <GlobalDialog dialog={activeDialog} onDismiss={() => hideDialog()} />
    </DialogContext.Provider>
  );
}

/**
 * Hook for accessing the dialog context API
 * @description Provides all dialog management methods
 * @returns {DialogContextValue} Dialog context with all management methods
 * @throws {Error} If used outside of DialogProvider
 * @example
 * ```tsx
 * const { showError, showSuccess, showPersistent, clearDialogsByIds } = useDialog();
 *
 * // Show error with icon
 * showError("Network error", {
 *   title: "Connection Failed",
 *   icon: () => <WifiOff size={50} color="#ef4444" />
 * });
 *
 * // Show dialog with custom content
 * showDialog({
 *   title: "Confirm Action",
 *   content: () => (
 *     <View className="py-4">
 *       <Text className="text-center mb-4">Are you sure?</Text>
 *       <ProgressBar progress={75} />
 *     </View>
 *   )
 * });
 *
 * // Show persistent dialog with progress
 * const controller = showPersistent({
 *   message: "Uploading...",
 *   customId: "upload-progress"
 * });
 * controller.updateProgress(50);
 *
 * // Clear specific dialogs by custom ID
 * clearDialogsByIds(["upload-progress", "toast-notification"]);
 *
 * // Priority queue: HIGH will interrupt LOW
 * showInfo("This will be queued");
 * showError("This shows immediately and interrupts");
 * ```
 */
export function useDialog(): DialogContextValue {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
}
