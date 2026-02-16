import axios from "axios";
import toast from "react-hot-toast";
console.log("VITE_API_BASE_URL =", import.meta.env.VITE_API_BASE_URL);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://e-mart-gamma-three.vercel.app",
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("emart_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "Something went wrong";

    // avoid spamming for common routes
    if (!String(msg).toLowerCase().includes("unauthorized")) {
      toast.error(msg);
    }
    return Promise.reject(err);
  }
);

export default api;
