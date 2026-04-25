import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Mail, ArrowLeft, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('users/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      console.error("Reset Error:", err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Unable to send reset link. Please check your email.');
    } finally {
      setLoading(false);
    }
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
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 py-4">
        {/* Left: Logo + Name */}
        <div className="flex items-center gap-0">
          <img src="/logo.png" alt="BAGS UP Logo" className="w-24 h-24 object-contain drop-shadow-2xl" />
          <span className="text-4xl font-black text-white tracking-tighter uppercase font-display drop-shadow-lg">BAGS UP</span>
        </div>
      </div>

      <div className="w-full relative z-10 flex flex-col items-center justify-center min-h-[70vh]">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-sm lg:max-w-md mx-auto bg-black/40 backdrop-blur-xl rounded-[28px] shadow-2xl border border-white/20 p-6 lg:p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500 rounded-bl-full -z-0 opacity-20 blur-2xl"></div>

          <div className="relative z-10">
            {success ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 mx-auto shadow-inner border border-green-500/30">
                    <ShieldCheck size={32} />
                </div>
                <div className="space-y-4">
                    <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight uppercase">Check Your Inbox</h2>
                    <p className="text-gray-300 font-bold text-xs uppercase tracking-widest leading-loose">
                        We've sent a password recovery link to <br/>
                        <span className="text-white">{email}</span>
                    </p>
                </div>
                <button
                    onClick={() => navigate('/login')}
                    className="mt-6 w-full py-3 text-gray-900 font-black text-sm uppercase tracking-wider rounded-[16px] shadow-lg transition-all flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 hover:scale-[1.02] active:scale-95 shadow-yellow-400/30"
                >
                    Return to Login
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                    <h2 className="text-2xl lg:text-3xl font-black text-white mb-2 font-display tracking-tight text-center">
                        Recover Access
                    </h2>
                    <p className="text-gray-300 text-xs lg:text-sm font-medium mb-6 text-center">
                        Enter your email address to reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="group">
                        <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1.5 ml-1">Email ID</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-white transition-colors" size={16} />
                            <input
                                type="email"
                                placeholder="john@studio.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-[16px] bg-white/10 border border-white/20 focus:bg-white/20 focus:border-white focus:ring-2 focus:ring-white/50 transition-all outline-none font-bold text-white placeholder:text-gray-400 shadow-sm text-sm"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-red-500/10 rounded-2xl border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-3"
                        >
                            <ShieldCheck size={16} className="rotate-180" />
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`mt-2 w-full py-3 text-gray-900 font-black text-sm uppercase tracking-wider rounded-[16px] shadow-lg transition-all flex items-center justify-center gap-2 ${
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
                                Send Recovery Link
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link 
                        to="/login"
                        className="inline-flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-white transition-colors group"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Sign In
                    </Link>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default ForgotPassword;
