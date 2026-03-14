import { tool } from 'ai'
import { z } from 'zod'
import { poketraceClient } from '../../utils/poketraceClient'

const parameters = z.object({
  setSlug: z.string().optional().describe('Poketrace set slug (e.g. "base-set")'),
  search: z.string().optional().describe('Search for a set by name'),
})

export const getSetInfo = tool({
  description:
    'Get information about a Pokemon TCG set. Can look up by Poketrace set slug or search by name. Returns set details including card count and release date.',
  inputSchema: parameters,
  execute: async (args: z.infer<typeof parameters>) => {
    try {
      if (args.setSlug) {
        const result = await poketraceClient.getSet(args.setSlug)
        return {
          source: 'poketrace' as const,
          slug: result.data.slug,
          name: result.data.name,
          releaseDate: result.data.releaseDate,
          cardCount: result.data.cardCount,
        }
      }

      if (args.search) {
        const result = await poketraceClient.getSets({ search: args.search, limit: 5 })
        return {
          source: 'poketrace_search' as const,
          sets: result.data.map((s) => ({
            slug: s.slug,
            name: s.name,
            releaseDate: s.releaseDate,
            cardCount: s.cardCount,
          })),
        }
      }

      return { error: 'Provide at least one of: setSlug or search' }
    } catch (error) {
      return { error: `Set lookup failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
    }
  },
})
