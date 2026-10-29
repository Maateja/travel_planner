import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, 
    Trash2, 
    MapPin, 
    Calendar, 
    Wallet, 
    CheckCircle, 
    Save, 
    Map as MapIcon, 
    Hotel, 
    Bus,
    Clock,
    ChevronDown,
    Sparkles,
    Globe
} from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../context/LoadingContext';

const ManualPlan = () => {
  const [trips, setTrips] = useState([]);
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    start_date: '',
    end_date: ''
  });
  const [selectedTripId, setSelectedTripId] = useState('');
  const [days, setDays] = useState([
    { 
        day: 1, 
        title: '', 
        activities: [{ name: '', cost: '', time: '' }],
        accommodation: '',
        transport: '',
        notes: ''
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  const addDay = () => {
    setDays([...days, { 
      day: days.length + 1, 
      title: '', 
      activities: [{ name: '', cost: '', time: '' }],
      accommodation: '',
      transport: '',
      notes: ''
    }]);
  };

  const removeDay = (index) => {
    const newDays = days.filter((_, i) => i !== index).map((day, i) => ({ ...day, day: i + 1 }));
    setDays(newDays);
  };

  const updateDay = (index, field, value) => {
    const newDays = [...days];
    newDays[index][field] = value;
    setDays(newDays);
  };

  const addActivity = (dayIndex) => {
    const newDays = [...days];
    newDays[dayIndex].activities.push({ name: '', cost: '', time: '' });
    setDays(newDays);
  };

  const updateActivity = (dayIndex, actIndex, field, value) => {
    const newDays = [...days];
    newDays[dayIndex].activities[actIndex][field] = value;
    setDays(newDays);
  };

  const removeActivity = (dayIndex, actIndex) => {
    const newDays = [...days];
    newDays[dayIndex].activities = newDays[dayIndex].activities.filter((_, i) => i !== actIndex);
    setDays(newDays);
  };

  const totalBudget = days.reduce((acc, day) => {
    const dayCost = day.activities.reduce((dAcc, act) => dAcc + (parseFloat(act.cost) || 0), 0);
    return acc + dayCost;
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.source || !formData.destination || !formData.start_date || !formData.end_date) {
      setError("Please fill in source, destination, start date, and end date.");
      return;
    }

    // Validate that all day details are entered
    for (let i = 0; i < days.length; i++) {
        const day = days[i];
        if (!day.title.trim() || !day.accommodation.trim() || !day.transport.trim()) {
            setError(`Please fill in all main details (Title, Accommodation, Transport) for Day ${day.day}.`);
            return;
        }
        
        const validActivities = day.activities.filter(a => a.name.trim() !== '');
        if (validActivities.length === 0) {
            setError(`Please add at least one activity name for Day ${day.day}.`);
            return;
        }
        
        for (const act of validActivities) {
            if (!act.cost || !act.time) {
                setError(`Please enter expected Cost and Time for activity "${act.name}" on Day ${day.day}.`);
                return;
            }
        }
    }

    setLoading(true);
    showLoading();
    setError(null);

    try {
      // 1. Create a new trip
      const tripPayload = {
        source: formData.source,
        destination: formData.destination,
        start_date: formData.start_date,
        end_date: formData.end_date,
        budget: totalBudget,
        preference: {
          interests: [],
          travel_style: "Manual"
        }
      };
      
      const tripRes = await api.post('trips', tripPayload);
      const tripId = tripRes.data.id;

      // 2. Create itinerary days for the trip
      for (const dayData of days) {
        // We'll adapt to the backend model
        await api.post('itinerary/create', {
          trip: tripId,
          day: dayData.day,
          title: dayData.title || `Day ${dayData.day}`,
          activities: dayData.activities.map(a => a.name).filter(n => n.trim() !== ''),
          plan_description: `Stay: ${dayData.accommodation}. Transport: ${dayData.transport}. Notes: ${dayData.notes}`,
          estimated_cost: dayData.activities.reduce((sum, a) => sum + (parseFloat(a.cost) || 0), 0)
        });
      }
      setSuccess(true);
      setTimeout(() => navigate(`/trip/${tripId}`), 2000);
    } catch (err) {
      console.error(err);
      setError("Failed to save your custom plan. Please check all fields.");
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
        <div className="max-w-6xl mx-auto py-10 px-6">
            <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                   <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-secondary-500 flex items-center justify-center text-white shadow-lg">
                            <MapIcon size={24} />
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Travel Plan by Me</h1>
                   </motion.div>
                   <p className="text-gray-400 font-medium ml-16">Design your own journey with precision and care.</p>
                </div>
            </header>

            {success && (
                <div className="mb-8 p-6 bg-emerald-50 border border-emerald-100 rounded-3xl text-emerald-700 font-bold flex items-center gap-4">
                    <CheckCircle className="text-emerald-500" /> Plan saved! Redirecting...
                </div>
            )}
            
            {error && (
                <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-3xl text-red-700 font-bold flex items-center gap-4">
                    ⚠️ {error}
                </div>
            )}

            <form 
                onSubmit={handleSubmit} 
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON') {
                        e.preventDefault();
                    }
                }}
                className="space-y-10 pb-20"
            >
                {/* 1. Trip Selection */}
                <section className="px-2">
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-wider mb-8 flex items-center gap-3">
                        <div className="w-2 h-6 bg-primary-500 rounded-full"></div>
                        1. Select Destination
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="group space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 block">Source</label>
                            <div className="relative">
                                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-500 transition-colors" size={20} />
                                <input 
                                    value={formData.source}
                                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                                    placeholder="e.g. Mumbai"
                                    className="w-full pl-16 pr-8 py-6 rounded-[28px] bg-white border border-gray-100 shadow-sm focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all font-bold text-lg text-gray-900"
                                />
                            </div>
                        </div>
                        <div className="group space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 block">Destination</label>
                            <div className="relative">
                                <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-secondary-500 transition-colors" size={20} />
                                <input 
                                    value={formData.destination}
                                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                                    placeholder="e.g. London"
                                    className="w-full pl-16 pr-8 py-6 rounded-[28px] bg-white border border-gray-100 shadow-sm focus:ring-4 focus:ring-secondary-500/5 focus:border-secondary-500 transition-all font-bold text-lg text-gray-900"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                        <div className="group space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 block">Start Date</label>
                            <input 
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-8 py-6 rounded-[28px] bg-white border border-gray-100 shadow-sm focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all font-bold text-lg text-gray-900"
                                required
                            />
                        </div>
                        <div className="group space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 block">End Date</label>
                            <input 
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                min={formData.start_date || new Date().toISOString().split('T')[0]}
                                className="w-full px-8 py-6 rounded-[28px] bg-white border border-gray-100 shadow-sm focus:ring-4 focus:ring-secondary-500/5 focus:border-secondary-500 transition-all font-bold text-lg text-gray-900"
                                required
                            />
                        </div>
                    </div>
                </section>

                {/* 2. Days Configuration */}
                <section className="space-y-8">
                     <h3 className="text-lg font-black text-gray-900 uppercase tracking-wider flex items-center gap-3 px-2">
                        <div className="w-2 h-6 bg-secondary-500 rounded-full"></div>
                        2. Build Your Daily Roadmap
                    </h3>

                    <AnimatePresence>
                        {days.map((day, dIdx) => (
                            <motion.div 
                                key={dIdx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 group relative"
                            >
                                <div className="absolute top-6 right-6">
                                    <button 
                                        type="button" 
                                        onClick={() => removeDay(dIdx)} 
                                        className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all group/trash"
                                        title="Remove Day"
                                    >
                                        <Trash2 size={16} className="group-hover/trash:scale-110 transition-transform" />
                                    </button>
                                </div>

                                <div className="flex flex-col xl:flex-row gap-12">
                                    {/* Day Header */}
                                    <div className="xl:w-48 shrink-0 flex flex-col items-center">
                                        <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-primary-600 to-primary-700 text-white flex flex-col items-center justify-center shadow-xl shadow-primary-500/20 mb-6">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Day</span>
                                            <span className="text-4xl font-black">{day.day}</span>
                                        </div>
                                        <div className="w-full space-y-4">
                                            <div className="p-4 bg-gray-50 rounded-2xl flex flex-col gap-1">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Hotel size={10}/> Accommodation</span>
                                                <input value={day.accommodation} onChange={(e) => updateDay(dIdx, 'accommodation', e.target.value)} placeholder="Hotel name" className="bg-transparent border-none p-0 focus:ring-0 text-xs font-bold text-gray-800" />
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-2xl flex flex-col gap-1">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Bus size={10}/> Transport</span>
                                                <input value={day.transport} onChange={(e) => updateDay(dIdx, 'transport', e.target.value)} placeholder="Train/Taxi" className="bg-transparent border-none p-0 focus:ring-0 text-xs font-bold text-gray-800" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Day Content */}
                                    <div className="flex-1 space-y-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Main Highlight / Title</label>
                                            <input 
                                                value={day.title} 
                                                onChange={(e) => updateDay(dIdx, 'title', e.target.value)} 
                                                className="w-full p-5 rounded-3xl bg-gray-50 border-none focus:ring-2 focus:ring-secondary-500 font-bold text-xl" 
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Activities & Costs</label>
                                            <div className="space-y-3">
                                                {day.activities.map((act, aIdx) => (
                                                    <div key={aIdx} className="flex gap-4 items-center animate-in fade-in slide-in-from-left-4 duration-300">
                                                        <div className="relative flex-1">
                                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                                            <input value={act.name} onChange={(e) => updateActivity(dIdx, aIdx, 'name', e.target.value)} placeholder="Visit Museum" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 font-bold text-sm" />
                                                        </div>
                                                        <div className="relative w-40">
                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">₹</span>
                                                            <input type="number" value={act.cost} onChange={(e) => updateActivity(dIdx, aIdx, 'cost', e.target.value)} placeholder="Cost" className="w-full pl-10 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm" />
                                                        </div>
                                                        <div className="relative w-32">
                                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                                            <input type="text" value={act.time} onChange={(e) => updateActivity(dIdx, aIdx, 'time', e.target.value)} placeholder="Time" className="w-full pl-10 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 font-bold text-sm" />
                                                        </div>
                                                        <button type="button" onClick={() => removeActivity(dIdx, aIdx)} className="text-gray-300 hover:text-red-500 p-2"><Trash2 size={18}/></button>
                                                    </div>
                                                ))}
                                                <button type="button" onClick={() => addActivity(dIdx)} className="flex items-center gap-2 text-primary-600 font-black uppercase tracking-widest text-[10px] py-3 px-4 hover:bg-primary-50 rounded-xl transition-all"><Plus size={14}/> Add Activity</button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Day Notes</label>
                                            <textarea value={day.notes} onChange={(e) => updateDay(dIdx, 'notes', e.target.value)} placeholder="Reminders, address, or special tips..." className="w-full p-6 rounded-[32px] bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 font-medium text-sm h-24 resize-none"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <button type="button" onClick={addDay} className="w-full py-10 border-4 border-dashed border-gray-100 rounded-[40px] text-gray-300 font-black uppercase tracking-widest hover:border-primary-200 hover:text-primary-400 hover:bg-primary-50/10 transition-all flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center"><Plus size={32}/></div>
                        Add Day {days.length + 1}
                    </button>
                </section>
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white p-10 rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-50 mt-12 mb-20">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
                            <Wallet size={32} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Estimated Itinerary Total</p>
                            <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">₹{totalBudget.toLocaleString()}</h2>
                        </div>
                    </div>
                    
                    <button type="submit" disabled={loading} className="w-full md:w-auto md:min-w-[400px] py-8 bg-black text-white rounded-[32px] font-black text-2xl uppercase tracking-tighter shadow-2xl shadow-gray-900/10 hover:translate-y-[-4px] active:scale-95 transition-all flex items-center justify-center gap-4">
                        <Save size={28}/> {loading ? "Saving Progress..." : "Save My Roadmap"}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default ManualPlan;
