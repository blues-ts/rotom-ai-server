import Redis, { type RedisOptions } from 'ioredis'
import NodeCache from 'node-cache'
import { config } from '../config'

/**
 * Redis cache wrapper that maintains NodeCache-compatible API
 * Falls back to NodeCache if Redis is unavailable
 */
class RedisCache {
  private redis: Redis | null = null
  private fallbackCache: NodeCache
  private useRedis: boolean = false
  private defaultTTL: number

  constructor(defaultTTL: number = 86400) {
    this.defaultTTL = defaultTTL
    this.fallbackCache = new NodeCache({
      stdTTL: defaultTTL,
      checkperiod: 600,
      useClones: false
    })

    this.initializeRedis()
  }

  /**
   * Initialize Redis connection
   */
  private async initializeRedis(): Promise<void> {
    // Skip Redis initialization if REDIS_HOST is explicitly set to empty or 'disabled'
    if (!process.env.REDIS_HOST || process.env.REDIS_HOST === 'disabled') {
      console.log('[Redis] Redis disabled via REDIS_HOST environment variable, using NodeCache')
      this.useRedis = false
      return
    }

    const redisOptions: RedisOptions = {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
      connectTimeout: 5000, // 5 second connection timeout
      retryStrategy: (times) => {
        // Stop retrying after 5 attempts
        if (times > 5) {
          console.warn('[Redis] Max retry attempts reached, falling back to NodeCache')
          this.useRedis = false
          return null // Stop retrying
        }
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      lazyConnect: true,
      // Disable automatic reconnection on initial failure
      enableOfflineQueue: false
    }

    try {
      this.redis = new Redis(redisOptions)

      // Set up ALL event handlers BEFORE attempting to connect
      this.redis.on('error', (error) => {
        // Only log if we're not already using fallback
        if (this.useRedis) {
          console.error('[Redis] Connection error:', error instanceof Error ? error.message : error)
        }
        this.useRedis = false
      })

      this.redis.on('close', () => {
        if (this.useRedis) {
          console.warn('[Redis] Connection closed, falling back to NodeCache')
        }
        this.useRedis = false
      })

      this.redis.on('reconnecting', () => {
        console.log('[Redis] Reconnecting...')
      })

      this.redis.on('ready', () => {
        console.log(`[Redis] Connected to ${config.redis.host}:${config.redis.port}`)
        this.useRedis = true
      })

      this.redis.on('end', () => {
        console.warn('[Redis] Connection ended')
        this.useRedis = false
      })

      // Attempt connection with timeout
      try {
        await Promise.race([
          this.redis.connect(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Connection timeout')), 5000)
          )
        ])

        // Test connection with ping
        await Promise.race([
          this.redis.ping(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Ping timeout')), 3000)
          )
        ])

        this.useRedis = true
        console.log(`[Redis] Successfully connected to ${config.redis.host}:${config.redis.port}`)
      } catch (connectError) {
        // Connection failed, but Redis instance is still created
        // We'll use fallback and let the error handlers manage reconnection attempts
        console.warn('[Redis] Initial connection failed, using NodeCache fallback:',
          connectError instanceof Error ? connectError.message : 'Unknown error')
        this.useRedis = false

        // Destroy the client to prevent background retry attempts
        try { this.redis?.disconnect(); } catch {}
        this.redis = null
      }
    } catch (error) {
      // If Redis creation itself fails, clean up and use fallback
      console.warn('[Redis] Failed to initialize, using NodeCache fallback:',
        error instanceof Error ? error.message : 'Unknown error')
      this.useRedis = false
      this.redis = null
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | undefined> {
    if (this.useRedis && this.redis && this.redis.status === 'ready') {
      try {
        const value = await this.redis.get(key)
        if (value === null) {
          return undefined
        }
        return JSON.parse(value) as T
      } catch (error) {
        // Silently fall back to NodeCache on error
        this.useRedis = false
        return this.fallbackCache.get<T>(key)
      }
    }

    return this.fallbackCache.get<T>(key)
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    const ttl = ttlSeconds ?? this.defaultTTL

    if (this.useRedis && this.redis && this.redis.status === 'ready') {
      try {
        const serialized = JSON.stringify(value)
        await this.redis.setex(key, ttl, serialized)
        return true
      } catch (error) {
        // Silently fall back to NodeCache on error
        this.useRedis = false
        return this.fallbackCache.set(key, value, ttl)
      }
    }

    return this.fallbackCache.set(key, value, ttl)
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<number> {
    if (this.useRedis && this.redis) {
      try {
        const result = await this.redis.del(key)
        return result
      } catch (error) {
        console.error('[Redis] Delete error, falling back to NodeCache:', error)
        this.useRedis = false
        return this.fallbackCache.del(key) ? 1 : 0
      }
    }

    return this.fallbackCache.del(key) ? 1 : 0
  }

  /**
   * Get all keys
   */
  async keys(): Promise<string[]> {
    if (this.useRedis && this.redis) {
      try {
        const keys = await this.redis.keys('*')
        return keys
      } catch (error) {
        console.error('[Redis] Keys error, falling back to NodeCache:', error)
        this.useRedis = false
        return this.fallbackCache.keys()
      }
    }

    return this.fallbackCache.keys()
  }

  /**
   * Flush all cache
   */
  async flushAll(): Promise<void> {
    if (this.useRedis && this.redis) {
      try {
        await this.redis.flushdb()
      } catch (error) {
        console.error('[Redis] Flush error, falling back to NodeCache:', error)
        this.useRedis = false
        this.fallbackCache.flushAll()
      }
    } else {
      this.fallbackCache.flushAll()
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    if (this.useRedis && this.redis) {
      // Redis doesn't provide built-in stats like NodeCache
      // We'll need to track these separately or use fallback stats
      return {
        hits: 0, // Would need to track separately
        misses: 0, // Would need to track separately
        ksize: 0,
        vsize: 0
      }
    }

    return this.fallbackCache.getStats()
  }

  /**
   * Check if Redis is connected
   */
  isRedisConnected(): boolean {
    try {
      return this.useRedis && this.redis !== null && this.redis.status === 'ready'
    } catch (error) {
      return false
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.redis) {
      try {
        await this.redis.quit()
      } catch (error) {
        console.error('[Redis] Error disconnecting:', error)
      }
      this.redis = null
      this.useRedis = false
    }
  }
}

// Export singleton instance
export const redisCache = new RedisCache(24 * 60 * 60) // 24 hours default TTL
