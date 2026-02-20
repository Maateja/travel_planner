import { Router } from 'express';
import { createTrip, getTrips, getTripById, deleteTrip } from '../controllers/trip.controller.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
router.post('/', authenticateToken, createTrip);
router.get('/', authenticateToken, getTrips);
router.get('/:id', authenticateToken, getTripById);
router.delete('/:id', authenticateToken, deleteTrip);
export default router;
