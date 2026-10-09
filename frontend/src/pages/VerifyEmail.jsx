import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { CheckCircle, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLoading } from '../context/LoadingContext';

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(3);
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    let isMounted = true;
    const verifyEmailToken = async () => {
      showLoading();
      try {
        const res = await api.get(`users/verify-email/${token}`);
        if (!isMounted) return;
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully! Your account is now active.');
      } catch (err) {
        if (!isMounted) return;
        setStatus('error');
        if (err.response && err.response.data) {
          setMessage(err.response.data.message || err.response.data.error || 'Invalid or expired verification link.');
        } else {
          setMessage('Server error during verification. Please try again later.');
        }
      } finally {
        hideLoading();
      }
    };

    if (token) {
      verifyEmailToken();
    } else {
      setStatus('error');
      setMessage('Missing verification token in link.');
      hideLoading();
    }

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Auto-redirect countdown on success
  useEffect(() => {
    if (status !== 'success') return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      navigate('/login?verified=true', { replace: true });
    }
  }, [status, countdown, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 pt-24 relative overflow-hidden bg-gray-900">
      {/* Background Image matching AuthPage */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/auth-bg.jpg)' }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 py-4">
        <Link to="/" className="flex items-center gap-0">
          <img src="/logo.png" alt="BAGS UP Logo" className="w-24 h-24 object-contain drop-shadow-2xl" />
          <span className="text-4xl font-black text-white tracking-tighter uppercase font-display drop-shadow-lg">BAGS UP</span>
        </Link>
      </div>

      <div className="w-full relative z-10 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-black/50 backdrop-blur-xl rounded-[28px] shadow-2xl border border-white/20 p-8 lg:p-10 text-center relative overflow-hidden"
        >
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-28 h-28 bg-yellow-400 rounded-bl-full -z-0 opacity-15 blur-2xl"></div>

          <div className="relative z-10">
            {status === 'loading' && (
              <div className="flex flex-col items-center py-6">
                <Loader2 className="w-14 h-14 text-yellow-400 animate-spin mb-6" />
                <h2 className="text-2xl font-black text-white font-display tracking-tight mb-2">
                  Verifying Your Email...
                </h2>
                <p className="text-gray-300 text-sm font-medium">
                  Please hold on while we activate your BAGS UP account.
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center py-4">
                <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center text-green-400 mb-6 shadow-xl shadow-green-500/20">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-black text-white font-display tracking-tight mb-2">
                  Email Verified!
                </h2>
                <p className="text-gray-300 text-sm font-medium mb-4">
                  {message}
                </p>

                <div className="w-full bg-white/10 rounded-2xl py-2.5 px-4 mb-6 border border-white/15">
                  <p className="text-xs text-yellow-300 font-bold tracking-wide">
                    Redirecting to Sign In in {countdown}s...
                  </p>
                </div>

                <Link 
                  to="/login?verified=true" 
                  replace
                  className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black text-sm uppercase tracking-wider rounded-[16px] shadow-lg shadow-yellow-400/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Sign In Now
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center py-4">
                <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center text-red-400 mb-6 shadow-xl shadow-red-500/20">
                  <XCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-black text-white font-display tracking-tight mb-2">
                  Verification Failed
                </h2>
                <p className="text-gray-300 text-sm font-medium mb-8">
                  {message}
                </p>
                <div className="space-y-3 w-full">
                  <Link 
                    to="/login" 
                    className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black text-sm uppercase tracking-wider rounded-[16px] shadow-lg shadow-yellow-400/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    Go to Sign In
                    <ArrowRight size={16} />
                  </Link>
                  <Link 
                    to="/register" 
                    className="w-full py-3.5 bg-white/10 hover:bg-white/20 text-white font-black text-sm uppercase tracking-wider rounded-[16px] border border-white/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    Register Again
                  </Link>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default VerifyEmail;
