import React, { useState, useEffect, useMemo, useRef } from 'react';
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
    Globe,
    Navigation,
    Copy,
    Camera,
    Utensils,
    Compass,
    Coffee,
    ShoppingBag,
    Sun,
    Info,
    ArrowRight,
    Check,
    Layers,
    AlertCircle,
    FileText,
    Car,
    Train
} from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../context/LoadingContext';

// Quick inspiration suggestions for users
const POPULAR_SOURCES = ['Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Kolkata', 'Chennai', 'Pune'];
const POPULAR_DESTINATIONS = ['Goa', 'Manali', 'Udaipur', 'Jaipur', 'Kerala', 'Varanasi', 'Rishikesh'];
const ACCOMMODATION_SUGGESTIONS = ['Backpacker Hostel', 'Boutique Hotel', 'Homestay / Airbnb', 'Beach Resort', 'Budget Hotel'];
const TRANSPORT_SUGGESTIONS = ['Metro & Walking', 'Cab / Auto-Rickshaw', 'Rented Scooter / Bike', 'Express Train', 'Private Taxi'];
const ACTIVITY_SUGGESTIONS = [
  { name: 'Heritage Fort Tour', category: 'sightseeing', defaultCost: '250', defaultTime: '10:00 AM' },
  { name: 'Street Food Crawl', category: 'food', defaultCost: '400', defaultTime: '01:30 PM' },
  { name: 'Scenic Sunset Point', category: 'nature', defaultCost: '100', defaultTime: '05:30 PM' },
  { name: 'Local Souvenir Market', category: 'shopping', defaultCost: '500', defaultTime: '07:30 PM' },
  { name: 'Cozy Cafe & Relaxation', category: 'cafe', defaultCost: '300', defaultTime: '04:00 PM' },
];

const CATEGORY_ICONS = {
  sightseeing: Camera,
  food: Utensils,
  nature: Sun,
  shopping: ShoppingBag,
  cafe: Coffee,
  transit: Car,
  other: Compass
};

