import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, User, Loader2, History, MessageSquare, Plus } from 'lucide-react';
import api from '../api';

const TravelBotAvatar = ({ isHovered, isTyping }) => {
  return (
    <motion.div 
      className="relative w-13 h-13 flex items-center justify-center"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-primary-400/20 blur-xl rounded-full animate-pulse"></div>
      
      {/* Bot Body */}
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Head/Body */}
        <motion.rect 
            x="10" y="12" width="40" height="38" rx="18" fill="#f0fdfa" 
            stroke="#0f172a" strokeWidth="2.5"
            animate={{ height: isTyping ? [38, 36, 38] : 38 }}
            transition={{ duration: 0.4, repeat: Infinity }}
        />
        
        {/* Face Area */}
        <rect x="18" y="22" width="24" height="14" rx="7" fill="#f8fafc" />
        
        {/* Eyes */}
        <motion.circle 
            cx="24" cy="29" r="2.5" fill="#0f172a" 
            animate={{ scaleY: [1, 0.1, 1], y: isHovered ? -1 : 0 }}
            transition={{ duration: 3, repeat: Infinity, times: [0, 0.05, 0.1] }}
        />
        <motion.circle 
            cx="36" cy="29" r="2.5" fill="#0f172a" 
            animate={{ scaleY: [1, 0.1, 1], y: isHovered ? -1 : 0 }}
            transition={{ duration: 3, repeat: Infinity, times: [0, 0.05, 0.1] }}
        />
        
        {/* Smile */}
        <motion.path 
            d="M26 33.5C27.5 34.5 32.5 34.5 34 33.5" 
            stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" 
            animate={{ d: isHovered ? "M25 33C27 35 33 35 35 33" : "M26 33.5C27.5 34.5 32.5 34.5 34 33.5" }}
        />

        {/* Headphones (Travel Accessory) */}
        <circle cx="10" cy="30" r="5" fill="#14b8a6" stroke="#0f172a" strokeWidth="2" />
        <circle cx="50" cy="30" r="5" fill="#14b8a6" stroke="#0f172a" strokeWidth="2" />
        <path d="M10 30C10 15 50 15 50 30" stroke="#14b8a6" strokeWidth="4" strokeLinecap="round" opacity="0.4" />

        {/* Backpack Icon (Small mark on chest) */}
        <rect x="25" y="42" width="10" height="8" rx="2" fill="#14b8a6" opacity="0.8" />
        <path d="M25 44H35" stroke="white" strokeWidth="1" />
      </svg>


    </motion.div>
  );
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [userName, setUserName] = useState('Explorer');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const [chatSessions, setChatSessions] = useState(() => {
    return JSON.parse(localStorage.getItem('bagsup_chat_sessions') || '[]');
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    const name = userData.full_name?.split(' ')[0] || userData.username || 'Explorer';
    setUserName(name);
    
    const savedCurrentChat = JSON.parse(localStorage.getItem('bagsup_current_chat') || 'null');
    if (savedCurrentChat && savedCurrentChat.length > 0) {
        setMessages(savedCurrentChat);
    } else {
        setMessages([
            { 
                role: 'assistant', 
                content: `Hey ${name} 👋 Ready to plan your next adventure? I'm your BagsUp AI Travel Assistant!` 
            }
        ]);
    }
  }, []);

  // Save current chat automatically
  useEffect(() => {
    if (messages.length > 0) {
        localStorage.setItem('bagsup_current_chat', JSON.stringify(messages));
    }
  }, [messages]);

  // Save history automatically
  useEffect(() => {
      localStorage.setItem('bagsup_chat_sessions', JSON.stringify(chatSessions));
  }, [chatSessions]);

  const startNewChat = () => {
    if (messages.length > 1) {
        const title = messages.find(m => m.role === 'user')?.content || "Travel Chat";
        setChatSessions(prev => [{ id: Date.now(), title, messages }, ...prev]);
    }
    setMessages([
        { 
            role: 'assistant', 
            content: `Hey ${userName} 👋 I've cleared the chat for you. Where to next?` 
        }
    ]);
  };


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const forbiddenKeywords = [
    'solve', 'equation', 'derivative', 'physics', 'coding', 
    'program', 'math', 'algorithm', 'politics', 'exam', 'assignment',
    'integral', 'calculus', 'javascript', 'python', 'java', 'c++',
    'history', 'president', 'prime minister'
  ];

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    // Frontend Protection Logic
    const isForbidden = forbiddenKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword.toLowerCase())
    );

    if (isForbidden) {
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "I'm here to help you plan your trips and explore destinations. Please ask me something related to your travel plans 😊" 
        }]);
      }, 500);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/chat', {
        message: userMessage,
        history: messages.slice(1) // exclude greeting
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.data.text }]);
    } catch (error) {
      console.error('Chat error:', error.response?.data || error.message);
      const errorDetail = error.response?.data?.details || '';
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Sorry, I encountered an error. ${errorDetail ? '(' + errorDetail + ')' : ''} Please ask me something related to travel plans 😊` 
      }]);
    } finally {
      setLoading(false);
    }
  };


  const [activeTab, setActiveTab] = useState('chat');

  const historyPrompts = [...messages]
    .filter(m => m.role === 'user')
    .reverse()
    .filter((v, i, a) => a.findIndex(t => t.content === v.content) === i)
    .slice(0, 10);

  return (
    <div className="fixed bottom-6 right-6 z-[3000]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.8, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 40, scale: 0.8, filter: 'blur(10px)' }}
            className="absolute bottom-24 right-0 w-[320px] md:w-[380px] h-[550px] bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gray-900 p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-500 overflow-hidden flex items-center justify-center border border-primary-400">
                   <TravelBotAvatar isHovered={true} isTyping={loading} />
                </div>
                <div>
                  <h3 className="text-white font-black text-[11px] uppercase tracking-tighter">BagsUp Assistant</h3>
                  <div className="flex items-center gap-1.5 ">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[8px] text-white/50 font-black uppercase tracking-widest">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-gray-900 px-2 pb-2 gap-1 shrink-0">
                <button 
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === 'chat' 
                        ? 'bg-white text-gray-900' 
                        : 'text-white/40 hover:text-white/60 bg-white/5'
                    }`}
                >
                    Current Chat
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === 'history' 
                        ? 'bg-white text-gray-900' 
                        : 'text-white/40 hover:text-white/60 bg-white/5'
                    }`}
                >
                    History
                </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
                {activeTab === 'chat' ? (
                    <>
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-gray-50/50">
                          {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border shadow-sm ${
                                  msg.role === 'user' ? 'bg-white border-gray-100' : 'bg-primary-500 border-primary-500 shadow-primary-500/10'
                                }`}>
                                  {msg.role === 'user' ? <User size={14} className="text-gray-400" /> : <Sparkles size={14} className="text-white" />}
                                </div>
                                <div className={`p-4 rounded-2xl text-[13px] font-bold leading-relaxed shadow-sm ${
                                  msg.role === 'user' 
                                    ? 'bg-gray-900 text-white rounded-tr-none' 
                                    : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                                }`}>
                                  {msg.content}
                                </div>
                              </div>
                            </div>
                          ))}
                          {loading && (
                            <div className="flex justify-start">
                               <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                                    <Loader2 size={14} className="text-white animate-spin" />
                                </div>
                                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex gap-1 items-center">
                                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.2 h-1.2 rounded-full bg-primary-400" />
                                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.2 h-1.2 rounded-full bg-primary-400" />
                                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.2 h-1.2 rounded-full bg-primary-400" />
                                </div>
                              </div>
                            </div>
                          )}
                          <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-2">
                            <button
                                onClick={startNewChat}
                                type="button"
                                className="w-10 h-10 shrink-0 bg-gray-100/80 text-gray-500 rounded-xl flex items-center justify-center hover:bg-gray-200 hover:text-gray-700 transition-all border border-gray-200"
                                title="New Chat"
                            >
                                <Plus size={20} />
                            </button>
                            <form onSubmit={handleSend} className="relative flex-1 flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about your next trip..."
                                    className="w-full bg-gray-50 border-none rounded-xl pl-4 pr-14 py-3.5 text-xs font-bold focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-gray-300"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !input.trim()}
                                    className="absolute right-1.5 w-9 h-9 bg-primary-500 text-white rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/25 hover:bg-primary-600 transition-all disabled:opacity-50"
                                >
                                    <Send size={16} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    /* History View */
                    <div className="flex-1 bg-white flex flex-col overflow-hidden">
                        <div className="p-5 overflow-y-auto custom-scrollbar space-y-3">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <History size={10} /> Recent Searches
                                </h4>
                                <button 
                                    onClick={() => {
                                        setChatSessions([]);
                                        setMessages([{ role: 'assistant', content: `Hey ${userName} 👋 I've cleared the chat for you. Where to next?` }]);
                                        localStorage.removeItem('bagsup_chat_sessions');
                                        localStorage.removeItem('bagsup_current_chat');
                                        setActiveTab('chat');
                                    }}
                                    className="text-[9px] font-black text-primary-500 uppercase tracking-widest hover:text-primary-600 transition-colors"
                                >
                                    Clear All
                                </button>
                            </div>
                            
                            {chatSessions.length > 0 ? (
                                chatSessions.map((session) => (
                                <div key={session.id} className="relative group/item flex items-center bg-gray-50 rounded-2xl border border-transparent hover:border-primary-100 hover:bg-white hover:shadow-xl hover:shadow-primary-500/5 transition-all">
                                    <button 
                                        onClick={() => {
                                            if (messages.length > 1) {
                                                // Save current chat silently before switching
                                                const title = messages.find(m => m.role === 'user')?.content || "Travel Chat";
                                                setChatSessions(prev => [{ id: Date.now(), title, messages }, ...prev.filter(s => s.id !== session.id)]);
                                            }
                                            setMessages(session.messages);
                                            setActiveTab('chat');
                                        }}
                                        className="flex-1 text-left p-4 rounded-l-2xl group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-white border border-gray-100 text-gray-400 group-hover:text-primary-500 transition-colors">
                                                <MessageSquare size={12} />
                                            </div>
                                            <p className="text-[12px] font-bold text-gray-600 line-clamp-1 group-hover:text-gray-900 transition-colors">
                                                {session.title}
                                            </p>
                                        </div>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setChatSessions(prev => prev.filter(s => s.id !== session.id));
                                        }}
                                        className="p-4 rounded-r-2xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover/item:opacity-100 focus:opacity-100"
                                        title="Delete Chat"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                    </button>
                                </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 opacity-20">
                                    <MessageSquare size={40} />
                                    <p className="text-xs font-black mt-4 uppercase tracking-widest">No History Yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        className={`w-18 h-18 rounded-full flex items-center justify-center shadow-[0_15px_40px_-10px_rgba(0,112,112,0.4)] transition-all duration-500 overflow-hidden border-2 ${
          isOpen ? 'bg-gray-900 border-gray-800' : 'bg-[#007070] border-[#005a5a]'
        }`}
      >
        <TravelBotAvatar isHovered={isHovered} isTyping={loading} />
      </motion.button>
    </div>
  );
};

export default ChatBot;

