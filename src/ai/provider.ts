import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { config } from '../config'

const google = createGoogleGenerativeAI({
  apiKey: config.ai.googleApiKey,
})

export function getModel() {
  return google(config.ai.model)
}
