import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const authAxios = axios.create({
  baseURL: "",
  withCredentials: false,
});

authAxios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

authAxios.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !["/login", "/register"].includes(window.location.pathname)
    ) {
      // Remove token & redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default authAxios;
