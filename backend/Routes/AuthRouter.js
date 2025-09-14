const router = require("express").Router();
const { signup, login, refresh } = require("../Controllers/AuthController");
const { signupValidation, loginValidation } = require("../Middlewares/AuthValidation");
const ensureAuthenticated = require("../Middlewares/Auth"); // 👈 import
const User = require("../Models/User");
const multer = require("multer");
const path = require("path");

// ======================
// Multer setup for avatar uploads
// ======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "backend/uploads/avatars");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ======================
// Auth routes
// ======================
router.post("/signup", signupValidation, signup);
router.post("/login", loginValidation, login);
router.post("/refresh", refresh);

// ======================
// Update user profile (name, email, password)
// ======================
router.put("/user/profile", ensureAuthenticated, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const updateData = {};
    if (name && name.trim() !== "") updateData.name = name;
    if (email && email.trim() !== "") updateData.email = email;
    if (password && password.trim() !== "") updateData.password = password; // ⚠️ hash later

    const user = await User.findByIdAndUpdate(
      req.user._id, // 👈 from token
      { $set: updateData },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Update user avatar
router.put("/user/avatar", ensureAuthenticated, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No avatar uploaded" });
    }

    // ✅ Build full URL
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 8080}`;
    const avatarUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      success: true,
      message: "Avatar updated ✅",
      avatar: user.avatar,
      user,
    });
  } catch (err) {
    console.error("Avatar update error:", err);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});


module.exports = router;
