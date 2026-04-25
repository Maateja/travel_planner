import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { GoogleLogin } from '@react-oauth/google';
import { MapPin, Globe, Compass, Sparkles, User, Lock, Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function AuthPage({ isLogin = false, isLanding = false }) {
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
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 py-4">
        {/* Left: Logo + Name */}
        <div className="flex items-center gap-0">
          <img src="/logo.png" alt="BAGS UP Logo" className="w-24 h-24 object-contain drop-shadow-2xl" />
          <span className="text-4xl font-black text-white tracking-tighter uppercase font-display drop-shadow-lg">BAGS UP</span>
        </div>
        {/* Right: Login Button */}
        {isLanding && (
          <Link
            to="/login"
            className="px-10 py-3 rounded-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Login
          </Link>
        )}
      </div>

      <div className="w-full relative z-10 flex flex-col items-center justify-center min-h-[70vh]">
        
        {/* Left Side / Hero: Branding */}
        {isLanding && (
          /* Landing Hero — shown when on landing page */
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="flex flex-col items-center justify-center text-center px-4 mt-16"
          >
            <p className="text-2xl md:text-4xl lg:text-[2.75rem] font-black text-gray-100 uppercase tracking-wider drop-shadow-lg whitespace-nowrap leading-tight">
              Escape the Ordinary, Embrace the Extraordinary.
            </p>
            <p className="mt-2 text-lg md:text-xl lg:text-2xl text-gray-200 font-medium drop-shadow whitespace-nowrap">
              Discover hidden gems, plan personalized trips, and explore the world with AI.
            </p>
            <Link
              to="/login"
              className="mt-12 px-14 py-4 rounded-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black text-lg uppercase tracking-wider shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Get Started →
            </Link>
          </motion.div>
        )}

        {/* Right Side: Auth Form — hidden on landing page */}
        {!isLanding && (
        <motion.div 
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-sm lg:max-w-md mx-auto bg-black/40 backdrop-blur-xl rounded-[28px] shadow-2xl border border-white/20 p-6 lg:p-8 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500 rounded-bl-full -z-0 opacity-20 blur-2xl"></div>
            
            <div className="relative z-10">
                <div className="text-center mb-4 lg:hidden flex flex-col items-center">
                    <p className="text-[10px] font-black text-gray-300 tracking-widest uppercase mb-3">Escape the Ordinary, Embrace the Extraordinary.</p>
                </div>

                <h2 className="text-2xl lg:text-3xl font-black text-white mb-2 font-display tracking-tight text-center">
                    {isLogin ? 'Welcome Back' : 'Get Started'}
                </h2>
                <p className="text-gray-300 text-xs lg:text-sm font-medium mb-6 text-center">
                    {isLogin ? 'Enter your details to continue your adventure.' : 'Plan your adventure today by signing up.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="group">
                        <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1.5 ml-1">
                            {isLogin ? 'Email ID' : 'Account Username'}
                        </label>
                        <div className="relative">
                            {isLogin ? (
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-white transition-colors" size={16} />
                            ) : (
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-white transition-colors" size={16} />
                            )}
                            <input
                                name="username"
                                type="text"
                                placeholder={isLogin ? "your email id" : "studio_explorer"}
                                value={formData.username}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-4 py-3 rounded-[16px] bg-white/10 border border-white/20 focus:bg-white/20 focus:border-white focus:ring-2 focus:ring-white/50 transition-all outline-none font-bold text-white placeholder:text-gray-400 shadow-sm text-sm"
                                required
                            />
                        </div>
                    </div>
                    
                    {!isLogin && (
                        <div className="group">
                            <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-white transition-colors" size={16} />
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="john@studio.edu"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-[16px] bg-white/10 border border-white/20 focus:bg-white/20 focus:border-white focus:ring-2 focus:ring-white/50 transition-all outline-none font-bold text-white placeholder:text-gray-400 shadow-sm text-sm"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="group">
                        <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-white transition-colors" size={16} />
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-4 py-3 rounded-[16px] bg-white/10 border border-white/20 focus:bg-white/20 focus:border-white focus:ring-2 focus:ring-white/50 transition-all outline-none font-bold text-white placeholder:text-gray-400 shadow-sm text-sm"
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
                                className="text-xs font-black text-gray-300 uppercase tracking-widest hover:text-white transition-colors mr-2"
                            >
                                Forgot Password?
                            </Link>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 text-gray-900 font-black text-sm uppercase tracking-wider rounded-[16px] shadow-lg transition-all flex items-center justify-center gap-2 ${
                            loading 
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                                : 'bg-yellow-400 hover:bg-yellow-300 hover:scale-[1.02] active:scale-95 shadow-yellow-400/30'
                        }`}
                    >
                        {loading ? (
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="w-4 h-4 border-4 border-gray-900/30 border-t-gray-900 rounded-full"
                            ></motion.div>
                        ) : (
                            <>
                                {isLogin ? 'Sign In' : 'Create Account'} 
                                <ArrowRight size={16} />
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

                <div className="mt-4 text-center">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
                        {isLogin ? "New to BAGS UP?" : "Already have an account?"}
                    </p>
                    <Link 
                        to={isLogin ? "/register" : "/login"}
                        className="inline-block mt-1 text-white font-black text-base hover:text-yellow-300 transition-colors group"
                    >
                        {isLogin ? "Sign up" : "Sign in"}
                        <div className="h-0.5 bg-yellow-400 rounded-full w-0 group-hover:w-full transition-all duration-300"></div>
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
