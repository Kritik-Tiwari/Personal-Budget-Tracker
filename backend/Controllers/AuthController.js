const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../Models/User");

// Generate JWT and Refresh Token
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { email: user.email, _id: user._id, name: user.name }, //include _id
    process.env.JWT_SECRET,
    { expiresIn: "15m" } // short-lived access token
  );

  const refreshToken = jwt.sign(
    { email: user.email, _id: user._id, name: user.name }, //include _id
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

// ======================
// Signup
// ======================
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User already exists, please login", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new UserModel({ name, email, password: hashedPassword });
    await user.save();

    // Generate tokens immediately after signup
    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      message: "Signup successful",
      success: true,
      accessToken,
      refreshToken,
      user: { _id: user._id, name: user.name, email: user.email }, 
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

// ======================
// Login
// ======================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    const errorMsg = "Authentication failed: email or password is wrong";

    if (!user) {
      return res.status(403).json({ message: errorMsg, success: false });
    }

    const isPassEqual = await bcrypt.compare(password, user.password);
    if (!isPassEqual) {
      return res.status(403).json({ message: errorMsg, success: false });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      message: "Login Success",
      success: true,
      accessToken,
      refreshToken,
      user: { _id: user._id, name: user.name, email: user.email }, 
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

// ======================
// Refresh Token
// ======================
const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res
      .status(401)
      .json({ message: "No refresh token", success: false });

  try {
    const user = await UserModel.findOne({ refreshToken });
    if (!user)
      return res
        .status(403)
        .json({ message: "Invalid refresh token", success: false });

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err)
        return res
          .status(403)
          .json({ message: "Invalid refresh token", success: false });

      const { accessToken, refreshToken: newRefreshToken } = generateTokens(
        user
      );
      user.refreshToken = newRefreshToken;
      user.save();

      return res.json({
        success: true,
        accessToken,
        refreshToken: newRefreshToken,
        user: { _id: user._id, name: user.name, email: user.email }, 
      });
    });
  } catch (err) {
    console.error("Refresh Error:", err);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

module.exports = { signup, login, refresh };
