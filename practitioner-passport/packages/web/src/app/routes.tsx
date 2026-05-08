import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./providers/AuthProvider";

import RequireAuth from "./guards/RequireAuth";
import RequireRole from "./guards/RequireRole";

import AppShell from "../components/layout/AppShell";

import LoginPage from "../features/auth/pages/LoginPage";
import SignupPage from "../features/auth/pages/SignupPage";

import StudentDashboard from "../features/student/pages/StudentDashboard";
import CompetenciesPage from "../features/student/pages/CompetenciesPage";
import QualificationsPage from "../features/student/pages/QualificationsPage";
import DevelopmentLogPage from "../features/student/pages/DevelopmentLogPage";
import PlacementsPage from "../features/student/pages/PlacementsPage";
import AiCvGeneratorPage from "../features/student/pages/AiCvGeneratorPage";
import StudentChatPage from "../features/student/pages/StudentChatPage";
import ProgressPage from "../features/student/pages/ProgressPage";
import AnalyticsPage from "../features/student/pages/AnalyticsPage";

import MentorDashboard from "../features/mentor/pages/MentorDashboard";
import StudentProgressPage from "../features/mentor/pages/StudentProgressPage";
import MentorQualificationsPage from "../features/mentor/pages/MentorQualificationsPage";
import MentorPlacementProgressPage from "../features/mentor/pages/MentorPlacementProgressPage";

import TeacherDashboard from "../features/teacher/pages/AcademicDashboard";
import PlacementRequestsPage from "../features/teacher/pages/PlacementRequestsPage";
import TeacherChatPage from "../features/teacher/pages/AcademicChatPage";
import ReportsPage from "../features/teacher/pages/ReportsPage";


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

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
          path="student/competencies"
          element={
            <RequireRole role="student">
              <CompetenciesPage />
            </RequireRole>
          }
        />
        <Route
          path="student/qualifications"
          element={
            <RequireRole role="student">
              <QualificationsPage />
            </RequireRole>
          }
        />
        <Route
          path="student/development"
          element={
            <RequireRole role="student">
              <DevelopmentLogPage />
            </RequireRole>
          }
        />
        <Route
          path="student/placements"
          element={
            <RequireRole role="student">
              <PlacementsPage />
            </RequireRole>
          }
        />
        <Route
          path="student/ai-cv"
          element={
            <RequireRole role="student">
              <AiCvGeneratorPage />
            </RequireRole>
          }
        />
        <Route
          path="student/chat"
          element={
            <RequireRole role="student">
              <StudentChatPage />
            </RequireRole>
          }
        />

        <Route
          path="student/progress"
          element={
            <RequireRole role="student">
              <ProgressPage />
            </RequireRole>
          }
        />
        <Route
          path="student/analytics"
          element={
            <RequireRole role="student">
              <AnalyticsPage />
            </RequireRole>
          }
        />

        <Route
          path="mentor/dashboard"
          element={
            <RequireRole role="mentor">
              <MentorDashboard />
            </RequireRole>
          }
        />
        <Route
          path="mentor/progress"
          element={
            <RequireRole role="mentor">
              <StudentProgressPage />
            </RequireRole>
          }
        />
        
        <Route
          path="mentor/qualifications"
          element={
            <RequireRole role="mentor">
              <MentorQualificationsPage />
            </RequireRole>
          }
        />
        <Route
          path="mentor/placements"
          element={
            <RequireRole role="mentor">
              <MentorPlacementProgressPage />
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
        <Route
          path="teacher/placement-requests"
          element={
            <RequireRole role="teacher">
              <PlacementRequestsPage />
            </RequireRole>
          }
        />
        <Route
          path="teacher/chat"
          element={
            <RequireRole role="teacher">
              <TeacherChatPage />
            </RequireRole>
          }
        />
        <Route
          path="teacher/reports"
          element={
            <RequireRole role="teacher">
              <ReportsPage />
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
  if (user.role === "mentor") return <Navigate to="/mentor/dashboard" replace />;
  if (user.role === "teacher") return <Navigate to="/teacher/dashboard" replace />;

  return <Navigate to="/login" replace />;
}