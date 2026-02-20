import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import MapComponent from '../components/MapComponent';
import { MapPin, Calendar, Wallet, ArrowLeft, Sparkles, Clock, AlertCircle, CheckCircle, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RouteAnimation from '../components/RouteAnimation';
import UserMenu from '../components/UserMenu';
import JourneyMap from '../components/JourneyMap';

function TripDetails() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    fetchTripDetails();
    fetchItinerary();
  }, [id]);

  useEffect(() => {
    if (error || successMsg) {
       const timer = setTimeout(() => {
         setError(null);
         setSuccessMsg(null);
       }, 5000);
       return () => clearTimeout(timer);
    }
  }, [error, successMsg]);

  const fetchTripDetails = async () => {
    try {
      const res = await api.get(`trips/${id}`);
      setTrip(res.data);
    } catch (err) {
      console.error(err);
      setError("Could not load trip details.");
    }
  };

  const fetchItinerary = async () => {
    try {
      setLoading(true);
      const res = await api.get(`itinerary/?trip_id=${id}`);
      setItinerary(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateItinerary = async () => {
    if (!trip) return;
    
    setGenerating(true);
    setError(null);
    setSuccessMsg(null);
    
    const payload = {
        trip_id: id,
        destination: trip.destination,
        start_date: trip.start_date,
        end_date: trip.end_date,
        budget: trip.budget,
        interests: trip.preference ? trip.preference.interests : [] 
    };

    console.log("Sending AI Generation Request:", payload);

    try {
      const res = await api.post('itinerary/generate', payload);
      console.log("AI Response:", res.data);
      
      if (res.data.itinerary) {
          setItinerary(res.data.itinerary);
          setSuccessMsg("Itinerary successfully generated!");
      } else {
          setItinerary(res.data); 
      }
    } catch (err) {
      console.error("AI Generation Error:", err);
      const errMsg = err.response?.data?.error || "Failed to generate itinerary. Please try again.";
      setError(errMsg);
    } finally {
      setGenerating(false);
    }
  };

  if (!trip) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500"
        ></motion.div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-transparent pb-20"
    >
      {/* Toast Notifications */}
      <AnimatePresence>
        {(error || successMsg) && (
            <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`fixed top-6 right-6 z-[2500] px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 backdrop-blur-xl border ${error ? 'bg-red-50/90 text-red-600 border-red-200' : 'bg-green-50/90 text-green-600 border-green-200'}`}
            >
                {error ? <AlertCircle size={24} /> : <CheckCircle size={24} />}
                <div>
                    <h4 className="font-bold">{error ? 'Oops!' : 'Success!'}</h4>
                    <p className="text-sm font-medium">{error || successMsg}</p>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header Section */}
      <div className="bg-white/50 border-b border-gray-100 pt-6 pb-20 backdrop-blur-sm">
        <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex items-center mb-8">
                <Link to="/dashboard" className="inline-flex items-center text-gray-400 font-bold hover:text-primary-600 transition-all group px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm">
                    <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
                <div className="flex-1 w-full">
                    <motion.h1 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-6xl font-black text-gray-900 mb-4 font-display tracking-tight uppercase"
                    >
                        {trip.destination}
                    </motion.h1>
                    
                    <div className="flex flex-wrap gap-4 mb-10">
                        <div className="flex flex-col sm:flex-row items-center bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 text-gray-700 font-bold gap-4 min-w-[300px] relative overflow-visible">
                            <div className="flex items-center">
                                <Navigation size={20} className="mr-3 text-primary-500" />
                                <span className="text-sm uppercase tracking-wider text-gray-400 mr-2">From:</span> {trip.source}
                            </div>
                            
                            {/* Route Animation as a connector */}
                            <RouteAnimation className="w-24 h-10 hidden sm:block opacity-60" />
                            
                            <div className="flex items-center">
                                <MapPin size={20} className="mr-3 text-secondary-500" />
                                <span className="text-sm uppercase tracking-wider text-gray-400 mr-2">To:</span> {trip.destination}
                            </div>
                        </div>
                        <div className="flex items-center bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 text-gray-700 font-bold">
                            <Calendar size={20} className="mr-3 text-indigo-500" />
                            {new Date(trip.start_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(trip.end_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex items-center bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 text-gray-700 font-bold">
                            <Wallet size={20} className="mr-3 text-emerald-500" />
                            ₹{trip.budget} Budget
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                         <div className="p-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-3xl text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-125 transition-transform duration-700">
                                <img src="/logo.png" alt="BAGS UP Logo" className="w-32 h-32 object-contain filter brightness-0 invert" />
                            </div>
                            <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                                <Sparkles /> {itinerary.length > 0 ? "Itinerary Ready!" : "Plan Your Journey"}
                            </h3>
                            <p className="text-white/80 font-medium mb-6 leading-relaxed">
                                {itinerary.length > 0 
                                    ? "Your AI-crafted guide is ready to show you the best of India on a budget."
                                    : "Let our AI analyze your preferences and budget to create the perfect Indian getaway."}
                            </p>
                            
                            <button 
                                onClick={generateItinerary} 
                                disabled={generating}
                                className={`
                                    w-full py-4 rounded-2xl font-black text-lg transition-all shadow-xl
                                    flex items-center justify-center gap-3
                                    ${generating 
                                        ? 'bg-white/20 text-white cursor-not-allowed' 
                                        : 'bg-white text-primary-600 hover:scale-[1.02] active:scale-95 hover:shadow-2xl'}
                                `}
                            >
                                {generating ? (
                                    <>
                                        <motion.span 
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                            className="block h-6 w-6 border-4 border-white/30 border-t-white rounded-full"
                                        ></motion.span>
                                        Generating Magic...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles />
                                        {itinerary.length > 0 ? "Regenerate Plan" : "Generate AI Itinerary"}
                                    </>
                                )}
                            </button>
                         </div>

                         {/* Map Card - Simplified to remove double border and label */}
                         <MapComponent destination={trip.destination} itinerary={itinerary} className="h-[320px]" />
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Itinerary Section - Interactive Journey Map */}
      <div className="container mx-auto px-4 mt-12 pb-20 relative z-10 max-w-7xl">
        <AnimatePresence mode="wait">
          {itinerary.length > 0 ? (
            <motion.div 
               key="itinerary-map"
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 1.05, opacity: 0 }}
               transition={{ duration: 0.6 }}
            >
              <JourneyMap itinerary={itinerary} />
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-24 bg-white/80 backdrop-blur-xl rounded-[50px] shadow-2xl border-2 border-dashed border-gray-200"
            >
                <div className="bg-primary-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-slow">
                    <Sparkles className="text-primary-500 w-12 h-12" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-4 font-display uppercase tracking-widest">No Roadmap Drawn</h3>
                <p className="text-gray-500 text-xl max-w-md mx-auto mb-10 font-medium">Your adventure awaits. Hit the generate button above to trace your path!</p>
                <div className="flex justify-center gap-4">
                    <div className="bg-gray-100 h-2 w-12 rounded-full"></div>
                    <div className="bg-primary-500 h-2 w-24 rounded-full"></div>
                    <div className="bg-gray-100 h-2 w-12 rounded-full"></div>
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default TripDetails;
