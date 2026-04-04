import React, { useState, useMemo, useEffect } from 'react';
import api from '../api';
import { 
  Bookmark, 
  BookmarkCheck,
  Map as MapIcon, 
  List, 
  Search, 
  Trash2, 
  MapPin, 
  Star,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Wallet,
  CheckCircle2,
  X,
  ArrowRight,
  LayoutGrid,
  Zap,
  Coffee,
  Instagram,
  Bus,
  Utensils,
  Camera,
  Hotel,
  ShieldCheck,
  ChevronDown,
  Info,
  RefreshCw,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function BudgetPlanner() {
  const [view, setView] = useState('list');
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [sortBy, setSortBy] = useState('Recommended');
  const [aiPlaces, setAiPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [tripBudget] = useState(15000); // Mock trip budget for students
  const [savedPlaceIds, setSavedPlaceIds] = useState(() => {
    try {
      const stored = localStorage.getItem('budget_saved_places');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const toggleSave = (id) => {
    setSavedPlaceIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('budget_saved_places', JSON.stringify(next));
      return next;
    });
  };

  const savedPlaces = useMemo(() => [
    // --- HOTELS ---
    { id: 1, name: 'The Taj Mahal Palace', type: 'Hotels', rating: 4.8, location: 'Mumbai, MH', image: "https://upload.wikimedia.org/wikipedia/commons/0/09/Mumbai_Aug_2018_%2843397784544%29.jpg", cost: 12000, members: 2, rooms: 1, studentScore: 6, tags: ['Iconic', 'Luxury', 'Safe'], budgetImpact: '🔴 Expensive', breakdown: { stay: 80, food: 15, transport: 5 } },
    { id: 5, name: 'Rambagh Palace', type: 'Hotels', rating: 4.9, location: 'Jaipur, RJ', image: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Rambagh_Palace%2C_Jaipur.jpg", cost: 15000, members: 2, rooms: 1, studentScore: 4, tags: ['Royal', 'Heritage'], budgetImpact: '🔴 Expensive', breakdown: { stay: 85, food: 10, transport: 5 } },
    { id: 17, name: 'Wildflower Hall', type: 'Hotels', rating: 4.8, location: 'Shimla, HP', image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?fit=crop&w=800&q=80", cost: 8500, members: 2, rooms: 1, studentScore: 5, tags: ['Mountains', 'Views'], budgetImpact: '🔴 Expensive', breakdown: { stay: 75, food: 15, transport: 10 } },
    { id: 32, name: 'Khyber Resort', type: 'Hotels', rating: 4.7, location: 'Gulmarg, JK', image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?fit=crop&w=800&q=80", cost: 7000, members: 2, rooms: 1, studentScore: 6, tags: ['Snow', 'Skiing'], budgetImpact: '🔴 Expensive', breakdown: { stay: 70, food: 20, transport: 10 } },
    { id: 59, name: 'The Tamara Coorg', type: 'Hotels', rating: 4.8, location: 'Coorg, KA', image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?fit=crop&w=800&q=80", cost: 4500, members: 2, rooms: 1, studentScore: 8, tags: ['Nature', 'Coffee'], budgetImpact: '🟡 Moderate', breakdown: { stay: 65, food: 25, transport: 10 } },
    { id: 62, name: 'Hostel Hayat', type: 'Hotels', rating: 4.4, location: 'Bengaluru, KA', image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?fit=crop&w=800&q=80", cost: 800, members: 1, rooms: 0.5, studentScore: 10, tags: ['Student Favorite', 'Budget'], budgetImpact: '🟢 Friendly', breakdown: { stay: 50, food: 30, transport: 20 } },

    // --- RESTAURANTS ---
    { id: 2, name: 'Bademiya Kebab', type: 'Restaurants', rating: 4.5, location: 'Colaba, Mumbai', image: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Bademiya%27s_kebab_stall.jpg", cost: 450, studentScore: 9, tags: ['Cheap Food', 'Street Art'], budgetImpact: '🟢 Friendly', breakdown: { stay: 0, food: 90, transport: 10 } },
    { id: 4, name: 'Leopold Cafe', type: 'Restaurants', rating: 4.2, location: 'Colaba, Mumbai', image: "https://upload.wikimedia.org/wikipedia/commons/8/8b/LeopoldCafe_gobeirne.jpg", cost: 600, studentScore: 8, tags: ['Historic', 'Students'], budgetImpact: '🟡 Moderate', breakdown: { stay: 0, food: 85, transport: 15 } },
    { id: 40, name: 'Vidyarthi Bhavan', type: 'Restaurants', rating: 4.8, location: 'Bengaluru, KA', image: "https://upload.wikimedia.org/wikipedia/commons/9/9d/VidyarthiBhavanEntrance.jpg", cost: 120, studentScore: 10, tags: ['Near Colleges', 'Legendary'], budgetImpact: '🟢 Friendly', breakdown: { stay: 0, food: 95, transport: 5 } },
    { id: 63, name: 'Blue Poppy', type: 'Restaurants', rating: 4.5, location: 'Kolkata, WB', image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?fit=crop&w=800&q=80", cost: 350, studentScore: 9, tags: ['Best Momos', 'Cheap Eats'], budgetImpact: '🟢 Friendly', breakdown: { stay: 0, food: 90, transport: 10 } },

    // --- ATTRACTIONS ---
    { id: 3, name: 'Gateway of India', type: 'Attractions', rating: 4.7, location: 'Mumbai, MH', image: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Gateway_of_India_Mumbai.jpg", cost: 0, studentScore: 10, tags: ['Free Entry', 'Instagram'], budgetImpact: '🟢 Friendly', breakdown: { stay: 0, food: 30, transport: 70 } },
    { id: 7, name: 'Taj Mahal', type: 'Attractions', rating: 5.0, location: 'Agra, UP', image: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Taj_Mahal_in_March_2004.jpg", cost: 1100, studentScore: 7, tags: ['Must Visit', 'Heritage'], budgetImpact: '🔴 Expensive', breakdown: { stay: 0, food: 40, transport: 60 } },
    { id: 16, name: 'Golden Temple', type: 'Attractions', rating: 4.9, location: 'Amritsar, PB', image: "https://upload.wikimedia.org/wikipedia/commons/9/94/The_Golden_Temple_of_Amrithsar_7.jpg", cost: 0, studentScore: 10, tags: ['Spiritual', 'Free Food'], budgetImpact: '🟢 Friendly', breakdown: { stay: 0, food: 10, transport: 90 } },
    { id: 21, name: 'Munnar Tea Gardens', type: 'Attractions', rating: 4.7, location: 'Munnar, KL', image: "https://upload.wikimedia.org/wikipedia/commons/0/04/Tea_plantation_in_Munnar.jpg", cost: 200, studentScore: 9, tags: ['Nature', 'Cheap Spots'], budgetImpact: '🟢 Friendly', breakdown: { stay: 0, food: 20, transport: 80 } },
    
    // --- HYDERABAD SPECIALS ---
    { id: 101, name: 'ITC Kohenur', type: 'Hotels', rating: 4.8, location: 'Hyderabad, TS', image: "https://upload.wikimedia.org/wikipedia/commons/e/e0/ITC_Kohenur_Hyderabad_India.jpg", cost: 9500, members: 2, rooms: 1, studentScore: 7, tags: ['Luxury', 'Business'], budgetImpact: '🔴 Expensive', breakdown: { stay: 80, food: 15, transport: 5 } },
    { id: 102, name: 'Paradise Biryani', type: 'Restaurants', rating: 4.6, location: 'Secunderabad, Hyderabad', image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?fit=crop&w=800&q=80", cost: 500, studentScore: 9, tags: ['Legendary', 'Biryani'], budgetImpact: '🟢 Friendly', breakdown: { stay: 0, food: 90, transport: 10 } },
    { id: 103, name: 'Charminar', type: 'Attractions', rating: 4.9, location: 'Hyderabad, TS', image: "https://upload.wikimedia.org/wikipedia/commons/7/71/Charminar_Hyderabad_1.jpg", cost: 50, studentScore: 10, tags: ['Historic', 'Iconic'], budgetImpact: '🟢 Friendly', breakdown: { stay: 0, food: 20, transport: 80 } },
    { id: 104, name: 'Hyderabad Metro Hub', type: 'Attractions', rating: 4.5, location: 'Ameerpet, Hyderabad', image: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Hyderabad_Metro_Train_at_Miyapur_station.jpg", cost: 40, studentScore: 10, tags: ['Transport', 'Connected'], budgetImpact: '🟢 Friendly', breakdown: { stay: 0, food: 10, transport: 90 } },
    
    // --- TRIVANDRUM FALLBACKS ---
    { id: 201, name: 'Hyatt Regency Trivandrum', type: 'Hotels', rating: 4.7, location: 'Trivandrum, KL', image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?fit=crop&w=800&q=80", cost: 7500, members: 2, rooms: 1, studentScore: 6, tags: ['Modern', 'Luxury'], budgetImpact: '🔴 Expensive', breakdown: { stay: 80, food: 15, transport: 5 } },
    { id: 202, name: 'Zam Zam Restaurant', type: 'Restaurants', rating: 4.5, location: 'Palayam, Trivandrum', image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?fit=crop&w=800&q=80", cost: 400, studentScore: 9, tags: ['Famous', 'Non-Veg'], budgetImpact: '🟢 Friendly', breakdown: { stay: 0, food: 90, transport: 10 } },
    { id: 203, name: 'Padmanabhaswamy Temple', type: 'Attractions', rating: 4.9, location: 'Trivandrum, KL', image: "https://upload.wikimedia.org/wikipedia/commons/d/d2/Sree_Padmanabhaswamy_temple_01.jpg", cost: 0, studentScore: 10, tags: ['Iconic', 'Free'], budgetImpact: '🟢 Friendly', breakdown: { stay: 0, food: 20, transport: 80 } },
    { id: 204, name: 'Napier Museum', type: 'Attractions', rating: 4.6, location: 'Trivandrum, KL', image: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Napier_Museum_TVM.jpg", cost: 20, studentScore: 10, tags: ['Heritage', 'Student Entry'], budgetImpact: '🟢 Friendly', breakdown: { stay: 0, food: 10, transport: 90 } },
    { id: 205, name: 'KSRTC City Hub', type: 'Attractions', rating: 4.4, location: 'East Fort, Trivandrum', image: "https://upload.wikimedia.org/wikipedia/commons/3/3d/KSRTC_Bus_Station_Thiruvananthapuram.jpg", cost: 15, studentScore: 10, tags: ['Local Bus', 'Cheap Transport'], budgetImpact: '🟢 Friendly', breakdown: { stay: 0, food: 5, transport: 95 } },

    // --- MANALI FALLBACKS ---
    { id: 301, name: 'The Himalayan', type: 'Hotels', rating: 4.8, location: 'Manali, HP', image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?fit=crop&w=800&q=80", cost: 6500, members: 2, rooms: 1, studentScore: 7, tags: ['Views', 'Castle'], budgetImpact: '🔴 Expensive', breakdown: { stay: 70, food: 20, transport: 10 } },
    { id: 302, name: 'Johnson Cafe', type: 'Restaurants', rating: 4.4, location: 'Old Manali', image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?fit=crop&w=800&q=80", cost: 800, studentScore: 8, tags: ['Music', 'Trout'], budgetImpact: '🟡 Moderate', breakdown: { stay: 0, food: 85, transport: 15 } },
    { id: 303, name: 'Solang Valley', type: 'Attractions', rating: 4.7, location: 'Manali, HP', image: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Solang_Valley_%2CManali%2C_Himachal_Pardes%2C_India.JPG", cost: 500, studentScore: 9, tags: ['Adventure', 'Snow'], budgetImpact: '🟡 Moderate', breakdown: { stay: 0, food: 30, transport: 70 } },

    // --- GOA FALLBACKS ---
    { id: 401, name: 'W Goa', type: 'Hotels', rating: 4.6, location: 'Vagator, Goa', image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?fit=crop&w=800&q=80", cost: 18000, members: 2, rooms: 1, studentScore: 5, tags: ['Beachfront', 'Party'], budgetImpact: '🔴 Expensive', breakdown: { stay: 85, food: 10, transport: 5 } },
    { id: 402, name: 'Curlies Beach Shack', type: 'Restaurants', rating: 4.3, location: 'Anjuna, Goa', image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?fit=crop&w=800&q=80", cost: 1200, studentScore: 8, tags: ['Hippie', 'Sunsets'], budgetImpact: '🟡 Moderate', breakdown: { stay: 0, food: 70, transport: 30 } },
    { id: 403, name: 'Fort Aguada', type: 'Attractions', rating: 4.5, location: 'Candolim, Goa', image: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Fort_aguada.jpg", cost: 0, studentScore: 10, tags: ['History', 'Free'], budgetImpact: '🟢 Friendly', breakdown: { stay: 0, food: 10, transport: 90 } },

    // --- MADANAPALLE FALLBACKS ---
    { id: 501, name: 'SSR Residency', type: 'Hotels', rating: 4.2, location: 'Madanapalle, AP', image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?fit=crop&w=800&q=80", cost: 1200, members: 2, rooms: 1, studentScore: 9, tags: ['Budget', 'Main Road'], budgetImpact: '🟢 Friendly', breakdown: { stay: 85, food: 10, transport: 5 } },
    { id: 505, name: 'Hotel Srinivaas', type: 'Hotels', rating: 4.0, location: 'Madanapalle, AP', image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?fit=crop&w=800&q=80", cost: 1500, members: 2, rooms: 1, studentScore: 8, tags: ['Central', 'Clean'], budgetImpact: '🟢 Friendly', breakdown: { stay: 80, food: 15, transport: 5 } },
    { id: 502, name: 'B.T. College', type: 'Attractions', rating: 4.5, location: 'Madanapalle, AP', image: "https://images.unsplash.com/photo-1562774053-701939374585?fit=crop&w=800&q=80", cost: 0, studentScore: 10, tags: ['Historic', 'Campus'], budgetImpact: '🟢 Friendly', breakdown: { stay: 0, food: 20, transport: 80 } },
    { id: 503, name: 'Horsley Hills', type: 'Attractions', rating: 4.8, location: 'Near Madanapalle', image: "https://upload.wikimedia.org/wikipedia/commons/4/47/Horsley_Hills_View_Point.jpg", cost: 100, studentScore: 10, tags: ['Hill Station', 'Nature'], budgetImpact: '🟢 Friendly', breakdown: { stay: 0, food: 30, transport: 70 } },
    { id: 506, name: 'Rishi Valley School', type: 'Attractions', rating: 4.6, location: 'Madanapalle, AP', image: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Rishi_valley_pano_view.jpg", cost: 0, studentScore: 9, tags: ['Educational', 'Iconic'], budgetImpact: '🟢 Friendly', breakdown: { stay: 0, food: 10, transport: 90 } },
    { id: 504, name: 'Nandini Restaurant', type: 'Restaurants', rating: 4.1, location: 'Madanapalle, AP', image: "https://images.unsplash.com/photo-1567337710282-00832b415979?fit=crop&w=800&q=80", cost: 250, studentScore: 10, tags: ['South Indian', 'Cheap'], budgetImpact: '🟢 Friendly', breakdown: { stay: 0, food: 95, transport: 5 } },
    { id: 507, name: 'New Highway Biryani', type: 'Restaurants', rating: 4.3, location: 'Madanapalle, AP', image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?fit=crop&w=800&q=80", cost: 350, studentScore: 9, tags: ['Biryani', 'Students'], budgetImpact: '🟢 Friendly', breakdown: { stay: 0, food: 90, transport: 10 } },
    { id: 508, name: 'Coffee Day Madanapalle', type: 'Restaurants', rating: 4.0, location: 'Madanapalle, AP', image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?fit=crop&w=800&q=80", cost: 300, studentScore: 8, tags: ['Hangout', 'Cafe'], budgetImpact: '🟡 Moderate', breakdown: { stay: 0, food: 80, transport: 20 } },

    // --- CHENNAI FALLBACKS ---
    { id: 601, name: 'ITC Grand Chola', type: 'Hotels', rating: 4.9, location: 'Guindy, Chennai', image: "https://upload.wikimedia.org/wikipedia/commons/5/5e/ITC_Grand_Chola_Hotel.jpg", cost: 12000, members: 2, rooms: 1, studentScore: 5, tags: ['Palatial', 'Luxury'], budgetImpact: '🔴 Expensive', breakdown: { stay: 85, food: 10, transport: 5 } },
    { id: 602, name: 'Ginger Hotel Chennai', type: 'Hotels', rating: 4.0, location: 'IITM Research Park', image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?fit=crop&w=800&q=80", cost: 3500, members: 2, rooms: 1, studentScore: 9, tags: ['Safe', 'Budget'], budgetImpact: '🟢 Friendly', breakdown: { stay: 75, food: 20, transport: 5 } },
    { id: 603, name: 'Holiday Inn Express', type: 'Hotels', rating: 4.2, location: 'OMR, Chennai', image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?fit=crop&w=800&q=80", cost: 4500, members: 2, rooms: 1, studentScore: 8, tags: ['Modern', 'Student Area'], budgetImpact: '🟡 Moderate', breakdown: { stay: 80, food: 15, transport: 5 } },
    { id: 604, name: 'Treebo Trend Trend', type: 'Hotels', rating: 3.8, location: 'T. Nagar, Chennai', image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?fit=crop&w=800&q=80", cost: 2200, members: 2, rooms: 1, studentScore: 9, tags: ['Central', 'Affordable'], budgetImpact: '🟢 Friendly', breakdown: { stay: 85, food: 10, transport: 5 } },
    { id: 605, name: 'Murugan Idli Shop', type: 'Restaurants', rating: 4.5, location: 'Besant Nagar', image: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Murugan_Idly_kadai.jpg", cost: 300, studentScore: 10, tags: ['Famous', 'Authentic'], budgetImpact: '🟢 Friendly', breakdown: { stay: 0, food: 95, transport: 5 } },
    { id: 606, name: 'Marina Beach Sundal', type: 'Restaurants', rating: 4.4, location: 'Marina Beach', image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?fit=crop&w=800&q=80", cost: 50, studentScore: 10, tags: ['Street Food', 'Iconic'], budgetImpact: '🟢 Friendly', breakdown: { stay: 0, food: 50, transport: 50 } },
    { id: 607, name: 'Amelies Cafe', type: 'Restaurants', rating: 4.2, location: 'Alwarpet, Chennai', image: "https://images.unsplash.com/photo-1559305616-3f99cd43e353?fit=crop&w=800&q=80", cost: 800, studentScore: 8, tags: ['Aesthetic', 'Hangout'], budgetImpact: '🟡 Moderate', breakdown: { stay: 0, food: 90, transport: 10 } },
    { id: 608, name: 'Marina Beach', type: 'Attractions', rating: 4.7, location: 'Chennai, TN', image: "https://upload.wikimedia.org/wikipedia/commons/5/5a/Marina_Beach%2C_Chennai.jpg", cost: 0, studentScore: 10, tags: ['Beach', 'Free'], budgetImpact: '🟢 Friendly', breakdown: { stay: 0, food: 40, transport: 60 } },
    { id: 609, name: 'Guindy National Park', type: 'Attractions', rating: 4.3, location: 'Chennai, TN', image: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Guindy_national_park.jpg", cost: 20, studentScore: 10, tags: ['Nature', 'Wildlife'], budgetImpact: '🟢 Friendly', breakdown: { stay: 0, food: 10, transport: 90 } },
    { id: 610, name: 'VGP Universal Kingdom', type: 'Attractions', rating: 4.1, location: 'ECR, Chennai', image: "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?fit=crop&w=800&q=80", cost: 800, studentScore: 7, tags: ['Amusement', 'Fun'], budgetImpact: '🟡 Moderate', breakdown: { stay: 0, food: 30, transport: 70 } },
  ], []);

  const allPlaces = useMemo(() => {
    // Combine hardcoded with AI results, avoiding duplicates by name
    const combined = [...savedPlaces];
    aiPlaces.forEach(aiP => {
      if (!combined.find(p => p.name.toLowerCase() === aiP.name.toLowerCase())) {
        combined.push(aiP);
      }
    });
    return combined;
  }, [savedPlaces, aiPlaces]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (citySearch && citySearch.length >= 3) {
        handleCitySearch();
      }
    }, 1000); // 1 second debounce
    return () => clearTimeout(timer);
  }, [citySearch]);

  const handleCitySearch = async () => {
    if (!citySearch || citySearch.length < 3) return;
    setLoading(true);
    setErrorMsg('');
    setAiPlaces([]); // Clear old results to show fresh start
    try {
      const response = await api.get(`/destinations/city-details?city=${citySearch}`);
      setAiPlaces(response.data);
    } catch (error) {
      console.error("Discovery failed:", error);
      setErrorMsg(error.response?.data?.message || "Something went wrong with AI Discovery.");
    } finally {
      setLoading(false);
    }
  };

  const moodTabs = [
    { name: 'All', icon: LayoutGrid },
    { name: 'Hotels', icon: Hotel },
    { name: 'Restaurants', icon: Utensils },
    { name: 'Attractions', icon: Camera },
    { name: 'Public Transport', icon: Bus },
  ];

  const filteredPlaces = useMemo(() => {
    let result = allPlaces.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = p.location.toLowerCase().includes(citySearch.toLowerCase());
      
      // If we have search results, we prioritize showing them
      if (citySearch && !matchesCity) return false;
      
      if (activeTab === 'All') return matchesSearch;
      if (activeTab === 'Public Transport') return matchesSearch && p.breakdown.transport > 50;
      
      return matchesSearch && p.type === activeTab;
    });

    // Sorting
    if (sortBy === 'Lowest Price') result.sort((a, b) => a.cost - b.cost);
    if (sortBy === 'Highest Rated') result.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'Student Score') result.sort((a, b) => b.studentScore - a.studentScore);
    
    return result;
  }, [activeTab, searchTerm, citySearch, sortBy, allPlaces]);

  const toggleCompare = (id) => {
    setSelectedForCompare(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : (prev.length < 3 ? [...prev, id] : prev)
    );
  };

  const getImpactColor = (impact) => {
    if (impact.includes('Friendly')) return 'bg-emerald-500';
    if (impact.includes('Moderate')) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100/30 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-100/20 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 z-0" />


      <div className="max-w-7xl mx-auto py-10 px-6 space-y-10 relative z-10">
        

        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-white/40 p-6 rounded-[32px] border border-white shadow-sm">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-primary-600 flex items-center justify-center text-white shadow-xl shadow-primary-200">
                    <Wallet size={32} />
                </div>
                <div>
                   <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Budget Planner</h1>
                   <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">Plan • Compare • Save</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                    <button 
                      onClick={() => setView('list')}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'list' ? 'bg-black text-white' : 'text-gray-400 hover:text-gray-900'}`}
                    >
                      <List size={16} /> List
                    </button>
                    <button 
                      onClick={() => setView('saved')}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'saved' ? 'bg-black text-white' : 'text-gray-400 hover:text-gray-900'}`}
                    >
                      <Bookmark size={16} /> Saved {savedPlaceIds.length > 0 && <span className="bg-primary-500 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center">{savedPlaceIds.length}</span>}
                    </button>
                </div>
            </div>
        </header>

        {/* Filters & Sorting */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-2 border-b border-gray-100">
          <div className="flex flex-wrap gap-2">
            {moodTabs.map(t => (
              <button 
                key={t.name}
                onClick={() => setActiveTab(t.name)}
                className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border-2 ${activeTab === t.name ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-100' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
              >
                <t.icon size={14}/> {t.name}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-6">
             <div className="relative group flex items-center">
                <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={16} />
                    <input 
                        type="text" 
                        placeholder="Enter any city in India..." 
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-xl w-72 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-[10px] uppercase tracking-widest"
                    />
                    {loading && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <RefreshCw size={14} className="animate-spin text-primary-500" />
                      </div>
                    )}
                </div>
             </div>

             <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sort By:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary-500"
                >
                    <option>Recommended</option>
                    <option>Lowest Price</option>
                    <option>Highest Rated</option>
                    <option>Student Score</option>
                </select>
             </div>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-primary-500 mb-6">
              <RefreshCw size={40} className="animate-spin" />
            </div>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">AI is discovering {citySearch}...</h3>
            <p className="text-gray-400 font-bold text-xs uppercase mt-2">Finding best student deals, hotels & more</p>
          </div>
        )}

        {errorMsg && (
          <div className={`flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300 ${filteredPlaces.length > 0 ? 'py-4' : 'py-20'}`}>
             <div className={`${filteredPlaces.length > 0 ? 'bg-amber-50 text-amber-600 border-amber-100 px-4 py-2' : 'bg-gray-50 text-gray-500 px-6 py-4'} rounded-[24px] border flex items-center gap-4 max-w-lg shadow-sm`}>
                <Info size={16} />
                <p className="text-[9px] font-black uppercase tracking-widest">
                    {filteredPlaces.length > 0 
                      ? "Showing local results. AI is catching up..." 
                      : "The Travel Expert AI is currently busy (Rate Limit)."}
                </p>
                <button onClick={handleCitySearch} className="ml-2 hover:rotate-180 transition-transform duration-500">
                  <RefreshCw size={12} />
                </button>
             </div>
             
             {filteredPlaces.length === 0 && (
               <div className="mt-8 space-y-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest max-w-xs leading-loose">
                    We've hit a temporary AI limit. While we wait for it to reset (usually 15-30 seconds), try searching for: 
                    <span className="text-primary-500 block mt-2">Hyderabad • Goa • Manali • Trivandrum</span>
                  </p>
                  <div className="flex items-center justify-center gap-2 text-[9px] font-bold text-primary-400 uppercase tracking-widest animate-pulse">
                     <div className="w-1.5 h-1.5 rounded-full bg-primary-400"></div>
                     Auto-retrying in a few seconds...
                  </div>
               </div>
             )}
          </div>
        )}

        {!loading && filteredPlaces.length === 0 && citySearch && !errorMsg && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">No results for "{citySearch}"</h3>
            <p className="text-gray-400 font-bold text-xs uppercase mt-2 max-w-xs">Try clicking the search icon or enter a different city to let AI find options for you.</p>
            <button 
              onClick={handleCitySearch}
              className="mt-6 px-8 py-3 bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg"
            >
              Force AI Discovery
            </button>
          </div>
        )}

        {view === 'list' && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {filteredPlaces.map((place, idx) => {
              const weight = place.cost > 0 ? ((place.cost / tripBudget) * 100).toFixed(0) : 0;
              const isSelected = selectedForCompare.includes(place.id);
              
              return (
                <motion.div 
                  key={place.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all flex flex-col relative overflow-hidden group p-4 ${isSelected ? 'ring-4 ring-primary-500 ring-offset-4' : ''}`}
                >
                  {/* Card Image Area */}
                  <div className="h-48 bg-gray-50 rounded-[32px] flex items-center justify-center text-6xl relative overflow-hidden mb-6">
                     <div className="absolute inset-0 bg-gradient-to-tr from-gray-50/50 via-transparent to-primary-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                     {place.image?.startsWith("http") ? <img src={place.image} alt={place.name} className="w-full h-full object-cover rounded-[32px] group-hover:scale-110 transition-transform duration-700" /> : <span className="group-hover:scale-110 transition-transform duration-700">{place.image}</span>}

                     {/* Checkbox for Compare */}
                     <button 
                        onClick={() => toggleCompare(place.id)}
                        className={`absolute top-6 left-6 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary-500 border-primary-500 text-white' : 'bg-white/80 backdrop-blur-md border-gray-200 text-transparent'}`}
                      >
                        <CheckCircle2 size={16} />
                      </button>
                  </div>

                  <div className="px-4 pb-4 space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-black text-gray-900 uppercase tracking-tighter text-xl group-hover:text-primary-600 transition-colors flex-1">{place.name}</h4>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSave(place.id); }}
                          className={`p-2 rounded-xl transition-all duration-300 flex-shrink-0 ${savedPlaceIds.includes(place.id) ? 'bg-primary-50 text-primary-500 shadow-sm' : 'bg-gray-50 text-gray-300 hover:text-primary-400 hover:bg-primary-50/50'}`}
                          title={savedPlaceIds.includes(place.id) ? 'Remove from saved' : 'Save place'}
                        >
                          {savedPlaceIds.includes(place.id) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                        </button>
                      </div>
                      <p className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">
                        <MapPin size={12} className="text-primary-400" /> {place.location}
                      </p>
                    </div>

                    {/* Hotel Specific Details */}
                    {place.type === 'Hotels' && (
                      <div className="pt-3 border-t border-gray-50 flex flex-col gap-2">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                          <span>Per Night</span>
                          <span className="text-gray-900 text-sm">₹{place.cost.toLocaleString()}</span>
                        </div>
                        <div className="flex gap-4 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                          <span className="bg-gray-50 px-2 py-1 rounded-md">{place.members} Members</span>
                          <span className="bg-gray-50 px-2 py-1 rounded-md">{place.rooms} {place.rooms === 1 ? 'Room' : 'Rooms'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        {view === 'saved' && !loading && (() => {
          const savedItems = allPlaces.filter(p => savedPlaceIds.includes(p.id));
          return savedItems.length > 0 ? (
            <div className="space-y-6 pb-20">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
                  <BookmarkCheck size={24} className="text-primary-500" /> Your Saved Places
                  <span className="bg-primary-100 text-primary-600 text-xs font-black px-3 py-1 rounded-full">{savedItems.length}</span>
                </h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Total Est. Cost: <span className="text-gray-900 text-sm">₹{savedItems.reduce((s, p) => s + (p.cost || 0), 0).toLocaleString()}</span>
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {savedItems.map((place, idx) => (
                  <motion.div
                    key={place.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-[40px] border border-primary-100 shadow-sm hover:shadow-xl hover:shadow-primary-100/50 transition-all flex flex-col relative overflow-hidden group p-4"
                  >
                    <div className="h-48 bg-gray-50 rounded-[32px] flex items-center justify-center text-6xl relative overflow-hidden mb-6">
                      {place.image?.startsWith("http") ? <img src={place.image} alt={place.name} className="w-full h-full object-cover rounded-[32px] group-hover:scale-110 transition-transform duration-700" /> : <span>{place.image}</span>}
                      <div className="absolute top-4 right-4 bg-primary-500 text-white p-2 rounded-full shadow-lg">
                        <BookmarkCheck size={16} />
                      </div>
                    </div>
                    <div className="px-4 pb-4 space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-black text-gray-900 uppercase tracking-tighter text-xl flex-1">{place.name}</h4>
                        <button
                          onClick={() => toggleSave(place.id)}
                          className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 transition-all flex-shrink-0"
                          title="Remove from saved"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                        <MapPin size={12} className="text-primary-400" /> {place.location}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{place.type}</span>
                        <span className="text-sm font-black text-gray-900">₹{(place.cost || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white h-[500px] rounded-[50px] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center p-20 space-y-8 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              <div className="w-32 h-32 bg-primary-50 rounded-full flex items-center justify-center text-primary-500 relative">
                <div className="absolute inset-0 bg-primary-500 blur-3xl opacity-20 animate-pulse"></div>
                <Bookmark size={64} className="relative z-10" />
              </div>
              <div className="max-w-md space-y-4">
                <h3 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">No Saved Places Yet</h3>
                <p className="text-gray-400 font-bold uppercase text-xs tracking-widest leading-loose">Bookmark your favorite hotels, restaurants and attractions from the list. They'll appear here for quick access.</p>
              </div>
              <button onClick={() => setView('list')} className="px-10 py-4 bg-gray-900 text-white rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-transform cursor-pointer">Browse Places</button>
            </div>
          );
        })()}
      </div>

      {/* Comparison Drawer */}
      <AnimatePresence>
        {selectedForCompare.length > 0 && (
          <motion.div 
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            exit={{ y: 200 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-4xl"
          >
            <div className="bg-gray-900/95 backdrop-blur-2xl p-6 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex items-center justify-between border border-white/10">
               <div className="flex items-center gap-6">
                  <div className="flex -space-x-4">
                    {selectedForCompare.map(id => {
                      const p = allPlaces.find(s => s.id === id);
                      return (
                        <div key={id} className="w-14 h-14 bg-white rounded-2xl border-4 border-gray-900 flex items-center justify-center text-2xl shadow-xl overflow-hidden">
                          {p?.image?.startsWith("http") ? <img src={p.image} className="w-full h-full object-cover" /> : (p?.image || '📍')}
                        </div>
                      );
                    })}
                  </div>
                  <div className="hidden sm:block">
                     <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Compare Mode</p>
                     <h6 className="text-white font-black text-sm uppercase">{selectedForCompare.length} Places Selected</h6>
                  </div>
               </div>
               
               <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedForCompare([])}
                    className="p-4 text-white/40 hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                  <button 
                    onClick={() => setIsCompareOpen(true)}
                    disabled={selectedForCompare.length < 2}
                    className={`px-10 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all ${selectedForCompare.length >= 2 ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-xl shadow-primary-500/20' : 'bg-white/10 text-white/20 cursor-not-allowed'}`}
                  >
                    Compare Now <ArrowRight size={16}/>
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Modal */}
      <AnimatePresence>
         {isCompareOpen && (
           <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsCompareOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 40 }}
                className="bg-white w-full max-w-5xl rounded-[60px] relative z-10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              >
                 <div className="p-10 border-b border-gray-100 flex items-center justify-between">
                    <div>
                       <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Compare Places</h2>
                       <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">Find the best fit for your student budget</p>
                    </div>
                    <button 
                      onClick={() => setIsCompareOpen(false)}
                      className="p-4 bg-gray-50 rounded-3xl text-gray-400 hover:text-gray-900 transition-colors"
                    >
                      <X size={24}/>
                    </button>
                 </div>

                 <div className="flex-1 overflow-x-auto p-10 custom-scrollbar">
                    <table className="w-full">
                       <thead>
                          <tr className="text-left border-b border-gray-100">
                             <th className="pb-8 text-[11px] font-black text-gray-400 uppercase tracking-widest">Detail</th>
                             {selectedForCompare.map(id => {
                               const p = allPlaces.find(s => s.id === id);
                               return (
                                 <th key={id} className="pb-8 px-8">
                                     <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center bg-gray-50 text-4xl">{p?.image?.startsWith("http") ? <img src={p.image} className="w-full h-full object-cover" /> : (p?.image || '📍')}</div>
                                        <div>
                                          <h4 className="font-black text-gray-900 uppercase text-sm tracking-tight">{p?.name || 'Unknown'}</h4>
                                          <p className="text-[9px] font-bold text-gray-400 uppercase">{p?.type || 'Place'}</p>
                                       </div>
                                    </div>
                                 </th>
                               );
                             })}
                          </tr>
                       </thead>
                       <tbody>
                          {[
                            { label: 'Avg Daily Cost', key: 'cost', prefix: '₹' },
                            { label: 'Rooms', key: 'rooms' },
                            { label: 'Members', key: 'members' },
                            { label: 'Student Score', key: 'studentScore', suffix: '/10' },
                            { label: 'Rating', key: 'rating', suffix: ' ★' },
                            { label: 'Budget Fit', key: 'budgetImpact' },
                            { label: 'Top Tags', key: 'tags' },
                          ].map((attr, rowIdx) => (
                            <tr key={attr.label} className={rowIdx === 0 ? 'bg-primary-50/30' : ''}>
                               <td className="py-8 text-[11px] font-black text-gray-900 uppercase tracking-widest border-b border-gray-50">{attr.label}</td>
                               {selectedForCompare.map(id => {
                                 const p = allPlaces.find(s => s.id === id);
                                 if (!p) return <td key={id} className="py-8 px-8 border-b border-gray-50">-</td>;
                                 let val = p[attr.key];
                                 if (Array.isArray(val)) val = val.join(', ');
                                 
                                 return (
                                   <td key={id} className="py-8 px-8 border-b border-gray-50">
                                      {attr.key === 'cost' ? (
                                        <span className="text-lg font-black text-gray-900">₹{val.toLocaleString()}</span>
                                      ) : attr.key === 'budgetImpact' ? (
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white ${getImpactColor(val)}`}>{val}</span>
                                      ) : (
                                        <span className="text-sm font-bold text-gray-600">{val}{attr.suffix}</span>
                                      )}
                                   </td>
                                 );
                               })}
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>

                 <div className="p-10 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Info size={18} className="text-primary-500" />
                       <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Select the best one and add to your itinerary</p>
                    </div>
                    <button 
                      onClick={() => setIsCompareOpen(false)}
                      className="px-12 py-5 bg-gray-900 text-white rounded-[24px] font-black text-[12px] uppercase tracking-widest hover:bg-black transition-all shadow-xl"
                    >
                      Got It
                    </button>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

    </div>
  );
}

export default BudgetPlanner;
