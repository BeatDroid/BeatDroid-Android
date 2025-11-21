import React from "react";
import {
  AlertCircle,
  CheckCircle,
  Info,
  Loader2,
  XCircle,
} from "lucide-react-native";
import { DialogConfig, DialogPriority } from "./dialog-types";

export const DialogTemplates = {
  error: (message: string, options?: Partial<DialogConfig>): DialogConfig => ({
    type: "error",
    priority: DialogPriority.HIGH,
    message,
    title: options?.title || "Error",
    icon: () => <XCircle size={50} color="#ef4444" />,
    dismissible: true,
    ...options,
    timestamp: Date.now(),
  }),

  success: (
    message: string,
    options?: Partial<DialogConfig>,
  ): DialogConfig => ({
    type: "success",
    priority: DialogPriority.MEDIUM,
    message,
    title: options?.title || "Success",
    icon: () => <CheckCircle size={50} color="#22c55e" />,
    autoHideDuration: 3000,
    dismissible: true,
    ...options,
    timestamp: Date.now(),
  }),

  info: (message: string, options?: Partial<DialogConfig>): DialogConfig => ({
    type: "info",
    priority: DialogPriority.LOW,
    message,
    title: options?.title || "Info",
    icon: () => <Info size={50} color="#3b82f6" />,
    autoHideDuration: 5000,
    dismissible: true,
    ...options,
    timestamp: Date.now(),
  }),

  warning: (
    message: string,
    options?: Partial<DialogConfig>,
  ): DialogConfig => ({
    type: "alert",
    priority: DialogPriority.MEDIUM,
    message,
    title: options?.title || "Warning",
    icon: () => <AlertCircle size={50} color="#f59e0b" />,
    dismissible: true,
    ...options,
    timestamp: Date.now(),
  }),

  loading: (
    message: string,
    options?: Partial<DialogConfig>,
  ): DialogConfig => ({
    type: "custom",
    priority: DialogPriority.PERSISTENT,
    message,
    title: options?.title || "Loading",
    icon: () => <Loader2 size={50} color="#6b7280" />,
    dismissible: false,
    ...options,
    timestamp: Date.now(),
  }),

  critical: (
    message: string,
    options?: Partial<DialogConfig>,
  ): DialogConfig => ({
    type: "error",
    priority: DialogPriority.CRITICAL,
    message,
    title: options?.title || "Critical Error",
    icon: () => <XCircle size={50} color="#dc2626" />,
    dismissible: false,
    ...options,
    timestamp: Date.now(),
  }),
};
