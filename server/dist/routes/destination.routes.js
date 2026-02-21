import express from 'express';
import Destination from '../models/Destination.js';
import { discoverDestinations, discoverCityDetails } from '../controllers/destination.controller.js';
const router = express.Router();
router.get('/discover', discoverDestinations);
router.get('/city-details', discoverCityDetails);
// Get all states
router.get('/states', async (req, res) => {
    try {
        const states = await Destination.distinct('state');
        res.json(states.sort());
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Get destinations by state with optional filters
router.get('/', async (req, res) => {
    try {
        const { state, category, budget_max, days } = req.query;
        let query = {};
        if (state)
            query.state = state;
        if (category)
            query.category = category;
        if (budget_max)
            query.estimated_budget_max = { $lte: Number(budget_max) };
        if (days)
            query.recommended_days = { $lte: Number(days) };
        const destinations = await Destination.find(query);
        res.json(destinations);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Get 12 random destinations for a state or nearby a location
router.get('/random', async (req, res) => {
    try {
        const { state, category, budget_max, days, limit, lat, lng, radius } = req.query;
        let match = {};
        if (state)
            match.state = state;
        if (category)
            match.category = category;
        if (budget_max)
            match.estimated_budget_max = { $lte: Number(budget_max) };
        if (days)
            match.recommended_days = { $lte: Number(days) };
        let destinations = await Destination.find(match);
        // Filter by distance if lat, lng, and radius are provided
        if (lat && lng && radius && radius !== 'all') {
            const userLat = Number(lat);
            const userLng = Number(lng);
            const r = Number(radius);
            destinations = destinations.filter(dest => {
                const dLat = (dest.latitude - userLat) * Math.PI / 180;
                const dLon = (dest.longitude - userLng) * Math.PI / 180;
                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(userLat * Math.PI / 180) * Math.cos(dest.latitude * Math.PI / 180) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const distance = 6371 * c; // Earth radius in km
                return distance <= r;
            });
        }
        // Shuffle and limit
        const size = limit ? Number(limit) : 12;
        const shuffled = destinations.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, size);
        res.json(selected);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
export default router;
