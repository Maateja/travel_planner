import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Briefcase, 
  ChevronRight, 
  ArrowRight, 
  TrendingUp, 
  Wallet,
  Clock,
  Sparkles,
  Map,
  Bookmark,
  Plane,
  Navigation
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { useLoading } from '../context/LoadingContext';

// --- Helper Components ---

const Counter = ({ value }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    const animation = animate(count, value, { duration: 1.5, ease: "easeOut" });
    return animation.stop;
  }, [value]);

  return <motion.span>{rounded}</motion.span>;
};

const FloatingBlob = ({ color, size, top, left, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ 
      opacity: [0.2, 0.4, 0.2],
      scale: [1, 1.2, 1],
      x: [0, 30, 0],
      y: [0, 50, 0],
    }}
    transition={{ 
      duration: 10 + Math.random() * 5, 
      repeat: Infinity, 
      delay,
      ease: "easeInOut" 
    }}
    className={`fixed pointer-events-none blur-[100px] rounded-full ${color}`}
    style={{ width: size, height: size, top, left, zIndex: -1 }}
  />
);

const getDestinationImage = (destination) => {
  if (!destination) return "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80";
  
  const city = destination.toLowerCase();
  
  // Reliable Unsplash IDs for iconic destinations
  const mapping = {
    'tirupati': 'https://images.unsplash.com/photo-1620959461144-88f5f242e8d3?auto=format&fit=crop&w=1200&q=80',
    'tirumala': 'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&w=1200&q=80',
    'agra': 'https://images.unsplash.com/photo-1564507592333-c60657451dd6?auto=format&fit=crop&w=1200&q=80',
    'delhi': 'https://images.unsplash.com/photo-1587474260584-1f3a9722cfa0?auto=format&fit=crop&w=1200&q=80',
    'mumbai': 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=1200&q=80',
    'jaipur': 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
    'varanasi': 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
    'goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    'kerala': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    'hyderabad': 'https://images.unsplash.com/photo-1572449043416-55f4685c9bb7?auto=format&fit=crop&w=1200&q=80',
    'hampi': 'https://images.unsplash.com/photo-1600100397608-f0939922572b?auto=format&fit=crop&w=1200&q=80',
    'ladakh': 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80'
  };

  for (const [key, url] of Object.entries(mapping)) {
    if (city.includes(key)) return url;
  }

  // Robust fallback to a travel-themed Unsplash photo
  return "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80";
};

