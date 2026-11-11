import axios from "axios";

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || "http://localhost:8087";

const api = axios.create({
    baseURL: `${GATEWAY_URL}/api/v1/backoffice`
});

// Automatically inject Keycloak JWT into every outgoing API Gateway -> Backoffice API request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token && token.split(".").length === 3) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
