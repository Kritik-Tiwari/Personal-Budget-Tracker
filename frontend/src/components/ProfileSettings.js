import React, { useState } from "react";
import { APIUrl, handleError, handleSuccess } from "../utils";
import "../App.css";

export default function ProfileSettings({ user }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(user?.avatar || null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      // ✅ 1. Update avatar separately if selected
      if (avatar) {
        const data = new FormData();
        data.append("avatar", avatar);
        await fetch(`${APIUrl}/user/${user.id}/avatar`, {
          method: "PUT",
          body: data,
        });
      }

      // ✅ 2. Only send changed fields
      const updatedFields = {};
      if (form.name && form.name !== user.name) updatedFields.name = form.name;
      if (form.email && form.email !== user.email) updatedFields.email = form.email;
      if (form.password && form.password.trim() !== "")
        updatedFields.password = form.password;

      // If something actually changed, send request
      if (Object.keys(updatedFields).length > 0) {
        const res = await fetch(`${APIUrl}/user/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedFields),
        });

        const responseData = await res.json();
        if (!res.ok) throw new Error(responseData.message);
      }

      handleSuccess("Profile updated!");
    } catch (err) {
      handleError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Profile Settings</h2>
        <p className="subtitle">Manage your account details</p>

        {/* Avatar */}
        <div className="avatar-upload-wrapper">
          <label htmlFor="newAvatar">
            <div className="avatar-circle">
              {preview ? (
                <img src={preview} alt="Avatar" className="avatar-img" />
              ) : (
                <span className="avatar-placeholder">👤</span>
              )}
              <div className="avatar-arrow">⬆️</div>
            </div>
          </label>
          <input
            id="newAvatar"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: "none" }}
          />
        </div>

        {/* Profile form */}
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder={user?.name || "Enter name"}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder={user?.email || "Enter email"}
          />
        </div>

        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Leave blank if unchanged"
          />
        </div>

        <button onClick={handleSave} className="btn-primary">
          Save Changes
        </button>
      </div>
    </div>
  );
}
