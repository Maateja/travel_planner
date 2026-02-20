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
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-white font-sans"
    >
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-0 text-secondary-500">
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

      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg bg-white rounded-[48px] shadow-2xl shadow-gray-200/50 border border-gray-100 p-12 lg:p-16 relative z-10 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-full -z-0 opacity-50"></div>
        
        <Link to="/login" className="inline-flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-primary-600 transition-colors mb-4">
            <ArrowLeft size={16} /> Back to Sign In
        </Link>

        {success ? (
          <div className="text-center space-y-4 py-4">
             <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto shadow-inner">
                <ShieldCheck size={48} />
             </div>
             <div className="space-y-4">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Check Your Inbox</h2>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest leading-loose">
                    We've sent a password recovery link to <br/>
                    <span className="text-gray-900">{email}</span>
                </p>
             </div>
             <button
                onClick={() => navigate('/login')}
                className="w-full py-6 bg-black text-white font-black text-xs uppercase tracking-[0.3em] rounded-[24px] hover:bg-primary-600 transition-all shadow-xl"
             >
                Return to Login
             </button>
          </div>
        ) : (
          <>
            <div className="mb-5 text-center lg:text-left">
                <div className="flex items-center gap-0 mb-2">
                    <img src="/logo.png" alt="BAGS UP Logo" className="w-35 h-30 object-contain" />
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase font-display">
                        BAGS UP
                    </h1>
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight uppercase">Recover Access</h2>
                <p className="text-gray-400 text-sm font-black uppercase tracking-widest leading-relaxed">
                    Enter your email address and we'll send you a link to reset your password.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="group">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Email ID</label>
                    <div className="relative">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-500 transition-colors" size={20} />
                        <input
                            type="email"
                            placeholder="YOUR MAIL ID@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-16 pr-6 py-6 rounded-[28px] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary-100 focus:ring-8 focus:ring-primary-500/5 transition-all outline-none font-bold text-gray-900 placeholder:text-gray-300 shadow-sm"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-50 rounded-2xl border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-3"
                    >
                        <ShieldCheck size={16} className="rotate-180" />
                        {error}
                    </motion.div>
                )}

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
                            Send Recovery Link
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

export default ForgotPassword;
