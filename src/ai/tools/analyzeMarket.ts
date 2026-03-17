import { tool } from 'ai'
import { z } from 'zod'
import { poketraceClient } from '../../utils/poketraceClient'
import type { PoketraceCardDetail, PoketracePriceHistoryEntry, PoketraceTierPrice } from '../../types/Poketrace'

interface PriceIntelligence {
  fairValue: number | null
  volatility: number | null
  change30d: number | null
  spreadAvgMedian: number | null
  sources: Record<string, { avg: number; saleCount: number }>
}

interface GradeSpread {
  raw: number | null
  psa9: number | null
  psa10: number | null
  psa9Premium: number | null
  psa10Premium: number | null
  gradingCost: number
  estimatedProfit9: number | null
  estimatedProfit10: number | null
  estimatedRoiPercent9: number | null
  estimatedRoiPercent10: number | null
  recommendation: string
}

interface Liquidity {
  totalSaleCount: number
  salesPerWeek: number | null
  daysSinceLastSale: number | null
  score: number
  assessment: string
}

interface Momentum {
  change7d: number | null
  change30d: number | null
  change90d: number | null
  rating: string
}

function extractTierPrice(card: PoketraceCardDetail, tier: string): PoketraceTierPrice | null {
  for (const source of ['tcgplayer', 'ebay'] as const) {
    const sourceData = card.prices[source]
    if (sourceData && sourceData[tier]) {
      return sourceData[tier]
    }
  }
  return null
}

function computeVolatility(entries: PoketracePriceHistoryEntry[]): number | null {
  const prices = entries.filter((e) => e.avg > 0).map((e) => e.avg)
  if (prices.length < 3) return null
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length
  const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length
  return Math.round((Math.sqrt(variance) / mean) * 100) / 100 // coefficient of variation
}

function computeChange(entries: PoketracePriceHistoryEntry[]): number | null {
  const sorted = entries.filter((e) => e.avg > 0).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  if (sorted.length < 2) return null
  const oldest = sorted[0].avg
  const newest = sorted[sorted.length - 1].avg
  if (oldest === 0) return null
  return Math.round(((newest - oldest) / oldest) * 10000) / 100 // percentage
}

function assessLiquidity(totalSales: number, daysSinceLast: number | null): { score: number; assessment: string } {
  let score = 0
  if (totalSales >= 50) score += 4
  else if (totalSales >= 20) score += 3
  else if (totalSales >= 5) score += 2
  else if (totalSales >= 1) score += 1

  if (daysSinceLast !== null) {
    if (daysSinceLast <= 3) score += 3
    else if (daysSinceLast <= 7) score += 2
    else if (daysSinceLast <= 14) score += 1
  }

  // Cap at 10
  score = Math.min(score, 10)

  let assessment: string
  if (score >= 7) assessment = 'High liquidity — easy to buy and sell'
  else if (score >= 4) assessment = 'Moderate liquidity — reasonable market activity'
  else assessment = 'Low liquidity — may be difficult to trade at fair value'

  return { score, assessment }
}

function assessMomentum(c7d: number | null, c30d: number | null, c90d: number | null): string {
  const values = [c7d, c30d, c90d].filter((v): v is number => v !== null)
  if (values.length === 0) return 'Insufficient data'

  const avg = values.reduce((a, b) => a + b, 0) / values.length
  if (avg > 15) return 'Strong Buy'
  if (avg > 5) return 'Buy'
  if (avg > -5) return 'Neutral'
  if (avg > -15) return 'Sell'
  return 'Strong Sell'
}

