// src/utils.js
export const APIUrl = process.env.REACT_APP_API_URL || "http://localhost:8080";

export const handleSuccess = (msg) => {
  console.log("SUCCESS:", msg);
};

export const handleError = (err) => {
  console.error("ERROR:", err);
};

// ✅ fetch wrapper that always sends Bearer token
export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem("token") || "";
  const headers = options.headers ? { ...options.headers } : {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const opts = { ...options, headers };
  try {
    const res = await fetch(url, opts);
    return res;
  } catch (err) {
    throw err;
  }
}
