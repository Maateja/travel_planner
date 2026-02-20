import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { 
  MapPin, 
  Calendar, 
  Wallet, 
  ArrowRight, 
  Briefcase, 
  Search, 
  Filter,
  Trash2,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await api.get('trips');
      setTrips(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trip? This cannot be undone.')) return;
    
    try {
      setDeletingId(id);
      await api.delete(`trips/${id}`);
      setTrips(trips.filter(t => t.id !== id));
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Failed to delete trip. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const isUpcoming = new Date(trip.start_date) > new Date();
    if (filter === 'Upcoming') return matchesSearch && isUpcoming;
    if (filter === 'Past') return matchesSearch && !isUpcoming;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-7xl mx-auto py-10 px-6 space-y-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div>
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg">
                        <Briefcase size={24} />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">My Trips</h1>
                </motion.div>
                <p className="text-gray-400 font-medium ml-16">Your complete travel history and upcoming adventures.</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search destination..." 
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-sm shadow-sm" 
                    />
                </div>
                <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                    {['All', 'Upcoming', 'Past'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>
        </header>

        {loading ? (
            <div className="py-20 flex justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                <AnimatePresence>
                    {filteredTrips.map((trip, idx) => {
                        const isUpcoming = new Date(trip.start_date) > new Date();
                        return (
                            <motion.div 
                                key={trip.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={{ y: -8 }}
                                className="bg-white rounded-[40px] shadow-sm hover:shadow-2xl hover:shadow-blue-200/20 border border-gray-100 overflow-hidden group cursor-pointer"
                                onClick={() => navigate(`/trip/${trip.id}`)}
                            >
                                <div className="h-56 bg-gray-50 relative p-8 flex flex-col justify-end">
                                    <div className="absolute top-6 right-6 flex gap-2">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(trip.id);
                                            }}
                                            disabled={deletingId === trip.id}
                                            className="p-3 bg-white/90 backdrop-blur rounded-xl text-gray-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                                        >
                                            {deletingId === trip.id ? (
                                                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <Trash2 size={16}/>
                                            )}
                                        </button>
                                        <button 
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-3 bg-white/90 backdrop-blur rounded-xl text-gray-400 hover:text-blue-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Copy size={16}/>
                                        </button>
                                    </div>
                                    <div className={`absolute top-6 left-6 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isUpcoming ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${isUpcoming ? 'bg-emerald-500' : 'bg-gray-500'}`}></div>
                                        {isUpcoming ? 'Upcoming' : 'Completed'}
                                    </div>
                                    <h4 className="text-gray-900 font-black text-4xl uppercase tracking-tighter truncate leading-none mb-1">{trip.destination}</h4>
                                    <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                        <MapPin size={10} /> {trip.source}
                                    </div>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Planned Date</p>
                                            <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                                                <Calendar size={14} className="text-blue-500" />
                                                {new Date(trip.start_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Budget Allocation</p>
                                            <p className="text-lg font-black text-gray-900 tracking-tighter"><span className="text-emerald-500">₹</span>{trip.budget.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Adventure Mode</span>
                                        <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest">
                                            Details <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                {filteredTrips.length === 0 && !loading && (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Briefcase size={32} className="text-gray-200" />
                        </div>
                        <h4 className="text-xl font-black text-gray-400 uppercase tracking-tighter">No trips found in this category</h4>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
}

export default MyTrips;
