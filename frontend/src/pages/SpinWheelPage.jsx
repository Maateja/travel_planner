import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MapPin, 
    Calendar, 
    IndianRupee, 
    Navigation, 
    RotateCcw, 
    RefreshCw, 
    Filter,
    ArrowRight,
    Star,
    Globe,
    CheckCircle2,
    Edit3,
    Save,
    Trash2,
    Plus,
    X,
    Sparkles
} from 'lucide-react';
import api from '../api';
import { useLoading } from '../context/LoadingContext';
import './SpinWheelPage.css';

// Initial state options are no longer needed as we use text input for source city
const SEGMENT_COLORS = [
    '#14b8a6', // Teal
    '#3b82f6', // Blue
    '#f97316', // Orange
    '#facc15', // Yellow
    '#a855f7', // Purple
    '#22c55e'  // Green
];

const SpinWheelPage = () => {
    // --- Basic State ---
    const [source, setSource] = useState('');
    const [sourceCoords, setSourceCoords] = useState(null);
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState(null);
    const [feedbackMsg, setFeedbackMsg] = useState('');
    const { showLoading, hideLoading } = useLoading();

    // --- New Filters ---
    const [filters, setFilters] = useState({
        distance: 'all', // all, 50, 100, 150, 200, 250, 300, 301
        startDate: '',
        endDate: ''
    });

    // --- AI Plan State ---
    const [aiLoading, setAiLoading] = useState(false);
    const [aiPlan, setAiPlan] = useState(null); // The generated itinerary data
    const [editingDay, setEditingDay] = useState(null); // Index of the day being edited
    const [isSaving, setIsSaving] = useState(false);

    const canvasRef = useRef(null);
    const requestRef = useRef(null);
    const startTimeRef = useRef(null);
    const currentRotationRef = useRef(0);
    const finalRotationRef = useRef(0);

    const fetchDestinations = async (isReload = false) => {
        if (!source || source.length < 3) return;
        setLoading(true);
        showLoading();
        setFeedbackMsg('');
        try {
            let coords = sourceCoords;
            // Only geocode if we don't already have them from 'Locate Me'
            if (!coords) {
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${source}&limit=1`, {
                        headers: { 'User-Agent': 'TravelPlanner/1.0' }
                    });
                    const data = await res.json();
                    if (data && data.length > 0) {
                        coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
                        setSourceCoords(coords);
                    }
                } catch (e) {
                    console.warn("Frontend geocoding failed, falling back to backend discovery:", e);
                }
            }

            const params = {
                limit: 12,
                radius: filters.distance,
                lat: coords?.lat,
                lng: coords?.lng,
                sourceCity: source
            };
            
            const response = await api.get('/destinations/discover', { params });
            const data = response.data;
            
            setDestinations(data);
            
            if (data.length > 0 && data.length < 5) {
                setFeedbackMsg(`Only these ${data.length} places are nearby you can visit!`);
            } else if (data.length === 0) {
                setFeedbackMsg("No places found within this range. Try increasing the distance or checking the city name.");
            }

            if (isReload) {
                setResult(null);
                setAiPlan(null);
                currentRotationRef.current = 0;
            }
        } catch (error) {
            console.error("Error fetching destinations:", error);
            setFeedbackMsg("Oops! Something went wrong while finding places. Please try again.");
        } finally {
            setLoading(false);
            hideLoading();
        }
    };

    const handleLocateMe = () => {
        if (navigator.geolocation) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                setSourceCoords({ lat: latitude, lng: longitude });
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    setSource(data.address.city || data.address.town || data.address.village || "Current Location");
                } catch(e) {
                    setSource("Current Location");
                }
                setLoading(false);
            }, () => {
                setLoading(false);
                alert("Unable to retrieve your location");
            });
        }
    };

    useEffect(() => {
        if (sourceCoords || (source && source.length > 3)) {
            const timer = setTimeout(() => fetchDestinations(), 1000);
            return () => clearTimeout(timer);
        }
        
        const savedRoadmap = sessionStorage.getItem('currentRoadmap');
        if (savedRoadmap) {
            const roadmap = JSON.parse(savedRoadmap);
            setAiPlan(roadmap.itinerary);
        }
    }, [source, filters.distance]);

    // --- Wheel Drawing ---
    const drawWheel = (currRotation) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = canvas.width / 2 - 10;
        const numSegments = 12; // Keep fixed segments as requested
        const arc = (2 * Math.PI) / numSegments;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const wrapText = (context, text, x, y, maxWidth, lineHeight) => {
            const words = text.split(' ');
            let line = '';
            const lines = [];
            for (let n = 0; n < words.length; n++) {
                let testLine = line + words[n] + ' ';
                if (context.measureText(testLine).width > maxWidth && n > 0) {
                    lines.push(line);
                    line = words[n] + ' ';
                } else {
                    line = testLine;
                }
            }
            lines.push(line);
            lines.slice(0, 2).forEach((l, i) => {
                context.fillText(l.trim(), x, y + (i - (lines.slice(0, 2).length - 1) / 2) * lineHeight);
            });
        };

        for (let i = 0; i < numSegments; i++) {
            const dest = destinations[i];
            const angle = currRotation + i * arc;
            ctx.beginPath();
            ctx.fillStyle = dest ? SEGMENT_COLORS[i % SEGMENT_COLORS.length] : '#f1f5f9'; // Light gray for empty
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, angle, angle + arc);
            ctx.lineTo(centerX, centerY);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 2;
            ctx.stroke();

            if (dest) {
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(angle + arc / 2);
                ctx.textAlign = "right";
                ctx.fillStyle = SEGMENT_COLORS[i % SEGMENT_COLORS.length] === '#facc15' ? "#000" : "#fff";
                let fontSize = dest.name.length > 15 ? 12 : (dest.name.length > 10 ? 14 : 16);
                ctx.font = `bold ${fontSize}px Inter, sans-serif`;
                wrapText(ctx, dest.name, radius - 40, 0, radius * 0.5, fontSize * 1.2);
                ctx.restore();
            }
        }

        // Center hub
        ctx.beginPath();
        ctx.arc(centerX, centerY, 45, 0, 2 * Math.PI);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Outer rim
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 12;
        ctx.stroke();
    };

    useEffect(() => {
        if (destinations.length > 0) drawWheel(currentRotationRef.current);
    }, [destinations]);

    const animate = (time) => {
        if (!startTimeRef.current) startTimeRef.current = time;
        const progress = Math.min((time - startTimeRef.current) / 4000, 1);
        const easeOut = (t) => 1 - Math.pow(1 - t, 3);
        const currentSpin = finalRotationRef.current * easeOut(progress);
        currentRotationRef.current = currentSpin;
        drawWheel(currentSpin);
        if (progress < 1) requestRef.current = requestAnimationFrame(animate);
        else {
            setSpinning(false);
            const numSegments = 12; // Fixed segments
            const arc = (2 * Math.PI) / numSegments;
            const normalizedRotation = currentRotationRef.current % (Math.PI * 2);
            // Pointer is at the top (3*Math.PI/2)
            const relativeAngle = ((3 * Math.PI) / 2 - normalizedRotation + Math.PI * 100) % (Math.PI * 2);
            const landedIndex = Math.floor(relativeAngle / arc);
            
            // Should always have a result if we rigged handleSpin correctly
            if (destinations[landedIndex]) {
                setResult(destinations[landedIndex]);
            }
        }
    };

    const handleSpin = () => {
        if (destinations.length === 0 || spinning) return;
        setSpinning(true);
        setResult(null);
        setAiPlan(null);

        startTimeRef.current = null;
        
        const numSegments = 12;
        const arc = (2 * Math.PI) / numSegments;
        
        // Select a random index from only the filled segments
        const targetIndex = Math.floor(Math.random() * destinations.length);
        
        // Rig the rotation to land on targetIndex
        // Target rotation such that (3PI/2 - finalRotation) % 2PI is roughly in [targetIndex*arc, (targetIndex+1)*arc]
        const extraRounds = 10 + Math.floor(Math.random() * 5);
        const currentPos = currentRotationRef.current % (Math.PI * 2);
        
        // Target angle at pointer (top)
        const targetAngleAtPointer = targetIndex * arc + arc / 2;
        const finalRotationOffset = ((3 * Math.PI) / 2 - targetAngleAtPointer - currentPos + Math.PI * 4) % (Math.PI * 2);
        
        finalRotationRef.current = currentRotationRef.current + (Math.PI * 2 * extraRounds) + finalRotationOffset;
        requestRef.current = requestAnimationFrame(animate);
    };

    const handleShuffle = () => fetchDestinations(true);

    // --- In-Page AI Generation ---
    const generateFullPlan = async () => {
        if (!result) return;
        setAiLoading(true);
        showLoading();
        try {
            const res = await api.post('itinerary/generate', {
                destination: result.name,
                start_date: filters.startDate || new Date().toISOString().split('T')[0],
                end_date: filters.endDate || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                budget: result.estimated_budget_max,
                interests: [result.category]
            });
            if (res.data.success || res.data.itinerary) {
                const roadmapData = {
                    ...res.data,
                    destination: result.name, // Ensure destination is present for Dashboard
                };
                setAiPlan(res.data.itinerary);
                sessionStorage.setItem('currentRoadmap', JSON.stringify(roadmapData));
                setTimeout(() => {
                    document.getElementById('editable-plan-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 500);
            }
        } catch (error) {
            console.error("AI Generation failed:", error);
        } finally {
            setAiLoading(false);
            hideLoading();
        }
    };

    // --- Editable Logic ---
    const updateDayField = (index, field, value) => {
        const newPlan = [...aiPlan];
        newPlan[index][field] = value;
        setAiPlan(newPlan);
    };

    const updateActivities = (index, activityIndex, value) => {
        const newPlan = [...aiPlan];
        newPlan[index].activities[activityIndex] = value;
        setAiPlan(newPlan);
    };

    const addActivity = (index) => {
        const newPlan = [...aiPlan];
        newPlan[index].activities.push("New Activity");
        setAiPlan(newPlan);
    };

    const removeActivity = (index, activityIndex) => {
        const newPlan = [...aiPlan];
        newPlan[index].activities.splice(activityIndex, 1);
        setAiPlan(newPlan);
    };

    const handleSaveCustomPlan = async () => {
        if (!aiPlan) return;
        setIsSaving(true);
        try {
            // Logic to save the customized plan to the backend
            // For now, we simulate success
            sessionStorage.removeItem('currentRoadmap');
            alert("Plan customized and saved successfully!");
            setAiPlan(null);
        } catch (error) {
            console.error("Save failed:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="spin-wheel-page">
            <div className="spin-wheel-container">
                <header className="spin-header">
                    <motion.h1 className="headline" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                        Don’t know where to go? Let <span className="brand-text">BAGS UP</span> choose for you!
                    </motion.h1>
                    <p className="subtext">Select your criteria and spin the wheel for a custom curated adventure.</p>
                </header>

                <div className="spin-main-layout">
                    {/* Filter Bar */}
                    <div className="discovery-filters">
                        <div className="filter-group">
                            <label>Source City</label>
                            <div className="relative flex items-center">
                                <input 
                                    className="source-input pr-10"
                                    placeholder="Enter city or town"
                                    value={source}
                                    onChange={(e) => { setSource(e.target.value); setSourceCoords(null); }}
                                    disabled={spinning}
                                />
                                <button className="absolute right-2 text-gray-400 hover:text-primary-500" onClick={handleLocateMe}>
                                    <Navigation size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="filter-group">
                            <label>Distance</label>
                            <select value={filters.distance} onChange={(e) => setFilters({...filters, distance: e.target.value})} disabled={spinning}>
                                <option value="all">Any Distance</option>
                                <option value="50">&lt; 50 km</option>
                                <option value="100">&lt; 100 km</option>
                                <option value="150">&lt; 150 km</option>
                                <option value="200">&lt; 200 km</option>
                                <option value="250">&lt; 250 km</option>
                                <option value="300">&lt; 300 km</option>
                                <option value="301">&gt; 300 km</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Start Date</label>
                            <input 
                                type="date" 
                                value={filters.startDate} 
                                onChange={(e) => setFilters({...filters, startDate: e.target.value})} 
                                disabled={spinning}
                            />
                        </div>
                        <div className="filter-group">
                            <label>End Date</label>
                            <input 
                                type="date" 
                                value={filters.endDate} 
                                onChange={(e) => setFilters({...filters, endDate: e.target.value})} 
                                disabled={spinning}
                            />
                        </div>
                        <button className="shuffle-btn" onClick={handleShuffle} disabled={spinning || !source}>
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                            Shuffle
                        </button>
                    </div>

                    {feedbackMsg && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            className="feedback-banner bg-primary-50 text-primary-700 px-6 py-3 rounded-2xl text-center font-bold mb-8 border border-primary-100"
                        >
                            {feedbackMsg}
                        </motion.div>
                    )}

                    {/* The Wheel */}
                    <div className="wheel-section-standalone">
                         <div className="wheel-pointer-top-standalone"></div>
                         <canvas ref={canvasRef} width={500} height={500} />
                         <button className={`spin-trigger-btn ${spinning || !source || destinations.length === 0 ? 'disabled' : ''}`} onClick={handleSpin} disabled={spinning || !source || destinations.length === 0}>
                             {spinning ? "..." : "SPIN"}
                         </button>
                    </div>

                    {/* Result Brief */}
                    <AnimatePresence>
                        {result && !spinning && (
                            <motion.div className="standalone-result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                                <div className="result-header">
                                    <span className="category-tag">{result.category}</span>
                                    <h2>{result.name}</h2>
                                </div>
                                <p className="desc">{result.short_description}</p>
                                <div className="brief-stats">
                                    <div className="stat-box">
                                        <IndianRupee size={16} />
                                        <span>₹{result.estimated_budget_min} - ₹{result.estimated_budget_max}</span>
                                    </div>
                                    <div className="stat-box">
                                        <Calendar size={16} />
                                        <span>{result.recommended_days} Days Preferred</span>
                                    </div>
                                </div>
                                <div className="result-actions">
                                    <button className="generate-btn" onClick={generateFullPlan} disabled={aiLoading}>
                                        {aiLoading ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                                        Generate Full AI Plan
                                    </button>
                                    <button className="spin-more" onClick={handleSpin}>Spin Again</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Editable AI Plan Section */}
                    <AnimatePresence>
                        {aiPlan && (
                            <motion.div 
                                id="editable-plan-section"
                                className="editable-plan-container"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="plan-header">
                                    <h3>Custom Curated Roadmap: {result?.name || ''}</h3>
                                    <p>Feel free to edit titles, descriptions, and activities to match your style.</p>
                                </div>

                                <div className="editable-days-stack">
                                    {aiPlan.map((day, dIdx) => (
                                        <div key={dIdx} className="day-edit-card shadow-sm border border-gray-100 p-6 rounded-3xl bg-white mb-6">
                                            <div className="day-header flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <span className="day-num bg-primary-500 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black">
                                                        {day.day}
                                                    </span>
                                                    <input 
                                                        className="day-title-input font-black text-gray-900 border-none bg-transparent focus:ring-0 text-xl w-full"
                                                        value={day.title}
                                                        onChange={(e) => updateDayField(dIdx, 'title', e.target.value)}
                                                    />
                                                </div>
                                                <div className="cost-tag bg-emerald-50 text-emerald-600 px-4 py-1 rounded-full text-xs font-black">
                                                    Est. ₹<input 
                                                        type="number" 
                                                        className="cost-inline bg-transparent border-none p-0 w-16 focus:ring-0 font-black"
                                                        value={day.estimated_cost}
                                                        onChange={(e) => updateDayField(dIdx, 'estimated_cost', parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </div>

                                            <textarea 
                                                className="day-desc-textarea w-full text-gray-500 text-sm border-none bg-gray-50/50 p-4 rounded-2xl focus:ring-1 focus:ring-primary-300 mb-6 font-medium"
                                                value={day.plan_description}
                                                onChange={(e) => updateDayField(dIdx, 'plan_description', e.target.value)}
                                                rows={2}
                                            />

                                            <div className="activities-list-edit">
                                                <label className="text-[10px] font-black uppercase text-gray-400 mb-3 block">Daily Checklist</label>
                                                <div className="space-y-3">
                                                    {day.activities.map((act, aIdx) => (
                                                        <div key={aIdx} className="flex items-center gap-3">
                                                            <div className="w-2 h-2 rounded-full bg-primary-400"></div>
                                                            <input 
                                                                className="flex-1 text-xs font-bold text-gray-700 bg-transparent border-none focus:ring-0 p-0"
                                                                value={act}
                                                                onChange={(e) => updateActivities(dIdx, aIdx, e.target.value)}
                                                            />
                                                            <button onClick={() => removeActivity(dIdx, aIdx)} className="text-gray-300 hover:text-red-400">
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button onClick={() => addActivity(dIdx)} className="add-act-btn flex items-center gap-2 text-[10px] font-black text-primary-500 uppercase mt-2">
                                                        <Plus size={10} /> Add Activity
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="plan-footer-actions">
                                    <button className="save-custom-plan" onClick={handleSaveCustomPlan} disabled={isSaving}>
                                        <Save size={18} /> Save & Finalize Journey
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default SpinWheelPage;
