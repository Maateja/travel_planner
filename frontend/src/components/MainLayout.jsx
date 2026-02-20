import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

import Header from './Header';
import ChatBot from './ChatBot';

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-white">
      <Header toggleSidebar={toggleSidebar} />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
      />
      
      <main className="w-full pt-24">
        <div className="w-full">
          {children}
        </div>
        <ChatBot />
      </main>
    </div>
  );
};

export default MainLayout;
