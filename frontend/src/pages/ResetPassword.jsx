import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api';
import { Lock, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function ResetPassword() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`users/reset-password/${token}`, { 
        password: formData.password 
      });
      setSuccess(true);
    } catch (err) {
      console.error("Reset Error:", err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Invalid or expired reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-white font-sans"
    >
      {/* Background blobs */}
      <div className="absolute inset-0 z-0">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-0 -left-20 w-[60%] h-[60%] bg-primary-50 rounded-full blur-[120px]"
          ></motion.div>
          <motion.div 
            animate={{ scale: [1.2, 1, 1.2], x: [0, -30, 0] }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute bottom-0 -right-20 w-[60%] h-[60%] bg-secondary-50 rounded-full blur-[120px]"
          ></motion.div>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-lg bg-white rounded-[48px] shadow-2xl shadow-gray-200/50 border border-gray-100 p-12 lg:p-16 relative z-10"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-full opacity-50"></div>
        
        {success ? (
          <div className="text-center space-y-8 py-4">
             <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto">
                <CheckCircle2 size={48} />
             </div>
             <div className="space-y-4">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Success!</h2>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest leading-loose">
                    Your password has been reset successfully. <br/>
                    You can now sign in with your new credentials.
                </p>
             </div>
             <button
                onClick={() => navigate('/login')}
                className="w-full py-6 bg-black text-white font-black text-xs uppercase tracking-[0.3em] rounded-[24px] hover:bg-primary-600 transition-all shadow-xl"
             >
                Go to Login
             </button>
          </div>
        ) : (
          <>
            <div className="mb-10">
                <div className="flex items-center gap-0 mb-2">
                    <img src="/logo.png" alt="BAGS UP Logo" className="w-24 h-20 object-contain" />
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase font-display">
                        BAGS UP
                    </h1>
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight uppercase">Set New Password</h2>
                <p className="text-gray-400 text-sm font-black uppercase tracking-widest leading-relaxed">
                    Create a strong password to secure your account.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="group">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">New Password</label>
                    <div className="relative">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-500 transition-colors" size={20} />
                        <input
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full pl-16 pr-6 py-6 rounded-[28px] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary-100 focus:ring-8 focus:ring-primary-500/5 transition-all outline-none font-bold text-gray-900 placeholder:text-gray-300 shadow-sm"
                            required
                        />
                    </div>
                </div>

                <div className="group">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Confirm Password</label>
                    <div className="relative">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-secondary-500 transition-colors" size={20} />
                        <input
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full pl-16 pr-6 py-6 rounded-[28px] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-secondary-100 focus:ring-8 focus:ring-secondary-500/5 transition-all outline-none font-bold text-gray-900 placeholder:text-gray-300 shadow-sm"
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
                          className="p-4 bg-red-50 rounded-2xl border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-3"
                      >
                          <AlertCircle size={18} />
                          {error}
                      </motion.div>
                  )}
                </AnimatePresence>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-6 text-white font-black text-xs uppercase tracking-[0.3em] rounded-[28px] shadow-2xl transition-all flex items-center justify-center gap-4 ${
                        loading 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-gray-900 to-gray-800 hover:from-primary-600 hover:to-secondary-600 hover:scale-[1.02] active:scale-95 shadow-gray-900/20'
                    }`}
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            Reset Password
                            <ArrowRight size={18} />
                        </>
                    )}
                </button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export default ResetPassword;
