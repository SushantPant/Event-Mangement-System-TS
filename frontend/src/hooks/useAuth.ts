import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import type { AuthContextType } from "../interface/auth.interface";

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
