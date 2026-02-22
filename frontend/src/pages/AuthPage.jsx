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
        setSuccessMsg(res.data.message || 'Registration successful. Please check your email to verify your account.');
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
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-white"
    >
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-0">
          <motion.div 
            animate={{ 
                scale: [1, 1.2, 1],
                x: [0, 50, 0],
                y: [0, 30, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-primary-100/50 rounded-full blur-[120px]"
          ></motion.div>
          <motion.div 
            animate={{ 
                scale: [1.2, 1, 1.2],
                x: [0, -50, 0],
                y: [0, -30, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-secondary-100/50 rounded-full blur-[120px]"
          ></motion.div>
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Side: Branding/Visuals */}
        <div className="hidden lg:flex flex-col justify-center">
            <motion.div 
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-12"
            >
                <div className="flex items-center gap-1 mb-4">
                    <img src="/logo.png" alt="BAGS UP Logo" className="w-32 h-32 object-contain mr-6" />
                    <h1 className="text-6xl font-black text-gray-900 tracking-tighter uppercase font-display">
                        BAGS UP
                    </h1>
                </div>
                <p className="text-2xl font-black text-gray-400 uppercase tracking-[0.3em] ml-2">
                    Pack smart. Travel smarter.
                </p>
            </motion.div>

            <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-8"
            >
                <div className="flex items-center gap-6 p-6 rounded-[32px] bg-white shadow-xl shadow-gray-200/50 border border-gray-100 hover:shadow-2xl transition-all group">
                    <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform">
                        <Globe size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-800">Global Exploration</h3>
                        <p className="text-gray-400 font-medium">Discover hidden gems across India and beyond.</p>
                    </div>
                </div>

                <div className="flex items-center gap-6 p-6 rounded-[32px] bg-white shadow-xl shadow-gray-200/50 border border-gray-100 hover:shadow-2xl transition-all group">
                    <div className="w-16 h-16 rounded-2xl bg-secondary-50 flex items-center justify-center text-secondary-500 group-hover:scale-110 transition-transform">
                        <Sparkles size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-800">AI Intelligence</h3>
                        <p className="text-gray-400 font-medium">Personalized roadmaps built for your budget.</p>
                    </div>
                </div>
            </motion.div>
        </div>

        {/* Right Side: Auth Form */}
        <motion.div 
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-lg mx-auto bg-white rounded-[48px] shadow-2xl shadow-gray-300/50 border border-gray-100 p-12 lg:p-16 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-full -z-0 opacity-50"></div>
            
            <div className="relative z-10">
                <div className="text-center mb-12 lg:hidden flex flex-col items-center">
                    <img src="/logo.png" alt="BAGS UP Logo" className="w-24 h-24 mb-4 object-contain" />
                    <h1 className="text-4xl font-black text-gray-900 mb-2 font-display tracking-tighter uppercase">BAGS UP</h1>
                    <p className="text-xs font-black text-gray-400 tracking-widest uppercase mb-8">Pack smart. Travel smarter.</p>
                </div>

                <h2 className="text-4xl font-black text-gray-900 mb-4 font-display tracking-tight text-center lg:text-left">
                    {isLogin ? 'Welcome Back' : 'Get Started'}
                </h2>
                <p className="text-gray-400 text-lg font-medium mb-10 text-center lg:text-left">
                    {isLogin ? 'Enter your details to continue your adventure.' : 'Join the community of student explorers today.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="group">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                            {isLogin ? 'Email ID' : 'Account Username'}
                        </label>
                        <div className="relative">
                            {isLogin ? (
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-500 transition-colors" size={20} />
                            ) : (
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-500 transition-colors" size={20} />
                            )}
                            <input
                                name="username"
                                type="text"
                                placeholder={isLogin ? "your email id" : "studio_explorer"}
                                value={formData.username}
                                onChange={handleInputChange}
                                className="w-full pl-14 pr-5 py-5 rounded-[24px] bg-gray-50 border border-transparent focus:bg-white focus:border-primary-100 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none font-bold text-gray-900 placeholder:text-gray-300 shadow-sm"
                                required
                            />
                        </div>
                    </div>
                    
                    {!isLogin && (
                        <div className="group">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-500 transition-colors" size={20} />
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="john@studio.edu"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full pl-14 pr-5 py-5 rounded-[24px] bg-gray-50 border border-transparent focus:bg-white focus:border-primary-100 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none font-bold text-gray-900 placeholder:text-gray-300 shadow-sm"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="group">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-secondary-500 transition-colors" size={20} />
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full pl-14 pr-5 py-5 rounded-[24px] bg-gray-50 border border-transparent focus:bg-white focus:border-secondary-100 focus:ring-4 focus:ring-secondary-500/5 transition-all outline-none font-bold text-gray-900 placeholder:text-gray-300 shadow-sm"
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

                    <div className="flex justify-end mb-2">
                        {isLogin && (
                            <Link 
                                to="/forgot-password" 
                                className="text-[12px] font-black text-gray-400 uppercase tracking-widest hover:text-secondary-600 transition-colors mr-2"
                            >
                                Forgot Password?
                            </Link>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-6 text-white font-black text-lg rounded-[24px] shadow-2xl transition-all flex items-center justify-center gap-3 ${
                            loading 
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                                : 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:scale-[1.02] active:scale-95 shadow-primary-600/30'
                        }`}
                    >
                        {loading ? (
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full"
                            ></motion.div>
                        ) : (
                            <>
                                {isLogin ? 'Sign In' : 'Create Account'} 
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                    
                    <div className="mt-6 flex justify-center">
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

                <div className="mt-12 text-center">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                        {isLogin ? "New to BAGS UP?" : "Already a Member?"}
                    </p>
                    <Link 
                        to={isLogin ? "/register" : "/login"}
                        className="inline-block mt-3 text-gray-900 font-black text-lg hover:text-primary-600 transition-colors group"
                    >
                        {isLogin ? 'Sign up' : 'Sign in to Account'}
                        <div className="h-1 bg-primary-500 rounded-full w-0 group-hover:w-full transition-all duration-300"></div>
                    </Link>
                </div>
            </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default AuthPage;
