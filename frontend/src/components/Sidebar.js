// src/components/Sidebar.js
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/layout.css"; // ✅ use single CSS file

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  const activeClass = ({ isActive }) =>
    isActive ? "nav-item active" : "nav-item";

  return (
    <aside className="sidebar">
      <div className="profile">
        <div className="avatar">
          {(localStorage.getItem("loggedInUser") || "U")
            .charAt(0)
            .toUpperCase()}
        </div>
        <div className="profile-name">
          {localStorage.getItem("loggedInUser") || "User"}
        </div>
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
        <button className="nav-item logout" onClick={handleLogout}>
          <span className="nav-icon">↩️</span>
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
}
