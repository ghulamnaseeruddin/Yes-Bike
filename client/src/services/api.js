import axios from "axios";

// In production, when deployed full-stack on Vercel, API is served from the same domain at /api.
// In local dev, Vite proxy forwards /api to http://localhost:5000/api.
// Can be overridden anytime via VITE_API_URL if an external backend is used.
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim() || "/api";
const isLocalhostOverride = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(?:\/.*)?$/i.test(configuredApiUrl);
const baseURL = import.meta.env.PROD && isLocalhostOverride ? "/api" : configuredApiUrl;

const api = axios.create({
  baseURL,
});

// Attach the JWT from localStorage (if present) to every request
api.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem("yesbike_auth") || "null");
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

// Normalize error messages so components can read err.message directly
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("yesbike_auth");
      sessionStorage.clear();
    }
    const message =
      error.response?.data?.message || error.message || "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);


export default api;
