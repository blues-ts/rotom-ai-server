import { Router } from 'express';
import {
  getPricingCards,
  getPricingCard,
  getPricingCardHistory,
  getPricingCardListings,
  getPricingSets,
  getPricingSet,
  getPricingPoolStats,
} from '../controllers/pricingController';

const router = Router();

// Cards
router.get('/cards', getPricingCards);
router.get('/cards/:id', getPricingCard);
router.get('/cards/:id/history/:tier', getPricingCardHistory);
router.get('/cards/:id/listings', getPricingCardListings);

// Sets
router.get('/sets', getPricingSets);
router.get('/sets/:slug', getPricingSet);

// Pool stats (for monitoring)
router.get('/pool/stats', getPricingPoolStats);

export default router;
