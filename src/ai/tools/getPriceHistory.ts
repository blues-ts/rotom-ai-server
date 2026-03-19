import { tool } from 'ai'
import { z } from 'zod'
import { poketraceClient } from '../../utils/poketraceClient'

const parameters = z.object({
  cardId: z.string().describe('Poketrace card ID (from getCardPricing results)'),
  tier: z.string().describe('Price tier. Valid values: Raw conditions: NEAR_MINT, LIGHTLY_PLAYED, MODERATELY_PLAYED, HEAVILY_PLAYED, DAMAGED. Graded: PSA_10, PSA_9, PSA_8, PSA_7, PSA_6, PSA_5, PSA_4, PSA_3, PSA_2, PSA_1, BGS_10, BGS_9_5, BGS_9, BGS_8_5, BGS_8, CGC_10, CGC_9_5, CGC_9, CGC_8_5, CGC_8. Aggregated: AGGREGATED.'),
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

      // Sort oldest first to calculate day-over-day change
      const sorted = [...result.data].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )

      const entries = sorted.map((entry, i) => {
        const prevAvg = i > 0 ? sorted[i - 1].avg : null
        const change = prevAvg && entry.avg
          ? Math.round(((entry.avg - prevAvg) / prevAvg) * 1000) / 10
          : null

        return {
          date: entry.date,
          avg: entry.avg,
          low: entry.low,
          high: entry.high,
          saleCount: entry.saleCount,
          change, // day-over-day % change (e.g. +2.3, -7.0)
        }
      })

      // Return newest first for display
      entries.reverse()

      return {
        entries,
        totalEntries: result.pagination.count,
      }
    } catch (error) {
      return { error: `Price history failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
    }
  },
})
