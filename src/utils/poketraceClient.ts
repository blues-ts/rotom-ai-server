import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../config';
import { logger } from './logger';
import { redisCache } from './redisCache';
import type {
  PoketraceCard,
  PoketraceCardDetail,
  PoketraceSet,
  PoketraceSetDetail,
  PoketraceAuthInfo,
  PoketracePriceHistoryEntry,
  PoketraceListing,
  PoketraceErrorResponse,
  PoketraceResponse,
  PoketracePaginatedResponse,
  GetCardsParams,
  GetSetsParams,
  GetPriceHistoryParams,
  GetListingsParams,
} from '../types/Poketrace';

// --- API Key Pool with sliding-window rate tracking ---

interface KeySlot {
  key: string;
  timestamps: number[]; // request timestamps within the current window
}

class ApiKeyPool {
  private slots: KeySlot[];
  private currentIndex: number = 0;
  private readonly windowMs: number;
  private readonly maxPerWindow: number;

  constructor(keys: string[], maxPerWindow: number, windowMs: number) {
    if (keys.length === 0) {
      throw new Error('POKETRACE_API_KEYS is not configured. Provide at least one API key.');
    }
    this.slots = keys.map(key => ({ key, timestamps: [] }));
    this.maxPerWindow = maxPerWindow;
    this.windowMs = windowMs;
    logger.info(`Poketrace API key pool initialized with ${keys.length} key(s), ${maxPerWindow} req/${windowMs}ms per key`);
  }

  /**
   * Get the next available API key using round-robin with rate awareness.
   * Prunes expired timestamps, skips exhausted keys, waits if all are exhausted.
   */
  async acquire(): Promise<string> {
    const now = Date.now();
    const startIndex = this.currentIndex;

    // Try each key starting from current index
    for (let i = 0; i < this.slots.length; i++) {
      const idx = (startIndex + i) % this.slots.length;
      const slot = this.slots[idx];

      // Prune timestamps outside the window
      slot.timestamps = slot.timestamps.filter(t => now - t < this.windowMs);

      if (slot.timestamps.length < this.maxPerWindow) {
        slot.timestamps.push(now);
        this.currentIndex = (idx + 1) % this.slots.length;
        return slot.key;
      }
    }

    // All keys exhausted — wait for the earliest slot to free up
    const earliestFree = Math.min(
      ...this.slots.map(s => s.timestamps[0] + this.windowMs)
    );
    const waitMs = earliestFree - now + 1;
    logger.warn(`All Poketrace API keys exhausted. Waiting ${waitMs}ms for rate limit reset.`);
    await new Promise(resolve => setTimeout(resolve, waitMs));
    return this.acquire();
  }

  /**
   * Mark a key as rate-limited from a 429 response (fill its window so it's skipped).
   */
  markRateLimited(key: string, retryAfterMs: number): void {
    const slot = this.slots.find(s => s.key === key);
    if (!slot) return;
    const now = Date.now();
    // Fill timestamps so this key is skipped until retryAfter elapses
    slot.timestamps = Array(this.maxPerWindow).fill(now + retryAfterMs - this.windowMs);
    logger.warn(`Poketrace key ...${key.slice(-6)} rate-limited, backing off ${retryAfterMs}ms`);
  }

  get size(): number {
    return this.slots.length;
  }

  getStats(): { total: number; available: number } {
    const now = Date.now();
    const available = this.slots.filter(s => {
      const active = s.timestamps.filter(t => now - t < this.windowMs);
      return active.length < this.maxPerWindow;
    }).length;
    return { total: this.slots.length, available };
  }
}

// --- Poketrace Client ---

const CACHE_TTL = 86400; // 24 hours

function buildCacheKey(path: string, params?: Record<string, unknown>): string {
  const sortedParams = params
    ? Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&')
    : '';
  return `poketrace:${path}${sortedParams ? ':' + sortedParams : ''}`;
}

class PoketraceClient {
  private pool: ApiKeyPool;
  private baseUrl: string;

  constructor() {
    const keys = config.poketrace.apiKeys
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    this.baseUrl = config.poketrace.baseUrl;
    this.pool = new ApiKeyPool(
      keys,
      config.poketrace.burstLimit,
      config.poketrace.burstWindowMs
    );
  }

  private createAxios(apiKey: string): AxiosInstance {
    return axios.create({
      baseURL: this.baseUrl,
      headers: { 'X-API-Key': apiKey },
      timeout: 15000,
    });
  }

