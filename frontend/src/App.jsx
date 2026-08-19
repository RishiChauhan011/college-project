import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DomainProvider } from './context/DomainContext';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import SignupLogin from './pages/SignupLogin';
import Roadmap from './pages/Roadmap';
import Onboarding from './pages/Onboarding';
import Pathfinder from './pages/Pathfinder';
import SkillDetail from './pages/SkillDetail';
import About from './pages/About';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import ProtectedRoute from './components/ProtectedRoute';

// Admin Pages & Guard
import AdminProtectedRoute from './admin/components/AdminProtectedRoute';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminUsers from './admin/pages/AdminUsers';
import AdminUserDetail from './admin/pages/AdminUserDetail';
import AdminJobs from './admin/pages/AdminJobs';
import AdminJobDetail from './admin/pages/AdminJobDetail';
import AdminCompanies from './admin/pages/AdminCompanies';
import AdminCompanyDetail from './admin/pages/AdminCompanyDetail';
import AdminSkills from './admin/pages/AdminSkills';
import AdminSkillDetail from './admin/pages/AdminSkillDetail';
import AdminAnalytics from './admin/pages/AdminAnalytics';
import AdminAiInsights from './admin/pages/AdminAiInsights';
import AdminActivity from './admin/pages/AdminActivity';
import AdminSettings from './admin/pages/AdminSettings';
import AdminProfile from './admin/pages/AdminProfile';

function App() {
  return (
    <AuthProvider>
      <DomainProvider>
        <Router>
          <Routes>
            {/* Student & Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<SignupLogin />} />
            <Route path="/roadmap" element={
              <ProtectedRoute>
                <Roadmap />
              </ProtectedRoute>
            } />
            <Route path="/onboarding" element={
              <ProtectedRoute requireCompleteProfile={false}>
                <Onboarding />
              </ProtectedRoute>
            } />
            <Route path="/pathfinder" element={<Pathfinder />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/profile/edit" element={
              <ProtectedRoute requireCompleteProfile={false}>
                <EditProfile />
              </ProtectedRoute>
            } />
            <Route path="/skill-insight" element={
              <ProtectedRoute>
                <SkillDetail />
              </ProtectedRoute>
            } />
            <Route path="/about" element={<About />} />

            {/* Admin Control Center Routes */}
            <Route path="/admin" element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/dashboard" element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <AdminProtectedRoute>
                <AdminUsers />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/users/:id" element={
              <AdminProtectedRoute>
                <AdminUserDetail />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/jobs" element={
              <AdminProtectedRoute>
                <AdminJobs />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/jobs/:id" element={
              <AdminProtectedRoute>
                <AdminJobDetail />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/companies" element={
              <AdminProtectedRoute>
                <AdminCompanies />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/companies/:id" element={
              <AdminProtectedRoute>
                <AdminCompanyDetail />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/skills" element={
              <AdminProtectedRoute>
                <AdminSkills />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/skills/:id" element={
              <AdminProtectedRoute>
                <AdminSkillDetail />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <AdminProtectedRoute>
                <AdminAnalytics />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/ai-insights" element={
              <AdminProtectedRoute>
                <AdminAiInsights />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/activity" element={
              <AdminProtectedRoute>
                <AdminActivity />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <AdminProtectedRoute>
                <AdminSettings />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/profile" element={
              <AdminProtectedRoute>
                <AdminProfile />
              </AdminProtectedRoute>
            } />
          </Routes>
        </Router>
      </DomainProvider>
    </AuthProvider>
  );
}

export default App;
