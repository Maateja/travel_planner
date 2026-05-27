import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sparkles, 
  Map, 
  Briefcase, 
  Bookmark, 
  Wallet, 
  RotateCcw,
  X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'My Trips', icon: Briefcase, path: '/my-trips' },
    { name: 'Travel Plan by AI', icon: Sparkles, path: '/create-trip' },
    { name: 'Travel Plan by Me', icon: Map, path: '/manual-plan' },
    { name: 'Budget Planner', icon: Wallet, path: '/budget-planner' },
    { name: 'Spin The Wheel', icon: RotateCcw, path: '/spin-wheel' },
  ];

  return (
    <>
      {/* Sidebar Container */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 h-screen w-80 bg-white shadow-2xl z-[2020] flex flex-col overflow-hidden"
      >
        {/* Header inside Sidebar */}
        <div className="p-8 pb-10 flex items-center justify-between bg-white relative border-b border-gray-50">
          <div className="flex items-center gap-5">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-16 h-16 md:w-20 md:h-20 object-contain" 
            />
            <span className="font-black text-2xl text-gray-900 tracking-tighter uppercase whitespace-nowrap">BAGS UP</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-all active:scale-95 translate-x-3"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-4 space-y-0 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-5 px-8 py-5 transition-all group relative border-none
                  ${isActive 
                    ? 'text-primary-600' 
                    : 'text-gray-400 hover:text-gray-900'}
                `}
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary-600 shadow-[0_0_10px_rgba(13,148,136,0.3)]" />
                )}
                
                <item.icon 
                  size={22} 
                  className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-primary-600' : ''}`} 
                />
                <span className={`font-bold text-sm tracking-tight whitespace-nowrap ${isActive ? 'text-gray-900 font-black' : ''}`}>
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Brand Text */}
        <div className="p-10 border-t border-gray-50">
           <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.3em] text-center">
             Travel Starts Here
           </p>
        </div>
      </motion.aside>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2010]"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
