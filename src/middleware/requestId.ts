import { v4 as uuidv4 } from 'uuid'
import type { Request, Response, NextFunction } from 'express'

/**
 * Request ID middleware
 * Adds a unique request ID to each request for distributed tracing
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = req.headers['x-request-id'] as string || uuidv4()

  // Add to request object for use in controllers/services
  ;(req as any).id = requestId

  // Add to response headers
  res.setHeader('X-Request-ID', requestId)

  next()
}
