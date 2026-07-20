import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/Dashboard";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import JobDescriptions from "./pages/JobDescriptions";
import InterviewPrep from "./pages/InterviewPrep";
import Roadmap from "./pages/Roadmap";
import History from "./pages/History";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/resume-analysis" element={<ResumeAnalysis />} />
          <Route path="/job-descriptions" element={<JobDescriptions />} />
          <Route path="/interview-prep" element={<InterviewPrep />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
