import Trip from '../models/Trip.js';
import Itinerary from '../models/Itinerary.js';
export const createTrip = async (req, res) => {
    try {
        const { source, destination, start_date, end_date, budget, preference } = req.body;
        const newTrip = new Trip({
            user: req.user.id,
            source,
            destination,
            start_date,
            end_date,
            budget,
            preference
        });
        await newTrip.save();
        res.status(201).json(newTrip);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const getTrips = async (req, res) => {
    try {
        const trips = await Trip.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(trips);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const getTripById = async (req, res) => {
    try {
        const trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });
        if (!trip)
            return res.status(404).json({ error: 'Trip not found' });
        res.json(trip);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const deleteTrip = async (req, res) => {
    try {
        await Trip.deleteOne({ _id: req.params.id, user: req.user.id });
        await Itinerary.deleteMany({ trip: req.params.id });
        res.json({ message: 'Trip deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
