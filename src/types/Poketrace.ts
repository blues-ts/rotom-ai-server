/**
 * Type definitions for the Poketrace Pokemon Card Pricing API
 */

// --- Enums & Constants ---

export type PoketracePlan = 'Free' | 'Pro' | 'Scale';
export type PoketraceMarket = 'US' | 'EU';
export type PoketraceCurrency = 'USD' | 'EUR';
export type PoketraceGame = 'pokemon' | 'pokemon-japanese' | 'pokemon-chinese';

export type PoketraceSource = 'ebay' | 'tcgplayer' | 'cardmarket' | 'cardmarket_unsold';

export type PoketraceVariant =
  | 'Normal'
  | 'Holofoil'
  | 'Reverse_Holofoil'
  | '1st_Edition'
  | '1st_Edition_Holofoil'
  | 'Unlimited';

export type PoketraceRawCondition =
  | 'MINT'
  | 'NEAR_MINT'
  | 'LIGHTLY_PLAYED'
  | 'MODERATELY_PLAYED'
  | 'HEAVILY_PLAYED'
  | 'DAMAGED';

export type PoketraceHistoryPeriod = '7d' | '30d' | '90d' | '1y' | 'all';

export type PoketraceListingSort = 'sold_at_desc' | 'sold_at_asc' | 'price_desc' | 'price_asc';

// --- Price Types ---

export interface PoketraceTierPrice {
  avg: number;
  low?: number;
  high?: number;
  saleCount?: number;
  lastUpdated: string;
  avg1d?: number;
  avg7d?: number;
  avg30d?: number;
  median3d?: number;
  median7d?: number;
  median30d?: number;
  country?: Record<string, { avg: number; low: number; high: number; saleCount: number }>;
}

export type PoketracePrices = {
  ebay?: Record<string, PoketraceTierPrice>;
  tcgplayer?: Record<string, PoketraceTierPrice>;
  cardmarket?: { AGGREGATED: PoketraceTierPrice };
  cardmarket_unsold?: Record<string, PoketraceTierPrice>;
};

// --- Card Types ---

export interface PoketraceCard {
  id: string;
  name: string;
  cardNumber: string;
  set: { slug: string; name: string };
  variant?: PoketraceVariant;
  rarity: string;
  image: string;
  game: PoketraceGame;
  market: PoketraceMarket;
  currency: PoketraceCurrency;
  refs: { tcgplayerId?: number; cardmarketId?: number };
  prices: PoketracePrices;
  lastUpdated: string;
}

export interface PoketraceCardDetail extends PoketraceCard {
  gradedOptions?: string[];
  conditionOptions?: string[];
  topPrice?: number;
  totalSaleCount?: number;
  hasGraded?: boolean;
}

// --- Set Types ---

export interface PoketraceSet {
  slug: string;
  name: string;
  releaseDate: string;
  cardCount: number;
}

export interface PoketraceSetDetail extends PoketraceSet {
  externalIds: { tcgplayer?: number; cardmarket?: number };
}

// --- Pagination ---

export interface PoketracePagination {
  hasMore: boolean;
  nextCursor: string | null;
  count: number;
}

// --- History ---

export interface PoketracePriceHistoryEntry {
  date: string;
  source: PoketraceSource;
  avg: number;
  low?: number;
  high?: number;
  saleCount?: number;
  median3d?: number;
  median7d?: number;
  median30d?: number;
  avg1d?: number;
  avg7d?: number;
  avg30d?: number;
  country?: Record<string, { avg: number; low: number; high: number; saleCount: number }>;
}

// --- Listings (Scale only) ---

export interface PoketraceListing {
  id: string;
  sourceItemId: string;
  listingType: string;
  title: string;
  price: number;
  currency: PoketraceCurrency;
  listingUrl: string;
  condition?: string;
  grader?: string;
  grade?: string;
  soldAt: string;
  anomalyFlag?: boolean;
  anomalyReason?: string;
}

// --- Auth ---

export interface PoketraceAuthInfo {
  key: string;
  name: string | null;
  active: boolean;
  createdAt: string;
  user: {
    plan: PoketracePlan;
    remaining: number;
    limit: number;
    periodStart: string;
    resetsAt: string;
  };
}

// --- Query Params ---

export interface GetCardsParams {
  limit?: number;
  cursor?: string;
  offset?: number;
  set?: string;
  search?: string;
  card_number?: string;
  variant?: string;
  rarity?: string;
  game?: PoketraceGame;
  market?: PoketraceMarket;
  tcgplayer_ids?: string;
  cardmarket_ids?: string;
  has_graded?: boolean;
}

export interface GetSetsParams {
  limit?: number;
  cursor?: string;
  search?: string;
  game?: PoketraceGame;
}

export interface GetPriceHistoryParams {
  period?: PoketraceHistoryPeriod;
  limit?: number;
  cursor?: string;
}

export interface GetListingsParams {
  limit?: number;
  cursor?: string;
  grader?: string;
  grade?: string;
  min_price?: number;
  max_price?: number;
  sort?: PoketraceListingSort;
}

// --- API Responses ---

export interface PoketraceResponse<T> {
  data: T;
}

export interface PoketracePaginatedResponse<T> {
  data: T[];
  pagination: PoketracePagination;
}

export interface PoketraceErrorResponse {
  error: string;
  code?: string;
  usage?: Record<string, unknown>;
  retryAfter?: number;
}
