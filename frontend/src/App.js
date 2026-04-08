import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import LearningPath from "@/pages/LearningPath";
import Sandbox from "@/pages/Sandbox";
import Badges from "@/pages/Badges";
import Planner from "@/pages/Planner";
import Forum from "@/pages/Forum";
import ThreadDetail from "@/pages/ThreadDetail";
import StudyRooms from "@/pages/StudyRooms";
import AppLayout from "@/components/AppLayout";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#FACC15] border-t-transparent animate-spin" data-testid="loading-spinner" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#FACC15] border-t-transparent animate-spin" />
    </div>
  );
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/learning-path" element={<LearningPath />} />
            <Route path="/sandbox" element={<Sandbox />} />
            <Route path="/badges" element={<Badges />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/study-rooms" element={<StudyRooms />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/forum/:threadId" element={<ThreadDetail />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