function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Explorer');
  const [temporaryRoadmap, setTemporaryRoadmap] = useState(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const cardRef = useRef(null);

  useEffect(() => {
    fetchTrips();
    const loadUser = async () => {
      // Optimistic load
      const userData = JSON.parse(sessionStorage.getItem('user_data') || '{}');
      if (userData.full_name) {
        setUserName(userData.full_name);
      } else if (userData.username) {
        setUserName(userData.username);
      }

      // Fetch fresh profile
      const token = sessionStorage.getItem('access_token');
      if (token) {
        try {
          const res = await api.get('users/profile');
          if (res.data) {
            sessionStorage.setItem('user_data', JSON.stringify(res.data));
            if (res.data.full_name) {
              setUserName(res.data.full_name);
            } else if (res.data.username) {
              setUserName(res.data.username);
            }
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    loadUser();

    // Load temporary roadmap from session storage only if authenticated
    const token = sessionStorage.getItem('access_token');
    if (token) {
        const savedRoadmap = sessionStorage.getItem('currentRoadmap');
        if (savedRoadmap) {
          setTemporaryRoadmap(JSON.parse(savedRoadmap));
        }
    }
  }, []);

  const fetchTrips = async () => {
    // Only fetch if authenticated
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      showLoading();
      const res = await api.get('trips');
      setTrips(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      if (error.response && error.response.status === 401) {
        navigate('/');
      }
    } finally {
      setLoading(false); 
      hideLoading();
    }
  };

  const clearTemporaryRoadmap = () => {
    sessionStorage.removeItem('currentRoadmap');
    setTemporaryRoadmap(null);
  };

  const now = new Date();
  
  // Robust Trip Calculations (Sorted by date)
  const validTrips = trips.filter(t => t && (t.start_date || t.destination));
  
  // Find trips that are in the future
  const futureTrips = [...validTrips]
    .filter(t => {
      if (!t.start_date) return false;
      const end = t.end_date ? new Date(t.end_date) : new Date(t.start_date);
      end.setHours(23, 59, 59, 999);
      return end > now;
    })
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

  // Only show a trip as "upcoming" if it hasn't ended yet
  const upcomingTrip = futureTrips.length > 0 ? futureTrips[0] : null;

  const totalBudgetSpent = validTrips
    .filter(t => {
      if (!t.start_date) return false;
      const end = t.end_date ? new Date(t.end_date) : new Date(t.start_date);
      end.setHours(23, 59, 59, 999);
      return end <= now;
    })
    .reduce((acc, trip) => acc + (Number(trip.budget) || 0), 0);
    
  const activeBudget = upcomingTrip && upcomingTrip.start_date && (() => {
      const end = upcomingTrip.end_date ? new Date(upcomingTrip.end_date) : new Date(upcomingTrip.start_date);
      end.setHours(23, 59, 59, 999);
      return end > now;
  })()
    ? Number(upcomingTrip.budget) 
    : 0;

  const quickActions = [
    { name: 'Plan with AI', icon: Sparkles, path: '/create-trip', color: 'from-primary-500 to-primary-600' },
    { name: 'Manual Trip', icon: Map, path: '/manual-plan', color: 'from-secondary-500 to-secondary-600' },
    { name: 'Budget Planner', icon: Wallet, path: '/budget-planner', color: 'from-accent-500 to-accent-600' },
  ];

  // Parallax Effect for Hero Card
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  function handleMouseMove(event) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden -mt-24">
      {/* Background Enhancements */}
      <FloatingBlob color="bg-primary-200" size="400px" top="-100px" left="-100px" delay={0} />
      <FloatingBlob color="bg-secondary-200" size="300px" bottom="10%" right="10%" delay={2} />
      <FloatingBlob color="bg-accent-100" size="250px" top="40%" left="20%" delay={4} />
      
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

      {/* Edge-to-Edge Hero Video Banner */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="w-full h-screen overflow-hidden relative z-0"
      >
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-screen object-cover object-center brightness-[0.65]"
        >
          <source src="/ride.mp4" type="video/mp4" />
        </video>

        {/* Welcome Greeting & Next Adventure Card + Stats Overlaid on Video */}
        <div className="absolute top-32 left-6 right-6 md:left-20 md:right-20 lg:left-32 lg:right-8 z-10 flex flex-col lg:flex-row justify-between items-start gap-8 md:gap-12">
          {/* Left Column: Welcome Greeting & Next Adventure */}
          <div className="flex-1 w-full max-w-2xl lg:max-w-3xl flex flex-col gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-wide uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
                Hello, <span className="text-primary-400">{userName}!</span>
              </h2>
            </motion.div>

            {/* Next Adventure block inside the overlay */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full"
            >
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-4 drop-shadow-md">
                 <div className="w-2.5 h-8 bg-primary-500 rounded-full shadow-[0_0_15px_rgba(20,184,166,0.5)]"></div>
                 Next Adventure
              </h3>
            </div>

            {temporaryRoadmap ? (
              <div 
                className="relative h-[280px] md:h-[320px] rounded-[32px] overflow-hidden shadow-2xl group bg-gray-900 border-4 border-primary-500/30"
              >
                <img 
                  src={getDestinationImage(temporaryRoadmap.destination)} 
                  alt={temporaryRoadmap.destination}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 z-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                
                <div className="absolute inset-0 z-20 p-6 flex flex-col justify-end">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-accent-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                          Temporary Roadmap
                        </span>
                        <span className="flex items-center gap-1.5 text-white/90 text-xs font-bold bg-white/10 backdrop-blur-md px-2 py-1 rounded-full border border-white/20">
                          Unsaved
                        </span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); clearTemporaryRoadmap(); }}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/60 hover:text-white transition-all"
                      >
                        <Plus size={20} className="rotate-45" />
                      </button>
                    </div>
                    
                    <h4 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                      {temporaryRoadmap.destination}
                    </h4>
                    
                    <div className="pt-2 flex items-center gap-4">
                      <Link 
                        to="/create-trip"
                        className="bg-primary-500 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary-600 transition-all flex items-center gap-2 shadow-lg"
                      >
                        View & Save <Sparkles size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : upcomingTrip ? (
              <div 
                onClick={() => navigate(`/trip/${upcomingTrip._id || upcomingTrip.id}`)}
                className="relative h-[280px] md:h-[320px] rounded-[32px] overflow-hidden shadow-2xl group cursor-pointer bg-gray-900"
              >
                <img 
                  key={upcomingTrip.destination}
                  src={(upcomingTrip.image_url && upcomingTrip.image_url !== 'undefined') ? upcomingTrip.image_url : getDestinationImage(upcomingTrip.destination)} 
                  alt={upcomingTrip.destination}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 z-0"
                  onError={(e) => {
                    e.target.src = "https://d3sftlgbtusmnv.cloudfront.net/blog/wp-content/uploads/2024/09/a-view-of-the-the-famous-Tirumala-temple-Cover-Photo-840x425.jpg";
                  }}
                />

                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                
                <div className="absolute inset-0 z-20 p-6 flex flex-col justify-end">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="px-4 py-1.5 bg-primary-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/30">
                        Upcoming Trip
                      </span>
                      <span className="flex items-center gap-1.5 text-white/90 text-xs font-bold bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                         <Calendar size={12} /> {upcomingTrip.start_date ? new Date(upcomingTrip.start_date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'TBD'}
                         {upcomingTrip.end_date && ` - ${new Date(upcomingTrip.end_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}`}
                      </span>
                    </div>
                    
                    <h4 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                      {upcomingTrip.destination || 'Unplanned Journey'}
                    </h4>
                    
                    <div className="flex items-center gap-6 pt-2">
                       <div className="flex flex-col">
                          <span className="text-[9px] font-black text-white/40 uppercase tracking-wider mb-0.5">From</span>
                          <span className="text-base font-bold text-white flex items-center gap-1.5">
                             <Navigation size={14} className="text-primary-400 rotate-45" /> {upcomingTrip.source || 'Anywhere'}
                          </span>
                       </div>
                       <div className="w-[1px] h-8 bg-white/20" />
                       <div className="flex flex-col">
                          <span className="text-[9px] font-black text-white/40 uppercase tracking-wider mb-0.5">Total Budget</span>
                          <span className="text-base font-bold text-white">₹{upcomingTrip.budget || 0}</span>
                       </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                       <Link 
                         to={`/trip/${upcomingTrip._id || upcomingTrip.id}`}
                         onClick={(e) => e.stopPropagation()}
                         className="bg-white text-gray-900 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all shadow-xl hover:shadow-primary-500/20 active:scale-95 flex items-center gap-2"
                       >
                          Explore Itinerary <Sparkles size={14} />
                       </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => setIsPlanModalOpen(true)}
                className="bg-black/40 backdrop-blur-md border-2 border-dashed border-white/20 rounded-[32px] w-48 h-48 flex flex-col items-center justify-center gap-3 p-4 group hover:border-primary-400/50 hover:bg-black/50 transition-all cursor-pointer shadow-2xl text-center"
              >
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-primary-500/20 text-white/80 group-hover:text-primary-400 transition-all duration-300">
                   <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                </div>
                <p className="text-white/80 group-hover:text-white text-xs font-bold leading-snug px-1">
                   {trips.length === 0 ? "Plan your first adventure here" : "Ready for your next adventure?"}
                </p>
              </div>
            )}
          </motion.div>
          </div>

          {/* Right Column: Stats in individual transparent blocks */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full lg:w-[250px] flex flex-col gap-3 mt-2 lg:-mt-10"
          >
            {[
              { label: 'Total Trips', value: trips.length, icon: Briefcase, iconColor: 'text-sky-400', bg: 'bg-white/5' },
              { label: 'Total Budget Spent', value: totalBudgetSpent, prefix: '₹ ', icon: TrendingUp, iconColor: 'text-emerald-400', bg: 'bg-white/5' },
              { label: 'Active Budget', value: activeBudget, prefix: '₹ ', icon: Wallet, iconColor: 'text-primary-400', bg: 'bg-white/5' }
            ].map((stat, i) => (
              <div 
                key={i}
                className="bg-black/35 backdrop-blur-md border border-white/10 rounded-[20px] p-3.5 flex items-center gap-3.5 shadow-xl hover:bg-black/45 transition-all duration-300 group"
              >
                <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center ${stat.iconColor} border border-white/5 transition-transform group-hover:scale-105`}>
                  <stat.icon size={18} />
                </div>
                <div>
                  <p className="text-[8px] font-bold text-white/50 uppercase tracking-[0.2em]">{stat.label}</p>
                  <h3 className="text-xl font-bold text-white tracking-tighter leading-tight">
                    {stat.prefix}<Counter value={stat.value} />
                  </h3>
                </div>
              </div>
            ))}
            
            <div className="bg-black/35 backdrop-blur-md border border-white/10 rounded-[24px] p-4 flex flex-col gap-3 shadow-xl">
              <h4 className="text-[9px] font-bold text-white/50 uppercase tracking-[0.2em] flex items-center gap-2">
                 <div className="w-1.5 h-3 bg-secondary-400 rounded-full"></div>
                 Recent Activities
              </h4>
              <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
                {trips.length > 0 ? (
                  trips.slice(0, 4).map((trip, i) => (
                    <div 
                      key={i}
                      onClick={() => navigate(`/trip/${trip._id || trip.id}`)}
                      className="hover:bg-white/5 py-2 px-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer group border border-transparent hover:border-white/5"
                    >
                      <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center text-secondary-400 border border-white/5">
                        <MapPin size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-bold text-white truncate leading-none mb-1.5 uppercase tracking-wide">{trip.destination}</h5>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider truncate">
                           {trip.start_date ? new Date(trip.start_date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'TBD'} • ₹ {trip.budget || 0}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-white/30 group-hover:text-white transition-colors" />
                    </div>
                  ))
                ) : (
                  <p className="text-[9px] text-white/40 uppercase tracking-widest text-center py-4 leading-normal">
                    No history yet.<br/>Your travels will appear here!
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

      </motion.div>

      {/* Main Scrolled Content Container */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="px-6 md:px-20 lg:px-32 py-8 pt-6 max-w-[1600px] mx-auto space-y-8 relative z-10"
      >


        <div className="space-y-6">
          <section>
             <h3 className="text-xl font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-4">
                <div className="w-2.5 h-8 bg-black rounded-full shadow-lg"></div>
                Quick Launch
             </h3>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               {quickActions.map((action, i) => (
                 <Link key={i} to={action.path}>
                   <motion.div 
                      whileHover={{ y: -5, scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`bg-gradient-to-br ${action.color} p-6 rounded-[32px] text-white shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group`}
                   >
                      <div className="absolute top-0 right-0 p-4 opacity-20 -rotate-12 translate-x-4 -translate-y-4 group-hover:rotate-0 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700">
                         <action.icon size={80} />
                      </div>
                      <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4">
                          <action.icon size={24} />
                        </div>
                        <span className="font-black text-sm uppercase tracking-widest">{action.name}</span>
                      </div>
                   </motion.div>
                 </Link>
               ))}
             </div>
          </section>
        </div>

        {/* Credits Footer */}
        <div className="flex justify-center w-full pt-12 pb-4">
          <div className="text-gray-400 font-bold text-[11px] tracking-widest uppercase bg-white/50 backdrop-blur-sm px-6 py-2 rounded-full border border-gray-100 shadow-sm">
            &copy; 2026 | Designed and Developed by <span className="text-primary-600">TEJ</span>
          </div>
        </div>
      </motion.div>

      {/* Plan Choice Modal */}
      <AnimatePresence>
        {isPlanModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPlanModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[2000] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-[40px] p-8 md:p-12 max-w-2xl w-full shadow-2xl relative overflow-hidden"
              >
                {/* Background Accents */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 rounded-bl-full opacity-50 -z-10"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary-100 rounded-tr-full opacity-50 -z-10"></div>

                <div className="text-center mb-10">
                  <h3 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter mb-4">
                    How would you like to plan?
                  </h3>
                  <p className="text-gray-500 font-medium">Choose your preferred way to create your next adventure.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* AI Plan */}
                  <button
                    onClick={() => {
                        setIsPlanModalOpen(false);
                        navigate('/create-trip');
                    }}
                    className="group relative bg-white border-2 border-gray-100 p-8 rounded-[32px] text-left hover:border-primary-500 transition-all duration-300 hover:-translate-y-2 shadow-sm hover:shadow-xl hover:shadow-primary-500/10"
                  >
                    <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">Plan with AI</h4>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed">
                      Let our intelligent AI craft a personalized itinerary for you in seconds.
                    </p>
                    <div className="mt-6 flex items-center gap-2 text-xs font-black text-primary-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      Get Started <ArrowRight size={14} />
                    </div>
                  </button>

                  {/* Manual Plan */}
                  <button
                    onClick={() => {
                        setIsPlanModalOpen(false);
                        navigate('/manual-plan');
                    }}
                    className="group relative bg-white border-2 border-gray-100 p-8 rounded-[32px] text-left hover:border-secondary-500 transition-all duration-300 hover:-translate-y-2 shadow-sm hover:shadow-xl hover:shadow-secondary-500/10"
                  >
                    <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">Plan Myself</h4>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed">
                      Take full control and build your dream trip exactly how you want it.
                    </p>
                    <div className="mt-6 flex items-center gap-2 text-xs font-black text-secondary-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      Create Manual <ArrowRight size={14} />
                    </div>
                  </button>
                </div>

                <button 
                  onClick={() => setIsPlanModalOpen(false)}
                  className="mt-10 w-full py-4 text-gray-400 font-black text-xs uppercase tracking-[0.2em] hover:text-gray-600 transition-colors"
                >
                  Maybe Later
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Dashboard;
