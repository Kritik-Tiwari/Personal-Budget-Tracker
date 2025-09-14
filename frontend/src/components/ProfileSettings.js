// src/components/ProfileSettings.js
import React, { useState } from "react";
import { APIUrl, handleError, handleSuccess } from "../utils";
import "../App.css";

export default function ProfileSettings({ user }) {
  const [newName, setNewName] = useState(user?.name || "");
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(
    localStorage.getItem("userAvatar") || user?.avatar || null
  );

  // ✅ Save user + notify Sidebar
  const saveUserToLocalStorage = (userData) => {
    if (!userData) return;
    if (userData.name) localStorage.setItem("loggedInUser", userData.name);
    if (userData.avatar) localStorage.setItem("userAvatar", userData.avatar);

    // 🔄 notify Sidebar instantly
    window.dispatchEvent(new Event("profileUpdated"));
  };

  // Avatar preview
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Update Avatar
  const updateAvatar = async () => {
    try {
      if (!avatar) return handleError("Please select an image first");
      const data = new FormData();
      data.append("avatar", avatar);

      const res = await fetch(`${APIUrl}/user/avatar`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: data,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      if (result.user) {
        saveUserToLocalStorage(result.user);
        setPreview(result.user.avatar);
      }

      handleSuccess("Avatar updated ✅");
    } catch (err) {
      handleError(err.message);
    }
  };

  // ✅ Update Name
  const updateNameHandler = async () => {
    try {
      const res = await fetch(`${APIUrl}/user/name`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (data.user) saveUserToLocalStorage(data.user);
      handleSuccess("Name updated ✅");
    } catch (err) {
      handleError(err.message);
    }
  };

  // ✅ Update Email
  const updateEmailHandler = async () => {
    try {
      const res = await fetch(`${APIUrl}/user/email`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ email: newEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (data.user) saveUserToLocalStorage(data.user);
      handleSuccess("Email updated ✅");
    } catch (err) {
      handleError(err.message);
    }
  };

  // ✅ Update Password
  const updatePasswordHandler = async () => {
    try {
      const res = await fetch(`${APIUrl}/user/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ oldPassword, password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      handleSuccess("Password updated ✅");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      handleError(err.message);
    }
  };

  return (
    <div className="main-area">
      <h1 className="page-title">Profile Settings</h1>

      {/* Avatar */}
      <div className="card mb-4">
        <h3>Update Avatar</h3>
        <div className="avatar-upload-wrapper">
          <label htmlFor="newAvatar">
            <div className="avatar-circle avatar">
              {preview ? (
                <img src={preview} alt="Avatar" />
              ) : (
                <span className="avatar-placeholder">👤</span>
              )}
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
        <button className="btn-primary mt-2" onClick={updateAvatar}>
          Save Avatar
        </button>
      </div>

      {/* Name */}
      <div className="card mb-4">
        <h3>Edit Name</h3>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="input"
        />
        <button className="btn-primary mt-2" onClick={updateNameHandler}>
          Save Name
        </button>
      </div>

      {/* Email */}
      <div className="card mb-4">
        <h3>Edit Email</h3>
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="input"
        />
        <button className="btn-primary mt-2" onClick={updateEmailHandler}>
          Save Email
        </button>
      </div>

      {/* Password */}
      <div className="card">
        <h3>Change Password</h3>
        <input
          type="password"
          placeholder="Old password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="input"
        />
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="input mt-2"
        />
        <button className="btn-primary mt-2" onClick={updatePasswordHandler}>
          Update Password
        </button>
      </div>
    </div>
  );
}