export const analyzeMarket = tool({
  description:
    'Run a comprehensive market analysis on a card. Computes price intelligence (fair value, volatility, 30d change), grade spread (Raw vs PSA 9 vs PSA 10, ROI, grading recommendation), liquidity (sales frequency, score), and momentum (7d/30d/90d trends). Requires a Poketrace card ID (from getCardPricing results).',
  inputSchema: z.object({
    cardId: z.string().describe('Poketrace card ID (from getCardPricing results)'),
  }),
  execute: async ({ cardId }: { cardId: string }) => {
    try {
      // Fetch all data in parallel
      const [cardResult, history30d, history90d] = await Promise.all([
        poketraceClient.getCard(cardId),
        poketraceClient.getCardPriceHistory(cardId, 'NEAR_MINT', { period: '30d', limit: 20 }).catch(() => null),
        poketraceClient.getCardPriceHistory(cardId, 'NEAR_MINT', { period: '90d', limit: 20 }).catch(() => null),
      ])

      const card = cardResult.data
      const entries30d = history30d?.data ?? []
      const entries90d = history90d?.data ?? []
      // 7d is the first 7 entries of 30d sorted by date
      const entries7d = entries30d
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 7)

      // --- Price Intelligence ---
      const sources: Record<string, { avg: number; saleCount: number }> = {}
      for (const source of ['tcgplayer', 'ebay'] as const) {
        const sourceData = card.prices[source]
        if (!sourceData) continue
        const tier = (sourceData as Record<string, PoketraceTierPrice>)['NEAR_MINT']
        if (tier) {
          sources[source] = { avg: tier.avg, saleCount: tier.saleCount ?? 0 }
        }
      }

      const nearMint = extractTierPrice(card, 'NEAR_MINT')
      const priceIntelligence: PriceIntelligence = {
        fairValue: nearMint?.avg ?? null,
        volatility: computeVolatility(entries30d),
        change30d: computeChange(entries30d),
        spreadAvgMedian: nearMint && nearMint.median30d ? Math.round((nearMint.avg - nearMint.median30d) * 100) / 100 : null,
        sources,
      }

      // --- Grade Spread ---
      const rawPrice = nearMint?.avg ?? null
      const psa9Price = extractTierPrice(card, 'PSA_9')?.avg ?? null
      const psa10Price = extractTierPrice(card, 'PSA_10')?.avg ?? null
      const gradingCost = 25 // approximate PSA grading cost

      const gradeSpread: GradeSpread = {
        raw: rawPrice,
        psa9: psa9Price,
        psa10: psa10Price,
        psa9Premium: rawPrice && psa9Price ? Math.round(((psa9Price - rawPrice) / rawPrice) * 100) : null,
        psa10Premium: rawPrice && psa10Price ? Math.round(((psa10Price - rawPrice) / rawPrice) * 100) : null,
        gradingCost,
        estimatedProfit9: rawPrice && psa9Price ? Math.round((psa9Price - rawPrice - gradingCost) * 100) / 100 : null,
        estimatedProfit10: rawPrice && psa10Price ? Math.round((psa10Price - rawPrice - gradingCost) * 100) / 100 : null,
        estimatedRoiPercent9: rawPrice && psa9Price ? Math.round(((psa9Price - rawPrice - gradingCost) / (rawPrice + gradingCost)) * 10000) / 100 : null,
        estimatedRoiPercent10: rawPrice && psa10Price ? Math.round(((psa10Price - rawPrice - gradingCost) / (rawPrice + gradingCost)) * 10000) / 100 : null,
        recommendation:
          rawPrice && psa10Price && psa10Price - rawPrice - gradingCost > rawPrice * 0.3
            ? 'Grade — significant upside potential'
            : rawPrice && psa9Price && psa9Price - rawPrice - gradingCost > rawPrice * 0.2
              ? 'Grade if likely PSA 9+ — moderate upside'
              : 'Sell raw — grading premium insufficient',
      }

      // --- Liquidity ---
      const totalSaleCount = card.totalSaleCount ?? nearMint?.saleCount ?? 0
      const lastUpdated = card.lastUpdated
      const daysSinceLastSale = lastUpdated
        ? Math.round((Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24))
        : null
      const salesPerWeek = entries30d.length > 0
        ? Math.round((entries30d.reduce((sum, e) => sum + (e.saleCount ?? 0), 0) / 30) * 7 * 100) / 100
        : null

      const { score: liquidityScore, assessment: liquidityAssessment } = assessLiquidity(totalSaleCount, daysSinceLastSale)

      const liquidity: Liquidity = {
        totalSaleCount,
        salesPerWeek,
        daysSinceLastSale,
        score: liquidityScore,
        assessment: liquidityAssessment,
      }

      // --- Momentum ---
      const change7d = computeChange(entries7d)
      const change30d = priceIntelligence.change30d
      const change90d = computeChange(entries90d)

      const momentum: Momentum = {
        change7d,
        change30d,
        change90d,
        rating: assessMomentum(change7d, change30d, change90d),
      }

      return {
        cardId,
        cardName: card.name,
        set: card.set,
        priceIntelligence,
        gradeSpread,
        liquidity,
        momentum,
      }
    } catch (error) {
      return { error: `Market analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
    }
  },
})
