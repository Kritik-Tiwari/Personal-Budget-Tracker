import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function SettingsIcon() {
  const navigate = useNavigate();

  return (
    <div className="settings-icon" onClick={() => navigate("/settings")}>
      ⚙️
    </div>
  );
}
