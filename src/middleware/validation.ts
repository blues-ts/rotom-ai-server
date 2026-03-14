import type { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

/**
 * Sanitize card name - remove potentially dangerous characters
 */
function sanitizeCardName(cardName: string): string {
  // Remove null bytes and control characters
  return cardName
    .replace(/\0/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim()
    .slice(0, 200) // Max length
}

/**
 * Validate card number format
 */
function validateCardNumber(cardNumber: string): boolean {
  // Card numbers can be formats like: "25", "25/102", "001/185", "H01/H32"
  // Allow alphanumeric with optional "/" separator
  return /^[A-Za-z0-9]+(\/[A-Za-z0-9]+)?$/.test(cardNumber) && cardNumber.length <= 20
}

/**
 * Input validation middleware for analyze card endpoint
 */
export function validateAnalyzeCardInput(req: Request, res: Response, next: NextFunction) {
  const { imageBase64, testImage, cardName, cardNumber } = req.body

  // Validate imageBase64 or testImage is provided
  if (!imageBase64 && !testImage) {
    return res.status(400).json({
      error: 'imageBase64 or testImage is required'
    })
  }

  // If cardName and cardNumber are provided (for direct scraping), validate them
  if (cardName || cardNumber) {
    if (!cardName || !cardNumber) {
      return res.status(400).json({
        error: 'Both cardName and cardNumber are required if provided'
      })
    }

    // Sanitize and validate card name
    const sanitizedCardName = sanitizeCardName(cardName)
    if (sanitizedCardName.length === 0) {
      return res.status(400).json({
        error: 'Invalid card name'
      })
    }

    // Validate card number
    if (!validateCardNumber(cardNumber)) {
      return res.status(400).json({
        error: 'Invalid card number format'
      })
    }

    // Replace with sanitized values
    req.body.cardName = sanitizedCardName
  }

  // Validate imageBase64 format if provided
  if (imageBase64) {
    if (typeof imageBase64 !== 'string') {
      return res.status(400).json({
        error: 'imageBase64 must be a string'
      })
    }

    // Check if it's a valid base64 image
    const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/
    if (!base64Regex.test(imageBase64) && !imageBase64.match(/^[A-Za-z0-9+/=]+$/)) {
      return res.status(400).json({
        error: 'Invalid imageBase64 format'
      })
    }

    // Check size (10MB limit)
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')
    const sizeInBytes = (base64Data.length * 3) / 4
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (sizeInBytes > maxSize) {
      return res.status(400).json({
        error: 'Image size exceeds 10MB limit'
      })
    }
  }

  next()
}
