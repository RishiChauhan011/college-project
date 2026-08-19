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
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <DomainProvider>
        <Router>
          <Routes>
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
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } />
            <Route path="/pathfinder" element={<Pathfinder />} />
            <Route path="/skill-insight" element={
              <ProtectedRoute>
                <SkillDetail />
              </ProtectedRoute>
            } />
            <Route path="/about" element={<About />} />
          </Routes>
        </Router>
      </DomainProvider>
    </AuthProvider>
  );
}

export default App;