  private buildUrl(path: string, params?: Record<string, unknown>): string {
    const queryString = params
      ? '?' + Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}=${v}`).join('&')
      : '';
    return `${this.baseUrl}${path}${queryString}`;
  }

  private async request<T>(method: 'get', path: string, params?: Record<string, unknown>): Promise<T> {
    const url = this.buildUrl(path, params);

    // Check cache first
    const cacheKey = buildCacheKey(path, params);
    const cached = await redisCache.get<T>(cacheKey);
    if (cached !== undefined) {
      console.log(`📡 GET ${url} (cached)`);
      return cached;
    }

    const apiKey = await this.pool.acquire();
    const client = this.createAxios(apiKey);

    try {
      console.log(`📡 GET ${url}`);
      const response = await client.get<T>(path, { params });

      const remaining = response.headers['x-ratelimit-remaining'];
      if (remaining !== undefined && Number(remaining) < 5) {
        logger.warn(`Poketrace key ...${apiKey.slice(-6)} has ${remaining} requests remaining`);
      }

      // Don't cache empty search results — they may be due to bad filters
      const data = response.data as any;
      const isEmpty = data?.data && Array.isArray(data.data) && data.data.length === 0;
      if (!isEmpty) {
        await redisCache.set(cacheKey, response.data, CACHE_TTL);
      }

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const status = error.response.status;
        const body = error.response.data as PoketraceErrorResponse;

        console.error(`❌ GET ${url} → ${status}:`, body.error || body);

        if (status === 429) {
          const retryAfter = (body.retryAfter ?? 10) * 1000;
          this.pool.markRateLimited(apiKey, retryAfter);
          return this.request(method, path, params);
        }

        throw new PoketraceApiError(
          body.error || `Poketrace API error (${status})`,
          status,
          body.code
        );
      }

      console.error(`❌ GET ${url} →`, error instanceof Error ? error.message : error);
      throw new PoketraceApiError(
        error instanceof Error ? error.message : 'Poketrace API request failed',
        500
      );
    }
  }

  // --- Health (no auth needed, but we still route through for consistency) ---

  async healthCheck(): Promise<{ status: string; timestamp: string; database: string }> {
    const response = await axios.get(`${this.baseUrl}/health`, { timeout: 5000 });
    return response.data;
  }

  // --- Auth ---

  async getAuthInfo(): Promise<PoketraceResponse<PoketraceAuthInfo>> {
    return this.request('get', '/auth/info');
  }

  // --- Cards ---

  async getCards(params?: GetCardsParams): Promise<PoketracePaginatedResponse<PoketraceCard>> {
    const withDefaults = { market: 'US' as const, ...params };
    return this.request('get', '/cards', withDefaults as Record<string, unknown>);
  }

  async getCard(id: string): Promise<PoketraceResponse<PoketraceCardDetail>> {
    return this.request('get', `/cards/${encodeURIComponent(id)}`);
  }

  async getCardPriceHistory(
    id: string,
    tier: string,
    params?: GetPriceHistoryParams
  ): Promise<PoketracePaginatedResponse<PoketracePriceHistoryEntry>> {
    return this.request(
      'get',
      `/cards/${encodeURIComponent(id)}/prices/${encodeURIComponent(tier)}/history`,
      params as Record<string, unknown>
    );
  }

  async getCardListings(
    id: string,
    params?: GetListingsParams
  ): Promise<PoketracePaginatedResponse<PoketraceListing>> {
    return this.request(
      'get',
      `/cards/${encodeURIComponent(id)}/listings`,
      params as Record<string, unknown>
    );
  }

  // --- Sets ---

  async getSets(params?: GetSetsParams): Promise<PoketracePaginatedResponse<PoketraceSet>> {
    return this.request('get', '/sets', params as Record<string, unknown>);
  }

  async getSet(slug: string): Promise<PoketraceResponse<PoketraceSetDetail>> {
    return this.request('get', `/sets/${encodeURIComponent(slug)}`);
  }

  // --- Pool stats (for health/debug endpoints) ---

  getPoolStats() {
    return this.pool.getStats();
  }
}

// --- Custom error class ---

export class PoketraceApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'PoketraceApiError';
  }
}

// Export singleton
export const poketraceClient = new PoketraceClient();
