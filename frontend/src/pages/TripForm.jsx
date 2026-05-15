import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Calendar, MapPin, Globe, Heart, Sparkles, ChevronRight, RefreshCw, Save, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from '../context/LoadingContext';

function TripForm() {
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    start_date: '',
    end_date: '',
    budget: '',
    interests: [],
    travel_style: 'Budget'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itinerary, setItinerary] = useState(null); 
  const [isSaved, setIsSaved] = useState(false);
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  // Task 5: Persistent State (Session only)
  useEffect(() => {
    const savedData = sessionStorage.getItem('itinerary_form_data');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
    const savedItinerary = sessionStorage.getItem('currentRoadmap');
    if (savedItinerary) {
      setItinerary(JSON.parse(savedItinerary));
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('itinerary_form_data', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (itinerary) {
      sessionStorage.setItem('currentRoadmap', JSON.stringify(itinerary));
    } else {
      sessionStorage.removeItem('currentRoadmap');
    }
  }, [itinerary]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Task 1: Preserve exact value
    setFormData({ ...formData, [name]: value });
  };

  const handleInterestChange = (e) => {
    const { value, checked } = e.target;
    const currentInterests = formData.interests;
    if (checked) {
      setFormData({ ...formData, interests: [...currentInterests, value] });
    } else {
      setFormData({
        ...formData,
        interests: currentInterests.filter((i) => i !== value),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Task 2: Date Validation
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      setError("Please select a valid future date.");
      return;
    }
    if (end < start) {
      setError("End date must be after start date.");
      return;
    }

    setLoading(true);
    showLoading();
    setError(null);
    setIsSaved(false);

    try {
      // Task 4: Only generate, don't save yet
      const res = await api.post('itinerary/generate', {
        destination: formData.destination,
        start_date: formData.start_date,
        end_date: formData.end_date,
        budget: formData.budget,
        interests: formData.interests
      });
      
      console.log('AI Response received:', res.data);
      if (res.data.success || res.data.itinerary) {
        setItinerary(res.data);
        // Scroll to result on success
        setTimeout(() => {
          document.getElementById('itinerary-roadmap-top')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      } else {
        console.warn('AI Generation issues:', res.data);
        setError(res.data.error || 'The AI was unable to generate a valid plan. Please try different dates or destination.');
      }
    } catch (err) {
      console.error('Error generating plan:', err);
      const backEndError = err.response?.data?.error || err.response?.data?.details;
      const status = err.response?.status;
      
      if (status === 401) {
        setError("Your session has expired. Please log in again.");
      } else if (status === 500) {
        setError(backEndError || "The AI server encountered an error. This usually happens with invalid API keys or high traffic.");
      } else if (err.code === 'ECONNABORTED') {
        setError("The request took too long. Please try again with a shorter duration.");
      } else {
        setError(backEndError || 'Network error. Please check if the backend server is running.');
      }
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  const handleSaveTrip = async () => {
    if (!itinerary) return;
    setLoading(true);
    showLoading();
    try {
      // 1. Save the Trip
      const tripPayload = {
        source: formData.source,
        destination: formData.destination,
        start_date: formData.start_date,
        end_date: formData.end_date,
        budget: formData.budget,
        preference: {
          interests: formData.interests,
          travel_style: formData.travel_style
        }
      };
      
      const tripRes = await api.post('trips', tripPayload);
      const tripId = tripRes.data.id;

      // 2. Save Itinerary Days
      const days = itinerary.itinerary || [];
      for (const dayItem of days) {
        await api.post('itinerary/create', {
          trip: tripId,
          day: dayItem.day,
          title: dayItem.title,
          plan_description: dayItem.plan_description,
          activities: dayItem.activities,
          estimated_cost: dayItem.estimated_cost
        });
      }

      setIsSaved(true);
      sessionStorage.removeItem('currentRoadmap');
      sessionStorage.removeItem('itinerary_form_data');
      
      // Navigate to detail after a small delay to show success
      setTimeout(() => navigate(`/trip/${tripId}`), 1500);
    } catch (err) {
      console.error('Error saving trip:', err);
      setError('Failed to save your trip. Please try again.');
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  const interestsOptions = [
    { name: 'Nature' }, { name: 'Food' }, { name: 'Adventure' }, 
    { name: 'History' }, { name: 'Shopping' }, { name: 'Culture' }
  ];

  return (
    <div className="min-h-screen bg-gray-50/30">
        <div className="max-w-[1600px] mx-auto py-10 px-6">
            <header className="mb-10 px-4">
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 mb-2"
                >
                    <div className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center text-white shadow-lg">
                        <Sparkles size={24} />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Travel Plan by AI</h1>
                </motion.div>
                <p className="text-gray-400 font-medium ml-16">Gemini AI will craft your perfect journey in seconds.</p>
            </header>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Left Section: Form */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:w-1/3 space-y-8"
                >
                    <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-6">
                                <div className="group space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">From</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-500" size={18} />
                                        <input
                                            name="source"
                                            placeholder="Mumbai"
                                            value={formData.source}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 font-bold"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="group space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">To</label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-500" size={18} />
                                        <input
                                            name="destination"
                                            placeholder="London"
                                            value={formData.destination}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 font-bold"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="group space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Start Date</label>
                                        <input
                                            type="date"
                                            name="start_date"
                                            value={formData.start_date}
                                            onChange={handleInputChange}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 font-bold text-sm"
                                            required
                                        />
                                    </div>
                                    <div className="group space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">End Date</label>
                                        <input
                                            type="date"
                                            name="end_date"
                                            value={formData.end_date}
                                            onChange={handleInputChange}
                                            min={formData.start_date || new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 font-bold text-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="group space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Budget (₹)</label>
                                    <input
                                        type="number"
                                        name="budget"
                                        placeholder="50000"
                                        step="1"
                                        min="0"
                                        value={formData.budget}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-emerald-500 font-black text-xl"
                                        required
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Heart size={14} className="text-red-400" /> Vibe Preferences
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {interestsOptions.map((opt) => (
                                            <label key={opt.name} className={`
                                                cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition-all border-2
                                                ${formData.interests.includes(opt.name) 
                                                    ? 'bg-primary-500 text-white border-primary-500' 
                                                    : 'bg-white text-gray-400 border-gray-100 hover:border-primary-200'}
                                            `}>
                                                <input
                                                    type="checkbox"
                                                    value={opt.name}
                                                    checked={formData.interests.includes(opt.name)}
                                                    onChange={handleInterestChange}
                                                    className="hidden"
                                                />
                                                {opt.name}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border-l-4 border-red-500"
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:translate-y-[-2px] active:scale-95 transition-all shadow-xl shadow-gray-200"
                            >
                                {loading && !itinerary ? <RefreshCw className="animate-spin" /> : <><Sparkles size={16} /> Generate AI Plan</>}
                            </button>
                        </form>
                    </div>
                </motion.div>

                {/* Right Section: Result */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[700px]"
                >
                   {!itinerary ? (
                     <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-6">
                        <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center">
                            <Sparkles size={64} className="text-gray-100" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-300 uppercase tracking-tighter">Your Magic Itinerary Will Appear Here</h3>
                        <p className="text-gray-300 font-medium max-w-xs uppercase tracking-widest text-[10px]">Fill the form and let AI do the heavy lifting.</p>
                     </div>
                   ) : (
                     <div className="flex-1 flex flex-col">
                        <div id="itinerary-roadmap-top" className="p-8 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter truncate max-w-[300px]">{itinerary.destination} Roadmap</h3>
                                <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest mt-1">AI Generated • {formData.travel_style} Mode</p>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => {
                                        setItinerary(null);
                                        sessionStorage.removeItem('currentRoadmap');
                                    }} 
                                    className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-all"
                                >
                                    <RefreshCw size={18} />
                                </button>
                                <button 
                                    onClick={handleSaveTrip} 
                                    disabled={loading || isSaved}
                                    className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all ${
                                        isSaved 
                                            ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                                            : 'bg-primary-500 text-white shadow-primary-500/20 hover:scale-[1.02]'
                                    }`}
                                >
                                    {loading ? <RefreshCw className="animate-spin" size={16} /> : <><Save size={16}/> {isSaved ? "Saved!" : "Save Trip"}</>}
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
                            {/* Roadmap Visualization */}
                            <div className="relative">
                                <div className="absolute left-6 top-8 bottom-8 w-[2px] border-l-2 border-dashed border-primary-200"></div>
                                <div className="space-y-12 relative z-10">
                                    {(itinerary.itinerary || []).map((day, idx) => (
                                        <motion.div 
                                            key={idx} 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="flex gap-8 group"
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 font-black text-xl shadow-sm border border-white group-hover:bg-primary-500 group-hover:text-white transition-colors">
                                                {day.day}
                                            </div>
                                            <div className="flex-1 bg-gray-50/50 p-6 rounded-3xl group-hover:bg-white border border-transparent group-hover:border-primary-100 transition-all duration-300">
                                                <h4 className="font-black text-gray-900 uppercase tracking-tight mb-2 leading-tight">{day.title}</h4>
                                                <p className="text-sm text-gray-500 leading-relaxed font-medium mb-4">{day.plan_description}</p>
                                                
                                                <div className="space-y-2">
                                                    {(day.activities || []).map((act, i) => (
                                                        <div key={i} className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary-300 shrink-0"></div>
                                                            {act}
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-6 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary-500">
                                                    <span>Est. Cost: ₹{typeof day.estimated_cost === 'number' ? day.estimated_cost.toLocaleString() : day.estimated_cost}</span>
                                                    <span>•</span>
                                                    <span>{(day.activities || []).length} Activities</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-400 font-bold text-xs">
                                <Download size={14} /> Export Plan
                            </div>
                            <button className="text-xs font-black text-primary-600 uppercase tracking-widest hover:text-primary-800">Share with friends</button>
                        </div>
                     </div>
                   )}
                </motion.div>
            </div>
        </div>
    </div>
  );
}

export default TripForm;
