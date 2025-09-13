const bcrypt = require("bcrypt");
const User = require("../Models/User");

// Helper to attach full avatar URL
const formatUser = (req, user) => {
  if (!user) return null;
  const obj = user.toObject ? user.toObject() : user;
  return {
    ...obj,
    avatar: obj.avatar ? `${req.protocol}://${req.get("host")}${obj.avatar}` : null,
  };
};

// ✅ Get logged-in user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -refreshToken");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user: formatUser(req, user) });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
};

// ✅ Update name
exports.updateName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Name required" });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true }
    ).select("-password -refreshToken");

    res.json({ success: true, user: formatUser(req, user) });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating name" });
  }
};

// ✅ Update email
exports.updateEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email required" });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { email },
      { new: true }
    ).select("-password -refreshToken");

    res.json({ success: true, user: formatUser(req, user) });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating email" });
  }
};

// ✅ Update password
exports.updatePassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(req.user._id, { password: hashed });

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating password" });
  }
};

// ✅ Update avatar
exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: "No file uploaded" });

    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarPath }, // store relative path in DB
      { new: true }
    ).select("-password -refreshToken");

    res.json({ success: true, user: formatUser(req, user) });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating avatar" });
  }
};
