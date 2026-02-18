//frontend/src/lib/axios.js
import axios from "axios";
const API_BASE = import.meta.env.VITE_API_URL;
const api = axios.create({
    baseURL: `${API_BASE}/api`,
});

// Request interceptor: Add token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 responses
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/";
        }
        return Promise.reject(err);
    }
);

export default api;
