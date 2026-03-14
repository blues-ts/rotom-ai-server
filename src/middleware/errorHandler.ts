import type { Request, Response, NextFunction } from "express";
import { handleApiError } from "../utils/apiErrors";

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
    const { statusCode, response } = handleApiError(err, 'globalErrorHandler');
    res.status(statusCode).json(response);
}
