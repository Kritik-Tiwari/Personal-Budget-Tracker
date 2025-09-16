const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./Models/db"); // MongoDB connection file

const AuthRouter = require("./Routes/AuthRouter");
const ProductRouter = require("./Routes/ProductRouter");
const ExpenseRouter = require("./Routes/ExpenseRouter");
const BudgetRouter = require("./Routes/BudgetRouter");
const GroupRouter = require("./Routes/GroupRouter");
const UserRouter = require("./Routes/UserRouter");
const ensureAuthenticated = require("./Middlewares/Auth");

const app = express();
const PORT = process.env.PORT || 8080;

// CORS configuration
app.use(cors({
  origin: [
    "http://localhost:3000",                             // local development
    "https://personal-budget-tracker-cdanna7g7j.vercel.app" //Vercel frontend URL
  ],
  credentials: true
}));

// Middleware to parse JSON
app.use(express.json());

// ✅ Serve uploaded files (avatars, etc.)
app.use("/uploads", express.static("uploads"));

// Health check route
app.get("/", (req, res) => {
  res.send("✅ Personal Budget Tracker Backend is running!");
});

app.get("/ping", (req, res) => res.send("PONG"));

// Routes
app.use("/auth", AuthRouter);
app.use("/products", ProductRouter);
app.use("/expenses", ensureAuthenticated, ExpenseRouter);
app.use("/budgets", ensureAuthenticated, BudgetRouter);
app.use("/groups", ensureAuthenticated, GroupRouter);
app.use("/user", ensureAuthenticated, UserRouter);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
