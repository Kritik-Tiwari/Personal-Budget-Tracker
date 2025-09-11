import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { APIUrl, handleError, handleSuccess } from "../utils";
import "../styles/auth.css";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${APIUrl}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      handleSuccess("Signup successful! Please log in.");
      navigate("/login");
    } catch (err) {
      handleError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <h1 className="brand-title">Personal Budget Tracker</h1>

        <div className="auth-box">
          <h2>Create an Account</h2>
          <p className="subtitle">Please enter your details to sign up</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>

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
                  placeholder="Min 8 Characters"
                  required
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>
            </div>

            <button type="submit" className="btn-primary">
              Sign Up
            </button>
          </form>

          <p className="footer-text">
            Already have an account?{" "}
            <Link to="/login" className="link">
              Log In
            </Link>
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-graphic">
          <h3>Manage Your Money</h3>
          <p>Create your account and start tracking expenses today.</p>
          <div className="fake-chart">
            <div className="bar" style={{ height: "40%" }}></div>
            <div className="bar" style={{ height: "75%" }}></div>
            <div className="bar" style={{ height: "55%" }}></div>
            <div className="bar" style={{ height: "90%" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
