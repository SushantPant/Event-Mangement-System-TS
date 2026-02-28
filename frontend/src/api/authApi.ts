import type { AuthContextType } from "../interface/auth.interface";
import api from "./api";

const refreshApi = async (): Promise<AuthContextType> => {
  const res = await api.post("/auth/refresh");
  if (res.data.success) {
    return res.data.data;
  } else {
    throw new Error("Failed to refresh token");
  }
};
const loginApi = async (
  email: string,
  password: string,
): Promise<AuthContextType> => {
  const res = await api.post("/auth/login", { email, password });
  if (res.data.success) {
    return res.data.data;
  } else {
    throw new Error("Failed to login");
  }
};
const registerApi = async (
  username: string,
  email: string,
  password: string,
) => {
  const res = await api.post("/auth/register", { username, email, password });
  if (res.data.success) {
    return res.data.data;
  } else {
    throw new Error("Failed to register");
  }
};
const logoutApi = async () => {
  await api.post("/auth/logout");
};
export { refreshApi, loginApi, registerApi, logoutApi };
