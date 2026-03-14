import type { Request, Response } from "express";
import { redisCache } from "../utils/redisCache";
import { logger } from "../utils/logger";

export async function healthCheck(req: Request, res: Response) {
    logger.info('[GET /health] Health check requested');

    const health: any = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0'
    };

    // Check Redis connectivity
    try {
        const redisConnected = redisCache.isRedisConnected();
        health.redis = redisConnected ? 'connected' : 'disconnected';
        if (!redisConnected) {
            health.status = 'degraded';
        }
    } catch (error) {
        health.redis = 'error';
        health.status = 'degraded';
    }

    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
}

/**
 * Readiness probe for Kubernetes
 * Checks if the service is ready to accept traffic
 */
export async function readinessCheck(req: Request, res: Response) {
    const ready = {
        ready: true,
        checks: {
            redis: false,
        }
    };

    // Check Redis
    ready.checks.redis = redisCache.isRedisConnected();
    ready.ready = ready.checks.redis;

    const statusCode = ready.ready ? 200 : 503;
    res.status(statusCode).json(ready);
}

/**
 * Liveness probe for Kubernetes
 * Checks if the service is alive
 */
export function livenessCheck(req: Request, res: Response) {
    res.status(200).json({ alive: true });
}
