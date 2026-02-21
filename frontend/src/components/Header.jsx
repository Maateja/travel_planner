import React, { useState, useRef, useEffect } from 'react';
import { Menu, User, ChevronDown, Settings, LogOut, UserCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ toggleSidebar }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const userData = JSON.parse(sessionStorage.getItem('user_data') || '{}');
  const displayName = userData.full_name || userData.username || 'Explorer';

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user_data');
    navigate('/login');
    setIsProfileOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-24 bg-white border-b border-gray-100 z-[2000] flex items-center px-2 md:px-4 shadow-sm">
      <div className="flex items-center justify-between w-full">
        
        {/* Left Side: Hamburger + Logo + Tagline */}
        <div className="flex items-center gap-1 md:gap-1">
          <button 
            onClick={toggleSidebar}
            className="p-3 pl-1 md:pl-2 hover:bg-gray-50 rounded-2xl text-gray-900 transition-all active:scale-90 group"
            aria-label="Toggle Sidebar"
          >
            <Menu size={28} className="group-hover:text-primary-600 transition-colors" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-0 group">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-10 w-10 md:h-30 md:w-30 object-contain transform group-hover:scale-105 transition-transform duration-300" 
            />
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">BAGS UP</h1>
              <p className="text-[11px] md:text-xs font-bold text-primary-600 uppercase tracking-[0.2em] mt-1.5 opacity-80 decoration-primary-500/30">Pack Smart. Travel Smarter.</p>
            </div>
          </Link>
        </div>

        {/* Right Side: Profile with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`flex items-center gap-2 p-1 rounded-full transition-all duration-300 ${isProfileOpen ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
          >
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 p-0.5 border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-gray-400 group-hover:text-primary-600 transition-colors">
                    <User size={24} />
                </div>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <span className="text-sm font-black text-gray-900 leading-none">{displayName}</span>
              <motion.div
                animate={{ rotate: isProfileOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={14} className="text-gray-400" />
              </motion.div>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 py-3 z-[100] overflow-hidden origin-top-right"
              >
                <div className="px-6 py-4 border-b border-gray-50 mb-2 bg-gray-50/50">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Signed in as</p>
                    <p className="text-sm font-black text-gray-900 truncate">{displayName}</p>
                </div>

                <Link 
                  to="/profile" 
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-4 px-6 py-4 text-gray-600 hover:text-primary-600 hover:bg-primary-50/50 transition-all group font-bold text-sm"
                >
                  <UserCircle size={20} className="group-hover:scale-110 transition-transform" />
                  Profile
                </Link>

                <div className="h-[1px] bg-gray-50 my-2 mx-4"></div>

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-6 py-4 text-red-500 hover:bg-red-50 transition-all group font-bold text-sm"
                >
                  <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
