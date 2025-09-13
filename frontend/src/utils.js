// src/utils.js
import { toast } from "react-toastify";

export const APIUrl = process.env.REACT_APP_API_URL || "http://localhost:8080";

// ✅ Toast helpers
export const handleSuccess = (msg) => toast.success(msg);
export const handleError = (err) =>
  toast.error(typeof err === "string" ? err : err?.message || "Something went wrong");

// helper: clear storage + redirect to login
function logoutAndRedirect() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("loggedInUser");
  toast.info("Logged out, please login again"); // show popup
  window.location.href = "/login"; // force redirect
}

// helper: refresh access token
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    logoutAndRedirect();
    return null;
  }

  try {
    const res = await fetch(`${APIUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json();
    if (res.ok && data.accessToken) {
      // ✅ save new tokens
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      return data.accessToken;
    } else {
      console.error("Failed to refresh token:", data.message);
      logoutAndRedirect();
      return null;
    }
  } catch (err) {
    console.error("Refresh token request failed:", err);
    logoutAndRedirect();
    return null;
  }
}

// ✅ fetch wrapper with auto refresh + retry + logout fallback
export async function fetchWithAuth(url, options = {}) {
  let token = localStorage.getItem("token") || "";
  let headers = options.headers ? { ...options.headers } : {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!headers["Content-Type"] && options.body) {
    headers["Content-Type"] = "application/json";
  }

  let res = await fetch(url, { ...options, headers });

  // If token expired → try refresh once
  if (res.status === 403 || res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(url, { ...options, headers });
    }
  }

  return res;
}
