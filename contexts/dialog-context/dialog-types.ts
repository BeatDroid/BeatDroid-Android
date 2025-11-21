export enum DialogPriority {
  CRITICAL = 6,
  PERSISTENT = 5,
  HIGH = 4,
  MEDIUM = 3,
  LOW = 2,
  PASSIVE = 1,
}

export type DialogType =
  | "alert"
  | "confirm"
  | "info"
  | "error"
  | "success"
  | "custom";

export interface DialogAction {
  label: string;
  onPress: () => void;
  variant?: "default" | "destructive";
}

export interface DialogConfig {
  id?: string;
  customId?: string;
  priority: DialogPriority;
  type: DialogType;
  title?: string;
  message?: string;
  icon?: () => React.ReactElement;
  content?: () => React.ReactElement;
  dismissible?: boolean;
  autoHideDuration?: number | null;
  actions?: DialogAction[];
  onDismiss?: () => void;
  timestamp: number;
}

export interface PersistentDialogConfig extends DialogConfig {
  priority: DialogPriority.PERSISTENT;
  persistent: true;
  controllerId: string;
  dismissible: false;
}

export interface PersistentDialogController {
  id: string;
  updateContent: (content: Partial<DialogConfig>) => void;
  updateProgress?: (progress: number) => void;
  complete: () => void;
}

export interface DialogContextValue {
  showDialog: (config: Partial<DialogConfig>) => string;
  showAlert: (message: string, options?: Partial<DialogConfig>) => string;
  showConfirm: (config: {
    title?: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => string;
  showError: (message: string, options?: Partial<DialogConfig>) => string;
  showSuccess: (message: string, options?: Partial<DialogConfig>) => string;
  showInfo: (message: string, options?: Partial<DialogConfig>) => string;
  showPersistent: (
    config: Partial<PersistentDialogConfig>,
  ) => PersistentDialogController;
  hideDialog: (id?: string) => void;
  clearDialogsByIds: (ids: string[]) => void;
  clearDialogsByPriority: (priority: DialogPriority) => void;
  clearQueuedDialogs: () => void;
  clearAllDialogs: () => void;
  hasDialog: (id: string) => boolean;
  updateDialog: (id: string, updates: Partial<DialogConfig>) => void;
  getQueueLength: () => number;
  isDialogActive: () => boolean;
}