const ManualPlan = () => {
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    start_date: '',
    end_date: ''
  });

  const [days, setDays] = useState([
    { 
      day: 1, 
      title: 'Arrival, Check-in & Sunset Stroll', 
      activities: [
        { name: 'Check into accommodation & freshen up', cost: '0', time: '12:00 PM', category: 'transit' },
        { name: 'Local neighborhood walk & lunch', cost: '350', time: '02:00 PM', category: 'food' },
        { name: 'Sunset view & evening market', cost: '200', time: '06:00 PM', category: 'sightseeing' }
      ],
      accommodation: 'Central Backpacker Hostel',
      transport: 'Metro / Auto-rickshaw',
      notes: 'Keep local currency handy for street vendors and auto fares.'
    }
  ]);

  const [activeDayTab, setActiveDayTab] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const dayRefs = useRef({});
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  // Restore draft from sessionStorage if available
  useEffect(() => {
    try {
      const savedDraft = sessionStorage.getItem('manual_plan_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.formData) setFormData(parsed.formData);
        if (parsed.days && parsed.days.length > 0) setDays(parsed.days);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save draft on edit
  useEffect(() => {
    try {
      sessionStorage.setItem('manual_plan_draft', JSON.stringify({ formData, days }));
    } catch {
      // Ignore storage errors
    }
  }, [formData, days]);

  // Calculate duration in days between start and end date
  const tripDuration = useMemo(() => {
    if (!formData.start_date || !formData.end_date) return null;
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return null;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }, [formData.start_date, formData.end_date]);

  // Calculate actual calendar date for a specific day index
  const getDayDateLabel = (dayIndex) => {
    if (!formData.start_date) return null;
    const start = new Date(formData.start_date);
    if (isNaN(start.getTime())) return null;
    const targetDate = new Date(start);
    targetDate.setDate(start.getDate() + dayIndex);
    return targetDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Sync days count with date duration
  const handleSyncDaysWithDates = () => {
    if (!tripDuration || tripDuration <= 0) return;
    if (tripDuration === days.length) return;

    if (tripDuration > days.length) {
      const newDays = [...days];
      for (let i = days.length; i < tripDuration; i++) {
        newDays.push({
          day: i + 1,
          title: `Day ${i + 1} Exploration`,
          activities: [{ name: 'Morning local sightseeing', cost: '300', time: '10:00 AM', category: 'sightseeing' }],
          accommodation: days[days.length - 1]?.accommodation || 'City Center Hotel',
          transport: days[days.length - 1]?.transport || 'Metro / Local Transit',
          notes: ''
        });
      }
      setDays(newDays);
    } else {
      // Trim with confirmation if activities exist
      const newDays = days.slice(0, tripDuration).map((d, idx) => ({ ...d, day: idx + 1 }));
      setDays(newDays);
    }
  };

  const addDay = () => {
    const nextDayNum = days.length + 1;
    const prevDay = days[days.length - 1];
    setDays([...days, { 
      day: nextDayNum, 
      title: `Day ${nextDayNum} Highlights`, 
      activities: [{ name: 'Explore local sights & cafes', cost: '300', time: '10:00 AM', category: 'sightseeing' }],
      accommodation: prevDay?.accommodation || 'City Center Stay',
      transport: prevDay?.transport || 'Local Transit / Taxi',
      notes: ''
    }]);
    setActiveDayTab(nextDayNum);
    
    // Smooth scroll to the newly added day
    setTimeout(() => {
      dayRefs.current[nextDayNum]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const duplicateDay = (index) => {
    const sourceDay = days[index];
    const newDay = {
      ...sourceDay,
      day: days.length + 1,
      title: `${sourceDay.title} (Copy)`,
      activities: sourceDay.activities.map(a => ({ ...a }))
    };
    const updated = [...days, newDay].map((d, i) => ({ ...d, day: i + 1 }));
    setDays(updated);
    setActiveDayTab(updated.length);
  };

  const removeDay = (index) => {
    if (days.length <= 1) {
      setError("An itinerary must contain at least one day.");
      return;
    }
    const newDays = days.filter((_, i) => i !== index).map((day, i) => ({ ...day, day: i + 1 }));
    setDays(newDays);
    if (activeDayTab > newDays.length) {
      setActiveDayTab(newDays.length);
    }
  };

  const updateDay = (index, field, value) => {
    const newDays = [...days];
    newDays[index][field] = value;
    setDays(newDays);
    
    // Clear validation error for this day if resolved
    if (validationErrors[`day_${index}_${field}`]) {
      setValidationErrors(prev => {
        const copy = { ...prev };
        delete copy[`day_${index}_${field}`];
        return copy;
      });
    }
  };

  const addActivity = (dayIndex, preset = null) => {
    const newDays = [...days];
    const newActivity = preset ? {
      name: preset.name,
      cost: preset.defaultCost || '200',
      time: preset.defaultTime || '11:00 AM',
      category: preset.category || 'sightseeing'
    } : { 
      name: '', 
      cost: '', 
      time: '', 
      category: 'sightseeing' 
    };
    newDays[dayIndex].activities.push(newActivity);
    setDays(newDays);
  };

  const updateActivity = (dayIndex, actIndex, field, value) => {
    const newDays = [...days];
    newDays[dayIndex].activities[actIndex][field] = value;
    setDays(newDays);
  };

  const removeActivity = (dayIndex, actIndex) => {
    const newDays = [...days];
    if (newDays[dayIndex].activities.length <= 1) {
      setError(`Day ${dayIndex + 1} must have at least one activity.`);
      return;
    }
    newDays[dayIndex].activities = newDays[dayIndex].activities.filter((_, i) => i !== actIndex);
    setDays(newDays);
  };

  // Subtotal for a given day
  const getDayCost = (day) => {
    return day.activities.reduce((sum, act) => sum + (parseFloat(act.cost) || 0), 0);
  };

  // Grand total of the whole itinerary
  const totalBudget = useMemo(() => {
    return days.reduce((acc, day) => {
      const dayCost = day.activities.reduce((dAcc, act) => dAcc + (parseFloat(act.cost) || 0), 0);
      return acc + dayCost;
    }, 0);
  }, [days]);

  // Total activities across all days
  const totalActivitiesCount = useMemo(() => {
    return days.reduce((acc, day) => acc + day.activities.length, 0);
  }, [days]);

  const scrollToDay = (dayNum) => {
    setActiveDayTab(dayNum);
    dayRefs.current[dayNum]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const newErrors = {};

    if (!formData.source.trim()) newErrors.source = "Origin / Source city is required.";
    if (!formData.destination.trim()) newErrors.destination = "Destination city is required.";
    if (!formData.start_date) newErrors.start_date = "Start date is required.";
    if (!formData.end_date) newErrors.end_date = "End date is required.";

    if (formData.start_date && formData.end_date) {
      const s = new Date(formData.start_date);
      const en = new Date(formData.end_date);
      if (en < s) newErrors.end_date = "Return date cannot be earlier than departure.";
    }

    // Validate days
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      if (!day.title.trim()) newErrors[`day_${i}_title`] = `Title for Day ${day.day} is required.`;
      if (!day.accommodation.trim()) newErrors[`day_${i}_accommodation`] = `Accommodation for Day ${day.day} is required.`;
      if (!day.transport.trim()) newErrors[`day_${i}_transport`] = `Transport for Day ${day.day} is required.`;

      const validActs = day.activities.filter(a => a.name.trim() !== '');
      if (validActs.length === 0) {
        newErrors[`day_${i}_activities`] = `Add at least one named activity for Day ${day.day}.`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      setError("Please check highlighted missing fields before saving.");
      // Scroll to first error
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    showLoading();
    setError(null);
    setValidationErrors({});

    try {
      // 1. Create trip record
      const tripPayload = {
        source: formData.source.trim(),
        destination: formData.destination.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
        budget: totalBudget,
        preference: {
          interests: [],
          travel_style: "Manual"
        }
      };
      
      const tripRes = await api.post('trips', tripPayload);
      const tripId = tripRes.data._id || tripRes.data.id;

      // 2. Create itinerary entries in parallel for fastest execution
      await Promise.all(
        days.map(dayData => {
          return api.post('itinerary/create', {
            trip: tripId,
            day: dayData.day,
            title: dayData.title || `Day ${dayData.day}`,
            activities: dayData.activities.map(a => a.name).filter(n => n.trim() !== ''),
            plan_description: `Stay: ${dayData.accommodation}. Transport: ${dayData.transport}. Notes: ${dayData.notes || 'None'}`,
            estimated_cost: dayData.activities.reduce((sum, a) => sum + (parseFloat(a.cost) || 0), 0)
          });
        })
      );

      // Clear local draft upon successful save
      sessionStorage.removeItem('manual_plan_draft');
      setSuccess(true);
      setTimeout(() => navigate(`/trip/${tripId}`), 1600);
    } catch (err) {
      console.error(err);
      setError("Failed to save your custom itinerary. Please ensure all inputs are valid.");
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-teal-50/20 to-indigo-50/20 pb-32">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-r from-teal-900 via-gray-900 to-indigo-950 text-white pt-12 pb-16 px-4 md:px-8 shadow-xl">
        {/* Subtle decorative aurora orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-400/10 border border-teal-400/20 text-teal-300 text-xs font-bold uppercase tracking-widest mb-4">
                <Sparkles size={14} className="text-teal-400" />
                <span>Custom Travel Architect</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight font-display text-white">
                Plan Your Journey, Your Way
              </h1>
              <p className="mt-2 text-sm md:text-base text-gray-300 max-w-2xl font-normal leading-relaxed">
                Design custom day-by-day itineraries with full freedom. Pin your favorite stays, calculate transit costs, and track your total budget in real-time.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-xs md:text-sm">
              <div className="px-3 py-1 border-r border-white/15">
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Total Days</span>
                <span className="text-lg font-black text-white">{days.length} Days</span>
              </div>
              <div className="px-3 py-1 border-r border-white/15">
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Planned Stops</span>
                <span className="text-lg font-black text-white">{totalActivitiesCount} Activities</span>
              </div>
              <div className="px-3 py-1">
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Estimated Total</span>
                <span className="text-lg font-black text-teal-300">₹{totalBudget.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        {/* Success Banner */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-5 bg-emerald-500 text-white rounded-2xl shadow-xl flex items-center justify-between gap-4 font-bold"
            >
              <div className="flex items-center gap-3">
                <CheckCircle size={24} className="text-white shrink-0" />
                <span>Roadmap saved successfully! Preparing your custom trip dashboard...</span>
              </div>
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 font-semibold flex items-center justify-between gap-3 text-sm"
            >
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
              <button 
                onClick={() => setError(null)} 
                className="text-red-400 hover:text-red-700 font-bold text-xs uppercase tracking-wider"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form 
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON') {
              e.preventDefault();
            }
          }}
          className="space-y-8"
        >
          {/* STEP 1: Basic Trip Parameters */}
          <section className="bg-white/90 backdrop-blur-xl border border-gray-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-gray-100 gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-teal-600 mb-1">
                  <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center text-xs">1</span>
                  <span>Trip Fundamentals</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 font-display">
                  Where and when are you traveling?
                </h2>
              </div>

              {tripDuration && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold self-start sm:self-auto">
                  <Calendar size={14} className="text-teal-600" />
                  <span>{tripDuration} Days • {tripDuration - 1 > 0 ? `${tripDuration - 1} Nights` : 'Day Trip'}</span>
                  {tripDuration !== days.length && (
                    <button
                      type="button"
                      onClick={handleSyncDaysWithDates}
                      className="ml-2 text-teal-700 hover:text-teal-900 underline text-xs font-semibold cursor-pointer"
                      title="Adjust roadmap days to match selected dates"
                    >
                      (Sync {tripDuration} Days)
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Source Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center justify-between">
                  <span>Starting From (Source)</span>
                  {validationErrors.source && <span className="text-red-500 text-[11px] font-normal">{validationErrors.source}</span>}
                </label>
                <div className="relative group">
                  <Navigation size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                  <input 
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="e.g. Mumbai, New Delhi"
                    className={`w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 border ${validationErrors.source ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200'} focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 font-semibold text-gray-800 text-sm transition-all outline-none`}
                    required
                  />
                </div>
                {/* Source Quick Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Popular:</span>
                  {POPULAR_SOURCES.slice(0, 5).map(city => (
                    <button
                      type="button"
                      key={city}
                      onClick={() => setFormData({ ...formData, source: city })}
                      className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-teal-50 hover:text-teal-700 text-gray-600 font-medium transition-colors cursor-pointer"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center justify-between">
                  <span>Destination</span>
                  {validationErrors.destination && <span className="text-red-500 text-[11px] font-normal">{validationErrors.destination}</span>}
                </label>
                <div className="relative group">
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    placeholder="e.g. Goa, Manali, Jaipur"
                    className={`w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 border ${validationErrors.destination ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200'} focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 font-semibold text-gray-800 text-sm transition-all outline-none`}
                    required
                  />
                </div>
                {/* Destination Quick Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Popular:</span>
                  {POPULAR_DESTINATIONS.slice(0, 5).map(city => (
                    <button
                      type="button"
                      key={city}
                      onClick={() => setFormData({ ...formData, destination: city })}
                      className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 text-gray-600 font-medium transition-colors cursor-pointer"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center justify-between">
                  <span>Departure Date</span>
                  {validationErrors.start_date && <span className="text-red-500 text-[11px] font-normal">{validationErrors.start_date}</span>}
                </label>
                <div className="relative group">
                  <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors pointer-events-none" />
                  <input 
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 border ${validationErrors.start_date ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200'} focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 font-semibold text-gray-800 text-sm transition-all outline-none`}
                    required
                  />
                </div>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center justify-between">
                  <span>Return Date</span>
                  {validationErrors.end_date && <span className="text-red-500 text-[11px] font-normal">{validationErrors.end_date}</span>}
                </label>
                <div className="relative group">
                  <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" />
                  <input 
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    min={formData.start_date || new Date().toISOString().split('T')[0]}
                    className={`w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 border ${validationErrors.end_date ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200'} focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 font-semibold text-gray-800 text-sm transition-all outline-none`}
                    required
                  />
                </div>
              </div>
            </div>
          </section>

          {/* STEP 2: Day Navigator & Roadmap Header */}
          <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-xl border border-gray-200/90 rounded-2xl p-3 shadow-md flex items-center justify-between gap-3 overflow-x-auto">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-black uppercase text-gray-500 tracking-wider pl-2 hidden sm:inline">Jump to Day:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {days.map((day) => {
                  const dayCost = getDayCost(day);
                  const isActive = activeDayTab === day.day;
                  return (
                    <button
                      key={day.day}
                      type="button"
                      onClick={() => scrollToDay(day.day)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                        isActive 
                          ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-600/30' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <span>Day {day.day}</span>
                      {dayCost > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isActive ? 'bg-teal-700/60 text-white' : 'bg-gray-200 text-gray-600'}`}>
                          ₹{dayCost}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={addDay}
              className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Day {days.length + 1}</span>
            </button>
          </div>

          {/* Daily Roadmap List */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">2</span>
                <h3 className="text-xl font-black text-gray-900 font-display">
                  Daily Itinerary & Activities
                </h3>
              </div>
              <span className="text-xs font-semibold text-gray-500">
                {days.length} {days.length === 1 ? 'Day' : 'Days'} Configured
              </span>
            </div>

            <AnimatePresence>
              {days.map((day, dIdx) => {
                const dateLabel = getDayDateLabel(dIdx);
                const dayCost = getDayCost(day);

                return (
                  <motion.div
                    key={day.day}
                    ref={(el) => (dayRefs.current[day.day] = el)}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-3xl border border-gray-200/90 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Day Top Bar */}
                    <div className="bg-gradient-to-r from-gray-50 via-teal-50/30 to-indigo-50/20 px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-indigo-600 text-white flex flex-col items-center justify-center shadow-md">
                          <span className="text-[9px] font-black uppercase tracking-wider opacity-80 leading-none">Day</span>
                          <span className="text-xl font-black leading-none">{day.day}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                              {dateLabel ? dateLabel : `Day ${day.day}`}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs font-bold text-gray-600">
                              {day.activities.length} {day.activities.length === 1 ? 'Stop' : 'Stops'}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-gray-500">
                            Day Subtotal: <strong className="text-gray-900 font-black">₹{dayCost.toLocaleString()}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Day Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => duplicateDay(dIdx)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-teal-700 hover:bg-white border border-gray-200/80 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="Clone this day's structure"
                        >
                          <Copy size={13} />
                          <span className="hidden sm:inline">Duplicate</span>
                        </button>
                        {days.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDay(dIdx)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                            title="Remove this day"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-6 md:p-8 space-y-6">
                      {/* Day Title / Highlight */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center justify-between">
                          <span>Day Focus / Highlight Title</span>
                          {validationErrors[`day_${dIdx}_title`] && (
                            <span className="text-red-500 text-[11px] font-normal">{validationErrors[`day_${dIdx}_title`]}</span>
                          )}
                        </label>
                        <input 
                          type="text"
                          value={day.title}
                          onChange={(e) => updateDay(dIdx, 'title', e.target.value)}
                          placeholder="e.g. North Goa Beach Hopping & Sunset Cafe"
                          className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 font-bold text-gray-900 text-base md:text-lg transition-all outline-none"
                          required
                        />
                      </div>

                      {/* Logistics: Accommodation & Transport */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/70 p-4 md:p-5 rounded-2xl border border-gray-100">
                        {/* Accommodation */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                            <Hotel size={14} className="text-teal-600" />
                            <span>Stay / Accommodation</span>
                          </label>
                          <input 
                            type="text"
                            value={day.accommodation}
                            onChange={(e) => updateDay(dIdx, 'accommodation', e.target.value)}
                            placeholder="e.g. Zostel Goa / Grand Hyatt"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-xs font-bold text-gray-800 transition-all outline-none"
                            required
                          />
                          <div className="flex flex-wrap gap-1 pt-1">
                            {ACCOMMODATION_SUGGESTIONS.slice(0, 3).map(acc => (
                              <button
                                type="button"
                                key={acc}
                                onClick={() => updateDay(dIdx, 'accommodation', acc)}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-white hover:bg-teal-50 hover:text-teal-700 text-gray-500 border border-gray-100 transition-colors cursor-pointer"
                              >
                                {acc}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Transport */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                            <Bus size={14} className="text-indigo-600" />
                            <span>Transit / Daily Travel</span>
                          </label>
                          <input 
                            type="text"
                            value={day.transport}
                            onChange={(e) => updateDay(dIdx, 'transport', e.target.value)}
                            placeholder="e.g. Rented Scooter / Metro"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-xs font-bold text-gray-800 transition-all outline-none"
                            required
                          />
                          <div className="flex flex-wrap gap-1 pt-1">
                            {TRANSPORT_SUGGESTIONS.slice(0, 3).map(trans => (
                              <button
                                type="button"
                                key={trans}
                                onClick={() => updateDay(dIdx, 'transport', trans)}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-white hover:bg-indigo-50 hover:text-indigo-700 text-gray-500 border border-gray-100 transition-colors cursor-pointer"
                              >
                                {trans}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Activities Schedule */}
                      <div className="space-y-4 pt-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                          <label className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
                            <Layers size={14} className="text-teal-600" />
                            <span>Planned Activities & Budget per Stop</span>
                          </label>
                          {/* Inspiration quick-add chips */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Quick Add:</span>
                            {ACTIVITY_SUGGESTIONS.slice(0, 3).map((sugg, sIdx) => (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={() => addActivity(dIdx, sugg)}
                                className="text-[11px] px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold border border-teal-100 transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Plus size={10} /> {sugg.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Activity Rows */}
                        <div className="space-y-3">
                          {day.activities.map((act, aIdx) => {
                            const CategoryIcon = CATEGORY_ICONS[act.category] || Compass;

                            return (
                              <div 
                                key={aIdx} 
                                className="p-3.5 bg-gray-50/80 hover:bg-gray-50 rounded-2xl border border-gray-200/60 transition-all flex flex-col md:flex-row md:items-center gap-3"
                              >
                                {/* Activity Name */}
                                <div className="relative flex-1">
                                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                    <CategoryIcon size={16} />
                                  </div>
                                  <input 
                                    type="text"
                                    value={act.name}
                                    onChange={(e) => updateActivity(dIdx, aIdx, 'name', e.target.value)}
                                    placeholder="Activity or Place (e.g., Anjuna Flea Market)"
                                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 font-bold text-gray-800 text-xs md:text-sm outline-none transition-all"
                                    required
                                  />
                                </div>

                                {/* Expected Time */}
                                <div className="relative w-full md:w-36">
                                  <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                  <input 
                                    type="text"
                                    value={act.time}
                                    onChange={(e) => updateActivity(dIdx, aIdx, 'time', e.target.value)}
                                    placeholder="e.g. 10:30 AM"
                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 font-bold text-gray-800 text-xs outline-none transition-all"
                                    required
                                  />
                                </div>

                                {/* Estimated Cost */}
                                <div className="relative w-full md:w-36">
                                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xs">₹</span>
                                  <input 
                                    type="number"
                                    min="0"
                                    value={act.cost}
                                    onChange={(e) => updateActivity(dIdx, aIdx, 'cost', e.target.value)}
                                    placeholder="Cost"
                                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 font-bold text-gray-800 text-xs outline-none transition-all"
                                    required
                                  />
                                </div>

                                {/* Delete Activity */}
                                <button
                                  type="button"
                                  onClick={() => removeActivity(dIdx, aIdx)}
                                  className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors self-end md:self-auto cursor-pointer"
                                  title="Remove activity"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            );
                          })}

                          <button
                            type="button"
                            onClick={() => addActivity(dIdx)}
                            className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-4 py-2.5 rounded-xl transition-colors cursor-pointer border border-teal-200/60"
                          >
                            <Plus size={14} />
                            <span>Add Custom Activity</span>
                          </button>
                        </div>
                      </div>

                      {/* Day Notes & Reminders */}
                      <div className="space-y-2 pt-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                          <FileText size={14} className="text-gray-400" />
                          <span>Day Notes & Reminders (Optional)</span>
                        </label>
                        <textarea 
                          value={day.notes}
                          onChange={(e) => updateDay(dIdx, 'notes', e.target.value)}
                          placeholder="e.g. Entry ticket required before 4 PM; remember sunscreen and powerbank..."
                          rows={2}
                          className="w-full p-3.5 rounded-2xl bg-gray-50 border border-gray-200 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 text-xs md:text-sm font-medium text-gray-700 outline-none transition-all resize-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Bottom Add Day Card */}
            <button
              type="button"
              onClick={addDay}
              className="w-full py-8 border-2 border-dashed border-teal-200 hover:border-teal-400 bg-teal-50/20 hover:bg-teal-50/50 rounded-3xl text-teal-700 font-bold text-sm uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group shadow-2xs"
            >
              <div className="w-10 h-10 rounded-2xl bg-teal-100 group-hover:bg-teal-200 text-teal-700 flex items-center justify-center transition-colors shadow-2xs">
                <Plus size={20} />
              </div>
              <span>Add Another Day (Day {days.length + 1})</span>
            </button>
          </section>

          {/* Sticky / Floating HUD Bar at Bottom */}
          <div className="sticky bottom-6 z-40 bg-gray-900/95 backdrop-blur-2xl text-white p-5 md:p-6 rounded-3xl shadow-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 w-full md:w-auto">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                <Wallet size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">Total Estimated Budget</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-gray-300 font-semibold">
                    {days.length} Days • {totalActivitiesCount} Stops
                  </span>
                </div>
                <div className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-baseline gap-2">
                  <span>₹{totalBudget.toLocaleString()}</span>
                  {days.length > 0 && totalBudget > 0 && (
                    <span className="text-xs font-normal text-emerald-400">
                      (~₹{Math.round(totalBudget / days.length).toLocaleString()}/day)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white rounded-2xl font-black text-base uppercase tracking-wider shadow-lg shadow-teal-500/25 active:scale-98 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving Itinerary...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Save My Roadmap</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ManualPlan;
