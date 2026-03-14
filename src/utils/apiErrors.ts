/**
 * API Error codes and user-friendly messages
 * Maps internal errors to clean, professional responses
 */

export enum ErrorCode {
  // Client errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMITED = 'RATE_LIMITED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // Server errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // Domain-specific errors
  IMAGE_PROCESSING_FAILED = 'IMAGE_PROCESSING_FAILED',
  CARD_ANALYSIS_FAILED = 'CARD_ANALYSIS_FAILED',
  CARD_NOT_FOUND = 'CARD_NOT_FOUND',
  PRICING_FETCH_FAILED = 'PRICING_FETCH_FAILED',
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
  };
}

/**
 * User-friendly error messages for each error code
 */
const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.BAD_REQUEST]: 'Invalid request. Please check your input and try again.',
  [ErrorCode.UNAUTHORIZED]: 'Authentication required. Please sign in to continue.',
  [ErrorCode.FORBIDDEN]: 'You do not have permission to perform this action.',
  [ErrorCode.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCode.RATE_LIMITED]: 'Too many requests. Please wait a moment and try again.',
  [ErrorCode.VALIDATION_ERROR]: 'Invalid input. Please check your data and try again.',
  [ErrorCode.INTERNAL_ERROR]: 'Something went wrong. Please try again later.',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable. Please try again later.',
  [ErrorCode.IMAGE_PROCESSING_FAILED]: 'Unable to process the image. Please try a different image.',
  [ErrorCode.CARD_ANALYSIS_FAILED]: 'Unable to analyze the card. Please ensure the image is clear and try again.',
  [ErrorCode.CARD_NOT_FOUND]: 'Card not found in our database. Please verify the card details.',
  [ErrorCode.PRICING_FETCH_FAILED]: 'Unable to fetch pricing data. Please try again later.',
};

/**
 * HTTP status codes for each error code
 */
const ERROR_STATUS_CODES: Record<ErrorCode, number> = {
  [ErrorCode.BAD_REQUEST]: 400,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.RATE_LIMITED]: 429,
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.IMAGE_PROCESSING_FAILED]: 422,
  [ErrorCode.CARD_ANALYSIS_FAILED]: 422,
  [ErrorCode.CARD_NOT_FOUND]: 404,
  [ErrorCode.PRICING_FETCH_FAILED]: 503,
};

/**
 * Create a standardized API error response
 */
export function createErrorResponse(code: ErrorCode, customMessage?: string): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message: customMessage || ERROR_MESSAGES[code],
    },
  };
}

/**
 * Get the HTTP status code for an error code
 */
export function getStatusCode(code: ErrorCode): number {
  return ERROR_STATUS_CODES[code] || 500;
}

/**
 * Determine the appropriate error code from an error object
 */
export function classifyError(error: unknown): ErrorCode {
  if (!(error instanceof Error)) {
    return ErrorCode.INTERNAL_ERROR;
  }

  const message = error.message.toLowerCase();

  // Gemini/AI errors
  if (message.includes('gemini') || message.includes('generativeai') || message.includes('google')) {
    return ErrorCode.CARD_ANALYSIS_FAILED;
  }

  // Image processing errors
  if (message.includes('sharp') || message.includes('image') || message.includes('buffer')) {
    return ErrorCode.IMAGE_PROCESSING_FAILED;
  }

  // Card validation errors
  if (message.includes('card not found') || message.includes('no matching card')) {
    return ErrorCode.CARD_NOT_FOUND;
  }

  // Poketrace pricing errors
  if (message.includes('poketrace') || message.includes('fetch') || message.includes('network')) {
    return ErrorCode.PRICING_FETCH_FAILED;
  }

  // Rate limiting
  if (message.includes('rate limit') || message.includes('too many')) {
    return ErrorCode.RATE_LIMITED;
  }

  // Auth errors
  if (message.includes('unauthorized') || message.includes('authentication')) {
    return ErrorCode.UNAUTHORIZED;
  }

  return ErrorCode.INTERNAL_ERROR;
}

/**
 * Log error internally while returning clean message to user
 */
export function handleApiError(error: unknown, context: string): { code: ErrorCode; statusCode: number; response: ApiErrorResponse } {
  // Log the full error for debugging (server-side only)
  console.error(`[${context}]`, error);

  const code = classifyError(error);
  const statusCode = getStatusCode(code);
  const response = createErrorResponse(code);

  return { code, statusCode, response };
}
