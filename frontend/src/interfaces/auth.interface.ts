interface User {
  id: number;
  username: string;
  email: string;
  role?: "user" | "admin";
}
import type { IResponse } from "./response.interface";
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<IResponse<{ token: string; user: User }>>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<IResponse<{ token: string; user: User }>>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  setAuthData: (token: string | null, user: User | null) => void;
}

type AuthProps = {
  toggleForm: () => void;
  submitForm: (e: React.SubmitEvent<HTMLFormElement>) => void;
  isLogin: boolean;
};
interface AuthPageText {
  title: string;
  submitButton: string;
  toggleText: string;
  toggleCTA: string;
}
interface AuthTextMapping {
  login: AuthPageText;
  register: AuthPageText;
}
export type { User, AuthContextType, AuthProps, AuthTextMapping };
