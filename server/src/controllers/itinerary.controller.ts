import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Trip from '../models/Trip.js';
import Itinerary from '../models/Itinerary.js';

interface AuthRequest extends Request {
    user?: any;
}

const getGenAI = () => {
    const key = (process.env.GEMINI_API_KEY || '').trim();
    if (!key) console.error("❌ GEMINI_API_KEY is missing in .env");
    else console.log(`[AI] Initializing with key length: ${key.length}`);
    return new GoogleGenerativeAI(key);
};

export const generateItinerary = async (req: AuthRequest, res: Response) => {
    try {
        const { destination, start_date, end_date, budget, interests, trip_id } = req.body;

        const sDate = new Date(start_date);
        const eDate = new Date(end_date);
        
        if (!start_date || !end_date || isNaN(sDate.getTime()) || isNaN(eDate.getTime())) {
            return res.status(400).json({ success: false, error: 'Invalid start or end date' });
        }
        
        const days = Math.ceil((eDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        if (days <= 0) return res.status(400).json({ success: false, error: 'Invalid date range' });

        const interestsArray = Array.isArray(interests) ? interests : [];

        const prompt = `
        Act as an expert travel planner for Indian students.
        
        CRITICAL VALIDATION:
        First, check if "${destination}" is a real, recognizable city or travel destination. 
        - If it is random letters (like "fgyhijo", "bgojpi"), nonsense, or a non-existent place, you MUST return a JSON with "success": false and an "error": "Invalid destination. Please enter a real city or place."
        - Do NOT try to guess or hallucinate a near match if the input is clearly gibberish.

        If the destination is VALID, generate a ${days}-day budget travel itinerary for a student visiting ${destination} with a total budget of ₹${budget} (INR).
        The student is interested in: ${interestsArray.join(', ')}.
        
        Requirements for Valid Destinations:
        1. Suggest realistic, low-cost travel options (trains/buses) and affordable food/stays in India.
        2. All costs must be in INR (₹).
        3. Structure the response strictly as valid JSON.
        4. Each day MUST have unique activities. No repetition between days.
        5. Vary the itinerary by day:
           - Day 1: Arrival, check-in, and major iconic attraction.
           - Day 2: Exploration, hidden gems, and local culture.
           - Day 3: Theme-based exploration (e.g., Food tour, History walk, or Nature).
           - Subsequent days: Nearby excursions, shopping, or relaxation.
        6. Divide the total budget of ₹${budget} logically across ${days} days.
        7. Response MUST be a JSON object with a "success" boolean.
        
        Example JSON Structure (Valid):
        {
          "success": true,
          "destination": "${destination}",
          "itinerary": [
            {
              "day": 1,
              "title": "Clear Unique Day Title",
              "plan_description": "Varied summary for this specific day...",
              "activities": [
                 "Unique Activity 1 (with estimated cost in ₹)",
                 "Unique Activity 2 (with estimated cost in ₹)"
              ],
              "estimated_cost": 500
            }
          ]
        }

        Example JSON Structure (Invalid Destination):
        {
          "success": false,
          "error": "Invalid destination. Please enter a real city or place."
        }
        `;

        const genAI = getGenAI();
        let result;
        try {
            // Priority: Fast layout, high rate limit threshold
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            result = await model.generateContent(prompt);
        } catch (error: any) {
            console.warn("[Itinerary] Primary model failed, trying fallback...", error.message);
            // Fallback
            const modelFallback = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
            result = await modelFallback.generateContent(prompt);
        }
        
        const response = await result.response;
        const text = response.text();
        
        console.log('--- RAW AI RESPONSE ---');
        console.log(text);
        console.log('-----------------------');

        // Extract JSON from response text - more robustly
        let cleanedText = text;
        if (text.includes('```json')) {
            cleanedText = text.split('```json')[1].split('```')[0];
        } else if (text.includes('```')) {
            cleanedText = text.split('```')[1].split('```')[0];
        }
        
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('No JSON block found in AI response');
            throw new Error('AI failed to return a valid itinerary format. Please try again.');
        }
        
        let data;
        try {
            data = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            // Try one more time by cleaning common issues like trailing commas
            const fixedJson = jsonMatch[0].replace(/,\s*([\]}])/g, '$1');
            data = JSON.parse(fixedJson);
        }

        if (data.success === false) {
            return res.status(400).json({ 
                success: false, 
                error: data.error || 'Invalid destination. Please enter a real city or place.' 
            });
        }

        data.destination = destination;

        // If trip_id is provided, save it automatically
        if (trip_id) {
            await Itinerary.deleteMany({ trip: trip_id });
            const itineraryPromises = (data.itinerary || []).map((item: any) => {
                return new Itinerary({
                    trip: trip_id,
                    day: item.day,
                    title: item.title,
                    plan_description: item.plan_description,
                    activities: item.activities,
                    estimated_cost: item.estimated_cost
                }).save();
            });
            await Promise.all(itineraryPromises);
        }

        res.json({ ...data, success: true });
    } catch (err: any) {
        console.error('AI Gen Error:', err);
        let errorMessage = err.message || 'An error occurred during itinerary generation.';
        
        if (errorMessage.includes("429")) errorMessage = "The AI is currently busy. Please wait a few seconds and try again.";
        if (errorMessage.includes("Quota")) errorMessage = "AI limit reached. Please try again in 1 minute.";
        
        res.status(500).json({ 
            success: false, 
            error: errorMessage
        });
    }
};

export const createItinerary = async (req: AuthRequest, res: Response) => {
    try {
        const { trip, day, title, plan_description, activities, estimated_cost } = req.body;
        const newItinerary = new Itinerary({
            trip,
            day,
            title,
            plan_description,
            activities,
            estimated_cost
        });
        await newItinerary.save();
        res.status(201).json(newItinerary);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getItineraryByTripId = async (req: AuthRequest, res: Response) => {
    try {
        const trip = await Trip.findOne({ _id: req.query.trip_id as string, user: req.user.id });
        if (!trip) return res.status(404).json({ error: 'Trip not found' });
        
        const itineraries = await Itinerary.find({ trip: trip._id }).sort({ day: 1 });
        res.json(itineraries);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
