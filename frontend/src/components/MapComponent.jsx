import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

// Fallback styling for the "Dotted" line in Leaflet since it doesn't natively support easy complex dashes like Google
const dashArray = ""; // Solid line for normal roadmap 

function MapComponent({ destination, itinerary = [], className = "h-[400px]" }) {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [routePath, setRoutePath] = useState([]);
  const [center, setCenter] = useState([20.5937, 78.9629]);

  // Extract locations from itinerary
  const extractLocations = useCallback(() => {
    const locations = [];
    if (itinerary && itinerary.length > 0) {
      itinerary.forEach((dayPlan) => {
        if (dayPlan.activities) {
          dayPlan.activities.forEach((activity) => {
            const description = typeof activity === 'string' ? activity : activity.activity;
            let place = description.split(' - ')[0].split(' at ')[1] || description.split(' - ')[0];
            place = place.split('(')[0].trim();
            if (place && !locations.includes(place) && place.length > 2) {
                locations.push(place);
            }
          });
        }
      });
    }
    if (destination && !locations.some(l => l.toLowerCase().includes(destination.toLowerCase()))) {
        locations.unshift(destination);
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
    
    // We'll use Nominatim (OpenStreetMap) as it doesn't need an API key
    for (const [idx, loc] of locations.entries()) {
        try {
            const query = idx === 0 ? loc : `${loc}, ${destination}`;
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
            const data = await res.json();
            
            if (data && data.length > 0) {
                results.push({
                    id: idx,
                    name: loc,
                    position: [parseFloat(data[0].lat), parseFloat(data[0].lon)]
                });
            }
        } catch (error) {
            console.error("Geocoding error:", error);
        }
    }

    if (results.length > 0) {
        setMarkers(results);
        setCenter(results[0].position);
        setRoutePath(results.map(m => m.position));
    }
    setLoading(false);
  };

  // Helper component to update map view
  function ChangeView({ markers }) {
    const map = useMap();
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
                html: `<div style="background: ${index === 0 ? '#0EA5E9' : '#8B5CF6'}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; items-center; justify-center; color: white; font-weight: 900; font-size: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">${index + 1}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })}
          >
            <Popup>
              <div className="font-bold text-gray-800">{marker.name}</div>
            </Popup>
          </Marker>
        ))}

        {routePath.length > 1 && (
            <Polyline
                positions={routePath}
                pathOptions={{
                    color: '#8B5CF6',
                    weight: 4,
                    dashArray: dashArray, // This makes it dotted
                    lineCap: 'round',
                    opacity: 0.8
                }}
            />
        )}
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

      {/* Roadmap Badge - RESTORED visibility and z-index balance */}
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
