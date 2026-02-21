import { GoogleGenerativeAI } from '@google/generative-ai';
import Destination from '../models/Destination.js';
const getGenAI = () => {
    const key = (process.env.GEMINI_API_KEY || '').trim();
    if (!key)
        console.error("❌ GEMINI_API_KEY is missing in .env");
    return new GoogleGenerativeAI(key);
};
export const discoverDestinations = async (req, res) => {
    try {
        const { lat, lng, radius, sourceCity, limit } = req.query;
        console.log(`[Discovery] Request for: ${sourceCity} within ${radius}km`);
        let userLat = Number(lat);
        let userLng = Number(lng);
        const r = Number(radius);
        // Geocoding Fallback
        if ((isNaN(userLat) || isNaN(userLng)) && sourceCity && radius !== 'all') {
            try {
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${sourceCity}&limit=1`, {
                    headers: { 'User-Agent': 'BagsUpTravelApp/2.0 (Contact: team@bagsup.com)' }
                });
                const geoData = await geoRes.json();
                if (geoData && geoData.length > 0) {
                    userLat = parseFloat(geoData[0].lat);
                    userLng = parseFloat(geoData[0].lon);
                    console.log(`[Discovery] Geocoded ${sourceCity} to ${userLat}, ${userLng}`);
                }
            }
            catch (err) {
                console.warn("[Discovery] Geocoding failed:", err);
            }
        }
        // 1. Get ALL destinations from DB
        const allDestinations = await Destination.find({});
        let localFiltered = [];
        // 2. Strict Filter by distance
        if (!isNaN(userLat) && !isNaN(userLng) && !isNaN(r) && radius !== 'all') {
            localFiltered = allDestinations.filter(dest => {
                const dLat = (dest.latitude - userLat) * Math.PI / 180;
                const dLon = (dest.longitude - userLng) * Math.PI / 180;
                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(userLat * Math.PI / 180) * Math.cos(dest.latitude * Math.PI / 180) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const distance = 6371 * c;
                return distance <= r;
            });
        }
        console.log(`[Discovery] Local DB found ${localFiltered.length} places within ${r}km.`);
        // 3. AI Discovery - ALWAYS attempt if we have less than 12 local results
        let aiResults = [];
        if (radius !== 'all' && !isNaN(r) && sourceCity && localFiltered.length < 12) {
            try {
                console.log(`[Discovery] Calling AI to find more places near ${sourceCity}...`);
                const coordHint = !isNaN(userLat) ? `(Lat: ${userLat}, Lng: ${userLng})` : '';
                const aiPrompt = `
                Act as a local travel expert. Find 12 REAL and popular tourist spots (including Hill Stations, Beaches, Waterfalls, and Heritage sites) STREICTLY within ${r}km of ${sourceCity} ${coordHint} in India.
                
                CRITICAL VARIETY RULES:
                - If there are hills nearby (like Ponmudi or Horsley Hills), you MUST include them.
                - If there are beaches nearby (like Varkala or Kovalam), you MUST include them.
                - Prioritize "must-visit" places that are actually popular.
                - Do NOT include any place further than ${r}km.
                - Return ONLY a JSON array of objects.
                
                Object Schema: { name, state, short_description, estimated_budget_min, estimated_budget_max, recommended_days, latitude, longitude, category }.
                `;
                const genAI = getGenAI();
                let result;
                try {
                    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                    result = await model.generateContent(aiPrompt);
                }
                catch (aiErr) {
                    console.warn("[Discovery] Primary model failed, trying fallback...", aiErr.message);
                    const modelFallback = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
                    result = await modelFallback.generateContent(aiPrompt);
                }
                const text = result.response.text();
                const jsonMatch = text.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    aiResults = JSON.parse(jsonMatch[0]);
                    console.log(`[Discovery] AI returned ${aiResults.length} raw places.`);
                    // Filter out AI results that are actually far
                    aiResults = aiResults.filter(p => {
                        const dLat = (p.latitude - userLat) * Math.PI / 180;
                        const dLon = (p.longitude - userLng) * Math.PI / 180;
                        const a = Math.sin(dLat / 2) ** 2 + Math.cos(userLat * Math.PI / 180) * Math.cos(p.latitude * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
                        const dist = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                        const isClose = dist <= r + 10; // Allow 10km grace for AI coordinate variance
                        if (!isClose)
                            console.log(`[Discovery] AI result "${p.name}" filtered out: ${dist.toFixed(1)}km > ${r}km`);
                        return isClose;
                    });
                    // Save new ones to DB
                    for (const p of aiResults) {
                        try {
                            const exists = await Destination.findOne({ name: p.name });
                            if (!exists)
                                await new Destination(p).save();
                        }
                        catch (e) { }
                    }
                }
            }
            catch (aiErr) {
                console.error("[Discovery] AI enrichment failed:", aiErr.message || aiErr);
            }
        }
        // 4. Combine results, taking local ones first, then AI ones
        const combinedMap = new Map();
        localFiltered.forEach(p => combinedMap.set(p.name, p));
        aiResults.forEach(p => {
            if (!combinedMap.has(p.name))
                combinedMap.set(p.name, p);
        });
        const finalResults = Array.from(combinedMap.values());
        console.log(`[Discovery] Final combined results: ${finalResults.length}`);
        res.json(finalResults.sort(() => 0.5 - Math.random()).slice(0, Number(limit) || 12));
    }
    catch (error) {
        console.error("[Discovery] Fatal Error:", error);
        let msg = error.message || "Unable to reach travel expert.";
        if (msg.includes("429"))
            msg = "The AI is currently busy with many requests. Please wait a few seconds and click 'Try Again'.";
        if (msg.includes("Quota"))
            msg = "AI daily limit reached or model busy. Please try again in 1 minute.";
        res.status(500).json({ message: "AI Discovery Error: " + msg });
    }
};
export const discoverCityDetails = async (req, res) => {
    try {
        const { city } = req.query;
        if (!city)
            return res.status(400).json({ message: "City name is required." });
        console.log(`[City Details] Discovery request for city: ${city}`);
        const aiPrompt = `
        Act as a local travel expert for Indian students. 
        Generate a HUGE list of EXACTLY 10 Hotels, 10 Restaurants, and 10 Attractions for the city of "${city}".
        
        CRITICAL RULES:
        1. All costs MUST be in INR (₹).
        2. Hotels MUST include "members" and "rooms" fields.
        3. The "location" field MUST ALWAYS include the word "${city}".
        4. Return ONLY a JSON array of objects. No intro/outro text.
        5. Provide high variety: budget lodges, student cafes, street food, and hidden monuments.
        
        Object Schema: { 
            id: unique_number, name: string, type: "Hotels" | "Restaurants" | "Attractions" | "Public Transport", 
            rating: number, location: string, image: emoji, cost: number, members: number, rooms: number, 
            studentScore: number, tags: string[], budgetImpact: "🟢 Friendly" | "🟡 Moderate" | "🔴 Expensive", 
            breakdown: { stay: number, food: number, transport: number }
        }.
        `;
        const genAI = getGenAI();
        let result;
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            result = await model.generateContent(aiPrompt);
        }
        catch (error) {
            console.warn("[City Details] 2.5 Model Busy, trying fallback lite...");
            const modelFallback = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
            result = await modelFallback.generateContent(aiPrompt);
        }
        const text = result.response.text();
        // Comprehensive JSON extraction
        let jsonStr = text;
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }
        else {
            // Try cleaning if no brackets found (unlikely but safe)
            jsonStr = text.replace(/```json|```/g, '').trim();
        }
        try {
            const results = JSON.parse(jsonStr);
            console.log(`[City Details] AI returned ${results.length} results for ${city}.`);
            res.json(results);
        }
        catch (parseError) {
            console.error("[City Details] Parse Error:", parseError, "Text:", text);
            throw new Error("AI response was not in a valid format. Please try again.");
        }
    }
    catch (error) {
        console.error("[City Details] Fatal Error:", error);
        let msg = error.message || "Unable to reach travel expert.";
        if (msg.includes("429"))
            msg = "The AI is currently busy with many requests. Please wait a few seconds and click 'Try Again'.";
        if (msg.includes("Quota"))
            msg = "AI daily limit reached or model busy. Please try again in 1 minute.";
        res.status(500).json({ message: "AI Discovery Error: " + msg });
    }
};
