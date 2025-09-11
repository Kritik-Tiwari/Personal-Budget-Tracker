// src/utils.js
export const APIUrl = process.env.REACT_APP_API_URL || "http://localhost:8080";

export const handleSuccess = (msg) => {
  // if you use react-toastify elsewhere, keep this
  // import { toast } from 'react-toastify' where used
  console.log("SUCCESS:", msg);
};

export const handleError = (err) => {
  console.error("ERROR:", err);
};

// fetch wrapper that automatically sends Authorization header and handles 401/403
export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem("token") || "";
  const headers = options.headers ? { ...options.headers } : {};
  if (token) headers["Authorization"] = token;
  const opts = { ...options, headers };
  try {
    const res = await fetch(url, opts);
    // If token expired server may return 401/403 — caller should handle navigation to login
    return res;
  } catch (err) {
    // network error
    throw err;
  }
}
