// src/components/Layout.js
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../styles/layout.css"; // import layout CSS

export default function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <h2>Personal-Budget-Tracker</h2>
          </div>
          <div className="topbar-right">
            {/* put profile, notifications, etc. */}
            <span className="username">{localStorage.getItem("loggedInUser") || "User"}</span>
          </div>
        </header>

        <main className="main-inner">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
