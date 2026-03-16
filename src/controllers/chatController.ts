import type { Response } from 'express'
import { streamText, stepCountIs } from 'ai'
import type { AuthRequest } from '../middleware/clerkAuth'
import { getModel } from '../ai/provider'
import { SYSTEM_PROMPT } from '../ai/systemPrompt'
import { searchCard, getCardPricing, getPriceHistory, getSetInfo, analyzeMarket } from '../ai/tools'
import { config } from '../config'
import { logger } from '../utils/logger'

export async function streamChat(req: AuthRequest, res: Response) {
  try {
    const { messages } = req.body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' })
    }

    logger.info('Chat request received', {
      userId: req.userId,
      messageCount: messages.length,
      lastMessage: messages[messages.length - 1]?.content?.slice(0, 100),
    })

    const result = streamText({
      model: getModel(),
      system: SYSTEM_PROMPT,
      messages,
      tools: {
        searchCard,
        getCardPricing,
        getPriceHistory,
        getSetInfo,
        analyzeMarket,
      },
      stopWhen: stepCountIs(config.ai.maxSteps),
      maxOutputTokens: config.ai.maxTokens,
      onStepFinish: ({ toolResults }) => {
        if (toolResults && toolResults.length > 0) {
          for (const toolResult of toolResults) {
            const { toolName, args, result } = toolResult
            console.log(`\n🔧 Tool Call: ${toolName}`)
            console.log('  Args:', JSON.stringify(args, null, 2).replace(/\n/g, '\n  '))
            console.log('  Result:', JSON.stringify(result, null, 2).replace(/\n/g, '\n  '))
          }
        }
      },
      onFinish: ({ text, usage }) => {
        const inputTokens = usage.inputTokens || 0
        const outputTokens = usage.outputTokens || 0
        const totalTokens = inputTokens + outputTokens

        console.log('Gemini Chat Token Usage:', {
          inputTokens,
          outputTokens,
          totalTokens,
        })

        // Gemini 2.5 Flash: $0.15 per 1M input tokens, $3.50 per 1M output tokens
        const inputCost = (inputTokens / 1_000_000) * 0.15
        const outputCost = (outputTokens / 1_000_000) * 3.50
        const totalCost = inputCost + outputCost

        console.log('Estimated Cost:', {
          inputCost: `$${inputCost.toFixed(6)}`,
          outputCost: `$${outputCost.toFixed(6)}`,
          totalCost: `$${totalCost.toFixed(6)}`,
        })

        logger.info('Chat response completed', {
          userId: req.userId,
          inputTokens,
          outputTokens,
          totalTokens,
          estimatedCost: `$${totalCost.toFixed(6)}`,
        })
      },
    })

    result.pipeTextStreamToResponse(res)
  } catch (error) {
    logger.error('Chat stream error:', error)

    // If headers haven't been sent yet, return JSON error
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Failed to process chat request',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}
