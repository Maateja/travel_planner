import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../api';
import { GoogleLogin } from '@react-oauth/google';
import { 
  MapPin, 
  Globe, 
  Compass, 
  Sparkles, 
  User, 
  Lock, 
  Mail, 
  ArrowRight, 
  ArrowUpRight, 
  AlertCircle, 
  CheckCircle, 
  ExternalLink,
  Calendar,
  Users,
  Wallet,
  Check,
  Bot,
  MessageSquare,
  Clock,
  Coins,
  Route,
  Zap,
  Layers,
  Shield,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from '../context/LoadingContext';
import DriftWall from '../components/DriftWall';
import ScrollStack, { ScrollStackItem } from '../components/ScrollStack';
import FoldText from '../components/FoldText';

// AI Capabilities Data
const AI_CAPABILITIES = [
  {
    title: 'Personalized Itineraries',
    description: 'Custom-tailored roadmaps shaped around your specific travel style—whether you crave high-energy adventure, cultural heritage, quiet nature retreats, or street foodie trails.',
    icon: Route,
    badge: 'Tailored To You',
    accent: 'teal'
  },
  {
    title: 'Destination Recommendations',
    description: 'Discover hidden gems and famous spots across India. Get intelligent suggestions based on current seasons, ideal weather windows, and your personal interests.',
    icon: Compass,
    badge: 'Smart Discovery',
    accent: 'indigo'
  },
  {
    title: 'Day-wise Activity Suggestions',
    description: 'Every single day is thoughtfully organized with morning sights, afternoon highlights, and sunset viewpoints—balanced with realistic transit and rest times.',
    icon: Clock,
    badge: 'Time-Optimized',
    accent: 'blue'
  },
  {
    title: 'Smart Budget Allocation',
    description: 'Intelligent division of your total funds in Indian Rupees (₹) across accommodation, local transit, entry passes, and meals to keep your entire trip financially balanced.',
    icon: Coins,
    badge: 'INR (₹) Precision',
    accent: 'emerald'
  },
  {
    title: 'Travel-Related AI Chatbot',
    description: 'An on-demand 24/7 AI travel companion ready to answer questions about local transport, packing checklists, regional etiquette, and authentic dining spots.',
    icon: Bot,
    badge: '24/7 Live Assistant',
    accent: 'amber'
  }
];

function AuthPage({ isLogin = false, isLanding = false }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [registeredEmail, setRegisteredEmail] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [showNavButtons, setShowNavButtons] = useState(false);
  const workflowRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    // Ping the backend to wake it up from cold sleep (e.g. Render free tier)
    api.get('/', { skipLoader: true }).catch(() => {});
  }, []);

  // Scroll listener for landing page header & detecting when workflow touches the upper bar
  useEffect(() => {
    if (!isLanding) return;
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      if (workflowRef.current) {
        const rect = workflowRef.current.getBoundingClientRect();
        // Upper bar height is ~65-75px. When rect.top <= 85, section touches the upper bar
        if (rect.top <= 85) {
          setShowNavButtons(true);
        } else {
          setShowNavButtons(false);
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLanding]);

  // Check for verification success redirect (from VerifyEmail page)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('verified') === 'true') {
      setSuccessMsg('Your email has been verified successfully! You can now sign in.');
      window.history.replaceState({}, '', '/login');
    }
  }, [location.search]);

  // Reset registeredEmail when switching to login mode
  useEffect(() => {
    if (isLogin) {
      setRegisteredEmail(null);
    }
  }, [isLogin]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    showLoading();
    setError(null);
    setSuccessMsg(null);
    setRegisteredEmail(null);
    try {
      if (isLogin) {
        const res = await api.post('users/login', {
          username: formData.username,
          password: formData.password
        });
        
        sessionStorage.setItem('access_token', res.data.access);
        sessionStorage.setItem('refresh_token', res.data.refresh);
        
        if (res.data.user) {
            sessionStorage.setItem('user_data', JSON.stringify(res.data.user));
        } else {
            sessionStorage.setItem('user_data', JSON.stringify({ username: formData.username }));
        }
        
        setError(null);
        setSuccessMsg(null);
        navigate('/dashboard');
      } else {
        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
        if (!gmailRegex.test(formData.email.trim())) {
          setError("Please enter a valid Gmail address (@gmail.com).");
          setLoading(false);
          hideLoading();
          return;
        }
        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters long.");
          setLoading(false);
          hideLoading();
          return;
        }

        const res = await api.post('users/register', formData);
        setRegisteredEmail(null);
        setSuccessMsg(res.data.message || 'Registration successful! A verification email has been sent to your Gmail. Please verify your email before logging in.');
        setError(null);
        setFormData({ username: '', email: '', password: '' });
      }
    } catch (err) {
      console.error("Auth Error:", err);
      if (err.response && err.response.data) {
        const msg = typeof err.response.data === 'string' 
          ? err.response.data 
          : (err.response.data.error || err.response.data.message || Object.values(err.response.data).join(' '));
        setError(msg || 'Authentication failed. Please check your credentials.');
      } else {
        setError('Connection error. Is the server running?');
      }
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  // ==========================================
  // LANDING PAGE VIEW (When path is '/')
  // ==========================================
  if (isLanding) {
    return (
      <div className="min-h-screen bg-white text-gray-900 selection:bg-yellow-400 selection:text-gray-900">
        
        {/* Fixed Header with smooth blur transition on scroll */}
        <header 
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 sm:px-10 lg:px-12 ${
            scrolled 
              ? 'py-2.5 bg-white/95 backdrop-blur-xl border-b border-gray-200/80 shadow-sm' 
              : 'py-4 bg-gradient-to-b from-black/50 to-transparent'
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo + Name slightly moved to the right */}
            <Link to="/" className="flex items-center gap-1 group ml-0 sm:ml-0">
              <img 
                src="/logo.png" 
                alt="Prayanam Logo" 
                className="w-13 h-13 md:w-10 md:h-16 object-contain drop-shadow-md group-hover:scale-100 transition-transform" 
              />
              <span className={`text-2xl md:text-3xl font-black uppercase font-display tracking-tighter transition-colors ${
                scrolled ? 'text-gray-900' : 'text-white drop-shadow-md'
              }`}>
                Prayanam
              </span>
            </Link>

            {/* Falling Sign In & Get Started buttons when workflow section touches upper bar */}
            <AnimatePresence>
              {showNavButtons && (
                <motion.div
                  key="nav-auth-buttons"
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -50, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.8 }}
                  className="flex items-center gap-2 sm:gap-3"
                >
                  <Link 
                    to="/login"
                    className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-black text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register"
                    className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                  >
                    Get Started
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* ==========================================
            SECTION 1: HERO (With Background Image - Fit to Screen)
            ========================================== */}
        <section className="relative h-screen w-full flex flex-col items-center justify-center text-center px-4 overflow-hidden bg-gray-950 text-white">
          {/* Background Image with brighter overlay */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/auth-bg.jpg)' }}
          >
            {/* Lighter gradient overlay for natural brightness */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/50"></div>
          </div>

          {/* Hero Content (Fit to screen, shifted slightly downwards) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 max-w-5xl mx-auto flex flex-col items-center justify-center px-4 translate-y-6 sm:translate-y-8"
          >
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[4rem] font-black text-white uppercase tracking-tight font-display drop-shadow-xl leading-tight">
              Escape the Ordinary, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400">
                Embrace the Extraordinary.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-xl md:text-2xl text-gray-200 font-medium max-w-3xl drop-shadow leading-relaxed">
              Discover hidden gems, plan personalized trips, and explore the world with AI.
            </p>

            {/* CTA Button */}
            <div className="mt-10 flex justify-center">
              <Link
                to="/register"
                className="px-12 py-4 rounded-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black text-base md:text-lg uppercase tracking-wider shadow-2xl hover:shadow-yellow-400/30 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
              >
                <span>Get Started</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Blinking Downward Chevron Icon */}
            <div className="mt-8 flex justify-center">
              <motion.button
                type="button"
                onClick={() => {
                  document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' });
                }}
                animate={{
                  opacity: [0.35, 1, 0.35],
                  y: [0, 8, 0]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut"
                }}
                className="p-2 text-yellow-400 hover:text-yellow-300 cursor-pointer transition-colors group focus:outline-none"
                aria-label="Scroll to From Dream to Destination in Minutes"
                title="Scroll to From Dream to Destination in Minutes"
              >
                <svg
                  viewBox="0 0 100 100"
                  className="w-12 h-12 text-yellow-400 hover:text-yellow-300 drop-shadow-[0_4px_16px_rgba(250,204,21,0.65)] group-hover:scale-110 group-hover:translate-y-1 transition-all"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="13"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M 29 41.5 L 50 59 L 71 41.5" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        </section>

        {/* =====================================================================
            WHITE BACKGROUND AREA DOWN TO THE HERO BACKGROUND IMAGE
            ===================================================================== */}
        <div className="bg-white text-gray-900 relative z-20">
          
          {/* ==========================================
              SECTION 2: SPLIT WORKFLOW (Left: Headlines + Window ScrollStack, Right: DriftWall)
              ========================================== */}
          <section id="workflow" ref={workflowRef} className="scroll-mt-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-start">
              
              {/* LEFT HALF: Headlines & Window-Scroll Stacking Cards */}
              <div className="flex flex-col py-20 md:py-28 px-4 sm:px-6 lg:pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] lg:pr-10">
                {/* Section Header */}
                <div className="mb-10 text-left">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 font-display tracking-tight leading-tight uppercase">
                    <FoldText text="Your Adventure Starts Here" foldStyle="paper" splitBy="char" hinge="top" trigger="scroll" foldAngle={92} duration={0.65} stagger={0.045} staggerFrom="start" ease="power3.out" perspective={700} creaseShading={0.55} fontSize="inherit" fontWeight={900} />
                  </h2>
                </div>

                {/* React Bits ScrollStack with useWindowScroll (No inner scrollbar, driven by page scroll) */}
                <ScrollStack
                  useWindowScroll={true}
                  stackPosition="100px"
                  itemDistance={100}
                  itemStackDistance={24}
                  itemScale={0.045}
                  baseScale={0.82}
                  dimAmount={0.18}
                  holdDistance={260}
                  smoothScroll={true}
                >
                  {/* Card 1: Destination */}
                  <ScrollStackItem style={{ '--scroll-stack-card-background': '#FFFFFF' }} itemClassName="border border-gray-200/80 shadow-xl">
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-xs">
                            <MapPin size={28} />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60">
                            Destination
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 font-display mb-2.5">
                          Choose your destination
                        </h3>
                        <p className="text-base text-gray-600 leading-relaxed">
                          Pick from sunny tropical beaches, tranquil backwaters, snowy mountain peaks, or historic fortresses across India.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2.5 pt-6">
                        {['Goa Beaches', 'Manali Hills', 'Jaipur Heritage', 'Kerala Backwaters'].map(tag => (
                          <span key={tag} className="text-xs font-bold px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </ScrollStackItem>

                  {/* Card 2: Dates & Travellers */}
                  <ScrollStackItem style={{ '--scroll-stack-card-background': '#FFFFFF' }} itemClassName="border border-gray-200/80 shadow-xl">
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-xs">
                            <Calendar size={28} />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200/60">
                            Timeline & Crew
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 font-display mb-2.5">
                          Enter travel dates & travellers
                        </h3>
                        <p className="text-base text-gray-600 leading-relaxed">
                          Travelling solo, with friends, or taking family along? Specify your travel window, pace, and party size.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2.5 pt-6">
                        {['Flexible Dates', 'Solo Explorer', 'Friends Group', 'Family Vacation'].map(tag => (
                          <span key={tag} className="text-xs font-bold px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200/60">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </ScrollStackItem>

                  {/* Card 3: Budget */}
                  <ScrollStackItem style={{ '--scroll-stack-card-background': '#FFFFFF' }} itemClassName="border border-gray-200/80 shadow-xl">
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
                            <Wallet size={28} />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60">
                            Cost Control
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 font-display mb-2.5">
                          Set your budget
                        </h3>
                        <p className="text-base text-gray-600 leading-relaxed">
                          From student backpacker budgets to luxury stays. Get realistic estimates for stays, food & daily transit in INR (₹).
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2.5 pt-6">
                        {['Student Friendly', 'Real-time ₹ Tracking', 'Expense Breakdown'].map(tag => (
                          <span key={tag} className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/60">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </ScrollStackItem>

                  {/* Card 4: AI Planning */}
                  <ScrollStackItem style={{ '--scroll-stack-card-background': '#FFFFFF' }} itemClassName="border border-gray-200/80 shadow-xl">
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs">
                            <Zap size={28} />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60">
                            AI Intelligence
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 font-display mb-2.5">
                          Generate with AI or organize manually
                        </h3>
                        <p className="text-base text-gray-600 leading-relaxed">
                          Let Google Gemini AI design an hour-by-hour itinerary or craft every detail yourself with flexible drag-and-drop editing.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2.5 pt-6">
                        {['Gemini AI Architect', 'Custom Day Builder', '100% Flexible Editing'].map(tag => (
                          <span key={tag} className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/60">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </ScrollStackItem>

                  {/* Card 5: Review & Save */}
                  <ScrollStackItem style={{ '--scroll-stack-card-background': '#FFFFFF' }} itemClassName="border border-gray-200/80 shadow-xl">
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                            <Route size={28} />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                            Complete Trip
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 font-display mb-2.5">
                          Review the roadmap & save your trip
                        </h3>
                        <p className="text-base text-gray-600 leading-relaxed">
                          Review your entire agenda with interactive route maps, spot transit distances, and save securely for offline access.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2.5 pt-6">
                        {['Interactive Route Map', '1-Click Save', 'Cloud Sync & Offline Access'].map(tag => (
                          <span key={tag} className="text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </ScrollStackItem>
                </ScrollStack>
              </div>

              {/* RIGHT HALF: 3D DriftWall — fills entire right half edge-to-edge */}
              <div className="hidden lg:block sticky top-0 h-screen w-full overflow-hidden">
                <DriftWall
                  columns={5}
                  tileWidth={200}
                  tileHeight={135}
                  gap={16}
                  tilt={14}
                  turn={-12}
                  perspective={1200}
                  depth={80}
                  speed={38}
                  direction="up"
                  variance={0.45}
                  parallax={0.6}
                  lift={52}
                  fade={0.25}
                  dim={0.92}
                  overlayColor="transparent"
                />
              </div>

            </div>
          </section>

          {/* ==========================================
              SECTION 3: AI TRAVEL INTELLIGENCE
              ========================================== */}
          <section id="ai-intelligence" className="py-24 md:py-32 bg-gray-50/70 border-y border-gray-200/80 px-6 lg:px-12 scroll-mt-20">
            <div className="max-w-7xl mx-auto">
              
              {/* Header */}
              <div className="text-center max-w-full mx-auto mb-16 md:mb-20">
                <h2 className="whitespace-nowrap text-[clamp(1.05rem,4.2vw,3rem)] font-black text-gray-900 font-display tracking-tight leading-tight uppercase">
                  <FoldText text="Let AI Plan the Journey With You." foldStyle="paper" splitBy="char" hinge="top" trigger="scroll" foldAngle={92} duration={0.65} stagger={0.045} staggerFrom="start" ease="power3.out" perspective={700} creaseShading={0.55} fontSize="inherit" fontWeight={900} />
                </h2>
              </div>

              {/* 5 AI Features Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {AI_CAPABILITIES.map((capability, idx) => {
                  const Icon = capability.icon;

                  return (
                    <motion.div
                      key={capability.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.08 }}
                      className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm hover:shadow-xl hover:border-indigo-400/50 transition-all duration-300 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Top Badge & Icon */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="w-13 h-13 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                            <Icon size={24} />
                          </div>
                          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                            {capability.badge}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-xl font-black text-gray-900 font-display mb-3 group-hover:text-indigo-600 transition-colors">
                          {capability.title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed font-normal">
                          {capability.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ==========================================
              QUERIES / CONTACT SECTION
              ========================================== */}
          <section className="py-8 px-6 lg:px-12 flex justify-center">
            <div className="flex flex-wrap items-center justify-center gap-2 text-center text-gray-700">
              <span className="text-base sm:text-lg font-bold font-display">Have any queries? mail us at</span>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=prayanamsupport@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Compose an email to Prayanam support in Gmail"
                title="Email Prayanam support"
                className="inline-flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition hover:scale-105 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                <svg aria-hidden="true" viewBox="0 0 48 48" className="h-7 w-7 sm:h-8 sm:w-8" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#4285F4" d="M7 14v20a3 3 0 0 0 3 3h4V21z" />
                  <path fill="#34A853" d="M34 21v16h4a3 3 0 0 0 3-3V14z" />
                  <path fill="#FBBC04" d="M34 13v8l7-5v-2a3.5 3.5 0 0 0-5.6-2.8z" />
                  <path fill="#EA4335" d="M14 21v-8l10 7.4L34 13v8L24 28.4z" />
                  <path fill="#C5221F" d="M7 14v2l7 5v-8l-1.4-2A3.5 3.5 0 0 0 7 14" />
                </svg>
              </a>
            </div>
          </section>

          {/* ==========================================
              FOOTER (Compact: Logo Headline on Left, Privacy Policy on Right)
              ========================================== */}
          <footer className="bg-white text-gray-600 py-4 sm:py-5 px-6 sm:px-10 lg:px-12 border-t border-gray-200 relative">
            <div aria-hidden="true" className="absolute -top-5 left-0 right-0 h-6 bg-[url('/vintage-white-divider.svg')] bg-repeat-x bg-[length:320px_24px]" />
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              {/* Left: Logo + Headline */}
              <Link to="/" className="flex items-center gap-1 group">
                <img src="/logo.png" alt="Prayanam Logo" className="w-11 h-11 sm:w-12 sm:h-12 object-contain drop-shadow-sm group-hover:scale-105 transition-transform" />
                <span className="text-xl sm:text-2xl font-black text-gray-900 font-display uppercase tracking-tight">Prayanam</span>
              </Link>

              {/* Right: Privacy Policy */}
              <Link 
                to="/privacy-policy" 
                className="text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 transition-colors group"
              >
                <span className="hover:underline">Privacy Policy</span>
                <ArrowUpRight size={14} className="stroke-[2] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  // ==========================================
  // AUTH VIEW (When path is '/login' or '/register')
  // ==========================================
  return (
    <div className="min-h-screen flex items-center justify-center p-6 pt-24 relative overflow-hidden bg-gray-900">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/auth-bg.jpg)' }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-6 sm:px-10 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1 group ml-0 sm:ml-0">
            <img src="/logo.png" alt="Prayanam Logo" className="w-13 h-13 md:w-10 md:h-16 object-contain drop-shadow-md group-hover:scale-100 transition-transform" />
            <span className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase font-display drop-shadow-md">Prayanam</span>
          </Link>

          <Link
            to="/"
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            Back to Home
          </Link>
        </div>
      </div>

      <div className="w-full relative z-10 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-sm lg:max-w-md mx-auto bg-black/40 backdrop-blur-xl rounded-[28px] shadow-2xl border border-white/20 p-6 lg:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500 rounded-bl-full -z-0 opacity-20 blur-2xl"></div>
            
            <div className="relative z-10">
                {registeredEmail ? (
                    <div className="text-center py-2">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-400/20 border-2 border-yellow-400/40 flex items-center justify-center text-yellow-400 shadow-xl shadow-yellow-400/10">
                            <Mail size={32} className="animate-bounce" />
                        </div>
                        
                        <h2 className="text-2xl lg:text-3xl font-black text-white mb-2 font-display tracking-tight">
                            Check Your Email
                        </h2>
                        <p className="text-gray-300 text-xs lg:text-sm font-medium mb-3">
                            A verification link has been sent to:
                        </p>
                        
                        <div className="bg-white/10 rounded-2xl p-3 mb-4 border border-white/20">
                            <p className="text-yellow-300 font-bold text-sm break-all font-mono">
                                {registeredEmail}
                            </p>
                        </div>
                        
                        <p className="text-gray-300 text-xs mb-6 leading-relaxed">
                            Please open your Gmail inbox and click the verification link to activate your account. Once verified, you will be automatically redirected to sign in.
                        </p>

                        <div className="space-y-2.5">
                            <a
                                href="https://mail.google.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black text-sm uppercase tracking-wider rounded-[16px] shadow-lg shadow-yellow-400/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Mail size={16} />
                                Open Gmail Inbox
                                <ExternalLink size={14} />
                            </a>
                            <Link
                                to="/login"
                                onClick={() => setRegisteredEmail(null)}
                                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-black text-sm uppercase tracking-wider rounded-[16px] border border-white/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                Go to Sign In
                                <ArrowRight size={16} />
                            </Link>
                        </div>

                        <p className="text-[11px] text-gray-400 mt-5">
                            Didn't receive the email? Check spam or{' '}
                            <button
                                type="button"
                                onClick={() => setRegisteredEmail(null)}
                                className="text-yellow-400 underline font-bold hover:text-yellow-300 ml-1 cursor-pointer"
                            >
                                try signing up again
                            </button>
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-4 lg:hidden flex flex-col items-center">
                            <p className="text-[10px] font-black text-gray-300 tracking-widest uppercase mb-3">Escape the Ordinary, Embrace the Extraordinary.</p>
                        </div>

                        <h2 className="text-2xl lg:text-3xl font-black text-white mb-2 font-display tracking-tight text-center">
                            {isLogin ? 'Welcome' : 'Get Started'}
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
                                        className="p-4 bg-green-500/15 rounded-2xl border border-green-500/40 text-green-300 text-xs sm:text-sm font-bold shadow-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
                                            <span>{successMsg}</span>
                                        </div>
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
                                className={`w-full py-3 text-gray-900 font-black text-sm uppercase tracking-wider rounded-[16px] shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
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
                                            showLoading();
                                            const res = await api.post('users/google-login', {
                                                token: credentialResponse.credential,
                                                isLogin: isLogin
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
                                                setError(`Login Error: ${err.response.data.details || err.response.data.error || 'Check console for details'}`);
                                            } else {
                                                setError('Google Login Failed. Check if server is running.');
                                            }
                                        } finally {
                                            setLoading(false);
                                            hideLoading();
                                        }
                                    }}
                                    onError={() => {
                                        console.error('Google Sign-In failed or popup was closed.');
                                        setError('Google Sign-In failed. Please ensure third-party popups are enabled and try again.');
                                    }}
                                    shape="pill"
                                    theme="filled_blue"
                                    size="large"
                                    text="continue_with"
                                />
                            </div>
                        </form>

                        <div className="mt-4 text-center">
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
                                {isLogin ? "New to Prayanam?" : "Already have an account?"}
                            </p>
                            <Link 
                                to={isLogin ? "/register" : "/login"}
                                replace
                                className="inline-block mt-1 text-white font-black text-base hover:text-yellow-300 transition-colors group cursor-pointer"
                            >
                                {isLogin ? "Sign up" : "Sign in"}
                                <div className="h-0.5 bg-yellow-400 rounded-full w-0 group-hover:w-full transition-all duration-300"></div>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
