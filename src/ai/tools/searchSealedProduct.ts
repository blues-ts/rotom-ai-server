import { tool } from 'ai'
import { z } from 'zod'
import { poketraceClient } from '../../utils/poketraceClient'
import { getSlugsForSet } from '../setSlugs'

const PRODUCT_SET_SLUGS = [
  'scarlet-violet-products',
  'pokemon-products',
]

const parameters = z.object({
  query: z.string().optional().describe('Search term for sealed products (e.g. "booster box", "elite trainer box", "booster bundle"). Optional — omit to browse all sealed products for a set.'),
  set: z.string().optional().describe('Filter by set name (e.g. "Paldean Fates", "Brilliant Stars"). Searches both the set\'s slug variations and the general product set slugs.'),
  limit: z.number().optional().default(10).describe('Max results to return (default 10, max 20)'),
  sortByPrice: z.enum(['desc', 'asc']).optional().describe('Sort results by price. Use "desc" for most expensive first, "asc" for cheapest first.'),
})

function summarizePrice(prices: any): { avgPrice: number | null; source: string | null } {
  for (const source of ['tcgplayer', 'ebay']) {
    const sourceData = prices?.[source]
    if (!sourceData) continue
    const tier = sourceData['AGGREGATED'] || sourceData['NEAR_MINT'] || Object.values(sourceData)[0] as any
    if (tier?.avg) {
      return { avgPrice: tier.avg, source }
    }
  }
  return { avgPrice: null, source: null }
}

function isSealedProduct(item: any): boolean {
  return !item.cardNumber || !item.cardNumber.includes('/')
}

export const searchSealedProduct = tool({
  description:
    'Search for sealed Pokemon TCG products (booster boxes, ETBs, booster bundles, collection boxes, tins, etc.). Returns matching products with pricing. Use this instead of searchCard when the user asks about sealed product pricing.',
  inputSchema: parameters,
  execute: async (args: z.infer<typeof parameters>) => {
    try {
      const returnLimit = Math.min(args.limit ?? 10, 20)

      // Build list of slugs to search
      const slugsToSearch: string[] = [...PRODUCT_SET_SLUGS]
      if (args.set) {
        const setSlugs = getSlugsForSet(args.set)
        slugsToSearch.push(...setSlugs)
      }

      // Deduplicate slugs
      const uniqueSlugs = [...new Set(slugsToSearch)]

      const allProducts: any[] = []

      for (const slug of uniqueSlugs) {
        const result = await poketraceClient.getCards({
          ...(args.query ? { search: args.query } : {}),
          set: slug,
          limit: 100,
        })
        allProducts.push(...result.data)
      }

      // Deduplicate by ID
      const uniqueProducts = new Map<string, any>()
      for (const product of allProducts) {
        if (isSealedProduct(product) && !uniqueProducts.has(product.id)) {
          uniqueProducts.set(product.id, product)
        }
      }

      let results = [...uniqueProducts.values()].map((product) => {
        const { avgPrice, source } = summarizePrice(product.prices)
        return { product, avgPrice, source }
      })

      // Filter to only products with prices if sorting
      if (args.sortByPrice) {
        results = results
          .filter((r) => r.avgPrice !== null)
          .sort((a, b) =>
            args.sortByPrice === 'desc'
              ? (b.avgPrice ?? 0) - (a.avgPrice ?? 0)
              : (a.avgPrice ?? 0) - (b.avgPrice ?? 0)
          )
      }

      return results.slice(0, returnLimit).map(({ product, avgPrice, source }) => ({
        id: product.id,
        name: product.name,
        set: product.set,
        image: product.image,
        currency: product.currency,
        avgPrice,
        priceSource: source,
        lastUpdated: product.lastUpdated,
      }))
    } catch (error) {
      return { error: `Sealed product search failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
    }
  },
})
