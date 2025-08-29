// Middlewares/Auth.js
const jwt = require('jsonwebtoken');

const ensureAuthenticated = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(403).json({ message: 'Unauthorized, JWT token is required', success: false });
  }

  // Accept both: "Bearer <token>" and "<token>"
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  try {
    if (!process.env.JWT_SECRET) {
      // This prevents confusing 500s when secret is missing
      return res.status(500).json({ message: 'Server misconfigured: JWT secret missing', success: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Make sure the token actually has an _id
    if (!decoded || !decoded._id) {
      return res.status(403).json({ message: 'Unauthorized, token payload invalid', success: false });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Unauthorized, JWT token wrong or expired', success: false });
  }
};

module.exports = ensureAuthenticated;
