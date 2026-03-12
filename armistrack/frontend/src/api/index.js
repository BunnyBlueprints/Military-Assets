import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every outgoing request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("armistrack_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401 — clear stored session and force re-login
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("armistrack_token");
      localStorage.removeItem("armistrack_user");
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const login  = (username, password) => API.post("/auth/login", { username, password });
export const getMe  = ()                   => API.get("/auth/me");

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
export const getDashboard = (params = {}) => API.get("/dashboard", { params });

// ── PURCHASES ─────────────────────────────────────────────────────────────────
export const getPurchases   = (params = {}) => API.get("/purchases", { params });
export const createPurchase = (data)        => API.post("/purchases", data);

// ── TRANSFERS ─────────────────────────────────────────────────────────────────
export const getTransfers    = (params = {}) => API.get("/transfers", { params });
export const createTransfer  = (data)        => API.post("/transfers", data);
export const completeTransfer = (id)         => API.patch(`/transfers/${id}/complete`);

// ── ASSIGNMENTS ───────────────────────────────────────────────────────────────
export const getAssignments   = (params = {}) => API.get("/assignments", { params });
export const createAssignment = (data)        => API.post("/assignments", data);

// ── AUDIT ─────────────────────────────────────────────────────────────────────
export const getAuditLogs = (params = {}) => API.get("/audit", { params });

export default API;