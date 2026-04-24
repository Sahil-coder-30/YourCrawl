import "./App.scss";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

// Auth pages
import Login from "../features/auth/components/Login";
import Register from "../features/auth/components/Register";
import VerifyOTP from "../features/auth/components/VerifyOTP";
import ForgotPassword from "../features/auth/components/ForgotPassword";
import ResetPassword from "../features/auth/components/ResetPassword";
import SetPassword from "../features/auth/components/SetPassword";

// Protected route guard
import ProtectedRoute from "../components/common/ProtectedRoute";

// App pages
import Landing from "../features/landing/components/Landing";
import Dashboard from "../features/dashboard/components/Dashboard";
import Config from "../features/config/components/Config";
import Analysis from "../features/analysis/components/Analysis";
import Roadmap from "../features/roadmap/components/Roadmap";
import Compliance from "../features/compliance/components/Compliance";
import Audits from "../features/audits/components/Audits";
import Profile from "../features/profile/components/Profile";

// RAG Compliance Assistant
import RagChat from "../features/rag/components/RagChat";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* ── Public ─────────────────────────────────────── */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/set-password" element={<SetPassword />} />

          {/* ── Protected ───────────────────────────────────── */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/config" element={<ProtectedRoute><Config /></ProtectedRoute>} />
          <Route path="/audits" element={<ProtectedRoute><Audits /></ProtectedRoute>} />
          <Route path="/analysis" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
          <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
          <Route path="/compliance" element={<ProtectedRoute><Compliance /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* ── Floating RAG Chat — available on all pages ── */}
        <RagChat />

        <Toaster position="top-right" richColors closeButton />
      </BrowserRouter>
    </div>
  );
}

export default App;

