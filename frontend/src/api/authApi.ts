import type { AuthReponse } from "../interface/auth.interface";
import api from "./api";

const loginApi = async (
  email: string,
  password: string,
): Promise<AuthReponse> => {
  try {
    const res = await api.post("/auth/login", { email, password });
    return {
      success: res.data.success,
      message: res.data.message,
      token: res.data.data.token,
      data: res.data.data.user,
    };
  } catch (error: any) {
    return (
      error.response?.data ?? {
        success: false,
        token: "",
        message: "Failed to login",
      }
    );
  }
};

const registerApi = async (
  username: string,
  email: string,
  password: string,
): Promise<AuthReponse> => {
  try {
    const res = await api.post("/auth/register", { username, email, password });
    return {
      success: res.data.success,
      message: res.data.message,
      token: res.data.data.token,
      data: res.data.data.user,
    };
  } catch (error: any) {
    return (
      error.response?.data ?? {
        success: false,
        token: "",
        message: "Failed to register",
      }
    );
  }
};

const refreshApi = async (): Promise<AuthReponse> => {
  try {
    const res = await api.post("/auth/refresh");
    return {
      success: res.data.success,
      message: res.data.message,
      token: res.data.data.token,
      data: res.data.data.user,
    };
  } catch (error: any) {
    return (
      error.response?.data ?? {
        success: false,
        token: "",
        message: "Failed to refresh token",
      }
    );
  }
};

const logoutApi = async () => {
  await api.post("/auth/logout");
};
export { refreshApi, loginApi, registerApi, logoutApi };
