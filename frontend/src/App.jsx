import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import LoadingInterceptor from './components/LoadingInterceptor';
import LoadingScreen from './components/LoadingScreen';
import { useLoading } from './context/LoadingContext';
import { getNetworkLoadingDuration } from './utils/networkSpeed';

const AnimatedRoutes = ({ displayLocation }) => {
  return (
    <ErrorBoundary>
      <Routes location={displayLocation} key={displayLocation.pathname}>
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
        
        <Route path="/" element={<AuthPage isLanding={true} />} />
      </Routes>
    </ErrorBoundary>
  );
};

const AppContent = () => {
  const location = useLocation();
  const { isLoading } = useLoading();
  const [prevLocation, setPrevLocation] = useState(location);
  const [displayLocation, setDisplayLocation] = useState(location);
  const [initialLoading, setInitialLoading] = useState(true);

  // Visited routes set (resets each time the page is reloaded in the browser)
  const [visitedRoutes, setVisitedRoutes] = useState(() => new Set([location.pathname]));

  // When location changes:
  // If already visited, synchronously sync displayLocation during render so there is ZERO delay or flash.
  if (location !== prevLocation) {
    setPrevLocation(location);
    if (visitedRoutes.has(location.pathname)) {
      setDisplayLocation(location);
    }
  }

  // On page reload / initial visit: show loader based on internet speed
  useEffect(() => {
    const duration = getNetworkLoadingDuration();
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, duration);
    return () => clearTimeout(timer);
  }, []);

  // When visiting a brand-new page for the first time: show loading animation, then display page
  useEffect(() => {
    if (location.pathname === displayLocation.pathname) {
      return;
    }

    if (!visitedRoutes.has(location.pathname)) {
      const duration = getNetworkLoadingDuration();

      const timer = setTimeout(() => {
        setVisitedRoutes((prev) => {
          const updated = new Set(prev);
          updated.add(location.pathname);
          return updated;
        });
        setDisplayLocation(location);
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [location, displayLocation.pathname, visitedRoutes]);

  const isVisitingNewPage =
    location.pathname !== displayLocation.pathname &&
    !visitedRoutes.has(location.pathname);

  const activeLoading = isLoading || initialLoading || isVisitingNewPage;

  return (
    <>
      <LoadingInterceptor />
      <LoadingScreen isVisible={activeLoading} />
      <div
        className={`min-h-screen ${
          activeLoading
            ? 'filter blur-md pointer-events-none select-none'
            : ''
        }`}
      >
        <AnimatedRoutes displayLocation={displayLocation} />
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
