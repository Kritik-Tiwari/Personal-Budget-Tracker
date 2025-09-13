import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/layout.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(localStorage.getItem("userAvatar"));
  const [name, setName] = useState(localStorage.getItem("loggedInUser") || "User");

  useEffect(() => {
    // ✅ Update state when localStorage changes (anywhere)
    const handleStorageChange = () => {
      setAvatar(localStorage.getItem("userAvatar"));
      setName(localStorage.getItem("loggedInUser") || "User");
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("profileUpdated", handleStorageChange); // 🔄 listen to custom event

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("profileUpdated", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("userAvatar");
    alert("Logged out successfully ✅");
    navigate("/login");
  };

  const activeClass = ({ isActive }) =>
    isActive ? "nav-item active" : "nav-item";

  return (
    <aside className="sidebar">
      <div className="profile">
        <div className="avatar">
          {avatar ? (
            <img src={avatar} alt="User Avatar" />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="profile-name">{name}</div>
      </div>

      <nav className="nav">
        <NavLink to="/dashboard" className={activeClass}>
          <span className="nav-icon">🏠</span>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/income" className={activeClass}>
          <span className="nav-icon">💵</span>
          <span>Income</span>
        </NavLink>
        <NavLink to="/expenses" className={activeClass}>
          <span className="nav-icon">🧾</span>
          <span>Expenses</span>
        </NavLink>
        <NavLink to="/settings" className={activeClass}>
          <span className="nav-icon">⚙️</span>
          <span>Settings</span>
        </NavLink>
        <button className="nav-item logout" onClick={handleLogout}>
          <span className="nav-icon">↩️</span>
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
}
