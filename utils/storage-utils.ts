import { MMKV } from "react-native-mmkv";

export const storage = new MMKV({
  id: `beatdroid`,
});

export const set = (
  key: string,
  value: string | number | boolean | ArrayBuffer
) => storage.set(key, value);

export const get = (key: string): string | undefined => {
  const value = storage.getString(key);
  if (value === null) return undefined;
  return value;
};

export const clear = (key: string) => storage.delete(key);

export const clearAll = () => {
  storage.clearAll();
  return true;
};
