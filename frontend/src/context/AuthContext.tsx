import { createContext, useEffect, useState } from "react";
import type { AuthContextType } from "../interface/auth.interface";
import { setAccessToken } from "../api/api";
import { loginApi, logoutApi, refreshApi, registerApi } from "../api/authApi";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthContextType["user"]>(null);
  const [token, setToken] = useState<AuthContextType["token"]>(null);
  const [loading, setLoading] = useState(true);
  const setAuthData = (
    newToken: AuthContextType["token"],
    newUser: AuthContextType["user"],
  ) => {
    setToken(newToken);
    setUser(newUser);
    setAccessToken(newToken);
  };
  useEffect(() => {
    const refreshAuth = async () => {
      try {
        const res = await refreshApi();
        const { token: accToken, user: accUser } = res;
        setAuthData(accToken, accUser);
      } catch (error) {
        setAuthData(null, null);
      } finally {
        setLoading(false);
      }
    };
    refreshAuth();
  }, []);
  const login: AuthContextType["login"] = async (email, password) => {
    const res = await loginApi(email, password);
    setAuthData(res.token, res.user);
  };
  const register: AuthContextType["register"] = async (
    username,
    email,
    password,
  ) => {
    const res = await registerApi(username, email, password);
    setAuthData(res.token, res.user);
  };
  const logout: AuthContextType["logout"] = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setAuthData(null, null);
    }
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        loading,
        setAuthData,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
export default AuthContext;
