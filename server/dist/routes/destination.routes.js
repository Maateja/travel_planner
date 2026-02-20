import express from 'express';
import Destination from '../models/Destination.js';
const router = express.Router();
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
// Get 12 random destinations for a state
router.get('/random', async (req, res) => {
    try {
        const { state, category, budget_max, days, limit } = req.query;
        if (!state) {
            return res.status(400).json({ message: 'State is required' });
        }
        let match = { state };
        if (category)
            match.category = category;
        if (budget_max)
            match.estimated_budget_max = { $lte: Number(budget_max) };
        if (days)
            match.recommended_days = { $lte: Number(days) };
        const count = await Destination.countDocuments(match);
        if (count === 0) {
            return res.json([]);
        }
        const size = limit ? Number(limit) : 10;
        const destinations = await Destination.aggregate([
            { $match: match },
            { $sample: { size } }
        ]);
        res.json(destinations);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
export default router;
