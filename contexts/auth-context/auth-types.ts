export interface AuthContextProps {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}
