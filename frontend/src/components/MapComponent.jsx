import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../api';

// In-memory cache to avoid repeated geocoding requests during the session
const geocodeCache = new Map();

// Fix for default marker icon in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Intelligent place name extractor from itinerary activities
const cleanLocationName = (text, destination) => {
  let cleaned = text;

  // 1. Look for specific examples inside parentheses first, e.g. (e.g., Zostel Hyderabad)
  const egMatch = cleaned.match(/\((?:e\.g\.|like|specifically)[,\s]*([^,)]+)/i);
  if (egMatch) {
    cleaned = egMatch[1];
  } else {
    // Otherwise, remove parentheses content
    cleaned = cleaned.replace(/\([^)]*\)/g, '');
  }

  // 2. Split on common separators
  if (cleaned.includes(' - ')) {
    cleaned = cleaned.split(' - ')[0];
  }
  
  // 3. Remove meal/time prefixes
  cleaned = cleaned.replace(/^(breakfast|lunch|dinner|evening snacks|night|morning|afternoon|snacks|early morning|late night)\s*:\s*/i, '');

  // 4. Strip leading action verbs and prepositions
  const verbRegex = /^(visit|explore|check\s+into\s+a|check\s+into|travel\s+to|stroll\s+around|wander\s+through|wander\s+around|enjoy|relish|arrive\s+in|head\s+to|go\s+to|walk\s+to|grab\s+a|try|dine\s+at|eat\s+at|spend\s+time\s+at|see|admire|experience|tour)\s+/i;
  cleaned = cleaned.replace(verbRegex, '');

  // 5. Remove leading articles/adjectives
  cleaned = cleaned.replace(/^(the|a|an|surrounding|famous|iconic|historic|ancient|local)\s+/i, '');

  // 6. Split on description prepositions
  const prepositionSplit = /\s+(for|to|with|and|by|on|from)\s+/i;
  if (prepositionSplit.test(cleaned)) {
    const parts = cleaned.split(prepositionSplit);
    // Keep the first part if it's longer than 2 characters
    if (parts[0].trim().length > 2) {
      cleaned = parts[0];
    }
  }

  cleaned = cleaned.trim();

  // 7. Ignore generic actions or travel states
  const blacklistedWords = ['arrive', 'check', 'travel', 'return', 'stay', 'breakfast', 'lunch', 'dinner', 'night', 'sleep', 'rest', 'walk', 'ride', 'bus', 'train', 'flight', 'cab'];
  const firstWord = cleaned.split(/\s+/)[0].toLowerCase();
  if (blacklistedWords.includes(firstWord) || cleaned.length < 3) {
    return null;
  }

  // Ensure it doesn't just match the destination city name itself if there are other details
  if (destination && cleaned.toLowerCase() === destination.toLowerCase()) {
    return null;
  }

  return cleaned;
};

