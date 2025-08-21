import { MMKV } from "react-native-mmkv";

export const storage = new MMKV({
  id: `beatdroid`,
});

export class MmkvStorage {
  setItem(key: string, value: string | number | boolean | ArrayBuffer): void {
    storage.set(key, value);
  }

  getItem(key: string): string | null {
    const value = storage.getString(key);
    return value === undefined ? null : value;
  }

  removeItem(key: string): void {
    storage.delete(key);
  }

  clearAll(): boolean {
    storage.clearAll();
    return true;
  }
}

export const mmkvStorage = new MmkvStorage();
