// Responsibility: define the small route surface for the React workspace.

import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage";
import InterviewPage from "./pages/InterviewPage/InterviewPage";
import EvaluationDashboardPage from "./pages/EvaluationDashboard/EvaluationDashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/interview" element={<InterviewPage />} />
      <Route path="/evaluation" element={<EvaluationDashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
