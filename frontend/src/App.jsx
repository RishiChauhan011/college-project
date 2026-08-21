import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DomainProvider } from './context/DomainContext';
import { DashboardDataProvider } from './context/DashboardDataContext';

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
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';
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
import AdminProfile from './admin/pages/AdminProfile';
import AdminEditProfile from './admin/pages/AdminEditProfile';

function App() {
  return (
    <AuthProvider>
      <DomainProvider>
        <Router>
          <Routes>
            {/* Student & Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<SignupLogin />} />
            <Route path="/about" element={<About />} />

            <Route path="/onboarding" element={
              <ProtectedRoute requireCompleteProfile={false}>
                <Onboarding />
              </ProtectedRoute>
            } />
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

            {/* Dashboard Data-Driven Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardDataProvider>
                  <Dashboard />
                </DashboardDataProvider>
              </ProtectedRoute>
            } />
            <Route path="/roadmap" element={
              <ProtectedRoute>
                <DashboardDataProvider>
                  <Roadmap />
                </DashboardDataProvider>
              </ProtectedRoute>
            } />
            <Route path="/pathfinder" element={
              <DashboardDataProvider>
                <Pathfinder />
              </DashboardDataProvider>
            } />
            <Route path="/skill-insight" element={
              <ProtectedRoute>
                <DashboardDataProvider>
                  <SkillDetail />
                </DashboardDataProvider>
              </ProtectedRoute>
            } />
            <Route path="/companies" element={
              <ProtectedRoute>
                <DashboardDataProvider>
                  <Companies />
                </DashboardDataProvider>
              </ProtectedRoute>
            } />
            <Route path="/companies/:id" element={
              <ProtectedRoute>
                <DashboardDataProvider>
                  <CompanyDetail />
                </DashboardDataProvider>
              </ProtectedRoute>
            } />

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
            <Route path="/admin/profile" element={
              <AdminProtectedRoute>
                <AdminProfile />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/profile/edit" element={
              <AdminProtectedRoute>
                <AdminEditProfile />
              </AdminProtectedRoute>
            } />
          </Routes>
        </Router>
      </DomainProvider>
    </AuthProvider>
  );
}

export default App;
