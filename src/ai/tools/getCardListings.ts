import { tool } from 'ai'
import { z } from 'zod'
import { poketraceClient } from '../../utils/poketraceClient'

const parameters = z.object({
  cardId: z.string().describe('Poketrace card ID (from getCardPricing results)'),
  grader: z.string().optional().describe('Filter by grading company (e.g. "PSA", "CGC", "BGS")'),
  grade: z.string().optional().describe('Filter by grade (e.g. "10", "9")'),
  limit: z.number().optional().default(10).describe('Max listings to return (default 10)'),
  sort: z
    .enum(['sold_at_desc', 'sold_at_asc', 'price_desc', 'price_asc'])
    .optional()
    .default('sold_at_desc')
    .describe('Sort order (default: most recent first)'),
})

export const getCardListings = tool({
  description:
    'Get recent sold eBay listings for a card. Useful for verifying real transaction prices and assessing liquidity. Requires a Poketrace card ID (from getCardPricing results). Scale plan only.',
  inputSchema: parameters,
  execute: async (args: z.infer<typeof parameters>) => {
    try {
      const result = await poketraceClient.getCardListings(args.cardId, {
        grader: args.grader,
        grade: args.grade,
        limit: args.limit,
        sort: args.sort,
      })

      return {
        listings: result.data.map((listing) => ({
          title: listing.title,
          price: listing.price,
          currency: listing.currency,
          condition: listing.condition,
          grader: listing.grader,
          grade: listing.grade,
          soldAt: listing.soldAt,
          anomalyFlag: listing.anomalyFlag,
        })),
        totalCount: result.pagination.count,
      }
    } catch (error) {
      return { error: `Listings lookup failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
    }
  },
})
