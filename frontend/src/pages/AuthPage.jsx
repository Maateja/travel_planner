import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { GoogleLogin } from '@react-oauth/google';
import { MapPin, Globe, Compass, Sparkles, User, Lock, Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function AuthPage({ isLogin = false }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Ping the backend to wake it up from cold sleep (e.g. Render free tier)
    // This makes the first Google Login or regular login attempt much faster 
    // by ensuring the server is already awake by the time the user clicks submit.
    api.get('/').catch(() => {});

    setFormData({
      username: '',
      email: '',
      password: ''
    });
    setError(null);
    setSuccessMsg(null);
    setLoading(false);
  }, [isLogin]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      if (isLogin) {
        const res = await api.post('users/login', {
          username: formData.username,
          password: formData.password
        });
        
        // Save tokens to sessionStorage
        sessionStorage.setItem('access_token', res.data.access);
        sessionStorage.setItem('refresh_token', res.data.refresh);
        
        // Save user data
        if (res.data.user) {
            sessionStorage.setItem('user_data', JSON.stringify(res.data.user));
        } else {
            // Fallback if user data not provided
            sessionStorage.setItem('user_data', JSON.stringify({ username: formData.username }));
        }
        
        // Clear any previous error
        setError(null);
        setSuccessMsg(null);
        
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(formData.email)) {
          setError("Invalid email or password");
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError("Invalid email or password");
          setLoading(false);
          return;
        }

        const res = await api.post('users/register', formData);
        
        // Show success message
        setSuccessMsg(res.data.message || 'Registration successful. You can now log in.');
        setError(null);
        // Do not auto-login or navigate until verified.
      }
    } catch (err) {
      console.error("Auth Error:", err); // Log the full error
      if (err.response && err.response.data) {
        console.log("Error Response Data:", err.response.data); // Log data
        const msg = typeof err.response.data === 'string' 
          ? err.response.data 
          : Object.values(err.response.data).join(' ');
        setError(msg || 'Authentication failed. Please check your credentials.');
      } else {
        setError('Connection error. Is the server running?');
      }
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center p-6 pt-24 relative overflow-hidden bg-gray-900"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/auth-bg.jpg)' }}
      >
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 py-4">
        {/* Left: Logo + Name */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center overflow-hidden shadow-xl">
            <img src="/logo.png" alt="BAGS UP Logo" className="w-12 h-12 object-contain" />
          </div>
          <span className="text-3xl font-black text-white tracking-tighter uppercase font-display drop-shadow-lg">BAGS UP</span>
        </div>
        {/* Right: Login Button */}
        <Link
          to="/login"
          className="px-10 py-3 rounded-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
        >
          Login
        </Link>
      </div>

      <div className={`w-full relative z-10 ${ isLogin ? 'max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center' : 'flex flex-col items-center justify-center text-center min-h-[70vh]' }`}>
        
        {/* Left Side / Hero: Branding */}
        {!isLogin ? (
          /* Landing Hero — shown when NOT on login page */
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="flex flex-col items-center justify-center text-center px-4"
          >
            <p className="text-3xl md:text-4xl font-black text-gray-100 uppercase tracking-[0.3em] drop-shadow-md">
              Pack smart. Travel smarter.
            </p>
            <p className="mt-6 text-lg text-gray-300 font-medium max-w-lg">
              Discover hidden gems, plan personalized trips, and explore the world — all in one place.
            </p>
            <Link
              to="/login"
              className="mt-10 px-12 py-4 rounded-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black text-base uppercase tracking-wider shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Get Started →
            </Link>
          </motion.div>
        ) : (
          /* Left branding column — shown on login page */
          <div className="hidden lg:flex flex-col justify-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <p className="text-3xl font-black text-gray-100 uppercase tracking-[0.3em] drop-shadow-md">
                Pack smart. Travel smarter.
              </p>
              <p className="mt-4 text-lg text-gray-300 font-medium max-w-md">
                Your personal travel companion — AI-powered, budget-smart, adventure-ready.
              </p>
            </motion.div>
          </div>
        )}

        {/* Right Side: Auth Form — only visible on /login */}
        {isLogin && (
        <motion.div 
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-lg mx-auto bg-white/95 backdrop-blur-xl rounded-[32px] shadow-2xl shadow-black/20 border border-white/30 p-8 lg:p-10 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-full -z-0 opacity-50"></div>
            
            <div className="relative z-10">
                <div className="text-center mb-6 lg:hidden flex flex-col items-center">
                    <p className="text-xs font-black text-gray-400 tracking-widest uppercase mb-4">Pack smart. Travel smarter.</p>
                </div>

                <h2 className="text-3xl font-black text-gray-900 mb-2 font-display tracking-tight text-center lg:text-left">
                    {isLogin ? 'Welcome Back' : 'Get Started'}
                </h2>
                <p className="text-gray-400 text-base font-medium mb-6 text-center lg:text-left">
                    {isLogin ? 'Enter your details to continue your adventure.' : 'Join the community of student explorers today.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="group">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">
                            {isLogin ? 'Email ID' : 'Account Username'}
                        </label>
                        <div className="relative">
                            {isLogin ? (
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                            ) : (
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                            )}
                            <input
                                name="username"
                                type="text"
                                placeholder={isLogin ? "your email id" : "studio_explorer"}
                                value={formData.username}
                                onChange={handleInputChange}
                                className="w-full pl-12 pr-4 py-3 rounded-[20px] bg-gray-50 border border-transparent focus:bg-white focus:border-primary-100 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none font-bold text-gray-900 placeholder:text-gray-300 shadow-sm text-sm"
                                required
                            />
                        </div>
                    </div>
                    
                    {!isLogin && (
                        <div className="group">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="john@studio.edu"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full pl-12 pr-4 py-3 rounded-[20px] bg-gray-50 border border-transparent focus:bg-white focus:border-primary-100 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none font-bold text-gray-900 placeholder:text-gray-300 shadow-sm text-sm"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="group">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-secondary-500 transition-colors" size={18} />
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full pl-12 pr-4 py-3 rounded-[20px] bg-gray-50 border border-transparent focus:bg-white focus:border-secondary-100 focus:ring-4 focus:ring-secondary-500/5 transition-all outline-none font-bold text-gray-900 placeholder:text-gray-300 shadow-sm text-sm"
                                required
                            />
                        </div>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="p-4 bg-red-50 rounded-2xl border-l-4 border-red-500 text-red-700 text-sm font-bold flex items-center gap-3"
                            >
                                <AlertCircle size={18} />
                                {error}
                            </motion.div>
                        )}
                        {successMsg && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="p-4 bg-green-50 rounded-2xl border-l-4 border-green-500 text-green-700 text-sm font-bold flex items-center gap-3"
                            >
                                <CheckCircle size={18} />
                                {successMsg}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex justify-end mb-1">
                        {isLogin && (
                            <Link 
                                to="/forgot-password" 
                                className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-secondary-600 transition-colors mr-2"
                            >
                                Forgot Password?
                            </Link>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 text-white font-black text-base rounded-[20px] shadow-2xl transition-all flex items-center justify-center gap-3 ${
                            loading 
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                                : 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:scale-[1.02] active:scale-95 shadow-primary-600/30'
                        }`}
                    >
                        {loading ? (
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full"
                            ></motion.div>
                        ) : (
                            <>
                                {isLogin ? 'Sign In' : 'Create Account'} 
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                    
                    <div className="mt-4 flex justify-center">
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                try {
                                    setLoading(true);
                                    const res = await api.post('users/google-login', {
                                        token: credentialResponse.credential
                                    });
                                    sessionStorage.setItem('access_token', res.data.access);
                                    sessionStorage.setItem('refresh_token', res.data.refresh);
                                    
                                    if (res.data.user) {
                                        sessionStorage.setItem('user_data', JSON.stringify(res.data.user));
                                    }

                                    setError(null);
                                    navigate('/dashboard');
                                } catch (err) {
                                    console.error("Google Login Error:", err);
                                    if (err.response && err.response.data) {
                                        console.log("Detailed Backend Error:", err.response.data);
                                        if (err.response.data.traceback) {
                                            console.log("Backend Traceback:", err.response.data.traceback);
                                        }
                                        setError(`Login Error: ${err.response.data.details || err.response.data.error || 'Check console for details'}`);
                                    } else {
                                        setError('Google Login Failed. Check if server is running.');
                                    }
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            onError={() => {
                                console.log('Login Failed');
                                setError('Google Login Failed');
                            }}
                            use_fedcm_for_prompt={true}
                            shape="pill"
                            theme="filled_blue"
                            size="large"
                            text="continue_with"
                        />
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                        New to BAGS UP?
                    </p>
                    <Link 
                        to="/register"
                        className="inline-block mt-2 text-gray-900 font-black text-base hover:text-primary-600 transition-colors group"
                    >
                        Sign up
                        <div className="h-1 bg-primary-500 rounded-full w-0 group-hover:w-full transition-all duration-300"></div>
                    </Link>
                </div>
            </div>
        </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default AuthPage;
