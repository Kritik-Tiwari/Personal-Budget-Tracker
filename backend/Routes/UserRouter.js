const router = require("express").Router();
const ensureAuthenticated = require("../Middlewares/Auth");
const multer = require("multer");
const path = require("path");
const {
  getProfile,
  updateName,
  updateEmail,
  updatePassword,
  updateAvatar,
} = require("../Controllers/UserController");


// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Routes
router.get("/me", ensureAuthenticated, getProfile);
router.put("/name", ensureAuthenticated, updateName);
router.put("/email", ensureAuthenticated, updateEmail);
router.put("/password", ensureAuthenticated, updatePassword);
router.put("/avatar", ensureAuthenticated, upload.single("avatar"), updateAvatar);

module.exports = router;
