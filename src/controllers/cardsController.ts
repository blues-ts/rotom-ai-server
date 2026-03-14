import type { Response } from "express";
import type { AuthRequest } from "../middleware/clerkAuth";
import sharp from "sharp";
import axios from "axios";
import { scanCardWithGemini } from "../utils/geminiClient";
import { poketraceClient } from "../utils/poketraceClient";
import { handleApiError, createErrorResponse, ErrorCode, getStatusCode } from "../utils/apiErrors";

// Test image URLs for Pokemon cards
const TEST_CARD_IMAGES: Record<string, string> = {
  baseSet: "https://tcgplayer-cdn.tcgplayer.com/product/42346_in_1000x1000.jpg",
  jungle: "https://tcgplayer-cdn.tcgplayer.com/product/45120_in_1000x1000.jpg",
  neoGenesis: "https://tcgplayer-cdn.tcgplayer.com/product/83485_in_1000x1000.jpg",
  gymHeroes: "https://tcgplayer-cdn.tcgplayer.com/product/83862_in_1000x1000.jpg",
  aquapolis: "https://tcgplayer-cdn.tcgplayer.com/product/83487_in_1000x1000.jpg",
  rubySapphire: "https://tcgplayer-cdn.tcgplayer.com/product/83475_in_1000x1000.jpg",
  diamondPearl: "https://tcgplayer-cdn.tcgplayer.com/product/83684_in_1000x1000.jpg",
  platinum: "https://tcgplayer-cdn.tcgplayer.com/product/83517_in_1000x1000.jpg",
  heartGoldSoulSilver: "https://tcgplayer-cdn.tcgplayer.com/product/83544_in_1000x1000.jpg",
  blackWhite: "https://tcgplayer-cdn.tcgplayer.com/product/83505_in_1000x1000.jpg",
  xy: "https://tcgplayer-cdn.tcgplayer.com/product/83462_in_1000x1000.jpg",
  sunMoon: "https://tcgplayer-cdn.tcgplayer.com/product/130686_in_1000x1000.jpg",
  swordShield: "https://tcgplayer-cdn.tcgplayer.com/product/206046_in_1000x1000.jpg",
  scarletViolet: "https://tcgplayer-cdn.tcgplayer.com/product/475417_in_1000x1000.jpg",
};

/**
 * Analyzes a Pokemon card image using Gemini Vision API,
 * then looks up the card via the Poketrace search endpoint.
 */
export async function analyzeCard(req: AuthRequest, res: Response) {
  try {
    const { imageBase64, testImage } = req.body;

    let base64Data: string;

    // Test mode: use hardcoded image URLs
    if (testImage && TEST_CARD_IMAGES[testImage as keyof typeof TEST_CARD_IMAGES]) {
      const imageUrl = TEST_CARD_IMAGES[testImage as keyof typeof TEST_CARD_IMAGES];
      console.log(`Test mode: Fetching image from ${imageUrl}`);

      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 10000,
      });

      base64Data = Buffer.from(imageResponse.data).toString('base64');
      console.log(`Test mode: Successfully fetched and converted image (${imageResponse.data.length} bytes)`);
    } else if (imageBase64) {
      base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    } else {
      return res.status(getStatusCode(ErrorCode.BAD_REQUEST)).json(
        createErrorResponse(ErrorCode.BAD_REQUEST, 'An image is required. Please provide an image to analyze.')
      );
    }

    // Convert base64 to buffer for processing
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Optimize image size to minimize Gemini token costs
    const optimizedImage = await sharp(imageBuffer)
      .resize(768, 768, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Convert back to base64 for Gemini API
    const optimizedBase64 = optimizedImage.toString('base64');

    // Use Gemini Vision API to extract structured card data
    const cardData = await scanCardWithGemini(optimizedBase64);

    // Search for the card via Poketrace API
    const searchQuery = cardData.name;
    const searchParams: Record<string, any> = {
      search: searchQuery,
      limit: 10,
    };

    // If we have a card number, add it to narrow the search
    if (cardData.cardNumber) {
      // Extract just the number part (before the slash)
      const numberPart = cardData.cardNumber.includes('/')
        ? cardData.cardNumber.split('/')[0]
        : cardData.cardNumber;
      searchParams.card_number = numberPart;
    }

    const poketraceResult = await poketraceClient.getCards(searchParams);

    // Try to find the best match
    let matchedCard = null;
    if (poketraceResult.data.length > 0) {
      // If we have a set name from Gemini, try to match on it
      if (cardData.setName) {
        const setNameLower = cardData.setName.toLowerCase();
        matchedCard = poketraceResult.data.find(
          (c) => c.set.name.toLowerCase().includes(setNameLower) || setNameLower.includes(c.set.name.toLowerCase())
        );
      }
      // Fall back to first result
      if (!matchedCard) {
        matchedCard = poketraceResult.data[0];
      }
    }

    if (!matchedCard) {
      // If card_number search returned nothing, try without it
      if (searchParams.card_number) {
        const broadResult = await poketraceClient.getCards({ search: searchQuery, limit: 5 });
        if (broadResult.data.length > 0) {
          matchedCard = broadResult.data[0];
        }
      }
    }

    if (!matchedCard) {
      return res.status(getStatusCode(ErrorCode.CARD_NOT_FOUND)).json(
        createErrorResponse(ErrorCode.CARD_NOT_FOUND, `Could not find card "${cardData.name}" in Poketrace.`)
      );
    }

    return res.json({
      success: true,
      data: {
        id: matchedCard.id,
        name: matchedCard.name,
        cardNumber: matchedCard.cardNumber,
        setName: matchedCard.set.name,
        setSlug: matchedCard.set.slug,
        rarity: matchedCard.rarity,
        image: matchedCard.image,
        variant: matchedCard.variant,
        currency: matchedCard.currency,
        prices: matchedCard.prices,
        lastUpdated: matchedCard.lastUpdated,
      },
      scannedData: {
        name: cardData.name,
        cardNumber: cardData.cardNumber,
        setName: cardData.setName,
        confidence: cardData.confidence,
        alternates: cardData.alternates,
      },
    });
  } catch (error) {
    const { statusCode, response } = handleApiError(error, 'analyzeCard');
    return res.status(statusCode).json(response);
  }
}
