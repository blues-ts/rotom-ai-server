/**
 * Centralized configuration management
 * Validates and provides type-safe access to environment variables
 */

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001'),

  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '86400'), // 24 hours
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || '10000')
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info'
  },

  poketrace: {
    apiKeys: process.env.POKETRACE_API_KEYS || '',
    baseUrl: process.env.POKETRACE_BASE_URL || 'https://api.poketrace.com/v1',
    burstLimit: parseInt(process.env.POKETRACE_BURST_LIMIT || '30'),
    burstWindowMs: parseInt(process.env.POKETRACE_BURST_WINDOW_MS || '10000'),
  },

  ai: {
    googleApiKey: process.env.GOOGLE_GENAI_API_KEY || '',
    model: process.env.AI_MODEL || 'gemini-2.5-flash',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '4096'),
    maxSteps: parseInt(process.env.AI_MAX_STEPS || '10'),
  }
} as const

// Validate critical configuration
if (config.nodeEnv === 'production') {
  if (!config.redis.password && config.redis.host !== 'localhost') {
    console.warn('WARNING: Redis password not set in production environment')
  }
}