function MapComponent({ destination, itinerary = [], className = "h-[400px]" }) {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState([20.5937, 78.9629]);

  // Extract locations from itinerary
  const extractLocations = useCallback(() => {
    const locations = [];
    if (itinerary && itinerary.length > 0) {
      itinerary.forEach((dayPlan) => {
        if (dayPlan && dayPlan.activities) {
          dayPlan.activities.forEach((activity) => {
            const description = typeof activity === 'string' ? activity : (activity?.activity || '');
            if (description) {
              const place = cleanLocationName(description, destination);
              if (place && !locations.includes(place)) {
                  locations.push(place);
              }
            }
          });
        }
      });
    }

    // If no specific locations were found, fallback to the destination city itself
    if (locations.length === 0 && destination) {
        locations.push(destination);
    }

    return locations.slice(0, 10);
  }, [itinerary, destination]);

  useEffect(() => {
    const locations = extractLocations();
    geocodeLocations(locations);
  }, [itinerary, destination, extractLocations]);

  const geocodeLocations = async (locations) => {
    setLoading(true);
    const results = [];
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    
    for (const [idx, loc] of locations.entries()) {
        try {
            const query = loc.toLowerCase().includes(destination.toLowerCase()) ? loc : `${loc}, ${destination}`;
            let lat, lon;
            const cacheKey = query.toLowerCase();
            
            if (geocodeCache.has(cacheKey)) {
                const cached = geocodeCache.get(cacheKey);
                if (cached) {
                    lat = cached.lat;
                    lon = cached.lon;
                }
            } else {
                // Try backend geocoding endpoint first (uses server-side Nominatim with User-Agent header, bypassing browser CORS/limits)
                try {
                    const res = await api.get(`destinations/geocode?q=${encodeURIComponent(query)}`, { skipLoader: true });
                    const data = res.data;
                    if (data && data.length > 0) {
                        lat = parseFloat(data[0].lat);
                        lon = parseFloat(data[0].lon);
                        geocodeCache.set(cacheKey, { lat, lon });
                    } else {
                        geocodeCache.set(cacheKey, null);
                    }
                } catch (err) {
                    console.warn(`Backend geocoding failed for: ${query}`, err.message);
                }
            }
            
            // Fallback to Google Geocoding if backend geocoding fails
            if ((lat === undefined || lon === undefined) && apiKey) {
                try {
                    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`;
                    const res = await fetch(url);
                    const data = await res.json();
                    if (data.status === 'OK' && data.results && data.results.length > 0) {
                        lat = data.results[0].geometry.location.lat;
                        lon = data.results[0].geometry.location.lng;
                    }
                } catch (gErr) {
                    console.error("Google Geocoding failed:", gErr);
                }
            }

            if (lat !== undefined && lon !== undefined) {
                results.push({
                    id: idx,
                    name: loc,
                    position: [lat, lon]
                });
            }
        } catch (error) {
            console.error("Geocoding error:", error);
        }
    }

    if (results.length > 0) {
        setMarkers(results);
        setCenter(results[0].position);
    } else if (destination) {
        // Fallback to city center
        try {
            let lat, lon;
            const cacheKey = `city_center:${destination.toLowerCase()}`;
            
            if (geocodeCache.has(cacheKey)) {
                const cached = geocodeCache.get(cacheKey);
                if (cached) {
                    lat = cached.lat;
                    lon = cached.lon;
                }
            } else {
                try {
                    const res = await api.get(`destinations/geocode?q=${encodeURIComponent(destination)}`, { skipLoader: true });
                    const data = res.data;
                    if (data && data.length > 0) {
                        lat = parseFloat(data[0].lat);
                        lon = parseFloat(data[0].lon);
                        geocodeCache.set(cacheKey, { lat, lon });
                    } else {
                        geocodeCache.set(cacheKey, null);
                    }
                } catch (err) {
                    console.warn(`Backend city center fallback failed:`, err.message);
                }
            }
            if ((lat === undefined || lon === undefined) && apiKey) {
                const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${apiKey}`;
                const res = await fetch(url);
                const data = await res.json();
                if (data.status === 'OK' && data.results && data.results.length > 0) {
                    lat = data.results[0].geometry.location.lat;
                    lon = data.results[0].geometry.location.lng;
                }
            }
            if (lat !== undefined && lon !== undefined) {
                setMarkers([{
                    id: 0,
                    name: destination,
                    position: [lat, lon]
                }]);
                setCenter([lat, lon]);
            }
        } catch (e) {
            console.error("City center fallback geocoding failed:", e);
        }
    }
    setLoading(false);
  };

  // Helper component to update map view
  function ChangeView({ markers }) {
    const map = useMap();
    
    useEffect(() => {
      // Invalidate the map size so Leaflet recalculates bounds and loads tiles correctly
      map.invalidateSize();
      
      const handleResize = () => {
        map.invalidateSize();
      };
      
      window.addEventListener('resize', handleResize);
      
      // Trigger invalidateSize after a short timeout to handle framer-motion layout animations
      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 250);

      return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(timer);
      };
    }, [map]);

    useEffect(() => {
      if (markers.length > 0) {
        const bounds = L.latLngBounds(markers.map(m => m.position));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }, [markers, map]);

    return null;
  }

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white group transition-all duration-500 ${className}`}>
      <MapContainer 
        center={center} 
        zoom={12} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        <ChangeView markers={markers} />

        {markers.map((marker, index) => (
          <Marker 
            key={index} 
            position={marker.position}
            icon={L.divIcon({
                className: 'custom-div-icon',
                html: `
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="38" height="38" style="filter: drop-shadow(0 3px 5px rgba(0,0,0,0.3)); display: block;">
                    <path fill="#EA4335" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                    <circle cx="12" cy="9" r="2.5" fill="#7F1D1D"/>
                  </svg>
                `,
                iconSize: [38, 38],
                iconAnchor: [19, 38]
            })}
          >
            <Popup>
              <div className="font-bold text-gray-800">{marker.name}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {loading && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-md flex items-center justify-center z-[1500] transition-all">
            <motion.div 
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full shadow-xl"
            />
        </div>
      )}

      {/* Roadmap Badge */}
      <div className="absolute bottom-6 left-6 z-[1000] pointer-events-none">
          <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-gray-900/80 backdrop-blur-xl text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest border border-white/20 shadow-2xl flex items-center gap-3"
          >
              <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
              {destination} Roadmap
          </motion.div>
      </div>
    </div>
  );
}

export default MapComponent;
