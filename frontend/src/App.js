// src/App.js
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./pages/Dashboard";
import ExpensePage from "./pages/ExpensePage";
import IncomePage from "./pages/IncomePage";
import GroupsPage from "./pages/GroupsPage";   // ✅ new
import BudgetsPage from "./pages/BudgetsPage"; // ✅ new
import Layout from "./components/Layout";
import ProfileSettings from "./components/ProfileSettings";

function App() {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/expenses" element={<ExpensePage />} />
          <Route path="/income" element={<IncomePage />} />
          <Route path="/groups" element={<GroupsPage />} />       {/* ✅ */}
          <Route path="/budgets" element={<BudgetsPage />} />     {/* ✅ */}
          <Route path="/settings" element={<ProfileSettings />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
