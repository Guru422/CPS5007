import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./providers/AuthProvider";

import AppShell from "../components/layout/AppShell";

import RequireAuth from "./guards/RequireAuth";
import RequireRole from "./guards/RequireRole";
import RequirePaid from "./guards/RequirePaid";

import LoginPage from "../features/auth/pages/LoginPage";
import StudentDashboard from "../features/student/pages/StudentDashboard";
import AssignmentsPage from "../features/student/pages/AssignmentsPage";
import ParentDashboard from "../features/parent/pages/ParentDashboard";
import TeacherDashboard from "../features/teacher/pages/TeacherDashboard";
import AiAssistantPage from "../features/premium/pages/AiAssistantPage";
import FeatureLocked from "../features/premium/pages/FeatureLocked";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/redirect" replace />} />
        <Route path="redirect" element={<RoleRedirect />} />

        <Route
          path="student/dashboard"
          element={
            <RequireRole role="student">
              <StudentDashboard />
            </RequireRole>
          }
        />

        <Route
          path="student/assignments"
          element={
            <RequireRole role="student">
              <AssignmentsPage />
            </RequireRole>
          }
        />

        <Route
          path="student/ai"
          element={
            <RequireRole role="student">
              <RequirePaid fallback={<FeatureLocked />}>
                <AiAssistantPage />
              </RequirePaid>
            </RequireRole>
          }
        />

        <Route
          path="parent/dashboard"
          element={
            <RequireRole role="parent">
              <ParentDashboard />
            </RequireRole>
          }
        />

        <Route
          path="teacher/dashboard"
          element={
            <RequireRole role="teacher">
              <TeacherDashboard />
            </RequireRole>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/redirect" replace />} />
    </Routes>
  );
}

function RoleRedirect() {
  const { user } = useAuth();

  if (!user.isAuthenticated) return <Navigate to="/login" replace />;

  if (user.role === "student") return <Navigate to="/student/dashboard" replace />;
  if (user.role === "parent") return <Navigate to="/parent/dashboard" replace />;
  if (user.role === "teacher") return <Navigate to="/teacher/dashboard" replace />;

  return <Navigate to="/login" replace />;
}