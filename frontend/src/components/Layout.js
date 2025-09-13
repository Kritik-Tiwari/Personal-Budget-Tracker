// src/components/Layout.js
import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Target,
} from "lucide-react";
import "../styles/layout.css";

export default function Layout() {
  const location = useLocation();

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/income": "Income",
    "/expenses": "Expenses",
    "/groups": "Groups",
    "/budgets": "Budgets",
    "/settings": "Settings",
  };

  const currentTitle =
    pageTitles[location.pathname] || "Personal Budget Tracker";

  const user = localStorage.getItem("loggedInUser") || "User";

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="profile">
          <div className="avatar">{user.charAt(0).toUpperCase()}</div>
          <div className="profile-name">{user}</div>
        </div>

        <nav className="nav">
          <NavLink to="/dashboard" className="nav-item">
            <span className="nav-icon">
              <LayoutDashboard size={18} />
            </span>
            Dashboard
          </NavLink>
          <NavLink to="/income" className="nav-item">
            <span className="nav-icon">
              <Wallet size={18} />
            </span>
            Income
          </NavLink>
          <NavLink to="/expenses" className="nav-item">
            <span className="nav-icon">
              <ShoppingCart size={18} />
            </span>
            Expenses
          </NavLink>
          <NavLink to="/groups" className="nav-item">
            <span className="nav-icon">
              <Users size={18} />
            </span>
            Groups
          </NavLink>
          <NavLink to="/budgets" className="nav-item">
            <span className="nav-icon">
              <Target size={18} />
            </span>
            Budgets
          </NavLink>
          <NavLink to="/settings" className="nav-item">
            <span className="nav-icon">
              <Settings size={18} />
            </span>
            Settings
          </NavLink>
        </nav>

        <NavLink
          to="/login"
          onClick={() => localStorage.clear()}
          className="nav-item logout"
        >
          <span className="nav-icon">
            <LogOut size={18} />
          </span>
          Logout
        </NavLink>
      </aside>

      {/* Main content */}
      <div className="main-area">
        <div className="topbar">
          {/* Left side -> dynamic page title */}
          <h2 style={{ fontWeight: 600, color: "#0f172a" }}>{currentTitle}</h2>

          {/* Right side -> Always show "PERSONAL BUDGET TRACKER" */}
          <h2 style={{ fontWeight: 700, color: "#6f3dd7", letterSpacing: "1px" }}>
            PERSONAL BUDGET TRACKER
          </h2>
        </div>

        <div className="main-inner">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
