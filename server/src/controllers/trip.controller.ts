import { Request, Response } from 'express';
import Trip from '../models/Trip.js';
import Itinerary from '../models/Itinerary.js';

interface AuthRequest extends Request {
    user?: any;
}

export const createTrip = async (req: AuthRequest, res: Response) => {
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
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getTrips = async (req: AuthRequest, res: Response) => {
    try {
        const trips = await Trip.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(trips);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getTripById = async (req: AuthRequest, res: Response) => {
    try {
        const trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });
        if (!trip) return res.status(404).json({ error: 'Trip not found' });
        res.json(trip);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteTrip = async (req: AuthRequest, res: Response) => {
    try {
        await Trip.deleteOne({ _id: req.params.id, user: req.user.id });
        await Itinerary.deleteMany({ trip: req.params.id });
        res.json({ message: 'Trip deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
