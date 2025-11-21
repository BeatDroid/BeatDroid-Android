/**
 * Dialog priority levels for queue management
 * @description Controls the order in which dialogs are displayed
 * - CRITICAL (6): Highest priority, shows immediately, blocks all others
 * - PERSISTENT (5): Second highest, blocks until completed via controller
 * - HIGH (4): High importance, shows when no higher priority dialogs exist
 * - MEDIUM (3): Default priority, normal dialog behavior
 * - LOW (2): Lower importance, shows when no higher priority dialogs exist
 * - PASSIVE (1): Lowest priority, only shows when queue is otherwise empty
 */
export enum DialogPriority {
  CRITICAL = 6,
  PERSISTENT = 5,
  HIGH = 4,
  MEDIUM = 3,
  LOW = 2,
  PASSIVE = 1,
}

/**
 * Dialog types for styling and behavior
 * @description Each type can have different visual treatments
 * - alert: Warning or alert dialog
 * - confirm: Confirmation dialog with yes/no actions
 * - info: Information dialog
 * - error: Error dialog (high priority by default)
 * - success: Success dialog (auto-hides by default)
 * - custom: Custom dialog with full control
 */
export type DialogType =
  | "alert"
  | "confirm"
  | "info"
  | "error"
  | "success"
  | "custom";

/**
 * Action button configuration for dialogs
 */
export interface DialogAction {
  /** Button text label */
  label: string;
  /** Callback when button is pressed */
  onPress: () => void;
  /** Button style variant */
  variant?: "default" | "destructive";
}

/**
 * Configuration for a dialog instance
 */
export interface DialogConfig {
  /** Auto-generated unique identifier */
  id?: string;
  /** Custom identifier for clearing specific dialogs */
  customId?: string;
  /** Priority level for queue management */
  priority: DialogPriority;
  /** Dialog type for styling */
  type: DialogType;
  /** Dialog title text */
  title?: string;
  /** Dialog message text */
  message?: string;
  /** Render function for icon component */
  icon?: () => React.ReactElement;
  /** Render function for custom content */
  content?: () => React.ReactElement;
  /** Whether dialog can be dismissed by tapping outside */
  dismissible?: boolean;
  /** Auto-hide duration in milliseconds, null to disable */
  autoHideDuration?: number | null;
  /** Action buttons for the dialog */
  actions?: DialogAction[];
  /** Callback when dialog is dismissed */
  onDismiss?: () => void;
  /** Creation timestamp (internal) */
  timestamp: number;
}

/**
 * Configuration for persistent dialogs
 * @extends DialogConfig
 */
export interface PersistentDialogConfig extends DialogConfig {
  /** Always PERSISTENT priority */
  priority: DialogPriority.PERSISTENT;
  /** Marks this as a persistent dialog */
  persistent: true;
  /** Unique controller identifier */
  controllerId: string;
  /** Persistent dialogs cannot be dismissed manually */
  dismissible: false;
}

/**
 * Controller for managing persistent dialogs
 * @example
 * ```tsx
 * const controller = showPersistent({ message: 'Processing...' });
 *
 * // Update progress
 * controller.updateProgress(50);
 *
 * // Complete and dismiss
 * controller.complete();
 * ```
 */
export interface PersistentDialogController {
  /** Dialog ID */
  id: string;
  /** Update dialog content */
  updateContent: (content: Partial<DialogConfig>) => void;
  /** Update progress message (0-100) */
  updateProgress?: (progress: number) => void;
  /** Complete and dismiss the dialog */
  complete: () => void;
}

/**
 * Dialog context API methods and state
 * @description All available methods for managing dialogs
 */
export interface DialogContextValue {
  /** Show a custom dialog with full configuration */
  showDialog: (config: Partial<DialogConfig>) => string;
  /** Show an alert dialog */
  showAlert: (message: string, options?: Partial<DialogConfig>) => string;
  /** Show a confirmation dialog */
  showConfirm: (config: {
    title?: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => string;
  /** Show an error dialog (HIGH priority by default) */
  showError: (message: string, options?: Partial<DialogConfig>) => string;
  /** Show a success dialog (auto-hides after 3s) */
  showSuccess: (message: string, options?: Partial<DialogConfig>) => string;
  /** Show an info dialog (LOW priority by default) */
  showInfo: (message: string, options?: Partial<DialogConfig>) => string;
  /** Show a persistent dialog with controller */
  showPersistent: (
    config: Partial<PersistentDialogConfig>,
  ) => PersistentDialogController;
  /** Hide a specific dialog or current dialog */
  hideDialog: (id?: string) => void;
  /** Clear multiple dialogs by their IDs */
  clearDialogsByIds: (ids: string[]) => void;
  /** Clear all dialogs of a specific priority */
  clearDialogsByPriority: (priority: DialogPriority) => void;
  /** Clear all queued dialogs (not showing) */
  clearQueuedDialogs: () => void;
  /** Clear all dialogs immediately */
  clearAllDialogs: () => void;
  /** Check if a dialog exists in queue */
  hasDialog: (id: string) => boolean;
  /** Update an existing dialog's content */
  updateDialog: (id: string, updates: Partial<DialogConfig>) => void;
  /** Get the current queue length */
  getQueueLength: () => number;
  /** Check if any dialog is currently active */
  isDialogActive: () => boolean;
}
