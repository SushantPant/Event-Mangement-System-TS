import type { User } from "../interfaces/auth.interface";
import type { IResponse } from "../interfaces/response.interface";
import api from "./api";

const loginApi = async (
  email: string,
  password: string,
): Promise<IResponse<{ token: string; user: User }>> => {
  try {
    console.error(api.defaults)
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  } catch (error: any) {
    return (
      error.response?.data ?? {
        success: false,
        message: "Failed to login",
      }
    );
  }
};

const registerApi = async (
  username: string,
  email: string,
  password: string,
): Promise<IResponse<{ token: string; user: User }>> => {
  try {

    const res = await api.post("/auth/register", { username, email, password });
    return res.data;
  } catch (error: any) {
    return (
      error.response?.data ?? {
        success: false,
        message: "Failed to register",
      }
    );
  }
};

const refreshApi = async (): Promise<IResponse<{ token: string; user: User }>> => {
  try {
    const res = await api.post("/auth/refresh");
    return res.data;
  } catch (error: any) {
    return (
      error.response?.data ?? {
        success: false,
        message: "Failed to refresh token",
      }
    );
  }
};

const logoutApi = async () => {
  await api.post("/auth/logout");
};
export { refreshApi, loginApi, registerApi, logoutApi };
