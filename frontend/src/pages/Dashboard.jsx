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
  Navigation,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';

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
  const navigate = useNavigate();
  const cardRef = useRef(null);

  useEffect(() => {
    fetchTrips();
    const userData = JSON.parse(sessionStorage.getItem('user_data') || '{}');
    if (userData.full_name) {
      setUserName(userData.full_name.split(' ')[0]);
    } else if (userData.username) {
      setUserName(userData.username);
    }

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
      const res = await api.get('trips');
      setTrips(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false); 
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

  // If no future trips, take the absolute last one (most recently added/started)
  const upcomingTrip = futureTrips.length > 0 
    ? futureTrips[0] 
    : [...validTrips].sort((a, b) => new Date(b.createdAt || b.start_date) - new Date(a.createdAt || a.start_date))[0];

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
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      {/* Background Enhancements */}
      <FloatingBlob color="bg-primary-200" size="400px" top="-100px" left="-100px" delay={0} />
      <FloatingBlob color="bg-secondary-200" size="300px" bottom="10%" right="10%" delay={2} />
      <FloatingBlob color="bg-accent-100" size="250px" top="40%" left="20%" delay={4} />
      
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

      {loading && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="px-6 md:px-20 lg:px-32 py-8 pt-6 max-w-[1600px] mx-auto space-y-8 relative z-10"
      >
        {/* Welcome Section - Simple Style */}
        <header>
          <motion.div 
            variants={itemVariants}
            className="flex items-center gap-4"
          >
             <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase">
               Hello, <span className="text-primary-600">{userName}!</span>
             </h2>
          </motion.div>
        </header>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total Trips', value: trips.length, icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-50/50', border: 'hover:border-blue-200' },
            { label: 'Total Budget Spent', value: totalBudgetSpent, prefix: '₹', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50/50', border: 'hover:border-emerald-200' },
            { label: 'Active Budget', value: activeBudget, prefix: '₹', icon: Wallet, color: 'text-primary-500', bg: 'bg-primary-50/50', border: 'hover:border-primary-200', glow: activeBudget > 0 && activeBudget < 5000 ? 'shadow-[0_0_20px_rgba(249,115,22,0.3)] border-accent-200' : '' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              className={`bg-white/80 backdrop-blur-md p-5 rounded-[24px] shadow-sm border border-gray-100/50 flex items-center gap-4 transition-all duration-300 group ${stat.border} hover:shadow-lg hover:shadow-gray-200/50 ${stat.glow || ''}`}
            >
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} transition-transform group-hover:rotate-6 duration-500 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <stat.icon size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-gray-900 tracking-tighter">
                  {stat.prefix}<Counter value={stat.value} />
                </h3>
              </div>
            </motion.div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Trip Card */}
            <section>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-wider flex items-center gap-4">
                   <div className="w-2.5 h-8 bg-primary-500 rounded-full shadow-[0_0_15px_rgba(20,184,166,0.5)]"></div>
                   Next Adventure
                </h3>
                <Link to="/my-trips" className="group flex items-center gap-2 text-xs font-black text-primary-600 uppercase tracking-widest">
                  View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {temporaryRoadmap ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="relative h-[380px] rounded-[32px] overflow-hidden shadow-2xl group bg-gray-900 border-4 border-primary-500/30"
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
                      
                      <h4 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">
                        {temporaryRoadmap.destination}
                      </h4>
                      
                      <div className="pt-4 flex items-center gap-4">
                        <Link 
                          to="/create-trip"
                          className="bg-primary-500 text-white px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-primary-600 transition-all flex items-center gap-3"
                        >
                          View & Save <Sparkles size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : upcomingTrip ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  onClick={() => navigate(`/trip/${upcomingTrip._id || upcomingTrip.id}`)}
                  className="relative h-[380px] rounded-[32px] overflow-hidden shadow-2xl group cursor-pointer bg-gray-900"
                >
                  {/* Dynamic Destination Image */}
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
                    <motion.div 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-4 py-1.5 bg-primary-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/30">
                          Upcoming Trip
                        </span>
                        <span className="flex items-center gap-1.5 text-white/90 text-xs font-bold bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                           <Calendar size={12} /> {upcomingTrip.start_date ? new Date(upcomingTrip.start_date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'TBD'}
                           {upcomingTrip.end_date && ` - ${new Date(upcomingTrip.end_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}`}
                        </span>
                      </div>
                      
                      <h4 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">
                        {upcomingTrip.destination || 'Unplanned Journey'}
                      </h4>
                      
                      <div className="flex items-center gap-8 pt-4">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1">From</span>
                            <span className="text-lg font-bold text-white flex items-center gap-2">
                               <Navigation size={18} className="text-primary-400 rotate-45" /> {upcomingTrip.source || 'Anywhere'}
                            </span>
                         </div>
                         <div className="w-[1px] h-10 bg-white/20" />
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1">Total Budget</span>
                            <span className="text-lg font-bold text-white">₹{upcomingTrip.budget || 0}</span>
                         </div>
                      </div>

                      <div className="pt-4 flex items-center justify-between">
                         <Link 
                           to={`/trip/${upcomingTrip._id || upcomingTrip.id}`}
                           onClick={(e) => e.stopPropagation()}
                           className="bg-white text-gray-900 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all shadow-xl hover:shadow-primary-500/20 active:scale-95 flex items-center gap-2"
                         >
                            Explore Itinerary <Sparkles size={16} />
                         </Link>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white/50 backdrop-blur-sm border-2 border-dashed border-gray-200 rounded-[32px] h-[300px] flex flex-col items-center justify-center text-center p-8 group hover:border-primary-300 transition-colors">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                     <Globe className="text-gray-300 w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-black text-gray-900 uppercase">No Trips Planned Yet</h4>
                  <p className="text-gray-500 text-sm mt-3 font-medium max-w-xs">Start your journey today and let AI help you discover amazing places in India.</p>
                  <Link to="/create-trip" className="mt-8 text-primary-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
                    Plan Your First Adventure <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </section>

            {/* Quick Actions */}
            <section>
               <h3 className="text-xl font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-4">
                  <div className="w-2.5 h-8 bg-black rounded-full shadow-lg"></div>
                  Quick Launch
               </h3>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                 {quickActions.map((action, i) => (
                   <Link key={i} to={action.path}>
                     <motion.div 
                        whileHover={{ y: -5, scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
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

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Activities Section */}
            <section>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-3">
                 <div className="w-2 h-6 bg-secondary-500 rounded-full"></div>
                 Recent Activities
              </h3>
              <div className="space-y-4">
                {trips.length > 0 ? (
                  trips.slice(0, 5).map((trip, i) => (
                    <motion.div 
                      key={i}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => navigate(`/trip/${trip._id || trip.id}`)}
                      className="bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-gray-100 hover:bg-white hover:border-primary-100 transition-all flex items-center gap-4 shadow-sm group cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-secondary-500 group-hover:scale-110 transition-transform">
                        <MapPin size={22} />
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-black text-gray-900 uppercase leading-none mb-1">{trip.destination}</h5>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                           {trip.start_date ? new Date(trip.start_date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'TBD'}
                           {trip.end_date && ` - ${new Date(trip.end_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}`} • ₹{trip.budget || 0}
                        </p>
                      </div>
                      <Link to={`/trip/${trip._id || trip.id}`} onClick={(e) => e.stopPropagation()} className="p-2 text-gray-300 hover:text-primary-500 transition-colors">
                        <ChevronRight size={20} />
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-10 px-4 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-loose">No history yet.<br/>Your travels will appear here!</p>
                  </div>
                )}
              </div>
            </section>


          </div>
        </div>

        {/* Credits Footer */}
        <div className="flex justify-center w-full pt-12 pb-4">
          <div className="text-gray-400 font-bold text-[11px] tracking-widest uppercase bg-white/50 backdrop-blur-sm px-6 py-2 rounded-full border border-gray-100 shadow-sm">
            &copy; 2026 | Designed and Developed by <span className="text-primary-600">TEJ</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Dashboard;
