import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user_data');
    sessionStorage.clear(); // Clear temporary roadmap and other session states
    navigate('/login');
  };

  const userData = JSON.parse(sessionStorage.getItem('user_data') || '{}');
  const displayName = userData.full_name || userData.username || 'Explorer Mode';

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-secondary-500 flex items-center justify-center text-white shadow-inner">
          <User size={20} strokeWidth={2.5} />
        </div>
        <ChevronDown size={16} className={`text-gray-400 group-hover:text-primary-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Transparent backdrop to close menu on click outside */}
            <div 
                className="fixed inset-0 z-40 bg-black/5" 
                onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-56 bg-white rounded-[24px] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden z-50 p-2"
            >
              <div className="p-4 border-b border-gray-50 mb-1">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">Account</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
              </div>

              <button
                onClick={() => {
                    setIsOpen(false);
                    navigate('/profile');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors group"
              >
                <div className="w-8 h-8 rounded-xl bg-gray-50 group-hover:bg-white flex items-center justify-center transition-colors">
                    <User size={18} />
                </div>
                <span className="font-bold text-sm">My Profile</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors group"
              >
                <div className="w-8 h-8 rounded-xl bg-gray-50 group-hover:bg-white flex items-center justify-center transition-colors">
                    <LogOut size={18} />
                </div>
                <span className="font-bold text-sm">Logout</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
