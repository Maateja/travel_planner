import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import TripForm from './pages/TripForm';
import TripDetails from './pages/TripDetails';
import ProfilePage from './pages/ProfilePage';
import ManualPlan from './pages/ManualPlan';
import MyTrips from './pages/MyTrips';
import BudgetPlanner from './pages/BudgetPlanner';
import SpinWheelPage from './pages/SpinWheelPage';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { AnimatePresence } from 'framer-motion';



const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<AuthPage isLogin={true} />} />
          <Route path="/register" element={<AuthPage isLogin={false} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/create-trip" element={<ProtectedRoute><MainLayout><TripForm /></MainLayout></ProtectedRoute>} />
          <Route path="/manual-plan" element={<ProtectedRoute><MainLayout><ManualPlan /></MainLayout></ProtectedRoute>} />
          <Route path="/my-trips" element={<ProtectedRoute><MainLayout><MyTrips /></MainLayout></ProtectedRoute>} />
          <Route path="/budget-planner" element={<ProtectedRoute><MainLayout><BudgetPlanner /></MainLayout></ProtectedRoute>} />
          <Route path="/spin-wheel" element={<ProtectedRoute><MainLayout><SpinWheelPage /></MainLayout></ProtectedRoute>} />
          <Route path="/trip/:id" element={<ProtectedRoute><MainLayout><TripDetails /></MainLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>} />
          
          <Route path="/" element={<AuthPage isLogin={false} />} />
        </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  );
};

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
