import {
  DialogConfig,
  DialogPriority,
  PersistentDialogConfig,
} from "./dialog-types";

export class DialogQueue {
  private queue: Map<string, DialogConfig> = new Map();
  private activePersistent: PersistentDialogConfig | null = null;
  private idCounter = 0;

  enqueue(dialog: DialogConfig): string {
    const id = dialog.id || dialog.customId || this.generateId();
    const dialogWithId = { ...dialog, id, timestamp: Date.now() };

    if (dialog.priority === DialogPriority.CRITICAL) {
      this.clearAll();
      this.activePersistent = null;
    }

    if (dialog.priority === DialogPriority.PERSISTENT) {
      this.activePersistent = dialogWithId as PersistentDialogConfig;
    }

    this.queue.set(id, dialogWithId);
    return id;
  }

  getNext(): DialogConfig | null {
    const sorted = this.getSorted();

    for (const dialog of sorted) {
      if (this.canShowDialog(dialog)) {
        return dialog;
      }
    }

    return null;
  }

  removeById(id: string): boolean {
    const dialog = this.queue.get(id);

    if (
      dialog?.priority === DialogPriority.PERSISTENT &&
      this.activePersistent?.id === id
    ) {
      this.activePersistent = null;
    }

    return this.queue.delete(id);
  }

  removeByIds(ids: string[]): number {
    let removed = 0;
    ids.forEach((id) => {
      if (this.removeById(id)) removed++;
    });
    return removed;
  }

  removeByPriority(priority: DialogPriority): number {
    let removed = 0;
    for (const [id, dialog] of this.queue) {
      if (dialog.priority === priority) {
        this.removeById(id);
        removed++;
      }
    }
    return removed;
  }

  update(id: string, updates: Partial<DialogConfig>): boolean {
    const dialog = this.queue.get(id);
    if (!dialog) return false;

    const updated = { ...dialog, ...updates };
    this.queue.set(id, updated);

    if (this.activePersistent?.id === id) {
      this.activePersistent = updated as PersistentDialogConfig;
    }

    return true;
  }

  has(id: string): boolean {
    return this.queue.has(id);
  }

  get(id: string): DialogConfig | undefined {
    return this.queue.get(id);
  }

  clearQueued(activeId?: string): void {
    for (const [id] of this.queue) {
      if (id !== activeId) {
        this.removeById(id);
      }
    }
  }

  clearAll(): void {
    this.queue.clear();
    this.activePersistent = null;
  }

  size(): number {
    return this.queue.size;
  }

  private getSorted(): DialogConfig[] {
    return Array.from(this.queue.values()).sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.timestamp - b.timestamp;
    });
  }

  private canShowDialog(dialog: DialogConfig): boolean {
    if (dialog.priority === DialogPriority.CRITICAL) {
      return true;
    }

    if (this.activePersistent !== null) {
      return dialog.priority > DialogPriority.PERSISTENT;
    }

    return true;
  }

  private generateId(): string {
    return `dialog-${Date.now()}-${this.idCounter++}`;
  }
}
