const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./Models/db"); // MongoDB connection file

const AuthRouter = require("./Routes/AuthRouter");
const ProductRouter = require("./Routes/ProductRouter");
const ExpenseRouter = require("./Routes/ExpenseRouter");
const BudgetRouter = require("./Routes/BudgetRouter");   // ✅ new
const GroupRouter = require("./Routes/GroupRouter");     // ✅ new
const UserRouter = require("./Routes/UserRouter");       // ✅ new
const ensureAuthenticated = require("./Middlewares/Auth");

const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(cors());
app.use(express.json()); // ✅ replaces bodyParser.json()

// ✅ Serve uploaded files (avatars etc.)
app.use("/uploads", express.static("uploads"));

// Health check route
app.get("/ping", (req, res) => res.send("PONG"));

// Routes
app.use("/auth", AuthRouter);
app.use("/products", ProductRouter);
app.use("/expenses", ensureAuthenticated, ExpenseRouter); // ✅ protected
app.use("/budgets", ensureAuthenticated, BudgetRouter);   // ✅ protected
app.use("/groups", ensureAuthenticated, GroupRouter);     // ✅ protected
app.use("/user", ensureAuthenticated, UserRouter);        // ✅ protected

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
