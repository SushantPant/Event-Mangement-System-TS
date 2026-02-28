interface User {
  id: number;
  username: string;
  email: string;
  role?: "user" | "admin";
}
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  setAuthData: (token: string, user: User) => void;
}

export type { User, AuthContextType };
