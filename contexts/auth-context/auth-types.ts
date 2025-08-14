export interface AuthContextProps {
  token: string | null;
  isTokenSet: boolean;
  setToken: (token: string) => void;
  clearToken: () => void;
}
