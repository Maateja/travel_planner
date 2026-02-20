import { GoogleGenerativeAI } from '@google/generative-ai';
import Trip from '../models/Trip.js';
import Itinerary from '../models/Itinerary.js';
const getGenAI = () => {
    const key = (process.env.GEMINI_API_KEY || '').trim();
    return new GoogleGenerativeAI(key);
};
export const generateItinerary = async (req, res) => {
    try {
        const { destination, start_date, end_date, budget, interests, trip_id } = req.body;
        const sDate = new Date(start_date);
        const eDate = new Date(end_date);
        const days = Math.ceil((eDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        if (days <= 0)
            return res.status(400).json({ success: false, error: 'Invalid dates' });
        const prompt = `
        Act as an expert travel planner for Indian students.
        Generate a ${days}-day budget travel itinerary for a student visiting ${destination} with a total budget of ₹${budget} (INR).
        The student is interested in: ${interests.join(', ')}.
        
        Requirements:
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
        7. Response MUST be a JSON object with a "success" boolean and an "itinerary" array of daily objects.
        
        Example JSON Structure:
        {
          "success": true,
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
        `;
        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log('--- RAW AI RESPONSE ---');
        console.log(text);
        console.log('-----------------------');
        // Extract JSON from response text - more robustly
        let cleanedText = text;
        if (text.includes('```json')) {
            cleanedText = text.split('```json')[1].split('```')[0];
        }
        else if (text.includes('```')) {
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
        }
        catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            // Try one more time by cleaning common issues like trailing commas
            const fixedJson = jsonMatch[0].replace(/,\s*([\]}])/g, '$1');
            data = JSON.parse(fixedJson);
        }
        data.destination = destination;
        // If trip_id is provided, save it automatically
        if (trip_id) {
            await Itinerary.deleteMany({ trip: trip_id });
            const itineraryPromises = (data.itinerary || []).map((item) => {
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
    }
    catch (err) {
        console.error('AI Gen Error:', err);
        let errorMessage = err.message || 'An error occurred during itinerary generation.';
        // If it's a 404 or specifically mentions model not found, it might be an invalid model name
        if (errorMessage.includes('404') || errorMessage.includes('not found')) {
            errorMessage = 'The AI model is currently unavailable or the model name is incorrect. Please contact support.';
        }
        // Handle 503 High Demand
        else if (errorMessage.includes('503') || errorMessage.includes('Service Unavailable') || errorMessage.includes('high demand')) {
            errorMessage = 'The AI service is currently overwhelmed by high demand. Please wait 10-20 seconds and try generating again.';
        }
        // Genuine API Key issues
        else if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('invalid') && errorMessage.includes('API key')) {
            errorMessage = 'Invalid Gemini API Key. Please update server/.env';
        }
        // Quota issues
        else if (errorMessage.includes('429') || errorMessage.includes('quota')) {
            errorMessage = 'API Quota exceeded. Please try again in a few minutes.';
        }
        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};
export const createItinerary = async (req, res) => {
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
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const getItineraryByTripId = async (req, res) => {
    try {
        const trip = await Trip.findOne({ _id: req.query.trip_id, user: req.user.id });
        if (!trip)
            return res.status(404).json({ error: 'Trip not found' });
        const itineraries = await Itinerary.find({ trip: trip._id }).sort({ day: 1 });
        res.json(itineraries);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
