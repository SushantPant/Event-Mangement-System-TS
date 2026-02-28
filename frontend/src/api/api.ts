import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
let accessToken: string | null = null;
const refreshListeners: Array<(token: string) => void> = [];

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    refreshListeners.forEach((listener) => listener(token));
  }
};

export const addRefreshListener = (listener: (token: string) => void) => {
  refreshListeners.push(listener);
};

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh"
    ) {
      originalRequest._retry = true;

      try {
        const response = await api.post("/auth/refresh");
        const newToken = response.data.data.token;
        setAccessToken(newToken);
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);
export default api;
