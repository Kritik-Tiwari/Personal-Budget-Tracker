// src/App.js
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./pages/Dashboard";
import ExpensePage from "./pages/ExpensePage";
import IncomePage from "./pages/IncomePage";
import Layout from "./components/Layout";  // ✅ import Layout

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes with Sidebar */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/expenses" element={<ExpensePage />} />
        <Route path="/income" element={<IncomePage />} />
      </Route>
    </Routes>
  );
}

export default App;
