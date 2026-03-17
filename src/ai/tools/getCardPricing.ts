import { tool } from 'ai'
import { z } from 'zod'
import { poketraceClient } from '../../utils/poketraceClient'

const parameters = z.object({
  cardId: z.string().describe('Poketrace card ID (from searchCard results)'),
})

/**
 * Extract key price tiers from the full prices object to reduce token usage
 */
function summarizePrices(prices: any): Record<string, any> {
  const summary: Record<string, any> = {}

  for (const source of ['tcgplayer', 'ebay']) {
    const sourceData = prices?.[source]
    if (!sourceData) continue

    const tiers: Record<string, any> = {}
    for (const [tier, data] of Object.entries(sourceData) as [string, any][]) {
      if (data?.avg) {
        tiers[tier] = {
          avg: data.avg,
          low: data.low,
          high: data.high,
          saleCount: data.saleCount,
          median30d: data.median30d,
        }
      }
    }
    if (Object.keys(tiers).length > 0) {
      summary[source] = tiers
    }
  }

  return summary
}

export const getCardPricing = tool({
  description:
    'Get detailed current market pricing for a specific card across eBay, TCGPlayer, and Cardmarket. Includes prices by condition (Raw, PSA grades, etc) and sale counts. Requires a Poketrace card ID (from searchCard results).',
  inputSchema: parameters,
  execute: async (args: z.infer<typeof parameters>) => {
    try {
      const detail = await poketraceClient.getCard(args.cardId)
      const card = detail.data

      return {
        id: card.id,
        name: card.name,
        cardNumber: card.cardNumber,
        set: card.set,
        rarity: card.rarity,
        image: card.image,
        currency: card.currency,
        prices: summarizePrices(card.prices),
        topPrice: card.topPrice,
        totalSaleCount: card.totalSaleCount,
        hasGraded: card.hasGraded,
        lastUpdated: card.lastUpdated,
      }
    } catch (error) {
      return { error: `Pricing lookup failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
    }
  },
})
