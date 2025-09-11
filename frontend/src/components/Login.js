import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { APIUrl, handleError, handleSuccess } from "../utils";
import "../styles/auth.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false); // 👁 toggle
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${APIUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("loggedInUser", data.user?.name || form.email);
      handleSuccess("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      handleError(err.message);
    }
  };

  return (
    <div className="auth-container">
      {/* Left Section */}
      <div className="auth-left">
        <h1 className="brand-title">Personal Budget Tracker</h1>

        <div className="auth-box">
          <h2>Welcome Back</h2>
          <p className="subtitle">Please log in to continue</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@email.com"
                required
              />
            </div>

            <div className="form-group password-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
                <span
                  className="toggle-eye"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>
            </div>

            <button type="submit" className="btn-primary">
              Login
            </button>
          </form>

          <p className="footer-text">
            Don’t have an account?{" "}
            <Link to="/signup" className="link">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="auth-right">
        <div className="auth-graphic">
          <h3>Manage Your Finances Easily</h3>
          <p>Track your income & expenses with Personal Budget Tracker.</p>
          <div className="fake-chart">
            <div className="bar" style={{ height: "50%" }}></div>
            <div className="bar" style={{ height: "75%" }}></div>
            <div className="bar" style={{ height: "60%" }}></div>
            <div className="bar" style={{ height: "85%" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
