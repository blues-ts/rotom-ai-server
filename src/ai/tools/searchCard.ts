import { tool } from 'ai'
import { z } from 'zod'
import { poketraceClient } from '../../utils/poketraceClient'

const parameters = z.object({
  query: z.string().optional().describe('Card name or search term (e.g. "Charizard", "Pikachu VMAX"). Optional — omit to browse by set or rarity.'),
  set: z.string().optional().describe('Filter by set slug (e.g. "base-set", "paldean-fates", "scarlet-violet-151"). Use this alone (without query) to list cards in a set.'),
  cardNumber: z.string().optional().describe('Filter by card number (e.g. "4/102")'),
  rarity: z.string().optional().describe('Filter by rarity'),
  limit: z.number().optional().default(10).describe('Max results to return (default 10, max 20)'),
})

/**
 * Extract a single representative price from the prices object
 */
function summarizePrice(prices: any): { avgPrice: number | null; source: string | null } {
  for (const source of ['ebay', 'tcgplayer', 'cardmarket']) {
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

export const searchCard = tool({
  description:
    'Search for Pokemon cards by name, set, card number, or rarity. Returns matching cards with a summary price. Use getCardPricing for full price detail.',
  inputSchema: parameters,
  execute: async (args: z.infer<typeof parameters>) => {
    try {
      const result = await poketraceClient.getCards({
        ...(args.query ? { search: args.query } : {}),
        set: args.set,
        card_number: args.cardNumber,
        rarity: args.rarity,
        limit: Math.min(args.limit ?? 10, 20),
      })

      return result.data.map((card) => {
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
