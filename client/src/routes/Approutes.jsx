import { Routes, Route, Navigate } from "react-router-dom";

import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import GoogleCallback from "../pages/auth/GoogleCallback";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

function Dashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#edf2f9]">
      <h1 className="text-3xl font-bold text-slate-800">
        Resume Builder Dashboard
      </h1>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/register" replace />} />

      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route
  path="/auth/google/callback"
  element={<GoogleCallback />}
/>
<Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>
<Route
  path="/reset-password/:token"
  element={<ResetPassword />}
/>

      <Route path="*" element={<Navigate to="/register" replace />} />
    </Routes>
  );
}