import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLoading } from '../context/LoadingContext';

function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    const verifyEmailToken = async () => {
      showLoading();
      try {
        const res = await api.get(`users/verify-email/${token}`);
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully!');
      } catch (err) {
        setStatus('error');
        if (err.response && err.response.data) {
          setMessage(err.response.data.message || err.response.data.error || 'Verification failed.');
        } else {
          setMessage('Server error during verification.');
        }
      } finally {
        hideLoading();
      }
    };

    verifyEmailToken();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-white">
      <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/50 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-100/50 rounded-full blur-[100px]"></div>
      </div>

      <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-[48px] shadow-2xl shadow-gray-200/50 border border-gray-100 p-12 text-center relative z-10"
      >
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-black text-gray-900 font-display">Verifying Email...</h2>
            <p className="text-gray-400 mt-2 font-medium">Please wait while we confirm your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-6" />
            <h2 className="text-2xl font-black text-gray-900 font-display">Email Verified!</h2>
            <p className="text-gray-500 mt-2 font-medium mb-8">{message}</p>
            <Link to="/login" className="w-full py-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:scale-[1.02] active:scale-95 text-white font-black text-lg rounded-[24px] shadow-xl shadow-primary-600/30 transition-all flex items-center justify-center">
              Continue to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-red-500 mb-6" />
            <h2 className="text-2xl font-black text-gray-900 font-display">Verification Failed</h2>
            <p className="text-gray-500 mt-2 font-medium mb-8">{message}</p>
            <Link to="/login" className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-900 font-black text-lg rounded-[24px] transition-all flex items-center justify-center">
              Back to Login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default VerifyEmail;
