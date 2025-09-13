const mongoose = require("mongoose");
require("dotenv").config();

const mongoURI = process.env.MONGO_CONN;

if (!mongoURI) {
  console.error("❌ ERROR: MONGO_CONN is missing in environment variables.");
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected...");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
})();
