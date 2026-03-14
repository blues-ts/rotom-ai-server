import { tool } from 'ai'
import { z } from 'zod'
import { poketraceClient } from '../../utils/poketraceClient'

const parameters = z.object({
  cardId: z.string().describe('Poketrace card ID (from getCardPricing results)'),
  tier: z.string().describe('Grade/condition tier (e.g. "NEAR_MINT", "PSA_10", "PSA_9", "RAW")'),
  period: z
    .enum(['7d', '30d', '90d', '1y', 'all'])
    .optional()
    .default('30d')
    .describe('Time period for history (default 30d)'),
})

export const getPriceHistory = tool({
  description:
    'Get historical price data for a specific card and grade tier. Use this to analyze price trends over time. Requires a Poketrace card ID (from getCardPricing results).',
  inputSchema: parameters,
  execute: async (args: z.infer<typeof parameters>) => {
    try {
      const result = await poketraceClient.getCardPriceHistory(args.cardId, args.tier, {
        period: args.period,
        limit: 20,
      })

      return {
        entries: result.data.map((entry) => ({
          date: entry.date,
          avg: entry.avg,
          low: entry.low,
          high: entry.high,
          saleCount: entry.saleCount,
        })),
        totalEntries: result.pagination.count,
      }
    } catch (error) {
      return { error: `Price history failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
    }
  },
})
