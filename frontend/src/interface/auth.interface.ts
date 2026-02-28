interface User {
  id: number;
  username: string;
  email: string;
  role?: "user" | "admin";
}
interface AuthReponse {
  success: boolean;
  token: string;
  message: string;
  data?: User;
}
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<AuthReponse>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<AuthReponse>;
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
export type { User, AuthContextType, AuthProps, AuthTextMapping, AuthReponse };
