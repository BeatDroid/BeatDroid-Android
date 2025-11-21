import {
  AlertCircle,
  CheckCircle,
  Info,
  Loader2,
  XCircle,
} from "lucide-react-native";
import React from "react";
import { DialogConfig, DialogPriority } from "./dialog-types";

/**
 * Pre-configured dialog templates for common use cases
 * @description Ready-to-use dialog configurations with appropriate icons, priorities, and behaviors
 * @example
 * ```tsx
 * const { showError, showSuccess } = useDialog();
 *
 * // Use error template
 * showError(DialogTemplates.error("Failed to save file"));
 *
 * // Use success template with custom title
 * showSuccess(DialogTemplates.success("File uploaded successfully", {
 *   title: "Upload Complete"
 * }));
 * ```
 */
export const DialogTemplates = {
  /**
   * Error dialog template with high priority and red X icon
   * @param {string} message - Error message to display
   * @param {Partial<DialogConfig>} options - Additional configuration overrides
   * @returns {DialogConfig} Complete error dialog configuration
   * @example
   * ```tsx
   * showError(DialogTemplates.error("Network connection failed"));
   * ```
   */
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

  /**
   * Success dialog template with green checkmark and auto-hide
   * @param {string} message - Success message to display
   * @param {Partial<DialogConfig>} options - Additional configuration overrides
   * @returns {DialogConfig} Complete success dialog configuration
   * @example
   * ```tsx
   * showSuccess(DialogTemplates.success("File uploaded successfully!"));
   * ```
   */
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

  /**
   * Info dialog template with blue info icon and low priority
   * @param {string} message - Information message to display
   * @param {Partial<DialogConfig>} options - Additional configuration overrides
   * @returns {DialogConfig} Complete info dialog configuration
   * @example
   * ```tsx
   * showInfo(DialogTemplates.info("New features available"));
   * ```
   */
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

  /**
   * Warning dialog template with amber warning icon
   * @param {string} message - Warning message to display
   * @param {Partial<DialogConfig>} options - Additional configuration overrides
   * @returns {DialogConfig} Complete warning dialog configuration
   * @example
   * ```tsx
   * showAlert(DialogTemplates.warning("Battery is low"));
   * ```
   */
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

  /**
   * Loading dialog template with spinner and persistent priority
   * @param {string} message - Loading message to display
   * @param {Partial<DialogConfig>} options - Additional configuration overrides
   * @returns {DialogConfig} Complete loading dialog configuration
   * @example
   * ```tsx
   * const controller = showPersistent(DialogTemplates.loading("Processing data..."));
   * ```
   */
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

  /**
   * Critical error dialog template with highest priority and cannot be dismissed
   * @param {string} message - Critical error message to display
   * @param {Partial<DialogConfig>} options - Additional configuration overrides
   * @returns {DialogConfig} Complete critical error dialog configuration
   * @example
   * ```tsx
   * showDialog(DialogTemplates.critical("System failure - app must restart"));
   * ```
   */
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
