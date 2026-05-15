import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Save, Key, Clock, Settings, LogOut, ChevronRight, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from '../context/LoadingContext';
import api from '../api';

const ProfilePage = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [trips, setTrips] = useState([]);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    age: '',
    gender: '',
    dob: '',
  });
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    fetchProfile();
    fetchTrips();
  }, []);

  const fetchProfile = async () => {
    showLoading();
    try {
        const res = await api.get('users/profile');
        setProfile({
            full_name: res.data.full_name ?? '',
            email: res.data.email ?? '',
            age: res.data.age ?? '',
            gender: res.data.gender ?? '',
            dob: res.data.dob ?? '',
        });
    } catch (err) {
        console.error("Fetch Profile Error:", err);
        // Fallback to local storage if API fails
        const userData = JSON.parse(sessionStorage.getItem('user_data') || '{}');
        setProfile({
            full_name: userData.full_name ?? userData.username ?? '',
            email: userData.email ?? '',
            age: userData.age ?? '',
            gender: userData.gender ?? '',
            dob: userData.dob ?? '',
        });
    } finally {
        hideLoading();
    }
  };

  const fetchTrips = async () => {
    try {
      const res = await api.get('trips');
      setTrips(res.data.slice(0, 3)); // Only show last 3 for history
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    showLoading();
    setSuccess(false);
    
    try {
        const res = await api.post('users/profile', profile);
        // Update local storage too to keep it sync
        sessionStorage.setItem('user_data', JSON.stringify(res.data));
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
        console.error("Save Profile Error:", err);
    } finally {
        setLoading(false);
        hideLoading();
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      <div className="max-w-6xl mx-auto py-10 px-6 space-y-10">
        <header className="mb-4">
            <div>
               <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white shadow-lg">
                        <Settings size={24} />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Profile Settings</h1>
               </motion.div>
               <p className="text-gray-400 font-medium ml-16">Manage your account and profile details.</p>
            </div>
        </header>

        <div className="max-w-4xl mx-auto space-y-10">
            <section className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-wider mb-10 flex items-center gap-3 px-2">
                    <div className="w-2 h-6 bg-primary-500 rounded-full"></div>
                    Account Information
                </h3>
                
                <form onSubmit={handleSave} className="space-y-8">
                    <div className="flex flex-col md:flex-row gap-10 items-start">
                        <div className="w-32 h-32 rounded-[32px] bg-gray-100 flex items-center justify-center text-gray-300 relative group overflow-hidden shrink-0 border-2 border-dashed border-gray-200">
                            <User size={48} />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer backdrop-blur-sm">
                                <Camera size={24} />
                            </div>
                        </div>
                        <div className="flex-1 w-full space-y-6">
                            <div className="group space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                <input 
                                    type="text" 
                                    value={profile.full_name} 
                                    onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                                    className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 font-bold" 
                                />
                            </div>
                            <div className="group space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                <input 
                                    type="email" 
                                    value={profile.email} 
                                    disabled
                                    className="w-full p-4 rounded-2xl bg-gray-50 border-none opacity-50 font-bold cursor-not-allowed" 
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-50 mt-6">
                                <div className="group space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Age</label>
                                    <input 
                                        type="number" 
                                        value={profile.age} 
                                        onChange={(e) => setProfile({...profile, age: e.target.value})}
                                        className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 font-bold transition-all" 
                                        placeholder="21"
                                    />
                                </div>
                                <div className="group space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gender</label>
                                    <div className="relative">
                                        <select 
                                            value={profile.gender} 
                                            onChange={(e) => setProfile({...profile, gender: e.target.value})}
                                            className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 font-bold appearance-none transition-all pr-10"
                                        >
                                            <option value="">Select</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="group space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date of Birth</label>
                                    <input 
                                        type="date" 
                                        value={profile.dob} 
                                        onChange={(e) => setProfile({...profile, dob: e.target.value})}
                                        className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 font-bold transition-all" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-end gap-4">
                        <AnimatePresence>
                            {success && (
                                <motion.span 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="text-green-500 font-black text-xs uppercase tracking-widest"
                                >
                                    Changes Saved!
                                </motion.span>
                            )}
                        </AnimatePresence>
                        <button type="submit" disabled={loading} className={`px-8 py-4 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-500/20 active:scale-95 transition-all flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <Save size={18}/> {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
