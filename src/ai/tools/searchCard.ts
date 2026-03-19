import { tool } from 'ai'
import { z } from 'zod'
import { poketraceClient } from '../../utils/poketraceClient'
import { getSlugsForSet } from '../setSlugs'

const parameters = z.object({
  query: z.string().optional().describe('Card name or search term (e.g. "Charizard", "Pikachu VMAX"). Include card number in the query if needed (e.g. "Mew ex 232"). Optional — omit to browse by set or rarity.'),
  set: z.string().optional().describe('Filter by set name. Use the exact set names from the system prompt reference (e.g. "Paldean Fates", "Brilliant Stars"). The tool automatically queries all slug variations for the set.'),
  rarity: z.string().optional().describe('Filter by rarity'),
  limit: z.number().optional().default(10).describe('Max results to return (default 10, max 20)'),
  sortByPrice: z.enum(['desc', 'asc']).optional().describe('Sort results by price. Use "desc" for most expensive first, "asc" for cheapest first. When set, fetches ALL cards in the set and sorts by price.'),
})

/**
 * Extract a single representative price from the prices object
 */
function summarizePrice(prices: any): { avgPrice: number | null; source: string | null } {
  for (const source of ['tcgplayer', 'ebay']) {
    const sourceData = prices?.[source]
    if (!sourceData) continue
    // Try NEAR_MINT first, then AGGREGATED, then first available tier
    const tier = sourceData['NEAR_MINT'] || sourceData['AGGREGATED'] || Object.values(sourceData)[0] as any
    if (tier?.avg) {
      return { avgPrice: tier.avg, source }
    }
  }
  return { avgPrice: null, source: null }
}

/**
 * Check if an item is an actual card (not sealed product).
 * Real cards have a cardNumber with a "/" (e.g. "25/102", "TG01/TG30").
 */
function isActualCard(card: any): boolean {
  return card.cardNumber && card.cardNumber.includes('/')
}

export const searchCard = tool({
  description:
    'Search for Pokemon cards by name, set, card number, or rarity. Returns matching cards with a summary price. Use getCardPricing for full price detail.',
  inputSchema: parameters,
  execute: async (args: z.infer<typeof parameters>) => {
    try {
      const returnLimit = Math.min(args.limit ?? 10, 20)
      const setSlugs = args.set ? getSlugsForSet(args.set) : []

      if (args.sortByPrice && setSlugs.length > 0) {
        const allCards: any[] = []
        const PAGE_SIZE = 100

        // Fetch all cards from all slug variations for this set
        for (const setSlug of setSlugs) {
          let cursor: string | undefined
          do {
            const page = await poketraceClient.getCards({
              ...(args.query ? { search: args.query } : {}),
              set: setSlug,
              ...(args.rarity ? { rarity: args.rarity } : {}),
              limit: PAGE_SIZE,
              ...(cursor ? { cursor } : {}),
            })
            allCards.push(...page.data)
            cursor = page.pagination.hasMore && page.pagination.nextCursor
              ? page.pagination.nextCursor
              : undefined
          } while (cursor)
        }

        // Deduplicate cards by ID (different slugs may return the same card)
        const uniqueCards = new Map<string, any>()
        for (const card of allCards) {
          if (!uniqueCards.has(card.id)) {
            uniqueCards.set(card.id, card)
          }
        }

        // Sort by price (exclude sealed products)
        const sorted = [...uniqueCards.values()]
          .filter(isActualCard)
          .map((card) => {
            const { avgPrice, source } = summarizePrice(card.prices)
            return { card, avgPrice, source }
          })
          .filter((c) => c.avgPrice !== null)
          .sort((a, b) =>
            args.sortByPrice === 'desc'
              ? (b.avgPrice ?? 0) - (a.avgPrice ?? 0)
              : (a.avgPrice ?? 0) - (b.avgPrice ?? 0)
          )
          .slice(0, returnLimit)

        return sorted.map(({ card, avgPrice, source }) => ({
          id: card.id,
          name: card.name,
          cardNumber: card.cardNumber,
          set: card.set,
          variant: card.variant,
          rarity: card.rarity,
          image: card.image,
          currency: card.currency,
          avgPrice,
          priceSource: source,
          lastUpdated: card.lastUpdated,
        }))
      }

      // Default: simple search without sorting
      // Use the first slug if a set was provided, otherwise no set filter
      const result = await poketraceClient.getCards({
        ...(args.query ? { search: args.query } : {}),
        ...(setSlugs.length > 0 ? { set: setSlugs[0] } : {}),
        ...(args.rarity ? { rarity: args.rarity } : {}),
        limit: returnLimit,
      })

      return result.data.filter(isActualCard).map((card) => {
        const { avgPrice, source } = summarizePrice(card.prices)
        return {
          id: card.id,
          name: card.name,
          cardNumber: card.cardNumber,
          set: card.set,
          variant: card.variant,
          rarity: card.rarity,
          image: card.image,
          currency: card.currency,
          avgPrice,
          priceSource: source,
          lastUpdated: card.lastUpdated,
        }
      })
    } catch (error) {
      return { error: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
    }
  },
})
