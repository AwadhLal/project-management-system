import { Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import ProjectDetails from "./pages/ProjectDetails";
import TaskDetails from "./pages/TaskDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CompanyRegistration from "./pages/CompanyRegistration";
import EmployeeSignup from "./pages/EmployeeSignup";
import GoogleSignupFlow from "./pages/GoogleSignupFlow";
import CompanyDashboard from "./pages/CompanyDashboard";
import Settings from "./pages/Settings";

const App = () => {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/google-signup" element={<GoogleSignupFlow />} />
        <Route path="/company-signup" element={<CompanyRegistration />} />
        <Route path="/employee-signup" element={<EmployeeSignup />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="company" element={<CompanyDashboard />} />
          <Route path="team" element={<Team />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projectsDetail" element={<ProjectDetails />} />
          <Route path="taskDetails" element={<TaskDetails />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
