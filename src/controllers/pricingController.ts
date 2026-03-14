import type { Response } from 'express';
import type { AuthRequest } from '../middleware/clerkAuth';
import { poketraceClient, PoketraceApiError } from '../utils/poketraceClient';
import { handleApiError, createErrorResponse, ErrorCode, getStatusCode } from '../utils/apiErrors';
import type {
  GetCardsParams,
  GetSetsParams,
  GetPriceHistoryParams,
  GetListingsParams,
  PoketraceMarket,
  PoketraceGame,
  PoketraceHistoryPeriod,
  PoketraceListingSort,
} from '../types/Poketrace';

// GET /api/pricing/cards — Search/list cards with pricing
export async function getPricingCards(req: AuthRequest, res: Response) {
  try {
    const params: GetCardsParams = {};
    const q = req.query;

    if (q.limit) params.limit = Math.min(Number(q.limit), 20);
    if (q.cursor) params.cursor = String(q.cursor);
    if (q.offset) params.offset = Number(q.offset);
    if (q.set) params.set = String(q.set);
    if (q.search) params.search = String(q.search);
    if (q.card_number) params.card_number = String(q.card_number);
    if (q.variant) params.variant = String(q.variant);
    if (q.rarity) params.rarity = String(q.rarity);
    if (q.game) params.game = String(q.game) as PoketraceGame;
    if (q.market) params.market = String(q.market) as PoketraceMarket;
    if (q.tcgplayer_ids) params.tcgplayer_ids = String(q.tcgplayer_ids);
    if (q.cardmarket_ids) params.cardmarket_ids = String(q.cardmarket_ids);
    if (q.has_graded !== undefined) params.has_graded = q.has_graded === 'true';

    const result = await poketraceClient.getCards(params);
    return res.json({ success: true, ...result });
  } catch (error) {
    return handlePricingError(error, 'getPricingCards', res);
  }
}

// GET /api/pricing/cards/:id — Single card detail with full pricing breakdown
export async function getPricingCard(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const result = await poketraceClient.getCard(id);
    return res.json({ success: true, ...result });
  } catch (error) {
    return handlePricingError(error, 'getPricingCard', res);
  }
}

// GET /api/pricing/cards/:id/history/:tier — Price history for a specific tier (e.g. NEAR_MINT, PSA_10)
export async function getPricingCardHistory(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const tier = String(req.params.tier);
    const params: GetPriceHistoryParams = {};
    const q = req.query;

    if (q.period) params.period = String(q.period) as PoketraceHistoryPeriod;
    if (q.limit) params.limit = Math.min(Number(q.limit), 365);
    if (q.cursor) params.cursor = String(q.cursor);

    const result = await poketraceClient.getCardPriceHistory(id, tier, params);
    return res.json({ success: true, ...result });
  } catch (error) {
    return handlePricingError(error, 'getPricingCardHistory', res);
  }
}

// GET /api/pricing/cards/:id/listings — Sold eBay listings (Scale plan only)
export async function getPricingCardListings(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const params: GetListingsParams = {};
    const q = req.query;

    if (q.limit) params.limit = Math.min(Number(q.limit), 20);
    if (q.cursor) params.cursor = String(q.cursor);
    if (q.grader) params.grader = String(q.grader);
    if (q.grade) params.grade = String(q.grade);
    if (q.min_price) params.min_price = Number(q.min_price);
    if (q.max_price) params.max_price = Number(q.max_price);
    if (q.sort) params.sort = String(q.sort) as PoketraceListingSort;

    const result = await poketraceClient.getCardListings(id, params);
    return res.json({ success: true, ...result });
  } catch (error) {
    return handlePricingError(error, 'getPricingCardListings', res);
  }
}

// GET /api/pricing/sets — List all Pokemon sets
export async function getPricingSets(req: AuthRequest, res: Response) {
  try {
    const params: GetSetsParams = {};
    const q = req.query;

    if (q.limit) params.limit = Math.min(Number(q.limit), 100);
    if (q.cursor) params.cursor = String(q.cursor);
    if (q.search) params.search = String(q.search);
    if (q.game) params.game = String(q.game) as PoketraceGame;

    const result = await poketraceClient.getSets(params);
    return res.json({ success: true, ...result });
  } catch (error) {
    return handlePricingError(error, 'getPricingSets', res);
  }
}

// GET /api/pricing/sets/:slug — Single set detail
export async function getPricingSet(req: AuthRequest, res: Response) {
  try {
    const slug = String(req.params.slug);
    const result = await poketraceClient.getSet(slug);
    return res.json({ success: true, ...result });
  } catch (error) {
    return handlePricingError(error, 'getPricingSet', res);
  }
}

// GET /api/pricing/pool/stats — API key pool health (total/available keys)
export async function getPricingPoolStats(_req: AuthRequest, res: Response) {
  return res.json({ success: true, data: poketraceClient.getPoolStats() });
}

function handlePricingError(error: unknown, context: string, res: Response) {
  if (error instanceof PoketraceApiError) {
    const statusCode = error.statusCode;

    if (error.code === 'UPGRADE_REQUIRED') {
      return res.status(403).json(
        createErrorResponse(ErrorCode.FORBIDDEN, 'This feature requires a higher Poketrace plan.')
      );
    }

    if (statusCode === 404) {
      return res.status(404).json(createErrorResponse(ErrorCode.NOT_FOUND));
    }

    if (statusCode === 429) {
      return res.status(429).json(
        createErrorResponse(ErrorCode.RATE_LIMITED, 'Pricing API rate limit reached. Please try again shortly.')
      );
    }
  }

  const { statusCode, response } = handleApiError(error, context);
  return res.status(statusCode).json(response);
}
