import axios from "axios";

let apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api/";

// Automatically append /api/ if the user forgot to add it in Vercel settings
if (apiBaseUrl && !apiBaseUrl.endsWith('/api') && !apiBaseUrl.endsWith('/api/')) {
  apiBaseUrl = apiBaseUrl.endsWith('/') ? `${apiBaseUrl}api/` : `${apiBaseUrl}/api/`;
}

const api = axios.create({
  baseURL: apiBaseUrl.endsWith('/') ? apiBaseUrl : `${apiBaseUrl}/`,
  timeout: 60000, // 60 seconds
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
