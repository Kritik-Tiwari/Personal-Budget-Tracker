const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Read the URI
const mongoURI = process.env.MONGO_CONN;

if (!mongoURI) {
    console.error("❌ ERROR: MONGO_CONN is missing in .env file.");
    process.exit(1); // Stop the process
}

(async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log("✅ MongoDB Connected...");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);
        process.exit(1);
    }
})();
