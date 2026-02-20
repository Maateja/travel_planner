import { Router } from 'express';
import { generateItinerary, createItinerary, getItineraryByTripId } from '../controllers/itinerary.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/generate', authenticateToken, generateItinerary);
router.post('/create', authenticateToken, createItinerary);
router.get('/', authenticateToken, getItineraryByTripId);

export default router;
